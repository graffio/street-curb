import t from 'tap'
import { createFirestoreContext } from '../../functions/src/firestore-admin-context.js'
import { Action, FieldTypes } from '../../src/types/index.js'
import { asSignedInUser, uniqueEmail } from '../integration-test-helpers/auth-emulator.js'
import { submitAndExpectSuccess } from '../integration-test-helpers/http-submit-action.js'

const { test } = t

test('Given UserCreated action', t => {
    t.test('When user is created Then user doc has empty organizations map', async t => {
        await asSignedInUser('success', async ({ namespace, token }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const userId = FieldTypes.newUserId()

            const targetEmail = uniqueEmail('alice')
            const action = Action.UserCreated.from({ userId, email: targetEmail, displayName: 'Alice Chen' })

            await submitAndExpectSuccess({ action, namespace, token })

            const fsContext = createFirestoreContext(namespace, organizationId, null)
            const user = await fsContext.users.read(userId)

            t.ok(user.organizations, 'Then organizations map exists')
            t.same(user.organizations, [], 'Then organizations is an empty LookupTable')
            t.same(user.organizations.idField, 'organizationId', 'Then organizations is an empty LookupTable')
        })
        t.end()
    })

    t.end()
})
