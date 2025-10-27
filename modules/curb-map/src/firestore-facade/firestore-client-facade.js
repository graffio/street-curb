import { getApps, initializeApp } from 'firebase/app'
import * as F from 'firebase/firestore'
import { collectionPaths, throwWithOriginal } from './firestore-facade-shared.js'

const getDefaultClientDb = () => {
    if (!getApps().length) {
        const projectId = process.env.GCLOUD_PROJECT || 'test-project'
        initializeApp({ projectId, apiKey: 'local-development', appId: `${projectId}-app` })
    }

    const db = F.getFirestore()

    if (process.env.FIRESTORE_EMULATOR_HOST) {
        const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':')
        try {
            F.connectFirestoreEmulator(db, host, Number(port))
        } catch (error) {
            // ignore if emulator already connected
        }
    }

    return db
}

const FirestoreClientFacade = (Type, collectionPrefix = '', db = getDefaultClientDb()) => {
    if (collectionPrefix && collectionPrefix.at(-1) !== '/') collectionPrefix += '/'

    const collectionPath = collectionPrefix + collectionPaths.get(Type)
    const _docRef = id => F.doc(db, collectionPath, id)
    const timestampFields = Type.timestampFields || []

    const encodeTimestamps = data => {
        if (!timestampFields.length || data == null) return data
        const result = { ...data }
        timestampFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(result, field)) result[field] = F.Timestamp.fromDate(result[field])
        })
        return result
    }

    const decodeTimestamps = data => {
        if (!timestampFields.length || data == null) return data
        const result = { ...data }
        timestampFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(result, field)) result[field] = result[field].toDate()
        })
        return result
    }

    // @sig write :: TaggedItem -> Promise Void
    const write = async record => {
        try {
            const firestoreData = encodeTimestamps(Type.toFirestore(record))
            await F.setDoc(_docRef(record.id), firestoreData)
        } catch (e) {
            throwWithOriginal(`Failed to write ${Type.toString()} ${e.message}`, e, record)
        }
    }

    // @sig update :: (Id, Object) -> Promise Void
    const update = async (id, fields) => {
        try {
            const firestoreData = encodeTimestamps(fields)
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
            const data = docSnap.data()
            return Type.fromFirestore(decodeTimestamps(data))
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
            return querySnapshot.docs.map(doc => Type.fromFirestore(decodeTimestamps(doc.data())))
        } catch (e) {
            throwWithOriginal(`Failed to query ${Type.toString()}: ${e.message}`, e, whereConditions)
        }
    }

    // @sig listenToDocument :: (Id, (Type?, Error?) -> Void) -> (() -> Void)
    const listenToDocument = (id, callback) =>
        F.onSnapshot(
            _docRef(id),
            snapshot => {
                const data = snapshot.exists() ? Type.fromFirestore(decodeTimestamps(snapshot.data())) : null
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
                const items = querySnapshot.docs.map(doc => Type.fromFirestore(decodeTimestamps(doc.data())))
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
