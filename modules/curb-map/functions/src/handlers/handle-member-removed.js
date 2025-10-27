/**
 * Handle MemberRemoved action
 * Soft-deletes member from organization
 * @sig handleMemberRemoved :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleMemberRemoved = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { userId, organizationId } = action

    const org = await fsContext.organizations.read(organizationId)
    const member = org.members?.[userId]

    // Validate: member must exist and not be removed
    if (!member) throw new Error(`Member ${userId} does not exist in organization ${organizationId}`)

    if (member.removedAt !== null)
        throw new Error(`Member ${userId} is already removed from organization ${organizationId}`)

    const removed = {
        [`members.${userId}.removedAt`]: new Date(),
        [`members.${userId}.removedBy`]: actionRequest.actorId,
    }

    // Atomic update: set removedAt/removedBy and delete user.organizations[orgId]
    await fsContext.organizations.update(organizationId, removed)
    await fsContext.users.update(userId, { [`organizations.${organizationId}`]: fsContext.deleteField() })

    logger.flowStep('Member removed')
}

export default handleMemberRemoved
