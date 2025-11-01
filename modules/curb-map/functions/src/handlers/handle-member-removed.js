import { Member } from '../../../src/types/index.js'

/**
 * Handle MemberRemoved action
 * Soft-deletes member from organization
 * @sig handleMemberRemoved :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleMemberRemoved = async (logger, fsContext, actionRequest) => {
    const { action, actorId } = actionRequest
    const { userId, organizationId } = action

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
    const memberData = fsContext.encodeTimestamps(Member, { ...member, removedAt: new Date(), removedBy: actorId })

    // Atomic update: write whole member object and delete user.organizations[orgId]
    await fsContext.organizations.update(organizationId, { [`members.${userId}`]: memberData })
    await fsContext.users.update(userId, { [`organizations.${organizationId}`]: fsContext.deleteField() })

    logger.flowStep('Member removed')
}

export default handleMemberRemoved
