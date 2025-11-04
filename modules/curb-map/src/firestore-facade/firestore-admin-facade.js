import admin from 'firebase-admin'
import { collectionPaths, throwWithOriginal } from './firestore-facade-shared.js'

const getDefaultAdminDb = () => {
    if (!admin.apps || admin.apps.length === 0) {
        const projectId = process.env.GCLOUD_PROJECT
        projectId ? admin.initializeApp({ projectId }) : admin.initializeApp()
    }

    return admin.firestore()
}

/*
 * Encode a single Date to Firestore Timestamp
 * @sig encodeTimestamp :: Date -> Timestamp
 */
const encodeTimestamp = date => admin.firestore.Timestamp.fromDate(date)

/*
 * Decode a single Firestore Timestamp to Date
 * @sig decodeTimestamp :: Timestamp -> Date
 */
const decodeTimestamp = timestamp => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
        console.error('decodeTimestamp received invalid timestamp:', {
            type: typeof timestamp,
            constructor: timestamp?.constructor?.name,
            hasToDate: 'toDate' in timestamp,
            toDateType: typeof timestamp?.toDate,
            value: timestamp,
        })
        throw new Error(`Expected Firestore Timestamp with toDate() method, got: ${JSON.stringify(timestamp)}`)
    }
    return timestamp.toDate()
}

/*
 *
 * @sig FirestoreAdminFacade :: (Type, String, FirestoreTransaction?, Firestore?)) -> Facade
 *  Facade = { [functionName]: Function }
 */
const FirestoreAdminFacade = (Type, collectionPrefix = '', tx = null, db = getDefaultAdminDb()) => {
    const fromFirestore = (Type, data) => Type.fromFirestore(data, decodeTimestamp)
    const toFirestore = (Type, data) => Type.toFirestore(data, encodeTimestamp)

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

    // -----------------------------------------------------------------------------------------------------------------
    // READ
    // -----------------------------------------------------------------------------------------------------------------

    // @sig read :: Id -> Promise Type
    const read = async id => {
        try {
            const docSnap = tx ? await tx.get(_docRef(id)) : await _docRef(id).get()

            if (!docSnap.exists) throw new Error(`${Type.toString()} not found: ${id}`)
            return fromFirestore(Type, docSnap.data())
        } catch (e) {
            throwWithOriginal(`Failed to read ${Type.toString()}: ${e.message}`, e, id)
        }
    }

    // @sig query :: [Condition] -> Promise [Type]
    //  Condition = [String, String, Any]
    const query = async whereConditions => {
        try {
            let q = db.collection(collectionPath)
            whereConditions.forEach(([field, operator, value]) => (q = q.where(field, operator, value)))

            const querySnapshot = tx ? await tx.get(q) : await q.get()
            return querySnapshot.docs.map(doc => fromFirestore(Type, doc.data()))
        } catch (e) {
            throwWithOriginal(`Failed to query ${Type.toString()}: ${e.message}`, e, whereConditions)
        }
    }

    // -----------------------------------------------------------------------------------------------------------------
    // WRITE
    // -----------------------------------------------------------------------------------------------------------------

    /*
     * Upsert operation - creates document if it doesn't exist, overwrites if it does.
     * Contrast with create() which fails if document exists, and update() which fails if it doesn't exist.
     * @sig write :: TaggedItem -> Promise Void
     */
    const write = async record => {
        try {
            if (!Type.is(record)) record = Type.from(record)
            const firestoreData = toFirestore(Type, record)
            tx ? await tx.set(_docRef(record.id), firestoreData) : await _docRef(record.id).set(firestoreData)
        } catch (e) {
            throwWithOriginal(`Failed to write ${Type.toString()}: ${e.message}`, e, record)
        }
    }

    /*
     * Create-only operation - atomically creates document, fails if it already exists.
     * Use for idempotency patterns where duplicate detection is critical.
     * Contrast with write() which overwrites existing documents, and update() which only modifies fields.
     * @sig create :: TaggedItem -> Promise Void
     */
    const create = async record => {
        try {
            if (!Type.is(record)) record = Type.from(record)
            const firestoreData = toFirestore(Type, record)

            tx ? await tx.set(_docRef(record.id), firestoreData) : await _docRef(record.id).create(firestoreData)
        } catch (e) {
            throwWithOriginal(`Failed to create ${Type.toString()}: ${e.message}`, e, record)
        }
    }

    /*
     * Partial update operation - updates specified fields only, fails if document doesn't exist.
     * Contrast with write() which replaces entire document, and create() which only works for new documents.
     * Note: Does not support partial updates of nested types (LookupTable, Tagged). Use write() for those.
     * @sig update :: (Id, Object) -> Promise Void
     */
    const update = async (id, fields) => {
        try {
            const firestoreData = toFirestorePartial(fields)
            tx ? await tx.update(_docRef(id), firestoreData) : await _docRef(id).update(firestoreData)
        } catch (e) {
            throwWithOriginal(`Failed to update ${Type.toString()}: ${e.message}`, e, { id, fields })
        }
    }

    // @sig readOrNull :: Id -> Promise Type | null
    const readOrNull = async id => {
        try {
            const docSnap = tx ? await tx.get(_docRef(id)) : await _docRef(id).get()

            if (!docSnap.exists) return null
            return fromFirestore(Type, docSnap.data())
        } catch (e) {
            throwWithOriginal(`Failed to read ${Type.toString()}: ${e.message}`, e, id)
        }
    }

    // @sig delete :: Id -> Promise Void
    const _delete = async id => {
        try {
            tx ? await tx.delete(_docRef(id)) : await _docRef(id).delete()
        } catch (e) {
            throwWithOriginal(`Failed to delete ${Type.toString()}: ${e.message}`, e, id)
        }
    }

    // -----------------------------------------------------------------------------------------------------------------
    // LISTEN
    // -----------------------------------------------------------------------------------------------------------------

    /*
     * List all documents in a collection
     * @sig list :: () -> Promise [Type]
     */
    const list = async () => {
        try {
            const querySnapshot = tx ? await tx.get(collectionRef) : await collectionRef.get()
            return querySnapshot.docs.map(doc => fromFirestore(Type, doc.data()))
        } catch (e) {
            throwWithOriginal(`Failed to list ${Type.toString()}: ${e.message}`, e)
        }
    }

    // @sig listenToDocument :: (Id, (Type?, Error?) -> Void) -> (() -> Void)
    const listenToDocument = (id, callback) =>
        _docRef(id).onSnapshot(
            snapshot => {
                try {
                    const data = snapshot.exists ? fromFirestore(Type, snapshot.data()) : null
                    callback(data, null)
                } catch (error) {
                    callback(null, error)
                }
            },
            error => callback(null, error),
        )

    // @sig listenToCollection :: ([Condition], ([Type], Error?) -> Void) -> (() -> Void)
    const listenToCollection = (whereConditions, callback) => {
        let ref = db.collection(collectionPath)
        whereConditions.forEach(([field, operator, value]) => {
            ref = ref.where(field, operator, value)
        })

        return ref.onSnapshot(
            querySnapshot => {
                try {
                    const items = querySnapshot.docs.map(doc => fromFirestore(Type, doc.data()))
                    callback(items, null)
                } catch (error) {
                    callback(null, error)
                }
            },
            error => callback(null, error),
        )
    }

    // -----------------------------------------------------------------------------------------------------------------
    // DANGEROUS DELETE
    // -----------------------------------------------------------------------------------------------------------------

    /*
     * Delete all documents under a collection path
     * DANGER: This is a destructive operation
     * Only works when FIREBASE_TEST_MODE environment variable is set
     * Only works with paths starting with 'tests/'
     * @sig recursiveDelete :: String -> Promise
     */
    const recursiveDelete = async () => {
        const message = `recursiveDelete requires FIREBASE_TEST_MODE environment variable to be set. This prevents accidental deletion of production data.`
        if (!process.env.FIREBASE_TEST_MODE) throw new Error(message)

        await db.recursiveDelete(collectionRef)
    }

    if (collectionPrefix && collectionPrefix.at(-1) !== '/') collectionPrefix += '/'

    const collectionName = collectionPaths.get(Type)
    const collectionPath = collectionPrefix + collectionName
    const collectionRef = db.collection(collectionPath)

    const _docRef = id => collectionRef.doc(id)

    // prettier-ignore
    return {
        // read
        read,
        readOrNull,
        query,
        list,

        // write
        write,
        create,
        update,

        // listen
        listenToDocument,
        listenToCollection,

        // delete
        delete: _delete,
        recursiveDelete,
    }
}

FirestoreAdminFacade.deleteField = () => admin.firestore.FieldValue.delete()

export { FirestoreAdminFacade }
