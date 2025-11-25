/**
 * Handle UserUpdated action
 * Updates user email and/or displayName
 * @sig handleUserUpdated :: (FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserUpdated = async (fsContext, actionRequest) => {
    const { action, actorId } = actionRequest
    const { userId, displayName } = action

    if (!displayName) return

    // Read user to find all their organizations
    const user = await fsContext.users.read(userId)
    const organizationIds = user.organizations.map(orgMember => orgMember.organizationId)

    const metadata = { updatedAt: new Date(), updatedBy: actorId }
    await fsContext.users.update(userId, { displayName, ...metadata })

    // Create org-specific context (reusing same transaction)
    for (const id of organizationIds)
        await fsContext.forOrganization(id).organizations.update(id, { [`members.${userId}.displayName`]: displayName })
}

export default handleUserUpdated
