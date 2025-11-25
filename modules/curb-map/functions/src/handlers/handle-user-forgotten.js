import { Member } from '../../../src/types/index.js'

/**
 * Handle UserForgotten action (GDPR)
 * Removes user from all organizations and deletes user document
 * @sig handleUserForgotten :: (FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserForgotten = async (fsContext, actionRequest) => {
    const { action, actorId } = actionRequest
    const { userId } = action

    const user = await fsContext.users.readOrNull(userId)
    if (!user) return

    const orgIds = user.organizations.map(orgMember => orgMember.organizationId)

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
        const memberData = Member.toFirestore({ ...member, removedAt, removedBy: actorId }, fsContext.encodeTimestamp)
        await fsContext.organizations.update(orgId, { [`members.${userId}`]: memberData })
    }
}

export default handleUserForgotten
