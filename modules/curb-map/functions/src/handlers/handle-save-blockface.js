import { Blockface } from '../../../src/types/index.js'
import { updatedMetadata } from '../shared.js'

/*
 * Handle SaveBlockface action
 * Persists blockface to Firestore
 * @sig handleSaveBlockface :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleSaveBlockface = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { blockface } = action

    const projectContext = fsContext.forProject(blockface.organizationId, blockface.projectId)
    const blockfaceWithMetadata = Blockface.from({ ...blockface, ...updatedMetadata(fsContext, actionRequest) })

    await projectContext.blockfaces.write(blockfaceWithMetadata)
    logger.flowStep('Blockface saved')
}

export default handleSaveBlockface
