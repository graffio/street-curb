import admin from 'firebase-admin'
import t from 'tap'
import { createFirestoreContext } from '../../functions/src/firestore-context.js'
import { Action, FieldTypes } from '../../src/types/index.js'
import { asSignedInUser, uniqueEmail } from '../integration-test-helpers/auth-emulator.js'
import { submitAndExpectSuccess } from '../integration-test-helpers/http-submit-action.js'

const { test } = t

test('Given UserCreated action', t => {
    t.test('When user is created Then user doc has empty organizations map and auth claim set', async t => {
        await asSignedInUser('success', async ({ namespace, token }) => {
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
            t.same(user.organizations, [], 'Then organizations is an empty LookupTable')
            t.same(user.organizations.idField, 'organizationId', 'Then organizations is an empty LookupTable')

            // Verify userId claim was set on target user's Firebase Auth record
            const authUser = await admin.auth().getUser(targetAuthUser.uid)
            t.ok(authUser.customClaims?.userId, 'Then userId claim is set on auth user')
            t.equal(authUser.customClaims.userId, userId, 'Then userId claim matches Firestore userId')
        })
        t.end()
    })

    t.end()
})
