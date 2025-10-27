import { omit, removeNilValues } from '@graffio/functional'
import { updatedMetadata } from '../shared.js'

/**
 * Handle OrganizationUpdated action
 * Updates organization name and/or status
 * @sig handleOrganizationUpdated :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleOrganizationUpdated = async (logger, fsContext, actionRequest) => {
    const { action, organizationId } = actionRequest
    const metadata = updatedMetadata(fsContext, actionRequest)
    const o = omit('organizationId', action)
    const changes = removeNilValues(o)

    await fsContext.organizations.update(organizationId, { ...changes, ...metadata })
    logger.flowStep('Organization updated')
}

export default handleOrganizationUpdated
