import { removeNilValues } from '@graffio/functional'

/**
 * Handle OrganizationUpdated action
 * Updates organization name and/or status
 * @sig handleOrganizationUpdated :: (FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleOrganizationUpdated = async (fsContext, actionRequest) => {
    const { action, organizationId, actorId } = actionRequest
    const metadata = { updatedAt: new Date(), updatedBy: actorId }
    const changes = removeNilValues(action)
    await fsContext.organizations.update(organizationId, { ...changes, ...metadata })
}

export default handleOrganizationUpdated
