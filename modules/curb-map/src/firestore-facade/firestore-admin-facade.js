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

const FirestoreAdminFacade = (Type, collectionPrefix = '', db = getDefaultAdminDb(), collectionNameOverride = null) => {
    if (collectionPrefix && collectionPrefix.at(-1) !== '/') collectionPrefix += '/'

    const collectionName = collectionNameOverride || collectionPaths.get(Type)
    const collectionPath = collectionPrefix + collectionName
    const collectionRef = db.collection(collectionPath)

    const _docRef = id => collectionRef.doc(id)
    const timestampFields = Type.timestampFields || []

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

    // @sig write :: TaggedItem -> Promise Void
    const write = async record => {
        try {
            const firestoreData = encodeTimestamps(Type.toFirestore(record))
            await _docRef(record.id).set(firestoreData)
        } catch (e) {
            throwWithOriginal(`Failed to write ${Type.toString()}: ${e.message}`, e, record)
        }
    }

    // @sig read :: Id -> Promise Type
    const read = async id => {
        try {
            const docSnap = await _docRef(id).get()

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

            const querySnapshot = await q.get()
            return querySnapshot.docs.map(doc => Type.fromFirestore(decodeTimestamps(doc.data())))
        } catch (e) {
            throwWithOriginal(`Failed to query ${Type.toString()}: ${e.message}`, e, whereConditions)
        }
    }

    // @sig delete :: Id -> Promise Void
    const _delete = async id => {
        try {
            await _docRef(id).delete()
        } catch (e) {
            throwWithOriginal(`Failed to delete ${Type.toString()}: ${e.message}`, e, id)
        }
    }

    /*
     * List all documents in a collection
     * @sig list :: () -> Promise [Type]
     */
    const list = async () => {
        try {
            const querySnapshot = await collectionRef.get()
            return querySnapshot.docs.map(doc => Type.fromFirestore(decodeTimestamps(doc.data())))
        } catch (e) {
            throwWithOriginal(`Failed to list ${Type.toString()}: ${e.message}`, e)
        }
    }

    const descendent = suffix => {
        if (suffix[0] === '/') suffix = suffix.slice(1)

        const segments = suffix.split('/').filter(Boolean)
        if (segments.length % 2 !== 0) throw new Error(`Suffix must have an even number of segments; found ${suffix}`)

        return FirestoreAdminFacade(
            Type,
            `${collectionPrefix}/${suffix}`.replaceAll(/\/\//g, '/'),
            db,
            collectionNameOverride,
        )
    }

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

    // prettier-ignore
    return {
        // read
        read,
        query,
        list,
        
        // write
        write,
       
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
