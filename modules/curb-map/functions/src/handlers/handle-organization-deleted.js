/**
 * Handle OrganizationDeleted action
 * Deletes organization document
 * @sig handleOrganizationDeleted :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleOrganizationDeleted = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { organizationId } = action

    await fsContext.organizations.delete(organizationId)
    logger.flowStep('Organization deleted')
}

export default handleOrganizationDeleted
