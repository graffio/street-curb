import { getApps, initializeApp } from 'firebase/app'
import * as F from 'firebase/firestore'
import { collectionPaths, throwWithOriginal } from './firestore-facade-shared.js'

const getDefaultClientDb = () => {
    if (!getApps().length) {
        const projectId = import.meta.env.VITE_GCLOUD_PROJECT || 'test-project'
        initializeApp({ projectId, apiKey: 'local-development', appId: `${projectId}-app` })
    }

    const db = F.getFirestore()

    const emulatorHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST
    if (emulatorHost) {
        const [host, port] = emulatorHost.split(':')
        try {
            F.connectFirestoreEmulator(db, host, Number(port))
        } catch (error) {
            // ignore if emulator already connected
        }
    }

    return db
}

/*
 * Encode a single Date to Firestore Timestamp
 * @sig encodeTimestamp :: Date -> Timestamp
 */
const encodeTimestamp = date => F.Timestamp.fromDate(date)

/*
 * Decode a single Firestore Timestamp to Date
 * Handles both Timestamp instances and plain objects from emulator
 * @sig decodeTimestamp :: Timestamp | Object -> Date
 */
const decodeTimestamp = timestamp => {
    if (timestamp.toDate) return timestamp.toDate()
    if (timestamp._seconds != null) return new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000)
    throw new Error(`Cannot decode timestamp: ${JSON.stringify(timestamp)}`)
}

const FirestoreClientFacade = (Type, collectionPrefix = '', db = getDefaultClientDb()) => {
    if (collectionPrefix && collectionPrefix.at(-1) !== '/') collectionPrefix += '/'

    const collectionName = collectionPaths.get(Type)
    if (!collectionName) 
        throw new Error(`No collection path registered for type: ${Type.toString ? Type.toString() : Type}`)
    
    const collectionPath = collectionPrefix + collectionName
    const _docRef = id => F.doc(db, collectionPath, id)

    const fromFirestore = data => Type.fromFirestore(data, decodeTimestamp)
    const toFirestore = data => Type.toFirestore(data, encodeTimestamp)

    // For partial updates, encode only Date fields (nested types not supported in partial updates)
    const toFirestorePartial = fields => {
        const encoded = {}
        for (const [key, value] of Object.entries(fields))
            if (value instanceof Date) encoded[key] = encodeTimestamp(value)
            else if (value && typeof value === 'object' && value.idField)
                throw new Error(
                    `Partial update of LookupTable field '${key}' not supported. Use write() with full object instead.`,
                )
            else encoded[key] = value

        return encoded
    }

    // @sig write :: TaggedItem -> Promise Void
    const write = async record => {
        try {
            const firestoreData = toFirestore(record)
            await F.setDoc(_docRef(record.id), firestoreData)
        } catch (e) {
            throwWithOriginal(`Failed to write ${Type.toString()} ${e.message}`, e, record)
        }
    }

    // @sig update :: (Id, Object) -> Promise Void
    // Note: Does not support partial updates of nested types (LookupTable, Tagged). Use write() for those.
    const update = async (id, fields) => {
        try {
            const firestoreData = toFirestorePartial(fields)
            await F.updateDoc(_docRef(id), firestoreData)
        } catch (e) {
            throwWithOriginal(`Failed to update ${Type.toString()}: ${e.message}`, e, { id, fields })
        }
    }

    // @sig read :: Id -> Promise Type
    const read = async id => {
        try {
            const docSnap = await F.getDoc(_docRef(id))
            if (!docSnap.exists()) throw new Error(`${Type.toString()} not found: ${id}`)
            return fromFirestore(docSnap.data())
        } catch (e) {
            throwWithOriginal(`Failed to read ${Type.toString()}: ${e.message}`, e, id)
        }
    }

    // @sig query :: [Condition] -> Promise [Type]
    //  Condition = [String, String, Any]
    const query = async whereConditions => {
        try {
            let q = F.collection(db, collectionPath)
            whereConditions.forEach(([field, operator, value]) => (q = F.query(q, F.where(field, operator, value))))

            const querySnapshot = await F.getDocs(q)
            return querySnapshot.docs.map(doc => fromFirestore(doc.data()))
        } catch (e) {
            throwWithOriginal(`Failed to query ${Type.toString()}: ${e.message}`, e, whereConditions)
        }
    }

    // @sig listenToDocument :: (Id, (Type?, Error?) -> Void) -> (() -> Void)
    const listenToDocument = (id, callback) =>
        F.onSnapshot(
            _docRef(id),
            snapshot => {
                const data = snapshot.exists() ? fromFirestore(snapshot.data()) : null
                callback(data, null)
            },
            error => callback(null, error),
        )

    // @sig listenToCollection :: ([Condition], ([Type], Error?) -> Void) -> (() -> Void)
    const listenToCollection = (whereConditions, callback) => {
        let q = F.collection(db, collectionPath)
        whereConditions.forEach(([field, operator, value]) => {
            q = F.query(q, F.where(field, operator, value))
        })

        return F.onSnapshot(
            q,
            querySnapshot => {
                const items = querySnapshot.docs.map(doc => fromFirestore(doc.data()))
                callback(items, null)
            },
            error => callback(null, error),
        )
    }

    const descendent = (DescendentType, suffix) => {
        if (suffix[0] === '/') suffix = suffix.slice(1)

        const segments = suffix.split('/').filter(Boolean)
        if (segments.length % 2 !== 0) throw new Error(`Suffix must have an even number of segments; found ${suffix}`)

        return FirestoreClientFacade(DescendentType, `${collectionPrefix}/${suffix}`, db)
    }

    return { write, update, read, query, listenToDocument, listenToCollection, descendent }
}

export { FirestoreClientFacade }
