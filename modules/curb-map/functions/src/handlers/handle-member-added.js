import { Member } from '../../../src/types/index.js'

/**
 * Handle MemberAdded action
 * Adds or reactivates member in organization
 * @sig handleMemberAdded :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleMemberAdded = async (logger, fsContext, actionRequest) => {
    const { action, actorId: addedBy } = actionRequest
    const { userId, organizationId, role, displayName } = action

    const org = await fsContext.organizations.read(organizationId)
    const existingMember = org.members?.[userId]

    // Validate: if member exists and is active, reject
    if (existingMember && !existingMember.removedAt)
        throw new Error(`Member ${userId} is already active in organization ${organizationId}`)

    const memberData = Member.toFirestore(
        { userId, displayName, role, addedAt: new Date(), addedBy },
        fsContext.encodeTimestamp,
    )

    // Atomic update: org.members[userId] and user.organizations[orgId]
    await fsContext.organizations.update(organizationId, { [`members.${userId}`]: memberData })

    const orgMember = { organizationId, role }
    await fsContext.users.update(userId, { [`organizations.${organizationId}`]: orgMember })

    logger.flowStep('Member added')
}

export default handleMemberAdded
