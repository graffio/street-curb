import t from 'tap'
import { createFirestoreContext } from '../../functions/src/firestore-context.js'
import { Action, FieldTypes } from '../../src/types/index.js'
import { asSignedInUser } from './auth-emulator.js'
import {
    buildActionPayload,
    rawHttpRequest,
    submitAndExpectDuplicate,
    submitAndExpectSuccess,
    submitAndExpectValidationError,
} from './http-submit-action.js'

const { test } = t

const createOrg = async ({
    namespace,
    token,
    organizationId = FieldTypes.newOrganizationId(),
    projectId = FieldTypes.newProjectId(),
    name = 'Test Org',
}) => {
    const action = Action.OrganizationCreated.from({ organizationId, projectId, name })
    await submitAndExpectSuccess({ action, namespace, token })
    return { organizationId, projectId }
}

const orgState = async ({ namespace, organizationId, projectId }) => {
    const fsContext = createFirestoreContext(namespace, organizationId, projectId)
    return fsContext.organizations.readOrNull(organizationId)
}

const projectState = async ({ namespace, organizationId, projectId }) => {
    const fsContext = createFirestoreContext(namespace, organizationId, projectId)
    return fsContext.projects.readOrNull(projectId)
}

test('Given organization handlers via submitActionRequest', t => {
    t.test('When OrganizationCreated is submitted Then Firestore and metadata reflect token UID', async t => {
        await asSignedInUser('org-created', async ({ namespace, token, actorUserId }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()

            const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'City of San Francisco' })
            const result = await submitAndExpectSuccess({ action, namespace, token })

            t.equal(result.status, 'completed', 'Then action request completes')
            t.ok(result.processedAt, 'Then processedAt timestamp is set')

            const org = await orgState({ namespace, organizationId, projectId })
            const project = await projectState({ namespace, organizationId, projectId })

            t.equal(org.createdBy, actorUserId, 'Then organization.createdBy matches token userId')
            t.equal(org.updatedBy, actorUserId, 'Then organization.updatedBy matches token userId')
            t.equal(project.createdBy, actorUserId, 'Then project.createdBy matches token userId')
            t.equal(project.updatedBy, actorUserId, 'Then project.updatedBy matches token userId')
        })
        t.end()
    })

    t.test('When request omits token Then HTTP 401 is returned and no writes occur', async t => {
        await asSignedInUser('org-missing-token', async ({ namespace }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()

            const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Unauthorized Org' })
            const result = await rawHttpRequest({ body: buildActionPayload(namespace, action) })

            t.equal(result.status, 401, 'Then HTTP response is unauthorized')
            t.equal(result.data.status, 'unauthorized', 'Then payload indicates unauthorized access')

            const org = await orgState({ namespace, organizationId, projectId })
            t.equal(org, null, 'Then organization document is not created')
        })
        t.end()
    })

    t.test('When OrganizationUpdated changes name Then metadata uses token UID', async t => {
        await asSignedInUser('org-update-name', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrg({ namespace, token, name: 'Original Name' })

            const action = Action.OrganizationUpdated.from({ organizationId, name: 'Updated Name' })
            await submitAndExpectSuccess({ action, namespace, token })

            const org = await orgState({ namespace, organizationId, projectId })
            t.equal(org.name, 'Updated Name', 'Then name updated')
            t.equal(org.updatedBy, actorUserId, 'Then updatedBy matches token userId')
        })
        t.end()
    })

    t.test('When OrganizationUpdated changes status Then status is updated', async t => {
        await asSignedInUser('org-update-status', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrg({ namespace, token })

            const action = Action.OrganizationUpdated.from({ organizationId, status: 'suspended' })
            await submitAndExpectSuccess({ action, namespace, token })

            const org = await orgState({ namespace, organizationId, projectId })
            t.equal(org.status, 'suspended', 'Then status updated')
        })
        t.end()
    })

    t.test('When OrganizationSuspended runs Then organization status becomes suspended', async t => {
        await asSignedInUser('org-suspend', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrg({ namespace, token })

            const action = Action.OrganizationSuspended.from({ organizationId })
            await submitAndExpectSuccess({ action, namespace, token })

            const org = await orgState({ namespace, organizationId, projectId })
            t.equal(org.status, 'suspended', 'Then suspended state persisted')
        })
        t.end()
    })

    t.test('When OrganizationDeleted runs Then organization document is removed', async t => {
        await asSignedInUser('org-delete', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrg({ namespace, token })

            const action = Action.OrganizationDeleted.from({ organizationId })
            await submitAndExpectSuccess({ action, namespace, token })

            const fsContext = createFirestoreContext(namespace, organizationId, projectId)
            await t.rejects(fsContext.organizations.read(organizationId), /not found/, 'Then organization is deleted')
        })
        t.end()
    })

    t.end()
})

test('Given transaction-based idempotency', t => {
    t.test('When duplicate OrganizationCreated submitted Then HTTP 409 duplicate is returned', async t => {
        await asSignedInUser('org-duplicate', async ({ namespace, token }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()

            const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Duplicate Org' })
            const idempotencyKey = FieldTypes.newIdempotencyKey()
            await submitAndExpectSuccess({ action, namespace, token, idempotencyKey })

            const duplicate = await submitAndExpectDuplicate({ action, namespace, token, idempotencyKey })
            t.equal(duplicate.status, 'duplicate', 'Then duplicate status returned')
        })
        t.end()
    })

    t.test('When server timestamps set Then completedActions entry has processedAt', async t => {
        await asSignedInUser('org-timestamps', async ({ namespace, token }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()

            const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Timestamp Org' })
            const result = await submitAndExpectSuccess({ action, namespace, token })

            t.ok(result.processedAt, 'Then processedAt timestamp returned')
        })
        t.end()
    })

    t.test('When validation fails Then HTTP 400 is returned', async t => {
        await asSignedInUser('org-validation-fail', async ({ namespace, token }) => {
            const invalidAction = { '@@tagName': 'OrganizationCreated', organizationId: 'bad', name: 123 }

            const result = await submitAndExpectValidationError({ action: invalidAction, namespace, token })

            t.equal(result.status, 'validation-failed', 'Then validation failure status returned')
        })
        t.end()
    })

    t.end()
})
