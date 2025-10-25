import admin from 'firebase-admin'
import t from 'tap'
import { createFirestoreContext } from '../../functions/src/firestore-context.js'
import { Action, FieldTypes } from '../../src/types/index.js'
import { signInWithEmailLink, signInWithPhoneNumber, uniqueEmail, withAuthTestEnvironment } from './auth-emulator.js'
import { rawHttpRequest, submitAndExpectSuccess } from './http-submit-action.js'

const { test } = t

const withEmailAuth = (label, effect) =>
    withAuthTestEnvironment(async ({ namespace }) => {
        const { token, uid, userId: actorUserId } = await signInWithEmailLink(uniqueEmail(label))
        await effect({ namespace, token, uid, actorUserId })
    })

const withPhoneAuth = effect =>
    withAuthTestEnvironment(async ({ namespace }) => {
        const { token, uid, userId: actorUserId } = await signInWithPhoneNumber()
        await effect({ namespace, token, uid, actorUserId })
    })

const createOrganization = async ({
    namespace,
    token,
    organizationId = FieldTypes.newOrganizationId(),
    projectId = FieldTypes.newProjectId(),
    name = 'Test Org',
}) => {
    await submitAndExpectSuccess({
        action: Action.OrganizationCreated.from({ organizationId, projectId, name }),
        namespace,
        token,
    })
    return { organizationId, projectId }
}

const createUser = async ({ namespace, token, userId = FieldTypes.newUserId(), email, displayName }) => {
    // Always use unique email to avoid collisions in parallel tests
    const userEmail = email || `${userId}@users.test`

    // Always create fresh auth user (don't reuse existing)
    const authUser = await admin.auth().createUser({ email: userEmail, password: 'Passw0rd!' })

    // Note: NOT setting custom claims here - handler should do it
    await submitAndExpectSuccess({
        action: Action.UserCreated.from({ userId, email: userEmail, displayName, authUid: authUser.uid }),
        namespace,
        token,
    })

    return { userId, authUid: authUser.uid }
}

const addMember = ({ namespace, token, userId, organizationId, role, displayName }) =>
    submitAndExpectSuccess({
        action: Action.MemberAdded.from({ userId, organizationId, role, displayName }),
        namespace,
        token,
    })

const removeMember = ({ namespace, token, userId, organizationId }) =>
    submitAndExpectSuccess({ action: Action.MemberRemoved.from({ userId, organizationId }), namespace, token })

const changeRole = ({ namespace, token, userId, organizationId, role }) =>
    submitAndExpectSuccess({ action: Action.RoleChanged.from({ userId, organizationId, role }), namespace, token })

const firestoreState = async ({ namespace, organizationId, projectId, userId }) => {
    const fsContext = createFirestoreContext(namespace, organizationId, projectId)
    const org = await fsContext.organizations.read(organizationId)
    const user = userId ? await fsContext.users.read(userId) : null
    return { org, user }
}

const buildPayload = (namespace, action) => ({
    action: Action.toFirestore(action),
    idempotencyKey: FieldTypes.newIdempotencyKey(),
    correlationId: FieldTypes.newCorrelationId(),
    namespace,
})

test('Given MemberAdded action', t => {
    t.test('When member already active Then reject with validation error', async t => {
        await withEmailAuth('member-added-duplicate', async ({ namespace, token }) => {
            const { organizationId } = await createOrganization({ namespace, token })
            const { userId, authUid } = await createUser({
                namespace,
                token,
                displayName: 'Alice',
                // email defaults to unique `${userId}@users.test`
            })

            // Verify userId claim was set by handler
            const authUser = await admin.auth().getUser(authUid)
            t.ok(authUser.customClaims?.userId, 'Then userId claim is set on auth user')
            t.equal(authUser.customClaims.userId, userId, 'Then userId claim matches Firestore userId')

            await addMember({ namespace, token, userId, organizationId, role: 'admin', displayName: 'Alice' })

            try {
                await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Alice' })
                t.fail('Then duplicate member should be rejected')
            } catch (error) {
                t.match(error.message, /already active|already exists/, 'Then validation error thrown')
            }
        })
        t.end()
    })

    t.test('When request omits token Then authentication fails with HTTP 401', async t => {
        await withEmailAuth('member-added-no-token', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({
                namespace,
                token,
                displayName: 'Missing Token',
                // email defaults to unique `${userId}@users.test`
            })

            const result = await rawHttpRequest({
                body: buildPayload(
                    namespace,
                    Action.MemberAdded.from({ userId, organizationId, role: 'member', displayName: 'Missing Token' }),
                ),
            })

            t.equal(result.status, 401, 'Then HTTP response is unauthorized')
            t.equal(result.data.status, 'unauthorized', 'Then payload indicates unauthorized access')

            const { org } = await firestoreState({ namespace, organizationId, projectId })
            t.notOk(org.members?.[userId], 'Then member not written')
        })
        t.end()
    })

    t.test('When new member added Then metadata uses actor userId claim', async t => {
        await withEmailAuth('member-added-success', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Bob' })

            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Bob Smith' })

            const { org, user } = await firestoreState({ namespace, organizationId, projectId, userId })

            t.equal(org.members[userId].addedBy, actorUserId, 'Then addedBy set from token userId claim')
            t.equal(user.organizations[organizationId], 'member', 'Then user.organizations has entry')
        })
        t.end()
    })

    t.test('When removed member reactivated Then claims and metadata refresh', async t => {
        await withEmailAuth('member-added-reactivate', async ({ namespace, token, uid, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Carol' })

            await addMember({ namespace, token, userId, organizationId, role: 'viewer', displayName: 'Carol Lee' })
            await removeMember({ namespace, token, userId, organizationId })
            await addMember({
                namespace,
                token,
                userId,
                organizationId,
                role: 'admin',
                displayName: 'Carol Lee (Admin)',
            })

            const { org, user } = await firestoreState({ namespace, organizationId, projectId, userId })

            t.equal(org.members[userId].removedAt, null, 'Then removedAt cleared')
            t.equal(user.organizations[organizationId], 'admin', 'Then user organization role updated')
            t.equal(org.members[userId].addedBy, actorUserId, 'Then addedBy uses token userId claim')
        })
        t.end()
    })

    t.test('When phone sign-in token used Then member added successfully', async t => {
        await withPhoneAuth(async ({ namespace, token, uid, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token, name: 'Phone Org' })
            const { userId } = await createUser({ namespace, token, displayName: 'Phone User' })

            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Phone User' })

            const { org } = await firestoreState({ namespace, organizationId, projectId, userId })
            t.equal(org.members[userId].addedBy, actorUserId, 'Then addedBy uses token userId claim')
        })
        t.end()
    })

    t.end()
})

test('Given MemberRemoved action', t => {
    t.test('When member not found Then reject with validation error', async t => {
        await withEmailAuth('member-removed-missing', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const userId = FieldTypes.newUserId()

            try {
                await removeMember({ namespace, token, userId, organizationId })
                t.fail('Then member not found should be rejected')
            } catch (error) {
                t.match(error.message, /not found|does not exist/, 'Then validation error thrown')
            }

            const { org } = await firestoreState({ namespace, organizationId, projectId })
            t.notOk(org.members?.[userId], 'Then org remains unchanged')
        })
        t.end()
    })

    t.test('When member already removed Then reject with validation error', async t => {
        await withEmailAuth('member-removed-again', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Dave' })

            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Dave' })
            await removeMember({ namespace, token, userId, organizationId })

            try {
                await removeMember({ namespace, token, userId, organizationId })
                t.fail('Then already removed member should be rejected')
            } catch (error) {
                t.match(error.message, /already removed|not active/, 'Then validation error thrown')
            }

            const { org } = await firestoreState({ namespace, organizationId, projectId })
            t.ok(org.members[userId].removedAt, 'Then removedAt remains from first removal')
        })
        t.end()
    })

    t.test('When member removed Then metadata and claims record actor userId', async t => {
        await withEmailAuth('member-removed-success', async ({ namespace, token, uid, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Eve' })

            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Eve Smith' })
            await removeMember({ namespace, token, userId, organizationId })

            const { org } = await firestoreState({ namespace, organizationId, projectId, userId })

            t.ok(org.members[userId].removedAt, 'Then removedAt is set')
            t.equal(org.members[userId].removedBy, actorUserId, 'Then removedBy uses token userId claim')
        })
        t.end()
    })

    t.test('When request omits token Then removal call is rejected', async t => {
        await withEmailAuth('member-removed-unauth', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Unauth' })

            await addMember({ namespace, token, userId, organizationId, role: 'viewer', displayName: 'Unauth' })

            const result = await rawHttpRequest({
                body: buildPayload(namespace, Action.MemberRemoved.from({ userId, organizationId })),
            })

            t.equal(result.status, 401, 'Then HTTP response is unauthorized')

            const { org } = await firestoreState({ namespace, organizationId, projectId })
            t.ok(org.members?.[userId], 'Then member still present')
        })
        t.end()
    })

    t.end()
})

test('Given RoleChanged action', t => {
    t.test('When member not found Then reject with validation error', async t => {
        await withEmailAuth('role-change-missing', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const userId = FieldTypes.newUserId()

            try {
                await changeRole({ namespace, token, userId, organizationId, role: 'admin' })
                t.fail('Then member not found should be rejected')
            } catch (error) {
                t.match(error.message, /not found|does not exist/, 'Then validation error thrown')
            }

            const { org } = await firestoreState({ namespace, organizationId, projectId })
            t.notOk(org.members?.[userId], 'Then org remains unchanged')
        })
        t.end()
    })

    t.test('When member removed Then role change rejected', async t => {
        await withEmailAuth('role-change-removed', async ({ namespace, token }) => {
            const { organizationId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Frank' })

            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Frank' })
            await removeMember({ namespace, token, userId, organizationId })

            try {
                await changeRole({ namespace, token, userId, organizationId, role: 'admin' })
                t.fail('Then removed member role change should be rejected')
            } catch (error) {
                t.match(error.message, /removed|not active/, 'Then validation error thrown')
            }
        })
        t.end()
    })

    t.test('When role changed Then organization, user, and claims update', async t => {
        await withEmailAuth('role-change-success', async ({ namespace, token, userId: actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Grace' })

            await addMember({ namespace, token, userId, organizationId, role: 'viewer', displayName: 'Grace' })
            await changeRole({ namespace, token, userId, organizationId, role: 'admin' })

            const { org, user } = await firestoreState({ namespace, organizationId, projectId, userId })

            t.equal(org.members[userId].role, 'admin', 'Then org member role updated')
            t.equal(user.organizations[organizationId], 'admin', 'Then user org map updated')
        })
        t.end()
    })

    t.test('When request omits token Then role change is rejected', async t => {
        await withEmailAuth('role-change-unauth', async ({ namespace, token }) => {
            const { organizationId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Grace' })
            await addMember({ namespace, token, userId, organizationId, role: 'viewer', displayName: 'Grace' })

            const result = await rawHttpRequest({
                body: buildPayload(namespace, Action.RoleChanged.from({ userId, organizationId, role: 'admin' })),
            })

            t.equal(result.status, 401, 'Then HTTP response is unauthorized')
        })
        t.end()
    })

    t.end()
})
