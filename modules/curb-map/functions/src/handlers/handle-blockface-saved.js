/*
 * Handle BlockfaceSaved action
 * Persists blockface to Firestore
 * Metadata has already been validated by submitActionRequest
 * @sig handleBlockfaceSaved :: (FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleBlockfaceSaved = async (fsContext, actionRequest) => {
    const { blockface } = actionRequest.action

    // Metadata (createdBy/At, updatedBy/At) already validated by submitActionRequest
    // organizationId/projectId already validated for tenant boundaries
    // Just write the blockface as-is
    await fsContext.blockfaces.write(blockface)
}

export default handleBlockfaceSaved
