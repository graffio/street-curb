import { Blockface } from '../../../src/types/index.js'
import { updatedMetadata } from '../shared.js'

/*
 * Handle SaveBlockface action
 * Persists blockface to Firestore and logs changes for audit trail
 * @sig handleSaveBlockface :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleSaveBlockface = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { blockface, changes } = action

    // Serialize blockface with updated metadata
    const projectContext = fsContext.forProject(blockface.organizationId, blockface.projectId)
    await projectContext.blockfaces.write({
        ...Blockface.toFirestore(blockface, fsContext.encodeTimestamp),
        ...updatedMetadata(fsContext, actionRequest),
    })
    logger.flowStep('Blockface saved')

    // Log changes for audit trail
    if (changes.added.length > 0) logger.info(`Added segments: ${JSON.stringify(changes.added)}`)
    if (changes.modified.length > 0) logger.info(`Modified segments: ${JSON.stringify(changes.modified)}`)
    if (changes.removed.length > 0) logger.info(`Removed segments: ${JSON.stringify(changes.removed)}`)
}

export default handleSaveBlockface
