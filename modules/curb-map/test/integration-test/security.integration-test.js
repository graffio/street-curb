// ABOUTME: Integration tests for security: tenant isolation, authorization, and audit trail integrity
// ABOUTME: Validates users can only access authorized orgs/projects and cannot tamper with metadata

import { LookupTable } from '@graffio/functional'
import t from 'tap'
import { Action, Blockface, FieldTypes, Segment } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { submitActionRequest } from '../integration-test-helpers/http-submit-action.js'
import { bypassValidation, createOrganization, createUser } from '../integration-test-helpers/test-helpers.js'

const { test } = t

const blockface = (organizationId, projectId, userId) =>
    Blockface.from({
        id: 'blk_000000000001',
        sourceId: 'test-source-security',
        geometry: null,
        streetName: 'Main Street',
        segments: LookupTable([], Segment),
        organizationId,
        projectId,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
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
                t.match(result.data, /Access denied to organization/i, 'Then error indicates access denied')
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
            t.match(result.data, /projectId required/i, 'Then error indicates projectId is required')
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
            t.same(result.data, { status: 'completed' }, 'Then action is completed')
        })
        t.end()
    })

    t.end()
})

// =============================================================================
// Metadata Tampering Attack Tests
// =============================================================================

test('Given attacker attempts to spoof metadata on create', t => {
    t.test('When client sends blockface with fake createdBy Then server rejects immediately', async t => {
        await asSignedInUser('metadata-create-attack', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Create blockface with SPOOFED createdBy (attacker pretending to be someone else)
            const spoofedBlockface = Blockface.from({
                ...blockface(organizationId, projectId, actorUserId),
                createdBy: 'usr_fakeadminid01', // Attacker trying to impersonate admin
                updatedBy: 'usr_fakeadminid01',
            })

            const action = Action.BlockfaceSaved(spoofedBlockface)
            const result = await submitActionRequest({ action, namespace, token, organizationId, projectId })

            // Server must immediately reject spoofed metadata
            t.equal(result.status, 500, 'Then request rejected with 500')
            t.match(result.data, /createdBy/i, 'Then error indicates createdBy is invalid')
        })
        t.end()
    })

    t.test('When client sends blockface with backdated createdAt Then server rejects immediately', async t => {
        await asSignedInUser('metadata-backdate-attack', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Create blockface with BACKDATED timestamp (to hide in audit logs)
            const backdatedBlockface = Blockface.from({
                ...blockface(organizationId, projectId, actorUserId),
                createdAt: new Date('2020-01-01'), // Backdated by years
                updatedAt: new Date('2020-01-01'),
            })

            const action = Action.BlockfaceSaved(backdatedBlockface)
            const result = await submitActionRequest({ action, namespace, token, organizationId, projectId })

            // Server must immediately reject backdated timestamps
            t.equal(result.status, 500, 'Then request rejected with 500')
            t.match(result.data, /timestamp|createdAt/i, 'Then error indicates timestamp is invalid')
        })
        t.end()
    })

    t.end()
})

test('Given attacker attempts to spoof metadata on update', t => {
    t.test('When client modifies createdBy on existing blockface Then server rejects', async t => {
        await asSignedInUser('metadata-update-attack', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // First, create a legitimate blockface
            const originalBlockface = blockface(organizationId, projectId, actorUserId)
            const createAction = Action.BlockfaceSaved(originalBlockface)
            const createResult = await submitActionRequest({
                action: createAction,
                namespace,
                token,
                organizationId,
                projectId,
            })
            t.equal(createResult.status, 200, 'Given blockface is created successfully')

            // Now try to UPDATE it with modified createdBy (tampering with audit trail)
            const tamperedBlockface = Blockface.from({
                ...originalBlockface,
                streetName: 'Updated Street', // Legitimate change
                createdBy: 'usr_fakeattacker1', // ILLEGAL: trying to change who created it
            })

            const updateAction = Action.BlockfaceSaved(tamperedBlockface)
            const updateResult = await submitActionRequest({
                action: updateAction,
                namespace,
                token,
                organizationId,
                projectId,
            })

            // Server MUST reject this because createdBy is immutable
            t.equal(updateResult.status, 500, 'Then request rejected')
            t.match(updateResult.data, /Cannot modify createdBy/i, 'Then error indicates createdBy tampering')
        })
        t.end()
    })

    t.test('When client modifies createdAt on existing blockface Then server rejects', async t => {
        await asSignedInUser('metadata-timestamp-attack', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Create legitimate blockface
            const originalBlockface = blockface(organizationId, projectId, actorUserId)
            const createAction = Action.BlockfaceSaved(originalBlockface)
            await submitActionRequest({ action: createAction, namespace, token, organizationId, projectId })

            // Try to update with backdated createdAt
            const tamperedBlockface = Blockface.from({
                ...originalBlockface,
                streetName: 'Updated Street',
                createdAt: new Date('2020-01-01'), // ILLEGAL: trying to backdate creation
            })

            const updateAction = Action.BlockfaceSaved(tamperedBlockface)
            const updateResult = await submitActionRequest({
                action: updateAction,
                namespace,
                token,
                organizationId,
                projectId,
            })

            t.equal(updateResult.status, 500, 'Then request rejected')
            t.match(updateResult.data, /Cannot modify createdAt/i, 'Then error indicates createdAt tampering')
        })
        t.end()
    })

    t.end()
})

test('Given attacker attempts tenant boundary violations', t => {
    t.test('When client sends blockface with wrong organizationId Then server rejects', async t => {
        await asSignedInUser('tenant-org-spoof', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Create blockface with DIFFERENT organizationId in the data
            const spoofedBlockface = Blockface.from({
                ...blockface(organizationId, projectId, actorUserId),
                organizationId: 'org_attackerorg1', // Wrong org in blockface data
            })

            const action = Action.BlockfaceSaved(spoofedBlockface)
            const result = await submitActionRequest({
                action,
                namespace,
                token,
                organizationId, // Real org in request
                projectId,
            })

            // Firestore facade should reject tenant boundary violation
            t.equal(result.status, 500, 'Then request rejected')
            t.match(result.data, /Organization ids.*cannot differ/i, 'Then error indicates organizationId mismatch')
        })
        t.end()
    })

    t.test('When client sends blockface with wrong projectId Then server rejects', async t => {
        await asSignedInUser('tenant-project-spoof', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Create blockface with DIFFERENT projectId in the data
            const spoofedBlockface = Blockface.from({
                ...blockface(organizationId, projectId, actorUserId),
                projectId: 'prj_attackerproj1', // Wrong project in blockface data
            })

            const action = Action.BlockfaceSaved(spoofedBlockface)
            const result = await submitActionRequest({
                action,
                namespace,
                token,
                organizationId,
                projectId, // Real project in request
            })

            // Firestore facade should reject tenant boundary violation
            t.equal(result.status, 500, 'Then request rejected')
            t.match(result.data, /Project ids.*cannot differ/i, 'Then error indicates projectId mismatch')
        })
        t.end()
    })

    t.test('When client sends null organizationId Then server rejects', async t => {
        await asSignedInUser('tenant-null-org', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Create valid blockface but send null organizationId in request
            const validBlockface = Blockface.from({ ...blockface(organizationId, projectId, actorUserId) })

            const action = Action.BlockfaceSaved(validBlockface)
            const result = await submitActionRequest({ action, namespace, token, organizationId: null, projectId })

            t.equal(result.status, 401, 'Then request rejected')
            t.match(result.data, /organizationId required/i, 'Then error indicates missing organizationId')
        })
        t.end()
    })

    t.test('When client sends undefined projectId Then server rejects', async t => {
        await asSignedInUser('tenant-undefined-project', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Create valid blockface but send undefined projectId in request
            const validBlockface = Blockface.from({ ...blockface(organizationId, projectId, actorUserId) })

            const action = Action.BlockfaceSaved(validBlockface)
            const result = await submitActionRequest({ action, namespace, token, organizationId, projectId: undefined })

            t.equal(result.status, 401, 'Then request rejected')
            t.match(result.data, /projectId required/i, 'Then error indicates missing projectId')
        })
        t.end()
    })

    t.test('When user tries to access different organization blockface Then rejected', async t => {
        await asSignedInUser('tenant-cross-org-read', async ({ namespace, token, actorUserId }) => {
            // Create organization
            const { organizationId, projectId } = await createOrganization({ namespace, token, name: 'Org 1' })

            // Try to access a different organization's blockface
            const differentOrg = FieldTypes.newOrganizationId()
            const differentProj = FieldTypes.newProjectId()

            const crossOrgBlockface = Blockface.from({
                ...blockface(differentOrg, differentProj, actorUserId), // Different org
            })

            const action = Action.BlockfaceSaved(crossOrgBlockface)
            const result = await submitActionRequest({
                action,
                namespace,
                token,
                organizationId, // User is member of this org
                projectId,
            })

            t.equal(result.status, 500, 'Then request rejected')
            t.match(result.data, /Organization ids.*cannot differ/i, 'Then error indicates org mismatch')
        })
        t.end()
    })

    t.test('When user tries to write to different project Then rejected', async t => {
        await asSignedInUser('tenant-cross-project-write', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId: proj1 } = await createOrganization({ namespace, token })

            // Try to write to a different project
            const proj2 = FieldTypes.newProjectId()
            const crossProjectBlockface = Blockface.from({
                ...blockface(organizationId, proj2, actorUserId), // Different project
            })

            const action = Action.BlockfaceSaved(crossProjectBlockface)
            const result = await submitActionRequest({
                action,
                namespace,
                token,
                organizationId,
                projectId: proj1, // User is in proj1
            })

            t.equal(result.status, 500, 'Then request rejected')
            t.match(result.data, /Project ids.*cannot differ/i, 'Then error indicates project mismatch')
        })
        t.end()
    })

    t.test('When blockface organizationId is empty string Then rejected', async t => {
        await asSignedInUser('tenant-empty-org', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Create blockface data with empty organizationId, bypassing validation
            const validBlockface = blockface(organizationId, projectId, actorUserId)
            const spoofedData = { ...validBlockface, organizationId: '' }
            const spoofedBlockface = bypassValidation(Blockface, spoofedData)

            // Bypass Action validation too
            const spoofedAction = bypassValidation(Action, {
                '@@tagName': 'BlockfaceSaved',
                blockface: spoofedBlockface,
            })

            const result = await submitActionRequest({
                action: spoofedAction,
                namespace,
                token,
                organizationId,
                projectId,
            })

            t.equal(result.status, 400, 'Then request rejected with validation error')
            t.match(result.data, /organizationId|expected/i, 'Then error indicates invalid organizationId')
        })
        t.end()
    })

    t.test('When trying to modify another organization member Then rejected', async t => {
        await asSignedInUser('tenant-cross-org-member', async ({ namespace, token }) => {
            // Create organization
            await createOrganization({ namespace, token, name: 'Org 1' })

            // Try to add member to a different organization
            const differentOrg = FieldTypes.newOrganizationId()
            const newUserId = FieldTypes.newUserId()
            await createUser({ namespace, token, userId: newUserId, displayName: 'New User' })

            const action = Action.MemberAdded.from({ userId: newUserId, role: 'member', displayName: 'New User' })
            const result = await submitActionRequest({
                action,
                namespace,
                token,
                organizationId: differentOrg, // Different org
            })

            t.equal(result.status, 401, 'Then request rejected')
            t.match(result.data, /Access denied/i, 'Then error indicates access denied')
        })
        t.end()
    })

    t.test('When organizationId in request differs from user membership Then rejected', async t => {
        await asSignedInUser('tenant-request-org-mismatch', async ({ namespace, token }) => {
            // Create organization
            await createOrganization({ namespace, token })

            // Try to perform action with different org ID in request
            const nonMemberOrg = FieldTypes.newOrganizationId()

            const action = Action.OrganizationUpdated.from({ name: 'Hacked Name' })
            const result = await submitActionRequest({
                action,
                namespace,
                token,
                organizationId: nonMemberOrg, // Not a member of this org
            })

            t.equal(result.status, 401, 'Then request rejected')
            t.match(result.data, /Access denied to organization/i, 'Then error indicates access denied')
        })
        t.end()
    })

    t.test('When action requires project but none provided Then rejected', async t => {
        await asSignedInUser('tenant-missing-required-project', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const testBlockface = Blockface.from({ ...blockface(organizationId, projectId, actorUserId) })

            const action = Action.BlockfaceSaved(testBlockface)
            const result = await submitActionRequest({
                action,
                namespace,
                token,
                organizationId,
                projectId: undefined, // Missing required project
            })

            t.equal(result.status, 401, 'Then request rejected')
            t.match(result.data, /projectId required/i, 'Then error indicates missing projectId')
        })
        t.end()
    })

    t.end()
})

test('Given metadata spoofing attacks', t => {
    t.test('When client sends blockface with future updatedAt Then rejected', async t => {
        await asSignedInUser('metadata-future-updated', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Create blockface with future timestamp (1 hour ahead)
            const futureDate = new Date(Date.now() + 3600000)
            const validBlockface = blockface(organizationId, projectId, actorUserId)
            const spoofedData = { ...validBlockface, updatedAt: futureDate }
            const spoofedBlockface = bypassValidation(Blockface, spoofedData)

            const spoofedAction = bypassValidation(Action, {
                '@@tagName': 'BlockfaceSaved',
                blockface: spoofedBlockface,
            })

            const result = await submitActionRequest({
                action: spoofedAction,
                namespace,
                token,
                organizationId,
                projectId,
            })

            t.equal(result.status, 500, 'Then request rejected')
            t.match(result.data, /updatedAt.*recent|Invalid updatedAt/i, 'Then error indicates future timestamp')
        })
        t.end()
    })

    t.test('When client sends blockface with past createdAt Then rejected', async t => {
        await asSignedInUser('metadata-past-created', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Create blockface with past timestamp (1 hour ago)
            const pastDate = new Date(Date.now() - 3600000)
            const validBlockface = blockface(organizationId, projectId, actorUserId)
            const spoofedData = { ...validBlockface, createdAt: pastDate, updatedAt: pastDate }
            const spoofedBlockface = bypassValidation(Blockface, spoofedData)

            const spoofedAction = bypassValidation(Action, {
                '@@tagName': 'BlockfaceSaved',
                blockface: spoofedBlockface,
            })

            const result = await submitActionRequest({
                action: spoofedAction,
                namespace,
                token,
                organizationId,
                projectId,
            })

            t.equal(result.status, 500, 'Then request rejected')
            t.match(result.data, /createdAt.*recent|Invalid createdAt/i, 'Then error indicates non-recent timestamp')
        })
        t.end()
    })

    t.test('When client sends blockface with null updatedAt Then rejected', async t => {
        await asSignedInUser('metadata-null-updated', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const validBlockface = blockface(organizationId, projectId, actorUserId)
            const spoofedData = { ...validBlockface, updatedAt: null }
            const spoofedBlockface = bypassValidation(Blockface, spoofedData)

            const spoofedAction = bypassValidation(Action, {
                '@@tagName': 'BlockfaceSaved',
                blockface: spoofedBlockface,
            })

            const result = await submitActionRequest({
                action: spoofedAction,
                namespace,
                token,
                organizationId,
                projectId,
            })

            t.equal(result.status, 400, 'Then request rejected with validation error')
            t.match(
                result.data,
                /Cannot read properties of null|updatedAt|@@typeName/i,
                'Then error indicates null timestamp',
            )
        })
        t.end()
    })

    t.test('When client sends blockface with wrong updatedBy Then rejected', async t => {
        await asSignedInUser('metadata-wrong-updatedby', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Try to claim someone else updated it
            const differentUserId = FieldTypes.newUserId()
            const validBlockface = blockface(organizationId, projectId, actorUserId)
            const spoofedData = { ...validBlockface, updatedBy: differentUserId }
            const spoofedBlockface = bypassValidation(Blockface, spoofedData)

            const spoofedAction = bypassValidation(Action, {
                '@@tagName': 'BlockfaceSaved',
                blockface: spoofedBlockface,
            })

            const result = await submitActionRequest({
                action: spoofedAction,
                namespace,
                token,
                organizationId,
                projectId,
            })

            t.equal(result.status, 500, 'Then request rejected')
            t.match(result.data, /updatedBy.*expected.*got|Invalid updatedBy/i, 'Then error indicates wrong updatedBy')
        })
        t.end()
    })

    t.test('When client tries to modify createdAt on update Then rejected', async t => {
        await asSignedInUser('metadata-modify-createdat', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // First, create a blockface
            const original = Blockface.from(blockface(organizationId, projectId, actorUserId))
            const createAction = Action.BlockfaceSaved(original)
            await submitActionRequest({ action: createAction, namespace, token, organizationId, projectId })

            // Now try to update it with modified createdAt
            const modifiedCreatedAt = new Date(Date.now() - 86400000) // 1 day ago
            const spoofedData = {
                ...original,
                createdAt: modifiedCreatedAt,
                updatedAt: new Date(),
                updatedBy: actorUserId,
            }
            const spoofedBlockface = bypassValidation(Blockface, spoofedData)

            const spoofedAction = bypassValidation(Action, {
                '@@tagName': 'BlockfaceSaved',
                blockface: spoofedBlockface,
            })

            const result = await submitActionRequest({
                action: spoofedAction,
                namespace,
                token,
                organizationId,
                projectId,
            })

            t.equal(result.status, 500, 'Then request rejected')
            t.match(result.data, /Cannot modify createdAt/i, 'Then error indicates createdAt tampering')
        })
        t.end()
    })

    t.test('When client sends blockface with mismatched createdBy Then rejected', async t => {
        await asSignedInUser('metadata-mismatched-createdby', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Create blockface claiming different creator
            const differentUserId = FieldTypes.newUserId()
            const validBlockface = blockface(organizationId, projectId, actorUserId)
            const spoofedData = { ...validBlockface, createdBy: differentUserId, updatedBy: actorUserId }
            const spoofedBlockface = bypassValidation(Blockface, spoofedData)

            const spoofedAction = bypassValidation(Action, {
                '@@tagName': 'BlockfaceSaved',
                blockface: spoofedBlockface,
            })

            const result = await submitActionRequest({
                action: spoofedAction,
                namespace,
                token,
                organizationId,
                projectId,
            })

            t.equal(result.status, 500, 'Then request rejected')
            t.match(result.data, /createdBy.*expected.*got|Invalid createdBy/i, 'Then error indicates wrong createdBy')
        })
        t.end()
    })

    t.end()
})

test('Given raw HTTP payload attacks (bypassing client validation)', t => {
    t.test('When attacker sends null organizationId in blockface data via raw HTTP Then rejected', async t => {
        await asSignedInUser('raw-null-orgid', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Craft raw HTTP payload with null organizationId in blockface
            const payload = {
                action: {
                    '@@tagName': 'BlockfaceSaved',
                    blockface: {
                        '@@tagName': 'Blockface',
                        id: 'blk_000000000001',
                        sourceId: 'test-source',
                        geometry: null,
                        streetName: 'Main Street',
                        segments: [],
                        organizationId: null, // NULL in data
                        projectId,
                        createdAt: new Date().toISOString(),
                        createdBy: actorUserId,
                        updatedAt: new Date().toISOString(),
                        updatedBy: actorUserId,
                    },
                },
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                organizationId, // Valid in request
                projectId,
                namespace,
            }

            const { rawHttpRequest } = await import('../integration-test-helpers/http-submit-action.js')
            const result = await rawHttpRequest({ body: payload, token })

            t.equal(result.status, 400, 'Then request rejected')
            t.match(result.data, /organizationId|Cannot read/i, 'Then error indicates invalid organizationId')
        })
        t.end()
    })

    t.test('When attacker sends empty string organizationId in blockface via raw HTTP Then rejected', async t => {
        await asSignedInUser('raw-empty-orgid', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            // Craft raw HTTP payload with empty string organizationId
            const payload = {
                action: {
                    '@@tagName': 'BlockfaceSaved',
                    blockface: {
                        '@@tagName': 'Blockface',
                        id: 'blk_000000000001',
                        sourceId: 'test-source',
                        geometry: null,
                        streetName: 'Main Street',
                        segments: [],
                        organizationId: '', // Empty string in data
                        projectId,
                        createdAt: new Date().toISOString(),
                        createdBy: actorUserId,
                        updatedAt: new Date().toISOString(),
                        updatedBy: actorUserId,
                    },
                },
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                organizationId, // Valid in request
                projectId,
                namespace,
            }

            const { rawHttpRequest } = await import('../integration-test-helpers/http-submit-action.js')
            const result = await rawHttpRequest({ body: payload, token })

            // Type validation rejects empty string before server mismatch check
            t.equal(result.status, 400, 'Then request rejected at type validation')
            t.match(result.data, /organizationId.*org_/i, 'Then error indicates invalid organizationId format')
        })
        t.end()
    })

    t.test('When attacker sends different organizationId in blockface data vs request Then rejected', async t => {
        await asSignedInUser('raw-mismatch-orgid', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const attackerOrgId = FieldTypes.newOrganizationId()

            // Craft raw HTTP payload with different org in data vs request
            const payload = {
                action: {
                    '@@tagName': 'BlockfaceSaved',
                    blockface: {
                        '@@tagName': 'Blockface',
                        id: 'blk_000000000001',
                        sourceId: 'test-source',
                        geometry: null,
                        streetName: 'Main Street',
                        segments: [],
                        organizationId: attackerOrgId, // Different org in data
                        projectId,
                        createdAt: new Date().toISOString(),
                        createdBy: actorUserId,
                        updatedAt: new Date().toISOString(),
                        updatedBy: actorUserId,
                    },
                },
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                organizationId, // User's real org in request
                projectId,
                namespace,
            }

            const { rawHttpRequest } = await import('../integration-test-helpers/http-submit-action.js')
            const result = await rawHttpRequest({ body: payload, token })

            t.equal(result.status, 500, 'Then request rejected at server validation')
            t.match(result.data, /Organization ids.*cannot differ/i, 'Then error indicates organizationId mismatch')
        })
        t.end()
    })

    t.test('When attacker sends wrong createdBy via raw HTTP Then rejected', async t => {
        await asSignedInUser('raw-wrong-createdby', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const fakeUserId = FieldTypes.newUserId()

            // Craft raw HTTP payload claiming someone else created it
            const payload = {
                action: {
                    '@@tagName': 'BlockfaceSaved',
                    blockface: {
                        '@@tagName': 'Blockface',
                        id: 'blk_000000000001',
                        sourceId: 'test-source',
                        geometry: null,
                        streetName: 'Main Street',
                        segments: [],
                        organizationId,
                        projectId,
                        createdAt: new Date().toISOString(),
                        createdBy: fakeUserId, // Wrong creator
                        updatedAt: new Date().toISOString(),
                        updatedBy: actorUserId,
                    },
                },
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                organizationId,
                projectId,
                namespace,
            }

            const { rawHttpRequest } = await import('../integration-test-helpers/http-submit-action.js')
            const result = await rawHttpRequest({ body: payload, token })

            t.equal(result.status, 500, 'Then request rejected at server validation')
            t.match(result.data, /createdBy.*expected.*got|Invalid createdBy/i, 'Then error indicates wrong createdBy')
        })
        t.end()
    })

    t.test('When attacker sends past createdAt via raw HTTP Then rejected', async t => {
        await asSignedInUser('raw-past-createdat', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const pastDate = new Date(Date.now() - 3600000).toISOString() // 1 hour ago

            // Craft raw HTTP payload with backdated timestamp
            const payload = {
                action: {
                    '@@tagName': 'BlockfaceSaved',
                    blockface: {
                        '@@tagName': 'Blockface',
                        id: 'blk_000000000001',
                        sourceId: 'test-source',
                        geometry: null,
                        streetName: 'Main Street',
                        segments: [],
                        organizationId,
                        projectId,
                        createdAt: pastDate, // Backdated
                        createdBy: actorUserId,
                        updatedAt: pastDate,
                        updatedBy: actorUserId,
                    },
                },
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                organizationId,
                projectId,
                namespace,
            }

            const { rawHttpRequest } = await import('../integration-test-helpers/http-submit-action.js')
            const result = await rawHttpRequest({ body: payload, token })

            t.equal(result.status, 500, 'Then request rejected at server validation')
            t.match(result.data, /createdAt.*recent|Invalid createdAt/i, 'Then error indicates non-recent timestamp')
        })
        t.end()
    })

    t.end()
})
