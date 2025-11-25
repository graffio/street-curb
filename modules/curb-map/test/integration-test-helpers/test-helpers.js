import admin from 'firebase-admin'
import { createFirestoreContext } from '../../functions/src/firestore-admin-context.js'
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
    const action = Action.OrganizationCreated.from({ projectId, name })
    await submitAndExpectSuccess({ action, namespace, token, organizationId, projectId })
    return { organizationId, projectId }
}

/**
 * Create a user with Firebase Auth account
 * Always creates a fresh auth user to avoid collisions in parallel tests
 *
 * @sig createUser :: ({ namespace: String, token: String, userId?: String, email?: String, displayName?: String }) -> Promise<{ userId: String, authUid: String }>
 */
const createUser = async ({ namespace, token, userId = FieldTypes.newUserId(), email, displayName }) => {
    // Always use unique email to avoid collisions in parallel tests
    const userEmail = email || `${userId}@users.test`

    // Always create fresh auth user (don't reuse existing)
    await admin.auth().createUser({ uid: userId, email: userEmail, password: 'Passw0rd!' })

    const action = Action.UserCreated.from({ userId, email: userEmail, displayName })
    await submitAndExpectSuccess({ action, namespace, token })

    return { userId }
}

/**
 * Add a member to an organization
 * @sig addMember :: ({ namespace: String, token: String, userId: String, organizationId: String, role: String, displayName: String }) -> Promise<void>
 */
const addMember = async ({ namespace, token, userId, organizationId, role, displayName }) => {
    const action = Action.MemberAdded.from({ userId, role, displayName })
    await submitAndExpectSuccess({ action, namespace, token, organizationId })
}

/**
 * Remove a member from an organization
 * @sig removeMember :: ({ namespace: String, token: String, userId: String, organizationId: String }) -> Promise<void>
 */
const removeMember = async ({ namespace, token, userId, organizationId }) => {
    const action = Action.MemberRemoved.from({ userId })
    await submitAndExpectSuccess({ action, namespace, token, organizationId })
}

/**
 * Change a member's role in an organization
 * @sig changeRole :: ({ namespace: String, token: String, userId: String, organizationId: String, role: String }) -> Promise<void>
 */
const changeRole = async ({ namespace, token, userId, organizationId, role }) => {
    const action = Action.RoleChanged.from({ userId, role })
    await submitAndExpectSuccess({ action, namespace, token, organizationId })
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

/**
 * Create an expired Firebase Auth token
 * Creates a custom token with 1-second expiry that can be used to test expired token handling
 * @sig createExpiredToken :: String -> Promise<String>
 */
const createExpiredToken = async userId => {
    // Create a custom token with 1-second expiry
    const customToken = await admin.auth().createCustomToken(userId, { exp: Math.floor(Date.now() / 1000) + 1 })

    // Exchange for ID token
    const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'
    const authUrl = `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-key`
    const signInResponse = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    })
    const { idToken } = await signInResponse.json()

    // Wait for token to expire
    await new Promise(resolve => setTimeout(resolve, 1100))

    return idToken
}

/**
 * Create object bypassing validation
 * Useful for testing metadata spoofing scenarios where we need invalid data
 * @sig bypassValidation :: (Type, Object) -> Object
 */
const bypassValidation = (Type, data) => {
    // Create raw object with @@tagName but skip .from() validation
    const tagName = Type.name || Object.keys(Type)[0]
    return { '@@tagName': tagName, ...data }
}

/**
 * Delete an organization
 * @sig deleteOrganization :: ({ namespace: String, token: String, organizationId: String, projectId?: String }) -> Promise<void>
 */
const deleteOrganization = async ({ namespace, token, organizationId, projectId }) => {
    const action = Action.OrganizationDeleted.from({})
    await submitAndExpectSuccess({ action, namespace, token, organizationId, projectId })
}

/**
 * Verify organization is soft-deleted with proper metadata
 * @sig verifyOrganizationSoftDeleted :: (TapTest, Organization, String) -> void
 */
const verifyOrganizationSoftDeleted = (t, org, actorUserId) => {
    t.ok(org.deletedAt, 'Then organization.deletedAt is set')
    t.equal(org.deletedBy, actorUserId, 'Then organization.deletedBy is set to actorId')
    t.ok(org.deletedAt instanceof Date, 'Then deletedAt is a Date object')
}

/**
 * Verify user no longer has organization in their organizations
 * @sig verifyUserLacksOrganization :: (TapTest, User, String) -> void
 */
const verifyUserLacksOrganization = (t, user, organizationId) => {
    t.notOk(user.organizations[organizationId], 'Then user.organizations no longer contains organizationId')
}

/**
 * Create a user and add them as a member to an organization
 * @sig createUserAndAddMember :: ({ namespace: String, token: String, organizationId: String, role: String, displayName: String, userId?: String }) -> Promise<{ userId: String }>
 */
const createUserAndAddMember = async ({ namespace, token, organizationId, role, displayName, userId }) => {
    const newUserId = userId || FieldTypes.newUserId()
    await createUser({ namespace, token, userId: newUserId, displayName })
    await addMember({ namespace, token, userId: newUserId, organizationId, role, displayName })
    return { userId: newUserId }
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
    createExpiredToken,
    bypassValidation,
    deleteOrganization,
    verifyOrganizationSoftDeleted,
    verifyUserLacksOrganization,
    createUserAndAddMember,
}
