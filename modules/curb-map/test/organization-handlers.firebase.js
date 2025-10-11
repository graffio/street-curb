import t from 'tap'
import { createFirestoreContext } from '../functions/src/firestore-context.js'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { Action, ActionRequest, FieldTypes } from '../src/types/index.js'

const { test } = t

function formatDate(date) {
    const pad = num => String(num).padStart(2, '0')
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1) // Months are zero-based
    const day = pad(date.getDate())
    const hour = pad(date.getHours())
    const minute = pad(date.getMinutes())
    const second = pad(date.getSeconds())
    const millisecond = String(date.getMilliseconds()).padStart(3, '0')

    return `${year}.${month}.${day}_${hour}${minute}${second}.${millisecond}`
}

const formattedDate = formatDate(new Date())

const namespace = `tests/ns_${formattedDate}`
const adminFacade = FirestoreAdminFacade(ActionRequest, `${namespace}/`)

const waitForActionRequestStatus = (id, timeout = 5000) =>
    new Promise((resolve, reject) => {
        const fail = error => {
            clearTimeout(timeoutId)
            unsubscribe()
            reject(error)
        }
        const succeed = item => {
            clearTimeout(timeoutId)
            unsubscribe()
            resolve(item)
        }

        const timeoutId = setTimeout(() => {
            unsubscribe()
            reject(new Error(`Timeout waiting for action request ${id} to change status`))
        }, timeout)

        const unsubscribe = adminFacade.listenToDocument(id, (item, error) => {
            if (error) return fail(error)
            if (item && item.status !== 'pending') succeed(item)
        })
    })

const createActionRequest = (action, organizationId, projectId, actorId, id = FieldTypes.newActionRequestId()) =>
    ActionRequest.from({
        id,
        actorId,
        subjectId: organizationId,
        subjectType: 'organization',
        action,
        organizationId,
        projectId,
        idempotencyKey: FieldTypes.newIdempotencyKey(),
        status: 'pending',
        resultData: undefined,
        error: undefined,
        correlationId: FieldTypes.newCorrelationId(),
        schemaVersion: 1,
        createdAt: new Date(),
        processedAt: undefined,
    })

test('Given organization handlers are integrated with the giant function', t => {
    t.test(
        'When OrganizationCreated action is processed Then organization and default project are created in Firestore',
        async t => {
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()
            const actorId = FieldTypes.newUserId()
            const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'City of San Francisco' })
            const actionRequest = createActionRequest(action, organizationId, projectId, actorId)

            await adminFacade.write(actionRequest)
            const result = await waitForActionRequestStatus(actionRequest.id)

            t.equal(result.status, 'completed', 'Then the action request is completed')
            t.ok(result.processedAt, 'Then processedAt timestamp is set')
            t.notOk(result.error, 'Then no error occurred')

            // Create Firestore context for this organization/project
            const fsContext = createFirestoreContext(namespace, organizationId, projectId)

            // Verify organization document was created
            const org = await fsContext.organizations.read(organizationId)

            t.ok(org, 'Then organization document exists')
            t.equal(org.name, 'City of San Francisco', 'Then organization name is set')
            t.equal(org.status, 'active', 'Then organization status is active')
            t.equal(org.defaultProjectId, projectId, 'Then defaultProjectId matches client-provided projectId')
            t.equal(org.createdBy, actorId, 'Then createdBy is set from actionRequest.actorId')
            t.ok(org.createdAt, 'Then createdAt is set by handler')
            t.equal(org.updatedBy, actorId, 'Then updatedBy is set from actionRequest.actorId')
            t.ok(org.updatedAt, 'Then updatedAt is set by handler')

            // Verify default project was created
            const project = await fsContext.projects.read(projectId)

            t.ok(project, 'Then default project document exists')
            t.equal(project.name, 'Default Project', 'Then default project name is set')
            t.equal(project.organizationId, organizationId, 'Then project links to organization')
            t.equal(project.createdBy, actorId, 'Then project createdBy is set from actionRequest.actorId')
            t.ok(project.createdAt, 'Then project createdAt is set by handler')
            t.equal(project.updatedBy, actorId, 'Then project updatedBy is set from actionRequest.actorId')
            t.ok(project.updatedAt, 'Then project updatedAt is set by handler')

            t.end()
        },
    )

    t.test('When OrganizationUpdated action updates name Then organization name is updated', async t => {
        // First create an organization
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const actorId = FieldTypes.newUserId()
        const createAction = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Original Name' })
        const createRequest = createActionRequest(createAction, organizationId, projectId, actorId)
        await adminFacade.write(createRequest)
        await waitForActionRequestStatus(createRequest.id)

        // Then update it
        const updateAction = Action.OrganizationUpdated.from({ organizationId, name: 'Updated Name' })
        const updateRequest = createActionRequest(updateAction, organizationId, projectId, actorId)
        await adminFacade.write(updateRequest)
        const result = await waitForActionRequestStatus(updateRequest.id)

        t.equal(result.status, 'completed', 'Then the action request is completed')
        t.notOk(result.error, 'Then no error occurred')

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
        const actorId = FieldTypes.newUserId()
        const createAction = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })
        const createRequest = createActionRequest(createAction, organizationId, projectId, actorId)
        await adminFacade.write(createRequest)
        await waitForActionRequestStatus(createRequest.id)

        // Then update status
        const updateAction = Action.OrganizationUpdated.from({ organizationId, status: 'suspended' })
        const updateRequest = createActionRequest(updateAction, organizationId, projectId, actorId)
        await adminFacade.write(updateRequest)
        const result = await waitForActionRequestStatus(updateRequest.id)

        t.equal(result.status, 'completed', 'Then the action request is completed')
        t.notOk(result.error, 'Then no error occurred')

        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const org = await fsContext.organizations.read(organizationId)

        t.equal(org.status, 'suspended', 'Then organization status is updated')
        t.equal(org.name, 'Test Org', 'Then organization name remains unchanged')

        t.end()
    })

    t.test(
        'When OrganizationUpdated action has invalid status Then action request fails with validation error',
        async t => {
            // First create an organization
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()
            const actorId = FieldTypes.newUserId()
            const createAction = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })
            const createRequest = createActionRequest(createAction, organizationId, projectId, actorId)
            await adminFacade.write(createRequest)
            await waitForActionRequestStatus(createRequest.id)

            // Then try to update with invalid status
            const updateAction = Action.OrganizationUpdated.from({ organizationId, status: 'suspended' })
            const updateRequest = createActionRequest(updateAction, organizationId, projectId, actorId)
            updateRequest.action.status = 'invalid-status'
            await adminFacade.write(updateRequest)
            const result = await waitForActionRequestStatus(updateRequest.id)

            t.equal(result.status, 'failed', 'Then the action request fails')
            t.ok(result.error, 'Then error is set')
            t.match(result.error, /Invalid status/, 'Then error mentions invalid status')

            t.end()
        },
        { skip: true },
    )

    t.test('When OrganizationSuspended action is processed Then organization status becomes suspended', async t => {
        // First create an organization
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const actorId = FieldTypes.newUserId()
        const createAction = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })
        const createRequest = createActionRequest(createAction, organizationId, projectId, actorId)
        await adminFacade.write(createRequest)
        await waitForActionRequestStatus(createRequest.id)

        // Then suspend it
        const suspendAction = Action.OrganizationSuspended.from({ organizationId })
        const suspendRequest = createActionRequest(suspendAction, organizationId, projectId, actorId)
        await adminFacade.write(suspendRequest)
        const result = await waitForActionRequestStatus(suspendRequest.id)

        t.equal(result.status, 'completed', 'Then the action request is completed')
        t.notOk(result.error, 'Then no error occurred')

        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const org = await fsContext.organizations.read(organizationId)

        t.equal(org.status, 'suspended', 'Then organization status is suspended')

        t.end()
    })

    t.test('When OrganizationDeleted action is processed Then organization is deleted from Firestore', async t => {
        // First create an organization
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const actorId = FieldTypes.newUserId()
        const createAction = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })
        const createRequest = createActionRequest(createAction, organizationId, projectId, actorId)
        await adminFacade.write(createRequest)
        await waitForActionRequestStatus(createRequest.id)

        // Then delete it
        const deleteAction = Action.OrganizationDeleted.from({ organizationId })
        const deleteRequest = createActionRequest(deleteAction, organizationId, projectId, actorId)
        await adminFacade.write(deleteRequest)
        const result = await waitForActionRequestStatus(deleteRequest.id)

        t.equal(result.status, 'completed', 'Then the action request is completed')
        t.notOk(result.error, 'Then no error occurred')

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
