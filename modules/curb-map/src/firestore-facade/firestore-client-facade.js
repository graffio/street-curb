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
    const _docRef = id => F.doc(db, collectionPath, id)

    const fromFirestore = data => Type.fromFirestore(data, decodeTimestamp)

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
        whereConditions.forEach(([field, operator, value]) => (q = F.query(q, F.where(field, operator, value))))

        return F.onSnapshot(
            q,
            querySnapshot => {
                const items = querySnapshot.docs.map(doc => fromFirestore(doc.data()))
                callback(items, null)
            },
            error => callback(null, error),
        )
    }

    const descendant = (parentId, descendantType) => {
        const suffix = collectionPaths.get(descendantType)
        return FirestoreClientFacade(descendantType, `${collectionPath}/${parentId}/${suffix}`, db)
    }

    // Main

    if (collectionPrefix && collectionPrefix.at(-1) !== '/') collectionPrefix += '/'

    let collectionPath = collectionPaths.get(Type)
    if (!collectionPath) throw new Error(`No collection path registered for type: ${Type.toString()}`)
    collectionPath = collectionPrefix + collectionPath

    return { read, query, listenToDocument, listenToCollection, descendant }
}

export { FirestoreClientFacade }
