import admin from 'firebase-admin'
import t from 'tap'
import { Action } from '../../src/types/index.js'
import { asSignedInUser } from './auth-emulator.js'
import { buildActionPayload, expectError, rawHttpRequest } from './http-submit-action.js'
import {
    addMember,
    createOrganization,
    createUser,
    readOrgAndUser,
    readOrganization,
    removeMember,
} from './test-helpers.js'

const { test } = t

test('Given MemberAdded action', t => {
    t.test('When member already active Then reject with validation error', async t => {
        await asSignedInUser('member-added-duplicate', async ({ namespace, token }) => {
            const { organizationId } = await createOrganization({ namespace, token })
            const displayName = 'Alice'
            const { userId, authUid } = await createUser({ namespace, token, displayName })

            // Verify userId claim was set by handler
            const authUser = await admin.auth().getUser(authUid)
            t.ok(authUser.customClaims?.userId, 'Then userId claim is set on auth user')
            t.equal(authUser.customClaims.userId, userId, 'Then userId claim matches Firestore userId')

            await addMember({ namespace, token, userId, organizationId, role: 'admin', displayName })

            const fn = () => addMember({ namespace, token, userId, organizationId, role: 'member', displayName })
            await expectError(t, fn, /already active|already exists/, 'Then validation error thrown')
        })
        t.end()
    })

    t.test('When request omits token Then authentication fails with HTTP 401', async t => {
        await asSignedInUser('member-added-no-token', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Missing Token' })

            const result = await rawHttpRequest({
                body: buildActionPayload(
                    namespace,
                    Action.MemberAdded.from({ userId, organizationId, role: 'member', displayName: 'Missing Token' }),
                ),
            })

            t.equal(result.status, 401, 'Then HTTP response is unauthorized')
            t.equal(result.data.status, 'unauthorized', 'Then payload indicates unauthorized access')

            const organization = await readOrganization({ namespace, organizationId, projectId })
            t.notOk(organization.members?.[userId], 'Then member not written')
        })
        t.end()
    })

    t.test('When new member added Then metadata uses actor userId claim', async t => {
        await asSignedInUser('member-added-success', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Bob' })

            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Bob Smith' })

            const { org, user } = await readOrgAndUser({ namespace, organizationId, projectId, userId })

            t.equal(org.members[userId].addedBy, actorUserId, 'Then addedBy set from token userId claim')
            t.equal(user.organizations[organizationId], 'member', 'Then user.organizations has entry')
        })
        t.end()
    })

    t.test('When removed member reactivated Then claims and metadata refresh', async t => {
        await asSignedInUser('member-added-reactivate', async ({ namespace, token, actorUserId }) => {
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

            t.equal(org.members[userId].removedAt, null, 'Then removedAt cleared')
            t.equal(user.organizations[organizationId], 'admin', 'Then user organization role updated')
            t.equal(org.members[userId].addedBy, actorUserId, 'Then addedBy uses token userId claim')
        })
        t.end()
    })

    t.test('When phone sign-in token used Then member added successfully', async t => {
        await asSignedInUser({ signInMethod: 'phone' }, async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token, name: 'Phone Org' })
            const { userId } = await createUser({ namespace, token, displayName: 'Phone User' })

            await addMember({ namespace, token, userId, organizationId, role: 'member', displayName: 'Phone User' })

            const { org } = await readOrgAndUser({ namespace, organizationId, projectId, userId })
            t.equal(org.members[userId].addedBy, actorUserId, 'Then addedBy uses token userId claim')
        })
        t.end()
    })

    t.end()
})
