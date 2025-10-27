import t from 'tap'
import { createFirestoreContext } from '../../../functions/src/firestore-context.js'
import { Action, FieldTypes } from '../../../src/types/index.js'
import { asSignedInUser, uniqueEmail } from '../integration-test-helpers/auth-emulator.js'
import { expectError, submitAndExpectSuccess } from '../integration-test-helpers/http-submit-action.js'
import { addMember, createOrganization, createUser } from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given UserForgotten action (GDPR)', t => {
    t.test('When user is forgotten Then removedAt set in all orgs and user deleted', async t => {
        await asSignedInUser('user-forgotten', async ({ namespace, token, actorUserId }) => {
            const { organizationId: org1, projectId } = await createOrganization({ namespace, token, name: 'Org 1' })
            const { organizationId: org2 } = await createOrganization({ namespace, token, name: 'Org 2' })

            const { userId } = await createUser({
                namespace,
                token,
                email: uniqueEmail('user-forgotten-user'),
                displayName: 'User',
            })

            await addMember({ namespace, token, userId, organizationId: org1, role: 'admin', displayName: 'User' })
            await addMember({ namespace, token, userId, organizationId: org2, role: 'member', displayName: 'User' })

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
            await expectError(t, () => fsContext.users.read(userId), /not found/, 'Then user doc is deleted')
        })
        t.end()
    })

    t.test('When user not found Then GDPR action handles gracefully', async t => {
        await asSignedInUser('user-forgotten-missing', async ({ namespace, token }) => {
            const userId = FieldTypes.newUserId()
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
        await asSignedInUser('user-forgotten-orphan', async ({ namespace, token }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const { userId } = await createUser({
                namespace,
                token,
                email: `orphan-${FieldTypes.newUserId()}@example.com`,
                displayName: 'Orphan',
            })

            const action = Action.UserForgotten.from({ userId, reason: 'GDPR' })
            await submitAndExpectSuccess({ action, namespace, token })

            const fsContext = createFirestoreContext(namespace, organizationId, null)
            await expectError(t, () => fsContext.users.read(userId), /not found/, 'Then user is deleted')
        })
        t.end()
    })

    t.end()
})
