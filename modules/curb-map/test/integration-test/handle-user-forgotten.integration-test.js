import t from 'tap'
import { createFirestoreContext } from '../../functions/src/firestore-context.js'
import { Action, FieldTypes } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import {
    expectError,
    submitActionRequest,
    submitAndExpectSuccess,
} from '../integration-test-helpers/http-submit-action.js'
import { createOrganization, createUser } from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given UserForgotten action (GDPR)', t => {
    t.test('When user is forgotten Then removedAt set in all orgs and user deleted', async t => {
        await asSignedInUser('success', async ({ namespace, token, actorUserId }) => {
            const { organizationId: org1, projectId } = await createOrganization({ namespace, token, name: 'Org 1' })
            const { organizationId: org2 } = await createOrganization({ namespace, token, name: 'Org 2' })

            // Forget user (GDPR)
            const action = Action.UserForgotten.from({ userId: actorUserId, reason: 'GDPR request' })
            await submitAndExpectSuccess({ action, namespace, token })

            const fsContext = createFirestoreContext(namespace, org1, projectId)

            // Verify removedAt set in all orgs
            const orgDoc1 = await fsContext.organizations.read(org1)
            const orgDoc2 = await fsContext.organizations.read(org2)
            t.ok(orgDoc1.members[actorUserId].removedAt, 'Then removedAt set in org1')
            t.ok(orgDoc2.members[actorUserId].removedAt, 'Then removedAt set in org2')
            t.equal(orgDoc1.members[actorUserId].removedBy, actorUserId, 'Then removedBy set from token userId in org1')

            // Verify user deleted
            await expectError(t, () => fsContext.users.read(actorUserId), /not found/, 'Then user doc is deleted')
        })
        t.end()
    })

    t.test('When user has no organizations Then GDPR deletes user only', async t => {
        await asSignedInUser('orphan', async ({ namespace, token, actorUserId }) => {
            const organizationId = FieldTypes.newOrganizationId()

            const action = Action.UserForgotten.from({ userId: actorUserId, reason: 'GDPR' })
            await submitAndExpectSuccess({ action, namespace, token })

            const fsContext = createFirestoreContext(namespace, organizationId, null)
            await expectError(t, () => fsContext.users.read(actorUserId), /not found/, 'Then user is deleted')
        })
        t.end()
    })

    t.test('RBAC: When user tries to forget another user Then returns 401 unauthorized', async t => {
        await asSignedInUser('forget-other-denied', async ({ namespace, token, actorUserId }) => {
            const { organizationId } = await createOrganization({ namespace, token, name: 'Test Org' })

            // Create another user
            const { userId: otherUserId } = await createUser({ namespace, token, displayName: 'Other User' })

            // Try to forget the other user
            const action = Action.UserForgotten.from({ userId: otherUserId, reason: 'Malicious deletion attempt' })
            const result = await submitActionRequest({ action, namespace, token })

            t.equal(result.status, 401, 'Then HTTP status is 401')
            t.equal(result.data.status, 'unauthorized', 'Then status is unauthorized')
            t.match(result.data.error, /trying to forget user/, 'Then error mentions unauthorized forget attempt')

            // Verify user was not deleted
            const fsContext = createFirestoreContext(namespace, organizationId, null)
            const user = await fsContext.users.read(otherUserId)
            t.ok(user, 'Then target user still exists')
        })
        t.end()
    })

    t.end()
})
