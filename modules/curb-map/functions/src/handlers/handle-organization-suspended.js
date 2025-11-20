import { updatedMetadata } from '../shared.js'

/**
 * Handle OrganizationSuspended action
 * Sets organization status to 'suspended'
 * @sig handleOrganizationSuspended :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleOrganizationSuspended = async (logger, fsContext, actionRequest) => {
    const { organizationId } = actionRequest
    const metadata = updatedMetadata(fsContext, actionRequest)

    await fsContext.organizations.update(organizationId, { status: 'suspended', ...metadata })
    logger.flowStep('Organization suspended')
}

export default handleOrganizationSuspended
