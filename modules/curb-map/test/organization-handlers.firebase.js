import { test } from 'tap'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { Action, ActionRequest, FieldTypes } from '../src/types/index.js'
import { createFirestoreContext } from '../functions/src/firestore-context.js'

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

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const waitForActionRequestStatus = async (id, timeout = 5000) => {
    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
        const item = await adminFacade.read(id)
        if (item.status !== 'pending') return item

        await wait(200)
    }
    throw new Error(`Timeout waiting for action request ${id} to change status`)
}

const createOrganizationActionRequest = (organizationId, projectId, name, actorId) =>
    ActionRequest.from({
        id: FieldTypes.newActionRequestId(),
        actorId,
        subjectId: organizationId,
        subjectType: 'organization',
        action: Action.OrganizationCreated.from({ organizationId, projectId, name }),
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
            const actionRequest = createOrganizationActionRequest(
                organizationId,
                projectId,
                'City of San Francisco',
                actorId,
            )

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

    t.end()
})
