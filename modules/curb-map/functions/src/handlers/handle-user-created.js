import { LookupTable } from '@graffio/functional'
import { OrganizationMember } from '../../../src/types/index.js'
import { generateMetadata } from '../shared.js'

/**
 * Handle UserCreated action
 * Creates user document with empty organizations map
 *
 * @sig handleUserCreated :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserCreated = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { userId, email, displayName } = action
    const metadata = generateMetadata(fsContext, actionRequest)

    const organizations = LookupTable([], OrganizationMember, 'organizationId')
    await fsContext.users.write({ id: userId, email, displayName, organizations, ...metadata })

    logger.flowStep('User created')
}

export default handleUserCreated
