import t from 'tap'
import { createFirestoreContext } from '../functions/src/firestore-context.js'
import { Action, FieldTypes } from '../src/types/index.js'
import { submitAndExpectSuccess } from './helpers/http-submit-action.js'

const { test } = t

const namespace = `tests/${new Date().toISOString().replace(/[:.]/g, '-')}`

test('Given organization handlers are integrated with HTTP function', t => {
    t.test(
        'When OrganizationCreated action is submitted via HTTP Then organization and default project are created',
        async t => {
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()
            const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'City of San Francisco' })

            console.log(`Test organizationId: ${organizationId}`)
            const result = await submitAndExpectSuccess({ action, namespace })

            t.equal(result.status, 'completed', 'Then the action request is completed')
            t.ok(result.processedAt, 'Then processedAt timestamp is set')
            t.notOk(result.id, 'Then action request ID is not exposed to client')

            // Create Firestore context for this organization/project
            const fsContext = createFirestoreContext(namespace, organizationId, projectId)

            // Verify organization document was created
            const org = await fsContext.organizations.read(organizationId)

            t.ok(org, 'Then organization document exists')
            t.equal(org.name, 'City of San Francisco', 'Then organization name is set')
            t.equal(org.status, 'active', 'Then organization status is active')
            t.equal(org.defaultProjectId, projectId, 'Then defaultProjectId matches client-provided projectId')
            t.equal(org.createdBy, 'usr_emulatorbypass', 'Then createdBy is set from emulator bypass')
            t.ok(org.createdAt, 'Then createdAt is set by handler')
            t.equal(org.updatedBy, 'usr_emulatorbypass', 'Then updatedBy is set from emulator bypass')
            t.ok(org.updatedAt, 'Then updatedAt is set by handler')

            // Verify default project was created
            const project = await fsContext.projects.read(projectId)

            t.ok(project, 'Then default project document exists')
            t.equal(project.name, 'Default Project', 'Then default project name is set')
            t.equal(project.organizationId, organizationId, 'Then project links to organization')
            t.equal(project.createdBy, 'usr_emulatorbypass', 'Then project createdBy is set from emulator bypass')
            t.ok(project.createdAt, 'Then project createdAt is set by handler')
            t.equal(project.updatedBy, 'usr_emulatorbypass', 'Then project updatedBy is set from emulator bypass')
            t.ok(project.updatedAt, 'Then project updatedAt is set by handler')

            t.end()
        },
    )

    t.test('When OrganizationUpdated action updates name Then organization name is updated', async t => {
        // First create an organization
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const createAction = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Original Name' })

        console.log(`Test organizationId: ${organizationId}`)
        await submitAndExpectSuccess({ action: createAction, namespace })

        // Then update it
        const updateAction = Action.OrganizationUpdated.from({ organizationId, name: 'Updated Name' })

        const result = await submitAndExpectSuccess({ action: updateAction, namespace })

        t.equal(result.status, 'completed', 'Then the action request is completed')

        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const org = await fsContext.organizations.read(organizationId)

        t.equal(org.name, 'Updated Name', 'Then organization name is updated')
        t.equal(org.status, 'active', 'Then organization status remains unchanged')

        t.end()
    })

    t.test('When OrganizationUpdated action updates status Then organization status is updated', async t => {
        // First create an organization
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const createAction = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })

        console.log(`Test organizationId: ${organizationId}`)
        await submitAndExpectSuccess({ action: createAction, namespace })

        // Then update status
        const updateAction = Action.OrganizationUpdated.from({ organizationId, status: 'suspended' })

        const result = await submitAndExpectSuccess({ action: updateAction, namespace })

        t.equal(result.status, 'completed', 'Then the action request is completed')

        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const org = await fsContext.organizations.read(organizationId)

        t.equal(org.status, 'suspended', 'Then organization status is updated')
        t.equal(org.name, 'Test Org', 'Then organization name remains unchanged')

        t.end()
    })

    t.test('When OrganizationSuspended action is submitted Then organization status becomes suspended', async t => {
        // First create an organization
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const createAction = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })

        console.log(`Test organizationId: ${organizationId}`)
        await submitAndExpectSuccess({ action: createAction, namespace })

        // Then suspend it
        const suspendAction = Action.OrganizationSuspended.from({ organizationId })

        const result = await submitAndExpectSuccess({ action: suspendAction, namespace })

        t.equal(result.status, 'completed', 'Then the action request is completed')

        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const org = await fsContext.organizations.read(organizationId)

        t.equal(org.status, 'suspended', 'Then organization status is suspended')

        t.end()
    })

    t.test('When OrganizationDeleted action is submitted Then organization is deleted from Firestore', async t => {
        // First create an organization
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const createAction = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })

        console.log(`Test organizationId: ${organizationId}`)
        await submitAndExpectSuccess({ action: createAction, namespace })

        // Then delete it
        const deleteAction = Action.OrganizationDeleted.from({ organizationId })

        const result = await submitAndExpectSuccess({ action: deleteAction, namespace })

        t.equal(result.status, 'completed', 'Then the action request is completed')

        const fsContext = createFirestoreContext(namespace, organizationId, projectId)

        // Verify organization is deleted
        try {
            await fsContext.organizations.read(organizationId)
            t.fail('Then organization should not exist')
        } catch (error) {
            t.match(error.message, /not found/, 'Then organization is deleted')
        }

        t.end()
    })

    t.end()
})
