import admin from 'firebase-admin'
import t from 'tap'
import { createFirestoreContext } from '../../functions/src/firestore-context.js'
import { Action, FieldTypes } from '../../src/types/index.js'
import { asSignedInUser, uniqueEmail } from './auth-emulator.js'
import { buildActionPayload, expectError, rawHttpRequest, submitAndExpectSuccess } from './http-submit-action.js'

const { test } = t

test('Given UserCreated action', t => {
    t.test('When user is created Then user doc has empty organizations map', async t => {
        await asSignedInUser('user-created', async ({ namespace, token, actorUserId }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const userId = FieldTypes.newUserId()

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
        await asSignedInUser('missing-token', async ({ namespace }) => {
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

            const result = await rawHttpRequest({ body: buildActionPayload(namespace, action) })

            t.equal(result.status, 401, 'Then HTTP response is unauthorized')
            t.equal(result.data.status, 'unauthorized', 'Then payload indicates unauthorized access')

            const fsContext = createFirestoreContext(namespace, organizationId, null)
            const fn = () => fsContext.users.read(userId)
            await expectError(t, fn, /not found/, 'Then missing-user error is returned')
        })
        t.end()
    })

    t.end()
})
