import admin from 'firebase-admin'
import { collectionPaths, throwWithOriginal } from './firestore-facade-shared.js'

// @sig isServerTimestampPlaceholder :: Any -> Boolean
const isServerTimestampPlaceholder = value =>
    value?._methodName === 'serverTimestamp' ||
    value?._delegate != null ||
    (typeof value === 'object' && value != null && Object.keys(value).length === 0)

// @sig timestampToDate :: Any -> Date
const timestampToDate = value => {
    if (value == null) return null
    if (value instanceof Date) return value
    if (value instanceof admin.firestore.Timestamp) return value.toDate()
    if (typeof value?.toDate === 'function') return value.toDate()

    if (typeof value === 'string') {
        const parsed = new Date(value)
        if (!Number.isNaN(parsed.getTime())) return parsed
    }

    if (isServerTimestampPlaceholder(value)) return new Date()

    throw new Error(`Invalid timestamp format: ${JSON.stringify(value)}`)
}

// @sig dateToTimestamp :: Any -> admin.firestore.Timestamp | Object
const dateToTimestamp = value => {
    if (value == null) return null
    if (value instanceof Date) return admin.firestore.Timestamp.fromDate(value)
    if (value instanceof admin.firestore.Timestamp) return value
    if (isServerTimestampPlaceholder(value)) return value

    if (typeof value?.toDate === 'function') return admin.firestore.Timestamp.fromDate(value.toDate())

    if (typeof value === 'string') {
        const parsed = new Date(value)
        if (!Number.isNaN(parsed.getTime())) return admin.firestore.Timestamp.fromDate(parsed)
    }

    throw new Error(`Invalid date format: ${JSON.stringify(value)}`)
}

const getDefaultAdminDb = () => {
    if (!admin.apps || admin.apps.length === 0) {
        const projectId = process.env.GCLOUD_PROJECT
        projectId ? admin.initializeApp({ projectId }) : admin.initializeApp()
    }

    return admin.firestore()
}

const FirestoreAdminFacade = (
    Type,
    collectionPrefix = '',
    db = getDefaultAdminDb(),
    collectionNameOverride = null,
    tx = null,
) => {
    const encodeTimestamps = data => {
        if (!timestampFields.length || data == null) return data
        const result = { ...data }

        timestampFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(result, field)) result[field] = dateToTimestamp(result[field])
        })

        return result
    }

    const decodeTimestamps = data => {
        if (!timestampFields.length || data == null) return data

        const result = { ...data }
        timestampFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(result, field)) result[field] = timestampToDate(result[field])
        })

        return result
    }

    // -----------------------------------------------------------------------------------------------------------------
    // READ
    // -----------------------------------------------------------------------------------------------------------------

    // @sig read :: Id -> Promise Type
    const read = async id => {
        try {
            const docSnap = tx ? await tx.get(_docRef(id)) : await _docRef(id).get()

            if (!docSnap.exists) throw new Error(`${Type.toString()} not found: ${id}`)
            return Type.fromFirestore(decodeTimestamps(docSnap.data()))
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
            return querySnapshot.docs.map(doc => Type.fromFirestore(decodeTimestamps(doc.data())))
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
            const firestoreData = encodeTimestamps(Type.toFirestore(record))
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
            const firestoreData = encodeTimestamps(Type.toFirestore(record))
            tx ? await tx.set(_docRef(record.id), firestoreData) : await _docRef(record.id).create(firestoreData)
        } catch (e) {
            throwWithOriginal(`Failed to create ${Type.toString()}: ${e.message}`, e, record)
        }
    }

    /*
     * Partial update operation - updates specified fields only, fails if document doesn't exist.
     * Contrast with write() which replaces entire document, and create() which only works for new documents.
     * @sig update :: (Id, Object) -> Promise Void
     */
    const update = async (id, fields) => {
        try {
            const firestoreData = encodeTimestamps(fields)
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
            return Type.fromFirestore(decodeTimestamps(docSnap.data()))
        } catch (e) {
            throwWithOriginal(`Failed to readOrNull ${Type.toString()}: ${e.message}`, e, id)
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
            return querySnapshot.docs.map(doc => Type.fromFirestore(decodeTimestamps(doc.data())))
        } catch (e) {
            throwWithOriginal(`Failed to list ${Type.toString()}: ${e.message}`, e)
        }
    }

    // @sig listenToDocument :: (Id, (Type?, Error?) -> Void) -> (() -> Void)
    const listenToDocument = (id, callback) =>
        _docRef(id).onSnapshot(
            snapshot => {
                try {
                    const data = snapshot.exists ? Type.fromFirestore(decodeTimestamps(snapshot.data())) : null
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
                    const items = querySnapshot.docs.map(doc => Type.fromFirestore(decodeTimestamps(doc.data())))
                    callback(items, null)
                } catch (error) {
                    callback(null, error)
                }
            },
            error => callback(null, error),
        )
    }

    // -----------------------------------------------------------------------------------------------------------------
    // DESCENDENT
    // -----------------------------------------------------------------------------------------------------------------

    const descendent = suffix => {
        if (suffix[0] === '/') suffix = suffix.slice(1)

        const segments = suffix.split('/').filter(Boolean)
        if (segments.length % 2 !== 0) throw new Error(`Suffix must have an even number of segments; found ${suffix}`)

        const collectionPrefix1 = `${collectionPrefix}/${suffix}`.replaceAll(/\/\//g, '/')
        return FirestoreAdminFacade(Type, collectionPrefix1, db, collectionNameOverride, tx)
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

    const collectionName = collectionNameOverride || collectionPaths.get(Type)
    const collectionPath = collectionPrefix + collectionName
    const collectionRef = db.collection(collectionPath)

    const _docRef = id => collectionRef.doc(id)
    const timestampFields = Type.timestampFields || []

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

        descendent,

    }
}

FirestoreAdminFacade.timestampToDate = timestampToDate
FirestoreAdminFacade.dateToTimestamp = dateToTimestamp
FirestoreAdminFacade.serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp()
FirestoreAdminFacade.deleteField = () => admin.firestore.FieldValue.delete()

export { FirestoreAdminFacade }
