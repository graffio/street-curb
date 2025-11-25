// ABOUTME: Tests for Action.metadata() function
// ABOUTME: Verifies metadata structure and exhaustiveness for all Action variants

import tap from 'tap'
import { Action } from '../../src/types/action.js'

tap.test('Action.metadata', t => {
    t.test('Given server-side actions', t => {
        t.test('When getting metadata for OrganizationCreated', t => {
            const action = Action.OrganizationCreated({ name: 'Test Org', projectId: 'proj-123' })
            const metadata = Action.metadata(action)

            t.test('Then returns correct metadata structure', t => {
                t.equal(metadata.requiresUser, true, 'requires user doc')
                t.equal(metadata.requiresOrganization, false, 'does not require organization')
                t.equal(metadata.requiresProject, false, 'does not require project')
                t.equal(metadata.authStrategy, 'requireOrganizationLimit', 'uses organization limit strategy')
                t.same(metadata.writesTo, [], 'has empty writesTo array')
                t.end()
            })

            t.end()
        })

        t.test('When getting metadata for BlockfaceSaved', t => {
            const action = Action.BlockfaceSaved({ blockface: { id: 'bf-123' } })
            const metadata = Action.metadata(action)

            t.test('Then returns metadata with writesTo', t => {
                t.equal(metadata.requiresUser, true, 'requires user doc')
                t.equal(metadata.requiresOrganization, true, 'requires organization')
                t.equal(metadata.requiresProject, true, 'requires project')
                t.equal(metadata.authStrategy, 'requireActorIsOrganizationMember', 'uses organization member strategy')
                t.equal(metadata.writesTo.length, 1, 'has one writesTo entry')
                t.same(
                    metadata.writesTo[0],
                    { collection: 'blockfaces', isCreate: false, docIds: 'action.blockface.id' },
                    'writesTo has correct structure',
                )
                t.end()
            })

            t.end()
        })

        t.test('When getting metadata for UserUpdated', t => {
            const action = Action.UserUpdated({ userId: 'user-123', displayName: 'Test' })
            const metadata = Action.metadata(action)

            t.test('Then uses requireSelfOnly strategy', t => {
                t.equal(metadata.authStrategy, 'requireSelfOnly', 'uses self-only strategy')
                t.equal(metadata.requiresUser, true, 'requires user doc')
                t.equal(metadata.requiresOrganization, false, 'does not require organization')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given local-only actions', t => {
        t.test('When getting metadata for UserLoaded', t => {
            const action = Action.UserLoaded({ user: { id: 'user-123' } })

            t.test('Then throws error indicating local-only', t => {
                t.throws(() => Action.metadata(action), /UserLoaded is local-only/, 'throws with correct error message')
                t.end()
            })

            t.end()
        })

        t.test('When getting metadata for SegmentAdded', t => {
            const action = Action.SegmentAdded({ targetIndex: 2 })

            t.test('Then throws error indicating local-only', t => {
                t.throws(
                    () => Action.metadata(action),
                    /SegmentAdded is local-only/,
                    'throws with correct error message',
                )
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given metadata structure validation', t => {
        const serverSideActions = [
            'OrganizationCreated',
            'OrganizationUpdated',
            'OrganizationDeleted',
            'MemberAdded',
            'MemberRemoved',
            'RoleChanged',
            'UserCreated',
            'UserUpdated',
            'UserForgotten',
            'AuthenticationCompleted',
            'BlockfaceSaved',
        ]

        serverSideActions.forEach(actionName => {
            t.test(`When getting metadata for ${actionName}`, t => {
                // Create minimal action (structure doesn't matter for metadata)
                const action = { '@@tagName': actionName, '@@tag': 'Action' }
                const metadata = Action.metadata(action)

                t.test('Then returns valid metadata structure', t => {
                    t.type(metadata.requiresUser, 'boolean', 'requiresUser is boolean')
                    t.type(metadata.requiresOrganization, 'boolean', 'requiresOrganization is boolean')
                    t.type(metadata.requiresProject, 'boolean', 'requiresProject is boolean')
                    t.type(metadata.authStrategy, 'string', 'authStrategy is string')
                    t.ok(Array.isArray(metadata.writesTo), 'writesTo is array')
                    t.end()
                })

                t.end()
            })
        })

        t.end()
    })

    t.end()
})
