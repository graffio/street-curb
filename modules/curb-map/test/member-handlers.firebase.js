import t from 'tap'
import { createFirestoreContext } from '../functions/src/firestore-context.js'
import { Action, FieldTypes } from '../src/types/index.js'
import { submitAndExpectSuccess } from './helpers/http-submit-action.js'

const { test } = t
const namespace = `tests/${new Date().toISOString().replace(/[:.]/g, '-')}`

test('Given MemberAdded action', t => {
    t.test('When member already active Then reject with validation error', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.UserCreated.from({ userId, email: 'alice@example.com', displayName: 'Alice' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({ userId, organizationId, role: 'admin', displayName: 'Alice' }),
            namespace,
        })

        // Try to add again (should fail)
        try {
            await submitAndExpectSuccess({
                action: Action.MemberAdded.from({ userId, organizationId, role: 'member', displayName: 'Alice' }),
                namespace,
            })
            t.fail('Then duplicate member should be rejected')
        } catch (error) {
            t.match(error.message, /already active|already exists/, 'Then validation error thrown')
        }
        t.end()
    })

    t.test('When new member Then atomic write to org.members and user.organizations', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.UserCreated.from({ userId, email: 'bob@example.com', displayName: 'Bob' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({ userId, organizationId, role: 'member', displayName: 'Bob Smith' }),
            namespace,
        })

        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const org = await fsContext.organizations.read(organizationId)
        const user = await fsContext.users.read(userId)

        t.ok(org.members[userId], 'Then member exists in org.members')
        t.equal(org.members[userId].displayName, 'Bob Smith', 'Then displayName set')
        t.equal(org.members[userId].role, 'member', 'Then role set')
        t.ok(org.members[userId].addedAt, 'Then addedAt set')
        t.equal(org.members[userId].addedBy, 'usr_emulatorbypass', 'Then addedBy set')
        t.equal(org.members[userId].removedAt, null, 'Then removedAt is null')
        t.equal(user.organizations[organizationId], 'member', 'Then user.organizations has entry')
        t.end()
    })

    t.test('When removed member re-activated Then clear removedAt, update fields, new addedAt', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.UserCreated.from({ userId, email: 'carol@example.com', displayName: 'Carol' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({ userId, organizationId, role: 'viewer', displayName: 'Carol Lee' }),
            namespace,
        })
        await submitAndExpectSuccess({ action: Action.MemberRemoved.from({ userId, organizationId }), namespace })

        // Re-activate with new role
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({
                userId,
                organizationId,
                role: 'admin',
                displayName: 'Carol Lee (Admin)',
            }),
            namespace,
        })

        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const org = await fsContext.organizations.read(organizationId)
        const user = await fsContext.users.read(userId)

        t.equal(org.members[userId].removedAt, null, 'Then removedAt cleared')
        t.equal(org.members[userId].removedBy, null, 'Then removedBy cleared')
        t.equal(org.members[userId].role, 'admin', 'Then role updated')
        t.equal(org.members[userId].displayName, 'Carol Lee (Admin)', 'Then displayName updated')
        t.ok(org.members[userId].addedAt, 'Then new addedAt set')
        t.equal(user.organizations[organizationId], 'admin', 'Then user.organizations restored')
        t.end()
    })

    t.end()
})

test('Given MemberRemoved action', t => {
    t.test('When member not found Then reject with validation error', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })

        try {
            await submitAndExpectSuccess({ action: Action.MemberRemoved.from({ userId, organizationId }), namespace })
            t.fail('Then member not found should be rejected')
        } catch (error) {
            t.match(error.message, /not found|does not exist/, 'Then validation error thrown')
        }
        t.end()
    })

    t.test('When member already removed Then reject with validation error', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.UserCreated.from({ userId, email: 'dave@example.com', displayName: 'Dave' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({ userId, organizationId, role: 'member', displayName: 'Dave' }),
            namespace,
        })
        await submitAndExpectSuccess({ action: Action.MemberRemoved.from({ userId, organizationId }), namespace })

        try {
            await submitAndExpectSuccess({ action: Action.MemberRemoved.from({ userId, organizationId }), namespace })
            t.fail('Then already removed member should be rejected')
        } catch (error) {
            t.match(error.message, /already removed|not active/, 'Then validation error thrown')
        }
        t.end()
    })

    t.test('When member removed Then atomic write sets removedAt and deletes user.organizations', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.UserCreated.from({ userId, email: 'eve@example.com', displayName: 'Eve' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({ userId, organizationId, role: 'member', displayName: 'Eve Smith' }),
            namespace,
        })
        await submitAndExpectSuccess({ action: Action.MemberRemoved.from({ userId, organizationId }), namespace })

        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const org = await fsContext.organizations.read(organizationId)
        const user = await fsContext.users.read(userId)

        t.ok(org.members[userId].removedAt, 'Then removedAt is set')
        t.equal(org.members[userId].removedBy, 'usr_emulatorbypass', 'Then removedBy is set')
        t.equal(org.members[userId].displayName, 'Eve Smith', 'Then displayName preserved for audit')
        t.notOk(user.organizations[organizationId], 'Then user.organizations entry deleted')
        t.end()
    })

    t.test('When validation error occurs Then transaction rollback leaves no partial state', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })

        try {
            await submitAndExpectSuccess({ action: Action.MemberRemoved.from({ userId, organizationId }), namespace })
            t.fail('Then member not found should fail')
        } catch (error) {
            const fsContext = createFirestoreContext(namespace, organizationId, projectId)
            const org = await fsContext.organizations.read(organizationId)
            t.notOk(org.members?.[userId], 'Then org.members has no partial state')
            t.pass('Then transaction rolled back')
        }
        t.end()
    })

    t.end()
})

test('Given RoleChanged action', t => {
    t.test('When member not found Then reject with validation error', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })

        try {
            await submitAndExpectSuccess({
                action: Action.RoleChanged.from({ userId, organizationId, role: 'admin' }),
                namespace,
            })
            t.fail('Then member not found should be rejected')
        } catch (error) {
            t.match(error.message, /not found|does not exist/, 'Then validation error thrown')
        }
        t.end()
    })

    t.test('When member removed Then reject with validation error', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.UserCreated.from({ userId, email: 'frank@example.com', displayName: 'Frank' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({ userId, organizationId, role: 'member', displayName: 'Frank' }),
            namespace,
        })
        await submitAndExpectSuccess({ action: Action.MemberRemoved.from({ userId, organizationId }), namespace })

        try {
            await submitAndExpectSuccess({
                action: Action.RoleChanged.from({ userId, organizationId, role: 'admin' }),
                namespace,
            })
            t.fail('Then removed member role change should be rejected')
        } catch (error) {
            t.match(error.message, /removed|not active/, 'Then validation error thrown')
        }
        t.end()
    })

    t.test('When role changed Then atomic write to org.members and user.organizations', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.UserCreated.from({ userId, email: 'grace@example.com', displayName: 'Grace' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({ userId, organizationId, role: 'viewer', displayName: 'Grace' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.RoleChanged.from({ userId, organizationId, role: 'admin' }),
            namespace,
        })

        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const org = await fsContext.organizations.read(organizationId)
        const user = await fsContext.users.read(userId)

        t.equal(org.members[userId].role, 'admin', 'Then org.members role updated')
        t.equal(user.organizations[organizationId], 'admin', 'Then user.organizations role updated')
        t.end()
    })

    t.test('When validation error occurs Then transaction rollback leaves no partial state', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })

        try {
            await submitAndExpectSuccess({
                action: Action.RoleChanged.from({ userId, organizationId, role: 'admin' }),
                namespace,
            })
            t.fail('Then member not found should fail')
        } catch (error) {
            const fsContext = createFirestoreContext(namespace, organizationId, projectId)
            const org = await fsContext.organizations.read(organizationId)
            t.notOk(org.members?.[userId], 'Then org.members has no partial state')
            t.pass('Then transaction rolled back')
        }
        t.end()
    })

    t.end()
})
