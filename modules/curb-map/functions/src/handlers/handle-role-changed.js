import { Member } from '../../../src/types/index.js'

/**
 * Handle RoleChanged action
 * Updates member role in organization
 * @sig handleRoleChanged :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleRoleChanged = async (logger, fsContext, actionRequest) => {
    const { action, organizationId } = actionRequest
    const { userId, role } = action

    const organization = await fsContext.organizations.read(organizationId)
    const member = organization.members?.[userId]

    // Validate: member must exist and not be removed
    if (!member) throw new Error(`Member ${userId} does not exist in organization ${organizationId}`)
    if (member.removedAt) throw new Error(`Member ${userId} is removed from organization ${organizationId}`)

    // After existing validation, before writing
    if (role !== 'admin') {
        // Downgrading from admin
        const activeAdmins = organization.members.filter(m => !m.removedAt && m.role === 'admin')
        if (activeAdmins.length === 1 && activeAdmins[0].userId === userId)
            throw new Error(`Cannot change role of ${userId} - last admin of organization ${organizationId}`)
    }

    // Update member with new role
    const memberData = Member.toFirestore({ ...member, role }, fsContext.encodeTimestamp)

    // Atomic update: write whole member object and update user.organizations[orgId]
    await fsContext.organizations.update(organizationId, { [`members.${userId}`]: memberData })

    const orgMember = { organizationId, role }
    await fsContext.users.update(userId, { [`organizations.${organizationId}`]: orgMember })

    logger.flowStep('Role changed')
}

export default handleRoleChanged
