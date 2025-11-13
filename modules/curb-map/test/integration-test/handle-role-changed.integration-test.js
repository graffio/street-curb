import t from 'tap'
import { FieldTypes } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { expectError } from '../integration-test-helpers/http-submit-action.js'
import {
    addMember,
    changeRole,
    createOrganization,
    createUser,
    readOrgAndUser,
    readOrganization,
    removeMember,
} from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given RoleChanged action', t => {
    t.test('When member not found Then reject with validation error', async t => {
        await asSignedInUser('missing', async ({ namespace, token }) => {
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
        await asSignedInUser('removed', async ({ namespace, token }) => {
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
        await asSignedInUser('success', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Grace' })

            await addMember({ namespace, token, userId, organizationId, role: 'viewer', displayName: 'Grace' })
            await changeRole({ namespace, token, userId, organizationId, role: 'admin' })

            const { org, user } = await readOrgAndUser({ namespace, organizationId, projectId, userId })

            t.equal(org.members[userId].role, 'admin', 'Then org member role updated')
            t.equal(user.organizations[organizationId].role, 'admin', 'Then user org map updated')
        })
        t.end()
    })

    t.test('RBAC: When trying to downgrade last admin Then returns error', async t => {
        await asSignedInUser('last-admin-downgrade-denied', async ({ namespace, token, actorUserId }) => {
            const { organizationId } = await createOrganization({ namespace, token })

            // Try to downgrade the only admin (actorUserId is the creator and only admin)
            const fn = () => changeRole({ namespace, token, userId: actorUserId, organizationId, role: 'member' })
            await expectError(
                t,
                fn,
                /last admin|Cannot change role.*last admin/,
                'Then error prevents downgrading last admin',
            )
        })
        t.end()
    })

    t.test('RBAC: When downgrading admin with multiple admins Then succeeds', async t => {
        await asSignedInUser('multi-admin-downgrade', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Add another admin
            const { userId: secondAdminId } = await createUser({ namespace, token, displayName: 'Second Admin' })
            await addMember({
                namespace,
                token,
                userId: secondAdminId,
                organizationId,
                role: 'admin',
                displayName: 'Second Admin',
            })

            // Now downgrade the first admin (should succeed because there's still one admin left)
            await changeRole({ namespace, token, userId: actorUserId, organizationId, role: 'member' })

            const { org, user } = await readOrgAndUser({ namespace, organizationId, projectId, userId: actorUserId })
            t.equal(org.members[actorUserId].role, 'member', 'Then first admin downgraded successfully')
            t.equal(user.organizations[organizationId].role, 'member', 'Then user org map updated')
            t.equal(org.members[secondAdminId].role, 'admin', 'Then second admin remains admin')
        })
        t.end()
    })

    t.test('RBAC: When upgrading last admin to admin again Then succeeds', async t => {
        await asSignedInUser('upgrade-to-admin', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // This should succeed - we're not downgrading from admin
            await changeRole({ namespace, token, userId: actorUserId, organizationId, role: 'admin' })

            const organization = await readOrganization({ namespace, organizationId, projectId })
            t.equal(organization.members[actorUserId].role, 'admin', 'Then role change to admin succeeds')
        })
        t.end()
    })

    t.end()
})
