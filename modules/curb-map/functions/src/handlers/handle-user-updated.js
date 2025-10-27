import { updatedMetadata } from '../shared.js'

/**
 * Handle UserUpdated action
 * Updates user email and/or displayName
 * @sig handleUserUpdated :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserUpdated = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { userId, email, displayName } = action
    const metadata = updatedMetadata(fsContext, actionRequest)

    const updates = { ...metadata }
    if (email !== undefined) updates.email = email
    if (displayName !== undefined) updates.displayName = displayName

    await fsContext.users.update(userId, updates)
    logger.flowStep('User updated')
}

export default handleUserUpdated
