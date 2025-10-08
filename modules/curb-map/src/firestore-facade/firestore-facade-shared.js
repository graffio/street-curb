import { ActionRequest, AuditRecord, Blockface, OperationDetails, Segment, SystemFlags } from '../types/index.js'

const collectionPaths = new Map()
collectionPaths.set(ActionRequest, 'actionRequests')
collectionPaths.set(AuditRecord, 'auditRecords')
collectionPaths.set(Blockface, 'blockfaces')
collectionPaths.set(OperationDetails, 'operationDetails')
collectionPaths.set(Segment, 'segments')
collectionPaths.set(SystemFlags, 'systemFlags')

// completedActions uses the same type as actionRequests but is a separate collection
// It's registered separately to allow different access patterns (write-once, immutable)
const completedActionsCollection = 'completedActions'

/*
 * Throw an error wrapping another error
 *
 * { message: String, wrappedException: Error, additionaData: * }
 */
// @sig throwWithOriginal :: (String, Error, Any) -> throws
const throwWithOriginal = (message, wrappedException, additionalData) => {
    const e = new Error(message)
    e.wrappedException = wrappedException
    e.additionalData = additionalData
    throw e
}

export { collectionPaths, completedActionsCollection, throwWithOriginal }
