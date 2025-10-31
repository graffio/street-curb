import admin from 'firebase-admin'
import { createFirestoreContext } from '../../functions/src/firestore-context.js'
import { Action, FieldTypes } from '../../src/types/index.js'
import { submitAndExpectSuccess } from './http-submit-action.js'

/**
 * Domain-specific test fixtures for integration tests.
 * Provides common setup patterns for creating organizations, users, and members.
 */

/**
 * Create an organization with default project
 * @sig createOrganization :: ({ namespace: String, token: String, organizationId?: String, projectId?: String, name?: String }) -> Promise<{ organizationId: String, projectId: String }>
 */
const createOrganization = async ({
    namespace,
    token,
    organizationId = FieldTypes.newOrganizationId(),
    projectId = FieldTypes.newProjectId(),
    name = 'Test Org',
}) => {
    const action = Action.OrganizationCreated.from({ organizationId, projectId, name })
    await submitAndExpectSuccess({ action, namespace, token })
    return { organizationId, projectId }
}

/**
 * Create a user with Firebase Auth account
 * Always creates a fresh auth user to avoid collisions in parallel tests
 * Handler will set userId custom claim on the auth user
 *
 * @sig createUser :: ({ namespace: String, token: String, userId?: String, email?: String, displayName?: String }) -> Promise<{ userId: String, authUid: String }>
 */
const createUser = async ({ namespace, token, userId = FieldTypes.newUserId(), email, displayName }) => {
    // Always use unique email to avoid collisions in parallel tests
    const userEmail = email || `${userId}@users.test`

    // Always create fresh auth user (don't reuse existing)
    const authUser = await admin.auth().createUser({ email: userEmail, password: 'Passw0rd!' })

    // Note: NOT setting custom claims here - handler should do it
    const action = Action.UserCreated.from({ userId, email: userEmail, displayName, authUid: authUser.uid })
    await submitAndExpectSuccess({ action, namespace, token })

    return { userId, authUid: authUser.uid }
}

/**
 * Add a member to an organization
 * @sig addMember :: ({ namespace: String, token: String, userId: String, organizationId: String, role: String, displayName: String }) -> Promise<void>
 */
const addMember = async ({ namespace, token, userId, organizationId, role, displayName }) => {
    const action = Action.MemberAdded.from({ userId, organizationId, role, displayName })
    await submitAndExpectSuccess({ action, namespace, token })
}

/**
 * Remove a member from an organization
 * @sig removeMember :: ({ namespace: String, token: String, userId: String, organizationId: String }) -> Promise<void>
 */
const removeMember = async ({ namespace, token, userId, organizationId }) => {
    const action = Action.MemberRemoved.from({ userId, organizationId })
    await submitAndExpectSuccess({ action, namespace, token })
}

/**
 * Change a member's role in an organization
 * @sig changeRole :: ({ namespace: String, token: String, userId: String, organizationId: String, role: String }) -> Promise<void>
 */
const changeRole = async ({ namespace, token, userId, organizationId, role }) => {
    const action = Action.RoleChanged.from({ userId, organizationId, role })
    await submitAndExpectSuccess({ action, namespace, token })
}

/**
 * Read organization state from Firestore
 * @sig readOrganization :: ({ namespace: String, organizationId: String, projectId: String }) -> Promise<Organization | null>
 */
const readOrganization = async ({ namespace, organizationId, projectId }) => {
    const fsContext = createFirestoreContext(namespace, organizationId, projectId)
    return fsContext.organizations.readOrNull(organizationId)
}

/**
 * Read project state from Firestore
 * @sig readProject :: ({ namespace: String, organizationId: String, projectId: String }) -> Promise<Project | null>
 */
const readProject = async ({ namespace, organizationId, projectId }) => {
    const fsContext = createFirestoreContext(namespace, organizationId, projectId)
    return fsContext.projects.readOrNull(projectId)
}

/**
 * Read user state from Firestore
 * @sig readUser :: ({ namespace: String, organizationId: String, userId: String }) -> Promise<User | null>
 */
const readUser = async ({ namespace, organizationId, userId }) => {
    const fsContext = createFirestoreContext(namespace, organizationId, null)
    return fsContext.users.readOrNull(userId)
}

/**
 * Read organization and optional user state from Firestore
 * Useful for member-related tests that need to verify both org and user state
 *
 * @sig readOrgAndUser :: ({ namespace: String, organizationId: String, projectId: String, userId?: String }) -> Promise<{ org: Organization, user: User | null }>
 */
const readOrgAndUser = async ({ namespace, organizationId, projectId, userId }) => {
    const fsContext = createFirestoreContext(namespace, organizationId, projectId)
    const org = await fsContext.organizations.read(organizationId)
    const user = userId ? await fsContext.users.read(userId) : null
    return { org, user }
}

export {
    createOrganization,
    createUser,
    addMember,
    removeMember,
    changeRole,
    readOrganization,
    readProject,
    readUser,
    readOrgAndUser,
}
