import t from 'tap'
import { FieldTypes } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { expectError } from '../integration-test-helpers/http-submit-action.js'
import {
    addMember,
    createOrganization,
    createUser,
    readOrganization,
    removeMember,
} from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given MemberRemoved action', t => {
    t.test('When member not found Then reject with validation error', async t => {
        await asSignedInUser('missing', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const userId = FieldTypes.newUserId()

            const fn = () => removeMember({ namespace, token, userId, organizationId })
            await expectError(t, fn, /not found|does not exist/, 'Then validation error thrown')

            const organization = await readOrganization({ namespace, organizationId, projectId })
            t.notOk(organization.members?.[userId], 'Then org remains unchanged')
        })
        t.end()
    })

    t.test('When member already removed Then reject with validation error', async t => {
        await asSignedInUser('already-removed', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Dave' })

            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Dave' })
            await removeMember({ namespace, token, userId, organizationId })

            const fn = () => removeMember({ namespace, token, userId, organizationId })
            await expectError(t, fn, /already removed|not active/, 'Then validation error thrown')

            const organization = await readOrganization({ namespace, organizationId, projectId })
            t.ok(organization.members[userId].removedAt, 'Then removedAt remains from first removal')
        })
        t.end()
    })

    t.test('When member removed Then metadata and claims record actor userId', async t => {
        await asSignedInUser('success', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Eve' })

            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Eve Smith' })
            await removeMember({ namespace, token, userId, organizationId })

            const organization = await readOrganization({ namespace, organizationId, projectId })

            t.ok(organization.members[userId].removedAt, 'Then removedAt is set')
            t.equal(organization.members[userId].removedBy, actorUserId, 'Then removedBy uses token userId claim')
        })
        t.end()
    })

    t.test('RBAC: When trying to remove last admin Then returns error', async t => {
        await asSignedInUser('last-admin-removal-denied', async ({ namespace, token, actorUserId }) => {
            const { organizationId } = await createOrganization({ namespace, token })

            // Try to remove the only admin (actorUserId is the creator and only admin)
            const fn = () => removeMember({ namespace, token, userId: actorUserId, organizationId })
            await expectError(t, fn, /last admin|Cannot remove.*last admin/, 'Then error prevents removing last admin')
        })
        t.end()
    })

    t.test('RBAC: When removing admin with multiple admins Then succeeds', async t => {
        await asSignedInUser('multi-admin-removal', async ({ namespace, token, actorUserId }) => {
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

            // Now remove the first admin (should succeed because there's still one admin left)
            await removeMember({ namespace, token, userId: actorUserId, organizationId })

            const organization = await readOrganization({ namespace, organizationId, projectId })
            t.ok(organization.members[actorUserId].removedAt, 'Then first admin removed successfully')
            t.notOk(organization.members[secondAdminId].removedAt, 'Then second admin remains active')
        })
        t.end()
    })

    t.end()
})
