import { updatedMetadata } from '../shared.js'

/**
 * Handle UserUpdated action
 * Updates user email and/or displayName
 * @sig handleUserUpdated :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserUpdated = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { userId, displayName } = action

    if (!displayName) {
        logger.flowStep('No updates requested')
        return
    }

    // Read user to find all their organizations
    const user = await fsContext.users.read(userId)
    const organizationIds = Object.keys(user.organizations)

    const metadata = updatedMetadata(fsContext, actionRequest)
    await fsContext.users.update(userId, { displayName, ...metadata })
    logger.flowStep('User updated')

    // Create org-specific context (reusing same transaction)
    for (const id of organizationIds)
        await fsContext.forOrganization(id).organizations.update(id, { [`members.${userId}.displayName`]: displayName })

    logger.flowStep(`DisplayName propagated to organizations`)
}

export default handleUserUpdated
