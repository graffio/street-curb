import t from 'tap'
import { createFirestoreContext } from '../functions/src/firestore-context.js'
import { Action, FieldTypes } from '../src/types/index.js'
import { submitAndExpectSuccess } from './helpers/http-submit-action.js'

const { test } = t
const namespace = `tests/${new Date().toISOString().replace(/[:.]/g, '-')}`

test('Given UserCreated action', t => {
    t.test('When user is created Then user doc has empty organizations map', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const userId = FieldTypes.newUserId()
        const action = Action.UserCreated.from({ userId, email: 'alice@example.com', displayName: 'Alice Chen' })

        await submitAndExpectSuccess({ action, namespace })

        const fsContext = createFirestoreContext(namespace, organizationId, null)
        const user = await fsContext.users.read(userId)

        t.ok(user.organizations, 'Then organizations map exists')
        t.same(user.organizations, {}, 'Then organizations map is empty')
        t.ok(user.createdAt, 'Then createdAt is set')
        t.equal(user.createdBy, 'usr_emulatorbypass', 'Then createdBy is set from actorId')
        t.end()
    })
    t.end()
})

test('Given UserUpdated action', t => {
    t.test('When user email is updated Then email changes and organizations unchanged', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })
        const createAction = Action.UserCreated.from({ userId, email: 'old@example.com', displayName: 'Alice' })
        await submitAndExpectSuccess({ action: createAction, namespace })
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({ userId, organizationId, role: 'member', displayName: 'Alice' }),
            namespace,
        })

        const updateAction = Action.UserUpdated.from({ userId, email: 'new@example.com' })
        await submitAndExpectSuccess({ action: updateAction, namespace })

        const fsContext = createFirestoreContext(namespace, organizationId, null)
        const user = await fsContext.users.read(userId)

        t.equal(user.email, 'new@example.com', 'Then email is updated')
        t.equal(user.displayName, 'Alice', 'Then displayName unchanged')
        t.ok(user.organizations[organizationId], 'Then organizations map unchanged')
        t.ok(user.updatedAt, 'Then updatedAt is set')
        t.equal(user.updatedBy, 'usr_emulatorbypass', 'Then updatedBy is set')
        t.end()
    })

    t.test('When displayName is updated Then displayName changes and organizations unchanged', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()

        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' }),
            namespace,
        })
        const createAction = Action.UserCreated.from({ userId, email: 'test@example.com', displayName: 'Old Name' })
        await submitAndExpectSuccess({ action: createAction, namespace })
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({ userId, organizationId, role: 'member', displayName: 'Old Name' }),
            namespace,
        })

        const updateAction = Action.UserUpdated.from({ userId, displayName: 'New Name' })
        await submitAndExpectSuccess({ action: updateAction, namespace })

        const fsContext = createFirestoreContext(namespace, organizationId, null)
        const user = await fsContext.users.read(userId)

        t.equal(user.displayName, 'New Name', 'Then displayName is updated')
        t.equal(user.email, 'test@example.com', 'Then email unchanged')
        t.ok(user.organizations[organizationId], 'Then organizations map unchanged')
        t.ok(user.updatedAt, 'Then updatedAt is set')
        t.end()
    })

    t.end()
})

test('Given UserForgotten action (GDPR)', t => {
    t.test('When user is forgotten Then removedAt set in all orgs and user deleted', async t => {
        const org1 = FieldTypes.newOrganizationId()
        const org2 = FieldTypes.newOrganizationId()
        const userId = FieldTypes.newUserId()
        const projectId = FieldTypes.newProjectId()

        // Create organizations
        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({ organizationId: org1, projectId, name: 'Org 1' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.OrganizationCreated.from({
                organizationId: org2,
                projectId: FieldTypes.newProjectId(),
                name: 'Org 2',
            }),
            namespace,
        })

        // Create user then add to org1 and org2
        await submitAndExpectSuccess({
            action: Action.UserCreated.from({ userId, email: 'user@example.com', displayName: 'User' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({ userId, organizationId: org1, role: 'admin', displayName: 'User' }),
            namespace,
        })
        await submitAndExpectSuccess({
            action: Action.MemberAdded.from({ userId, organizationId: org2, role: 'member', displayName: 'User' }),
            namespace,
        })

        // Forget user (GDPR)
        await submitAndExpectSuccess({
            action: Action.UserForgotten.from({ userId, reason: 'GDPR request' }),
            namespace,
        })

        const fsContext = createFirestoreContext(namespace, org1, projectId)

        // Verify removedAt set in all orgs
        const orgDoc1 = await fsContext.organizations.read(org1)
        const orgDoc2 = await fsContext.organizations.read(org2)
        t.ok(orgDoc1.members[userId].removedAt, 'Then removedAt set in org1')
        t.ok(orgDoc2.members[userId].removedAt, 'Then removedAt set in org2')
        t.ok(orgDoc1.members[userId].removedBy, 'Then removedBy set in org1')

        // Verify user deleted
        try {
            await fsContext.users.read(userId)
            t.fail('Then user doc should be deleted')
        } catch (error) {
            t.match(error.message, /not found/, 'Then user doc is deleted')
        }
        t.end()
    })

    t.test('When user not found Then GDPR action handles gracefully', async t => {
        const userId = FieldTypes.newUserId()
        await submitAndExpectSuccess({
            action: Action.UserForgotten.from({ userId, reason: 'User does not exist' }),
            namespace,
        })
        t.pass('Then action completes without error')
        t.end()
    })

    t.test('When user has no organizations Then GDPR deletes user only', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const userId = FieldTypes.newUserId()
        await submitAndExpectSuccess({
            action: Action.UserCreated.from({ userId, email: 'orphan@example.com', displayName: 'Orphan' }),
            namespace,
        })

        await submitAndExpectSuccess({ action: Action.UserForgotten.from({ userId, reason: 'GDPR' }), namespace })

        const fsContext = createFirestoreContext(namespace, organizationId, null)
        try {
            await fsContext.users.read(userId)
            t.fail('Then user should be deleted')
        } catch (error) {
            t.match(error.message, /not found/, 'Then user is deleted')
        }
        t.end()
    })

    t.end()
})
