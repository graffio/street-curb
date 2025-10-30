import { Member } from '../../../src/types/index.js'

/**
 * Handle UserForgotten action (GDPR)
 * Removes user from all organizations and deletes user document
 * @sig handleUserForgotten :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserForgotten = async (logger, fsContext, actionRequest) => {
    const { action, actorId } = actionRequest
    const { userId } = action

    const user = await fsContext.users.readOrNull(userId)
    if (!user) {
        logger.flowStep('User not found, nothing to forget')
        return
    }

    const organizations = user.organizations || {}
    const orgIds = Object.keys(organizations)

    // Phase 1: Read
    const organizationsToUpdate = []
    for (const orgId of orgIds) {
        const org = await fsContext.organizations.read(orgId)
        const member = org.members[userId]
        if (member && !member.removedAt) organizationsToUpdate.push({ orgId, member })
    }

    // Phase 2: Write
    const removedAt = new Date()

    await fsContext.users.delete(userId)
    for (const { orgId, member } of organizationsToUpdate) {
        const memberData = fsContext.encodeTimestamps(Member, { ...member, removedAt, removedBy: actorId })
        await fsContext.organizations.update(orgId, { [`members.${userId}`]: memberData })
    }

    logger.flowStep('User forgotten (GDPR)')
}

export default handleUserForgotten
