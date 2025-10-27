import t from 'tap'
import { Action } from '../../src/types/index.js'
import { asSignedInUser, uniqueEmail } from './auth-emulator.js'
import { submitAndExpectSuccess } from './http-submit-action.js'
import { addMember, createOrganization, createUser, readUser } from './test-helpers.js'

const { test } = t

test('Given UserUpdated action', t => {
    t.test('When user email is updated Then email changes and organizations unchanged', async t => {
        await asSignedInUser('user-updated-email', async ({ namespace, token, actorUserId }) => {
            const { organizationId } = await createOrganization({ namespace, token, name: 'Test Org' })
            const { userId } = await createUser({
                namespace,
                token,
                email: uniqueEmail('user-updated-email-old'),
                displayName: 'Alice',
            })
            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Alice' })

            await submitAndExpectSuccess({
                action: Action.UserUpdated.from({ userId, email: 'new@example.com' }),
                namespace,
                token,
            })

            const user = await readUser({ namespace, organizationId, userId })

            t.equal(user.email, 'new@example.com', 'Then email is updated')
            t.equal(user.displayName, 'Alice', 'Then displayName unchanged')
            t.ok(user.organizations[organizationId], 'Then organizations map unchanged')
            t.ok(user.updatedAt, 'Then updatedAt is set')
            t.equal(user.updatedBy, actorUserId, 'Then updatedBy matches token userId claim')
        })
        t.end()
    })

    t.test('When displayName is updated Then displayName changes and organizations unchanged', async t => {
        await asSignedInUser('user-updated-display', async ({ namespace, token, actorUserId }) => {
            const { organizationId } = await createOrganization({ namespace, token, name: 'Test Org' })
            const originalEmail = uniqueEmail('user-updated-display-old')
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
            t.ok(user.updatedAt, 'Then updatedAt is set')
            t.equal(user.updatedBy, actorUserId, 'Then updatedBy matches token userId claim')
        })
        t.end()
    })

    t.end()
})
