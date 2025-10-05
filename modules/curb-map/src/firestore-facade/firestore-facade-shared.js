import { Action, AuditRecord, Blockface, OperationDetails, QueueItem, Segment } from '../types/index.js'

const collectionPaths = new Map()
collectionPaths.set(Action, 'actions')
collectionPaths.set(AuditRecord, 'auditRecords')
collectionPaths.set(Blockface, 'blockfaces')
collectionPaths.set(OperationDetails, 'operationDetails')
collectionPaths.set(QueueItem, 'queueItems')
collectionPaths.set(Segment, 'segments')

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

export { collectionPaths, throwWithOriginal }
