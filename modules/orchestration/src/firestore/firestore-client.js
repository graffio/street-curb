import * as F from 'firebase/firestore'
import { throwWithOriginal } from './firestore-shared.js'

// @sig write :: (TaggedType, String) => (Firestore, Type) -> Promise Void
const _write = (Type, CollectionPath) => async (db, auditRecord) => {
    try {
        const reference = F.doc(db, CollectionPath, auditRecord.id)
        await F.setDoc(reference, Type.toFirestore(auditRecord))
    } catch (e) {
        throwWithOriginal(`Failed to write infrastructure audit record: ${e.message}`, e, auditRecord)
    }
}

// @sig read :: (TaggedType, String) => (Firestore, String) -> Promise Type
const _read = (Type, CollectionPath) => async (db, auditId) => {
    try {
        const docRef = F.doc(db, CollectionPath, auditId)
        const docSnap = await F.getDoc(docRef)

        if (!docSnap.exists()) throw new Error(`Infrastructure audit record not found: ${auditId}`)
        const data = docSnap.data()
        return Type.fromFirestore(data)
    } catch (e) {
        throwWithOriginal(`Failed to read infrastructure audit record: ${e.message}`, e, auditId)
    }
}

// @sig query :: (TaggedType, String) => (Firestore, [[String, String, Any]] -> Promise [Type]
const _query = (Type, CollectionPath) => async (db, whereConditions) => {
    try {
        let q = F.collection(db, CollectionPath)
        whereConditions.forEach(([field, operator, value]) => (q = F.query(q, F.where(field, operator, value))))
        q = F.query(q, F.orderBy('timestamp', 'desc'))

        const querySnapshot = await F.getDocs(q)
        return querySnapshot.docs.map(doc => Type.fromFirestore(doc.data()))
    } catch (e) {
        throwWithOriginal(`Failed to query infrastructure audit records: ${e.message}`, e, whereConditions)
    }
}

// @sig delete :: (TaggedType, String) => (Firestore, String) -> Promise Void
const _delete = (Type, CollectionPath) => async (db, auditId) => {
    try {
        const docRef = F.doc(db, CollectionPath, auditId)
        await F.deleteDoc(docRef)
    } catch (e) {
        throwWithOriginal(`Failed to delete infrastructure audit record: ${e.message}`, e, auditId)
    }
}

export { _query, _write, _read, _delete }
