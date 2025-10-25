import admin from 'firebase-admin'
import t from 'tap'
import { createFirestoreContext } from '../../functions/src/firestore-context.js'
import { Action, FieldTypes } from '../../src/types/index.js'
import { signInWithEmailLink, uniqueEmail, withAuthTestEnvironment } from './auth-emulator.js'
import { rawHttpRequest, submitAndExpectSuccess } from './http-submit-action.js'

const { test } = t
test('Given UserCreated action', t => {
    t.test('When user is created Then user doc has empty organizations map', async t => {
        await withAuthTestEnvironment(async ({ namespace }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const userId = FieldTypes.newUserId()
            const { token, userId: actorUserId } = await signInWithEmailLink(uniqueEmail('user-created'))

            // Create separate Firebase Auth user for the target user
            const targetEmail = uniqueEmail('alice')
            const targetAuthUser = await admin.auth().createUser({ email: targetEmail, password: 'Passw0rd!' })

            const action = Action.UserCreated.from({
                userId,
                email: targetEmail,
                displayName: 'Alice Chen',
                authUid: targetAuthUser.uid,
            })

            await submitAndExpectSuccess({ action, namespace, token })

            const fsContext = createFirestoreContext(namespace, organizationId, null)
            const user = await fsContext.users.read(userId)

            t.ok(user.organizations, 'Then organizations map exists')
            t.same(user.organizations, {}, 'Then organizations map is empty')
            t.ok(user.createdAt, 'Then createdAt is set')
            t.equal(user.createdBy, actorUserId, 'Then createdBy matches token userId claim')
            t.equal(user.updatedBy, actorUserId, 'Then updatedBy matches token userId claim')

            // Verify userId claim was set on target user's Firebase Auth record
            const authUser = await admin.auth().getUser(targetAuthUser.uid)
            t.ok(authUser.customClaims?.userId, 'Then userId claim is set on auth user')
            t.equal(authUser.customClaims.userId, userId, 'Then userId claim matches Firestore userId')
        })
        t.end()
    })

    t.test('When request omits token Then authentication fails with HTTP 401', async t => {
        await withAuthTestEnvironment(async ({ namespace }) => {
            const userId = FieldTypes.newUserId()
            const organizationId = FieldTypes.newOrganizationId()
            const missingTokenEmail = `missing-token-${FieldTypes.newUserId()}@example.com`
            const authUser = await admin.auth().createUser({ email: missingTokenEmail, password: 'Passw0rd!' })

            const action = Action.UserCreated.from({
                userId,
                email: missingTokenEmail,
                displayName: 'Missing Token',
                authUid: authUser.uid,
            })
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                namespace,
            }

            const result = await rawHttpRequest({ body: payload })

            t.equal(result.status, 401, 'Then HTTP response is unauthorized')
            t.equal(result.data.status, 'unauthorized', 'Then payload indicates unauthorized access')

            const fsContext = createFirestoreContext(namespace, organizationId, null)
            try {
                await fsContext.users.read(userId)
                t.fail('Then user doc should not be created')
            } catch (error) {
                t.match(error.message, /not found/, 'Then missing-user error is returned')
            }
        })
        t.end()
    })
    t.end()
})

test('Given UserUpdated action', t => {
    t.test('When user email is updated Then email changes and organizations unchanged', async t => {
        await withAuthTestEnvironment(async ({ namespace }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()
            const userId = FieldTypes.newUserId()
            const { token, userId: actorUserId } = await signInWithEmailLink(uniqueEmail('user-updated-email'))

            await submitAndExpectSuccess({
                action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
                namespace,
                token,
            })

            const originalEmail = uniqueEmail('user-updated-email-old')
            const authUser = await admin.auth().createUser({ email: originalEmail, password: 'Passw0rd!' })

            await submitAndExpectSuccess({
                action: Action.UserCreated.from({
                    userId,
                    email: originalEmail,
                    displayName: 'Alice',
                    authUid: authUser.uid,
                }),
                namespace,
                token,
            })
            await submitAndExpectSuccess({
                action: Action.MemberAdded.from({ userId, organizationId, role: 'member', displayName: 'Alice' }),
                namespace,
                token,
            })

            await submitAndExpectSuccess({
                action: Action.UserUpdated.from({ userId, email: 'new@example.com' }),
                namespace,
                token,
            })

            const fsContext = createFirestoreContext(namespace, organizationId, null)
            const user = await fsContext.users.read(userId)

            t.equal(user.email, 'new@example.com', 'Then email is updated')
            t.equal(user.displayName, 'Alice', 'Then displayName unchanged')
            t.ok(user.organizations[organizationId], 'Then organizations map unchanged')
            t.ok(user.updatedAt, 'Then updatedAt is set')
            t.equal(user.updatedBy, actorUserId, 'Then updatedBy matches token userId claim')
        })
        t.end()
    })

    t.test('When displayName is updated Then displayName changes and organizations unchanged', async t => {
        await withAuthTestEnvironment(async ({ namespace }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()
            const userId = FieldTypes.newUserId()
            const { token, userId: actorUserId } = await signInWithEmailLink(uniqueEmail('user-updated-display'))

            await submitAndExpectSuccess({
                action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
                namespace,
                token,
            })

            const originalEmail = uniqueEmail('user-updated-display-old')
            const authUser = await admin.auth().createUser({ email: originalEmail, password: 'Passw0rd!' })

            await submitAndExpectSuccess({
                action: Action.UserCreated.from({
                    userId,
                    email: originalEmail,
                    displayName: 'Old Name',
                    authUid: authUser.uid,
                }),
                namespace,
                token,
            })
            await submitAndExpectSuccess({
                action: Action.MemberAdded.from({ userId, organizationId, role: 'member', displayName: 'Old Name' }),
                namespace,
                token,
            })

            await submitAndExpectSuccess({
                action: Action.UserUpdated.from({ userId, displayName: 'New Name' }),
                namespace,
                token,
            })

            const fsContext = createFirestoreContext(namespace, organizationId, null)
            const user = await fsContext.users.read(userId)

            t.equal(user.displayName, 'New Name', 'Then displayName is updated')
            t.equal(user.email, originalEmail, 'Then email unchanged')
            t.ok(user.organizations[organizationId], 'Then organizations map unchanged')
            t.ok(user.updatedAt, 'Then updatedAt is set')
            t.equal(user.updatedBy, actorUserId, 'Then updatedBy matches token userId claim')
        })
        t.end()
    })

    t.end()
})

test('Given UserForgotten action (GDPR)', t => {
    t.test('When user is forgotten Then removedAt set in all orgs and user deleted', async t => {
        await withAuthTestEnvironment(async ({ namespace }) => {
            const org1 = FieldTypes.newOrganizationId()
            const org2 = FieldTypes.newOrganizationId()
            const userId = FieldTypes.newUserId()
            const projectId = FieldTypes.newProjectId()
            const { token, userId: actorUserId } = await signInWithEmailLink(uniqueEmail('user-forgotten'))

            // Create organizations
            await submitAndExpectSuccess({
                action: Action.OrganizationCreated.from({ organizationId: org1, projectId, name: 'Org 1' }),
                namespace,
                token,
            })
            await submitAndExpectSuccess({
                action: Action.OrganizationCreated.from({
                    organizationId: org2,
                    projectId: FieldTypes.newProjectId(),
                    name: 'Org 2',
                }),
                namespace,
                token,
            })

            // Create user then add to org1 and org2
            const forgottenEmail = uniqueEmail('user-forgotten-user')
            const authUser = await admin.auth().createUser({ email: forgottenEmail, password: 'Passw0rd!' })

            await submitAndExpectSuccess({
                action: Action.UserCreated.from({
                    userId,
                    email: forgottenEmail,
                    displayName: 'User',
                    authUid: authUser.uid,
                }),
                namespace,
                token,
            })
            await submitAndExpectSuccess({
                action: Action.MemberAdded.from({ userId, organizationId: org1, role: 'admin', displayName: 'User' }),
                namespace,
                token,
            })
            await submitAndExpectSuccess({
                action: Action.MemberAdded.from({ userId, organizationId: org2, role: 'member', displayName: 'User' }),
                namespace,
                token,
            })

            // Forget user (GDPR)
            await submitAndExpectSuccess({
                action: Action.UserForgotten.from({ userId, reason: 'GDPR request' }),
                namespace,
                token,
            })

            const fsContext = createFirestoreContext(namespace, org1, projectId)

            // Verify removedAt set in all orgs
            const orgDoc1 = await fsContext.organizations.read(org1)
            const orgDoc2 = await fsContext.organizations.read(org2)
            t.ok(orgDoc1.members[userId].removedAt, 'Then removedAt set in org1')
            t.ok(orgDoc2.members[userId].removedAt, 'Then removedAt set in org2')
            t.equal(orgDoc1.members[userId].removedBy, actorUserId, 'Then removedBy set from token userId in org1')

            // Verify user deleted
            try {
                await fsContext.users.read(userId)
                t.fail('Then user doc should be deleted')
            } catch (error) {
                t.match(error.message, /not found/, 'Then user doc is deleted')
            }
        })
        t.end()
    })

    t.test('When user not found Then GDPR action handles gracefully', async t => {
        await withAuthTestEnvironment(async ({ namespace }) => {
            const userId = FieldTypes.newUserId()
            const { token } = await signInWithEmailLink(uniqueEmail('user-forgotten-missing'))
            await submitAndExpectSuccess({
                action: Action.UserForgotten.from({ userId, reason: 'User does not exist' }),
                namespace,
                token,
            })
        })
        t.pass('Then action completes without error')
        t.end()
    })

    t.test('When user has no organizations Then GDPR deletes user only', async t => {
        await withAuthTestEnvironment(async ({ namespace }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const userId = FieldTypes.newUserId()
            const { token } = await signInWithEmailLink(uniqueEmail('user-forgotten-orphan'))
            const orphanEmail = `orphan-${FieldTypes.newUserId()}@example.com`
            const authUser = await admin.auth().createUser({ email: orphanEmail, password: 'Passw0rd!' })
            await submitAndExpectSuccess({
                action: Action.UserCreated.from({
                    userId,
                    email: orphanEmail,
                    displayName: 'Orphan',
                    authUid: authUser.uid,
                }),
                namespace,
                token,
            })

            await submitAndExpectSuccess({
                action: Action.UserForgotten.from({ userId, reason: 'GDPR' }),
                namespace,
                token,
            })

            const fsContext = createFirestoreContext(namespace, organizationId, null)
            try {
                await fsContext.users.read(userId)
                t.fail('Then user should be deleted')
            } catch (error) {
                t.match(error.message, /not found/, 'Then user is deleted')
            }
        })
        t.end()
    })

    t.end()
})
