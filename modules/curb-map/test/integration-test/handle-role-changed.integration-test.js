import t from 'tap'
import { Action, FieldTypes } from '../../src/types/index.js'
import { asSignedInUser } from './auth-emulator.js'
import { buildActionPayload, rawHttpRequest , expectError } from './http-submit-action.js'
import {
    addMember,
    changeRole,
    createOrganization,
    createUser,
    readOrgAndUser,
    readOrganization,
    removeMember,
} from './test-helpers.js'

const { test } = t

test('Given RoleChanged action', t => {
    t.test('When member not found Then reject with validation error', async t => {
        await asSignedInUser('role-change-missing', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const userId = FieldTypes.newUserId()

            const fn = () => changeRole({ namespace, token, userId, organizationId, role: 'admin' })
            await expectError(t, fn, /not found|does not exist/, 'Then validation error thrown')

            const organization = await readOrganization({ namespace, organizationId, projectId })
            t.notOk(organization.members?.[userId], 'Then org remains unchanged')
        })
        t.end()
    })

    t.test('When member removed Then role change rejected', async t => {
        await asSignedInUser('role-change-removed', async ({ namespace, token }) => {
            const { organizationId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Frank' })

            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Frank' })
            await removeMember({ namespace, token, userId, organizationId })

            const fn = () => changeRole({ namespace, token, userId, organizationId, role: 'admin' })
            await expectError(t, fn, /removed|not active/, 'Then validation error thrown')
        })
        t.end()
    })

    t.test('When role changed Then organization, user, and claims update', async t => {
        await asSignedInUser('role-change-success', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Grace' })

            await addMember({ namespace, token, userId, organizationId, role: 'viewer', displayName: 'Grace' })
            await changeRole({ namespace, token, userId, organizationId, role: 'admin' })

            const { org, user } = await readOrgAndUser({ namespace, organizationId, projectId, userId })

            t.equal(org.members[userId].role, 'admin', 'Then org member role updated')
            t.equal(user.organizations[organizationId], 'admin', 'Then user org map updated')
        })
        t.end()
    })

    t.test('When request omits token Then role change is rejected', async t => {
        await asSignedInUser('role-change-unauth', async ({ namespace, token }) => {
            const { organizationId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Grace' })
            await addMember({ namespace, token, userId, organizationId, role: 'viewer', displayName: 'Grace' })

            const result = await rawHttpRequest({
                body: buildActionPayload(namespace, Action.RoleChanged.from({ userId, organizationId, role: 'admin' })),
            })

            t.equal(result.status, 401, 'Then HTTP response is unauthorized')
        })
        t.end()
    })

    t.end()
})
