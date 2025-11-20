// ABOUTME: Integration tests for tenant isolation and authorization
// ABOUTME: Validates users can only access organizations/projects they're authorized for

import { LookupTable } from '@graffio/functional'
import t from 'tap'
import { Action, Blockface, Segment } from '../../src/types/index.js'
import { FieldTypes } from '../../type-definitions/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { submitActionRequest } from '../integration-test-helpers/http-submit-action.js'
import { createOrganization } from '../integration-test-helpers/test-helpers.js'

const { test } = t

const blockface = (organizationId, projectId, actorId) =>
    Blockface.from({
        id: FieldTypes.newBlockfaceId(),
        sourceId: 'aaa',
        geometry: {},
        streetName: 'Main Street',
        segments: LookupTable([], Segment),

        organizationId,
        projectId,
        createdAt: new Date(),
        createdBy: actorId,
        updatedAt: new Date(),
        updatedBy: actorId,
    })

test('Given user attempts to access unauthorized organization', t => {
    t.test('When submitting action for organization user is not a member of', async t => {
        await asSignedInUser('user1', async ({ namespace, token: token1 }) => {
            // User1 creates org1 - user1 IS a member
            await createOrganization({ namespace, token: token1, name: 'Authorized Org' })

            // User2 creates org2 in the SAME namespace
            await asSignedInUser({ label: 'user2', namespace }, async ({ token: token2 }) => {
                const { organizationId: org2Id } = await createOrganization({
                    namespace, // Same namespace as user1
                    token: token2,
                    name: 'Unauthorized Org',
                })

                // Try to submit action for org2 using user1's token
                // This should fail because user1 is not a member of org2
                const action = Action.OrganizationUpdated.from({ name: 'Hacked!' })
                const result = await submitActionRequest({
                    action,
                    namespace,
                    token: token1, // user1's token (not a member of org2)
                    organizationId: org2Id,
                })

                t.equal(result.status, 401, 'Then request rejected with 401')
                t.match(result.data.error, /Access denied to organization/i, 'Then error indicates access denied')
            })
        })
        t.end()
    })

    t.end()
})

test('Given user submits project-level action', t => {
    t.test('When submitting project-level action without projectId', async t => {
        await asSignedInUser('missing-project', async ({ namespace, token, actorUserId }) => {
            const { organizationId } = await createOrganization({ namespace, token })

            // Try to submit project-level action without projectId
            const action = Action.BlockfaceSaved(blockface(organizationId, 'prj_123456789012', actorUserId))
            const result = await submitActionRequest({
                action,
                namespace,
                token,
                organizationId,
                // No projectId provided in request
            })

            t.equal(result.status, 401, 'Then request rejected with 401')
            t.match(result.data.error, /projectId required/i, 'Then error indicates projectId is required')
        })
        t.end()
    })

    t.end()
})

test('Given new user with no organization membership', t => {
    t.test('When user creates their first organization Then request succeeds', async t => {
        await asSignedInUser('new-user-first-org', async ({ namespace, token }) => {
            // User has been authenticated but has no organization membership yet
            // Creating first organization should succeed (chicken-and-egg allowance)
            const { organizationId } = await createOrganization({ namespace, token, name: 'First Org' })

            t.ok(organizationId, 'Then organization is created successfully')
            t.pass('New users can create their first organization')
        })
        t.end()
    })

    t.end()
})

test('Given user is member of organization', t => {
    t.test('When user submits action for their organization Then request succeeds', async t => {
        await asSignedInUser('member-access', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Submit project-level action with valid organizationId and projectId
            const action = Action.BlockfaceSaved(blockface(organizationId, projectId, actorUserId))
            const result = await submitActionRequest({ action, namespace, token, organizationId, projectId })

            t.equal(result.status, 200, 'Then request succeeds with 200')
            t.equal(result.data.status, 'completed', 'Then action is completed')
        })
        t.end()
    })

    t.end()
})
