// ABOUTME: Integration tests for OrganizationDeleted action
// ABOUTME: Tests soft-delete behavior, cascade to user.organizations, and double-delete protection

import t from 'tap'
import { createFirestoreContext } from '../../functions/src/firestore-admin-context.js'
import { Action } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { submitActionRequest, submitAndExpectSuccess } from '../integration-test-helpers/http-submit-action.js'
import {
    createOrganization,
    deleteOrganization,
    verifyOrganizationSoftDeleted,
    verifyUserLacksOrganization,
    createUserAndAddMember,
} from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given OrganizationDeleted action', t => {
    t.test(
        'When single-member organization is deleted Then soft-delete occurs and user.organizations cleared',
        async t => {
            await asSignedInUser('single-member-delete', async ({ namespace, token, actorUserId }) => {
                const { organizationId, projectId } = await createOrganization({ namespace, token, name: 'Test Org' })

                await deleteOrganization({ namespace, token, organizationId, projectId })

                const fsContext = createFirestoreContext(namespace, organizationId, projectId)
                const org = await fsContext.organizations.read(organizationId)
                const user = await fsContext.users.read(actorUserId)

                verifyOrganizationSoftDeleted(t, org, actorUserId)
                verifyUserLacksOrganization(t, user, organizationId)
            })
            t.end()
        },
    )

    t.test('When multi-member organization is deleted Then all active members lose access', async t => {
        await asSignedInUser('multi-member-delete', async ({ namespace, token, actorUserId }) => {
            const { organizationId } = await createOrganization({ namespace, token, name: 'Multi-member Org' })

            const { userId: secondUserId } = await createUserAndAddMember({
                namespace,
                token,
                organizationId,
                role: 'member',
                displayName: 'Second User',
            })

            await deleteOrganization({ namespace, token, organizationId })

            const fsContext = createFirestoreContext(namespace, organizationId)
            const actor = await fsContext.users.read(actorUserId)
            const secondUser = await fsContext.users.read(secondUserId)

            verifyUserLacksOrganization(t, actor, organizationId)
            verifyUserLacksOrganization(t, secondUser, organizationId)
        })
        t.end()
    })

    t.test('When organization with removed members is deleted Then only active members are cascaded', async t => {
        await asSignedInUser('removed-member-delete', async ({ namespace, token, actorUserId }) => {
            const { organizationId } = await createOrganization({ namespace, token, name: 'Mixed-status Org' })
            const fsContext = createFirestoreContext(namespace, organizationId)

            const { userId: secondAdminId } = await createUserAndAddMember({
                namespace,
                token,
                organizationId,
                role: 'admin',
                displayName: 'Second Admin',
            })
            const { userId: memberId } = await createUserAndAddMember({
                namespace,
                token,
                organizationId,
                role: 'member',
                displayName: 'Member User',
            })

            // Remove the member (soft delete)
            const removeMemberAction = Action.MemberRemoved.from({ userId: memberId })
            await submitAndExpectSuccess({ action: removeMemberAction, namespace, token, organizationId })

            // Verify member was removed (should not have organizationId in user.organizations)
            const memberBefore = await fsContext.users.read(memberId)
            t.notOk(memberBefore.organizations[organizationId], 'Given member was removed from user.organizations')

            await deleteOrganization({ namespace, token, organizationId })

            const actor = await fsContext.users.read(actorUserId)
            const secondAdmin = await fsContext.users.read(secondAdminId)
            const memberAfter = await fsContext.users.read(memberId)

            verifyUserLacksOrganization(t, actor, organizationId)
            verifyUserLacksOrganization(t, secondAdmin, organizationId)
            verifyUserLacksOrganization(t, memberAfter, organizationId)
        })
        t.end()
    })

    t.test('When already-deleted organization is deleted again Then access denied', async t => {
        await asSignedInUser('double-delete', async ({ namespace, token }) => {
            const { organizationId } = await createOrganization({ namespace, token, name: 'To Delete Twice' })

            await deleteOrganization({ namespace, token, organizationId })

            // Try to delete again - blocked by checkTenantAccess since org removed from user.organizations
            const action = Action.OrganizationDeleted.from({})
            const result = await submitActionRequest({ action, namespace, token, organizationId })

            t.equal(result.status, 401, 'Then HTTP 401 returned')
            t.match(result.data, /Access denied/i, 'Then error indicates access denied')
        })
        t.end()
    })

    t.end()
})
