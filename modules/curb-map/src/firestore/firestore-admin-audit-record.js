import { AuditRecord } from '../types/index.js'
import { _delete, _query, _read, _write } from './firestore-admin.js'
import { CollectionPaths } from './firestore-shared.js'

const FirestoreAdminAuditRecord = {
    Infrastructure: {
        write: _write(AuditRecord, CollectionPaths.AuditRecord.InfrastructurePath),
        read: _read(AuditRecord, CollectionPaths.AuditRecord.InfrastructurePath),
        query: _query(AuditRecord, CollectionPaths.AuditRecord.InfrastructurePath),
        delete: _delete(AuditRecord, CollectionPaths.AuditRecord.InfrastructurePath),
    },
}

export { FirestoreAdminAuditRecord }
