import admin from 'firebase-admin'
import { generateMetadata, updatedMetadata } from '../shared.js'

/**
 * Handle UserCreated action
 * Creates user document with empty organizations map
 * Sets userId custom claim on Firebase Auth user
 *
 * NOTE: In production, PasscodeVerified action (F121) should set this claim BEFORE
 * UserCreated is submitted (to avoid 401 deadlock). This claim-setting is a safety
 * net for robustness, but the claim should already exist when this handler runs.
 *
 * @sig handleUserCreated :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserCreated = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { userId, email, displayName, authUid } = action
    const metadata = generateMetadata(fsContext, actionRequest)

    const user = { id: userId, email, displayName, organizations: {}, ...metadata }
    await fsContext.users.write(user)

    // Set userId custom claim to link Firebase Auth token to Firestore user doc
    await admin.auth().setCustomUserClaims(authUid, { userId })

    logger.flowStep('User created')
}

/**
 * Handle UserUpdated action
 * Updates user email and/or displayName
 * @sig handleUserUpdated :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserUpdated = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { userId, email, displayName } = action
    const metadata = updatedMetadata(fsContext, actionRequest)

    const updates = { ...metadata }
    if (email !== undefined) updates.email = email
    if (displayName !== undefined) updates.displayName = displayName

    await fsContext.users.update(userId, updates)
    logger.flowStep('User updated')
}

/**
 * Handle MemberAdded action
 * Adds or reactivates member in organization
 * @sig handleMemberAdded :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleMemberAdded = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { userId, organizationId, role, displayName } = action

    const org = await fsContext.organizations.read(organizationId)
    const existingMember = org.members?.[userId]

    // Validate: if member exists and is active, reject
    if (existingMember && existingMember.removedAt === null)
        throw new Error(`Member ${userId} is already active in organization ${organizationId}`)

    const addedAt = fsContext.serverTimestamp()
    const addedBy = actionRequest.actorId
    const memberData = { displayName, role, addedAt, addedBy, removedAt: null, removedBy: null }

    // Atomic update: org.members[userId] and user.organizations[orgId]
    await fsContext.organizations.update(organizationId, { [`members.${userId}`]: memberData })
    await fsContext.users.update(userId, { [`organizations.${organizationId}`]: role })

    logger.flowStep('Member added')
}

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
        [`members.${userId}.removedAt`]: fsContext.serverTimestamp(),
        [`members.${userId}.removedBy`]: actionRequest.actorId,
    }

    // Atomic update: set removedAt/removedBy and delete user.organizations[orgId]
    await fsContext.organizations.update(organizationId, removed)
    await fsContext.users.update(userId, { [`organizations.${organizationId}`]: fsContext.deleteField() })

    logger.flowStep('Member removed')
}

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

/**
 * Handle UserForgotten action (GDPR)
 * Removes user from all organizations and deletes user document
 * @sig handleUserForgotten :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserForgotten = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { userId } = action

    const user = await fsContext.users.readOrNull(userId)
    if (!user) {
        logger.flowStep('User not found, nothing to forget')
        return
    }

    const organizations = user.organizations || {}
    const orgIds = Object.keys(organizations)

    // Phase 1: Read
    const orgsToUpdate = []
    for (const orgId of orgIds) {
        const org = await fsContext.organizations.read(orgId)
        if (org.members?.[userId] && org.members[userId].removedAt === null) orgsToUpdate.push(orgId)
    }

    // Phase 2: Write
    await fsContext.users.delete(userId)
    for (const orgId of orgsToUpdate)
        await fsContext.organizations.update(orgId, {
            [`members.${userId}.removedAt`]: fsContext.serverTimestamp(),
            [`members.${userId}.removedBy`]: actionRequest.actorId,
        })

    logger.flowStep('User forgotten (GDPR)')
}

export {
    handleMemberAdded,
    handleMemberRemoved,
    handleRoleChanged,
    handleUserCreated,
    handleUserForgotten,
    handleUserUpdated,
}
