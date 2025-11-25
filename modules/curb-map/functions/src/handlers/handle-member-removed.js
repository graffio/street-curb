import { Member } from '../../../src/types/index.js'

/**
 * Handle MemberRemoved action
 * Soft-deletes member from organization
 * @sig handleMemberRemoved :: (FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleMemberRemoved = async (fsContext, actionRequest) => {
    const { action, actorId, organizationId } = actionRequest
    const { userId } = action

    const org = await fsContext.organizations.read(organizationId)
    const member = org.members?.[userId]

    // Validate: member must exist and not be removed
    if (!member) throw new Error(`Member ${userId} does not exist in organization ${organizationId}`)
    if (member.removedAt) throw new Error(`Member ${userId} is already removed from organization ${organizationId}`)

    // After existing validation, before writing
    const activeAdmins = org.members.filter(m => !m.removedAt && m.role === 'admin')
    if (activeAdmins.length === 1 && activeAdmins[0].userId === userId)
        throw new Error(`Cannot remove ${userId} from ${organizationId} - they're the last admin `)

    // Update member with removedAt/removedBy fields
    const memberData = Member.toFirestore(
        { ...member, removedAt: new Date(), removedBy: actorId },
        fsContext.encodeTimestamp,
    )

    // Atomic update: write whole member object and delete user.organizations[orgId]
    await fsContext.organizations.update(organizationId, { [`members.${userId}`]: memberData })
    await fsContext.users.update(userId, { [`organizations.${organizationId}`]: fsContext.deleteField() })
}

export default handleMemberRemoved
