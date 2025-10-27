/**
 * Handle RoleChanged action
 * Updates member role in organization
 * @sig handleRoleChanged :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleRoleChanged = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { userId, organizationId, role } = action

    const org = await fsContext.organizations.read(organizationId)
    const member = org.members?.[userId]

    // Validate: member must exist and not be removed
    if (!member) throw new Error(`Member ${userId} does not exist in organization ${organizationId}`)
    if (member.removedAt !== null) throw new Error(`Member ${userId} is removed from organization ${organizationId}`)

    // Atomic update: org.members[userId].role and user.organizations[orgId]
    await fsContext.organizations.update(organizationId, { [`members.${userId}.role`]: role })
    await fsContext.users.update(userId, { [`organizations.${organizationId}`]: role })

    logger.flowStep('Role changed')
}

export default handleRoleChanged
