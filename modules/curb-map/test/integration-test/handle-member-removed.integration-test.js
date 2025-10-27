import t from 'tap'
import { Action, FieldTypes } from '../../src/types/index.js'
import { asSignedInUser } from './auth-emulator.js'
import { buildActionPayload, expectError, rawHttpRequest } from './http-submit-action.js'
import { addMember, createOrganization, createUser, readOrganization, removeMember } from './test-helpers.js'

const { test } = t

test('Given MemberRemoved action', t => {
    t.test('When member not found Then reject with validation error', async t => {
        await asSignedInUser('member-removed-missing', async ({ namespace, token }) => {
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
        await asSignedInUser('member-removed-again', async ({ namespace, token }) => {
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
        await asSignedInUser('member-removed-success', async ({ namespace, token, actorUserId }) => {
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

    t.test('When request omits token Then removal call is rejected', async t => {
        await asSignedInUser('member-removed-unauth', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })
            const { userId } = await createUser({ namespace, token, displayName: 'Unauth' })

            await addMember({ namespace, token, userId, organizationId, role: 'viewer', displayName: 'Unauth' })

            const result = await rawHttpRequest({
                body: buildActionPayload(namespace, Action.MemberRemoved.from({ userId, organizationId })),
            })

            t.equal(result.status, 401, 'Then HTTP response is unauthorized')

            const organization = await readOrganization({ namespace, organizationId, projectId })
            t.ok(organization.members?.[userId], 'Then member still present')
        })
        t.end()
    })

    t.end()
})
