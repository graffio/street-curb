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

    // Build Firestore path from denormalized IDs
    const path = `organizations/${blockface.organizationId}/projects/${blockface.projectId}/blockfaces/${blockface.id}`

    // Serialize blockface with updated metadata
    const blockfaceData = {
        ...Blockface.toFirestore(blockface, fsContext.encodeTimestamp),
        ...updatedMetadata(fsContext, actionRequest),
    }

    // Write to Firestore
    await fsContext.db.doc(path).set(blockfaceData)
    logger.flowStep('Blockface saved')

    // Log changes for audit trail
    if (changes.added.length > 0) logger.info(`Added segments: ${JSON.stringify(changes.added)}`)
    if (changes.modified.length > 0) logger.info(`Modified segments: ${JSON.stringify(changes.modified)}`)
    if (changes.removed.length > 0) logger.info(`Removed segments: ${JSON.stringify(changes.removed)}`)
}

export default handleSaveBlockface
