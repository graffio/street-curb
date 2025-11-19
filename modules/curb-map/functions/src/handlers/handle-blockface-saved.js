import { updatedMetadata } from '../shared.js'

/*
 * Handle BlockfaceSaved action
 * Persists blockface to Firestore
 * @sig handleBlockfaceSaved :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleBlockfaceSaved = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    let { blockface } = action

    const projectContext = fsContext.forProject(blockface.organizationId, blockface.projectId)

    // segments has to *stay* a LookupTable; spreading turns it into an array, which will not be serialized properly
    blockface = { ...blockface, ...updatedMetadata(fsContext, actionRequest), segments: blockface.segments }
    await projectContext.blockfaces.write(blockface)
    logger.flowStep('Blockface saved')
}

export default handleBlockfaceSaved
