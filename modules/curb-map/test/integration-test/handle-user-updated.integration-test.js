import t from 'tap'
import { Action } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { submitActionRequest, submitAndExpectSuccess } from '../integration-test-helpers/http-submit-action.js'
import { createOrganization, createUser, readOrganization, readUser } from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given UserUpdated action', t => {
    t.test('When displayName is updated Then displayName changes and organizations unchanged', async t => {
        await asSignedInUser('display-name', async ({ namespace, token, actorUserId }) => {
            const { organizationId } = await createOrganization({ namespace, token, name: 'Test Org' })

            const userId = actorUserId

            const action = Action.UserUpdated.from({ userId, displayName: 'New Name' })
            await submitAndExpectSuccess({ action, namespace, token })

            const user = await readUser({ namespace, organizationId, userId })

            t.equal(user.displayName, 'New Name', 'Then displayName is updated')
            t.ok(user.organizations[organizationId], 'Then organizations map unchanged')

            // organization member should show new displayName
            const org = await readOrganization({ namespace, organizationId })
            t.equal(org.members[userId].displayName, 'New Name', 'Then member displayName synced in organization')
        })
        t.end()
    })

    t.test('RBAC: When user tries to update another user Then returns 401 unauthorized', async t => {
        await asSignedInUser('update-other-denied', async ({ namespace, token, actorUserId }) => {
            const { organizationId } = await createOrganization({ namespace, token, name: 'Test Org' })

            // Create another user
            const { userId: otherUserId } = await createUser({ namespace, token, displayName: 'Other User' })

            // Try to update the other user
            const action = Action.UserUpdated.from({ userId: otherUserId, displayName: 'Hacked Name' })
            const result = await submitActionRequest({ action, namespace, token })

            t.equal(result.status, 401, 'Then HTTP status is 401')
            t.equal(result.data.status, 'unauthorized', 'Then status is unauthorized')
            t.match(result.data.error, /trying to update user/, 'Then error mentions unauthorized update attempt')

            // Verify user was not modified
            const user = await readUser({ namespace, organizationId, userId: otherUserId })
            t.equal(user.displayName, 'Other User', 'Then target user displayName unchanged')
        })
        t.end()
    })

    t.end()
})
