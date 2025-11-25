import { LookupTable } from '@graffio/functional'
import { OrganizationMember } from '../../../src/types/index.js'

/**
 * Handle UserCreated action
 * Creates user document with empty organizations map
 *
 * @sig handleUserCreated :: (FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserCreated = async (fsContext, actionRequest) => {
    const { action, actorId } = actionRequest
    const { userId, email, displayName } = action
    const date = new Date()
    const metadata = { createdAt: date, createdBy: actorId, updatedAt: date, updatedBy: actorId }
    const organizations = LookupTable([], OrganizationMember, 'organizationId')
    await fsContext.users.write({ id: userId, email, displayName, organizations, ...metadata })
}

export default handleUserCreated
