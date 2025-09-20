import { throwWithOriginal } from './firestore-shared.js'

const _write = (Type, collectionPath) => async (db, record) => {
    try {
        const docRef = db.collection(collectionPath).doc(record.id)
        await docRef.set(Type.toFirestore(record))
    } catch (e) {
        throwWithOriginal(`Failed to write record: ${e.message}`, e, record)
    }
}

const _read = (Type, collectionPath) => async (db, id) => {
    try {
        const docRef = db.collection(collectionPath).doc(id)
        const docSnap = await docRef.get()
        if (!docSnap.exists) throw new Error(`Record not found: ${id}`)
        return Type.fromFirestore(docSnap.data())
    } catch (e) {
        throwWithOriginal(`Failed to read record: ${e.message}`, e, id)
    }
}

const _query = (Type, collectionPath) => async (db, whereConditions) => {
    try {
        let q = db.collection(collectionPath)
        whereConditions.forEach(([field, operator, value]) => (q = q.where(field, operator, value)))
        q = q.orderBy('timestamp', 'desc')
        const querySnapshot = await q.get()
        return querySnapshot.docs.map(doc => Type.fromFirestore(doc.data()))
    } catch (e) {
        throwWithOriginal(`Failed to query records: ${e.message}`, e, whereConditions)
    }
}

const _delete = (Type, collectionPath) => async (db, id) => {
    try {
        const docRef = db.collection(collectionPath).doc(id)
        await docRef.delete()
    } catch (e) {
        throwWithOriginal(`Failed to delete record: ${e.message}`, e, id)
    }
}

export { _query, _write, _read, _delete }
