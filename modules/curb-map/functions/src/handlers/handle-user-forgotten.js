/**
 * Handle UserForgotten action (GDPR)
 * Removes user from all organizations and deletes user document
 * @sig handleUserForgotten :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserForgotten = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { userId } = action

    const user = await fsContext.users.readOrNull(userId)
    if (!user) {
        logger.flowStep('User not found, nothing to forget')
        return
    }

    const organizations = user.organizations || {}
    const orgIds = Object.keys(organizations)

    // Phase 1: Read
    const orgsToUpdate = []
    for (const orgId of orgIds) {
        const org = await fsContext.organizations.read(orgId)
        if (org.members?.[userId] && org.members[userId].removedAt === null) orgsToUpdate.push(orgId)
    }

    // Phase 2: Write
    await fsContext.users.delete(userId)
    for (const orgId of orgsToUpdate)
        await fsContext.organizations.update(orgId, {
            [`members.${userId}.removedAt`]: new Date(),
            [`members.${userId}.removedBy`]: actionRequest.actorId,
        })

    logger.flowStep('User forgotten (GDPR)')
}

export default handleUserForgotten
