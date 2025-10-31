import t from 'tap'
import { Action } from '../../src/types/index.js'
import { asSignedInUser, uniqueEmail } from '../integration-test-helpers/auth-emulator.js'
import { submitAndExpectSuccess } from '../integration-test-helpers/http-submit-action.js'
import {
    addMember,
    createOrganization,
    createUser,
    readOrganization,
    readUser,
} from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given UserUpdated action', t => {
    t.test('When displayName is updated Then displayName changes and organizations unchanged', async t => {
        await asSignedInUser('display-name', async ({ namespace, token }) => {
            const { organizationId } = await createOrganization({ namespace, token, name: 'Test Org' })
            const originalEmail = uniqueEmail('display-name')
            const { userId } = await createUser({ namespace, token, email: originalEmail, displayName: 'Old Name' })
            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Old Name' })

            await submitAndExpectSuccess({
                action: Action.UserUpdated.from({ userId, displayName: 'New Name' }),
                namespace,
                token,
            })

            const user = await readUser({ namespace, organizationId, userId })

            t.equal(user.displayName, 'New Name', 'Then displayName is updated')
            t.equal(user.email, originalEmail, 'Then email unchanged')
            t.ok(user.organizations[organizationId], 'Then organizations map unchanged')

            // organization member should show new displayName
            const org = await readOrganization({ namespace, organizationId })
            t.equal(org.members[userId].displayName, 'New Name', 'Then member displayName synced in organization')
        })
        t.end()
    })

    t.end()
})
