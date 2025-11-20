import t from 'tap'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { expectError } from '../integration-test-helpers/http-submit-action.js'
import {
    addMember,
    createOrganization,
    createUser,
    readOrgAndUser,
    removeMember,
} from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given MemberAdded action', t => {
    t.test('When member already active Then reject with validation error', async t => {
        await asSignedInUser('duplicate', async ({ namespace, token }) => {
            const { organizationId } = await createOrganization({ namespace, token })
            const displayName = 'Alice'
            const { userId } = await createUser({ namespace, token, displayName })

            await addMember({ namespace, token, userId, organizationId, role: 'admin', displayName })

            const fn = async () =>
                await addMember({ namespace, token, userId, organizationId, role: 'member', displayName })
            await expectError(t, fn, /already active|already exists/, 'Then validation error thrown')
        })
        t.end()
    })

    t.test('When new member added Then metadata uses actor userId', async t => {
        await asSignedInUser('success', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Bob' })

            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Bob Smith' })

            const { org, user } = await readOrgAndUser({ namespace, organizationId, projectId, userId })

            t.equal(org.members[userId].addedBy, actorUserId, 'Then addedBy set from auth User uid')
            t.equal(user.organizations[organizationId].role, 'member', 'Then user.organizations has entry')
        })
        t.end()
    })

    t.test('When removed member reactivated Then metadata refreshes', async t => {
        await asSignedInUser('reactivate', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Carol' })

            await addMember({ namespace, token, userId, organizationId, role: 'viewer', displayName: 'Carol Lee' })
            await removeMember({ namespace, token, userId, organizationId })
            await addMember({
                namespace,
                token,
                userId,
                organizationId,
                role: 'admin',
                displayName: 'Carol Lee (Admin)',
            })

            const { org, user } = await readOrgAndUser({ namespace, organizationId, projectId, userId })

            t.equal(org.members[userId].removedAt, undefined, 'Then removedAt cleared')
            t.equal(user.organizations[organizationId].role, 'admin', 'Then user organization role updated')
            t.equal(org.members[userId].addedBy, actorUserId, 'Then addedBy uses auth user uid')
        })
        t.end()
    })

    t.end()
})
