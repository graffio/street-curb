/**
 * Handle OrganizationDeleted action
 * Soft-deletes organization and removes from all member users
 * @sig handleOrganizationDeleted :: (FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleOrganizationDeleted = async (fsContext, actionRequest) => {
    const { organizationId, actorId } = actionRequest

    // Read organization
    const org = await fsContext.organizations.read(organizationId)

    // Get all active members (not already removed)
    const activeMembers = org.members.filter(m => !m.removedAt)

    // Update organization with deletion metadata
    const metadata = { deletedAt: new Date(), deletedBy: actorId, updatedAt: new Date(), updatedBy: actorId }
    await fsContext.organizations.update(organizationId, metadata)

    // Remove organization from each active member's user.organizations
    for (const member of activeMembers)
        await fsContext.users.update(member.userId, { [`organizations.${organizationId}`]: fsContext.deleteField() })
}

export default handleOrganizationDeleted
