import t from 'tap'
import { Action, FieldTypes } from '../../src/types/index.js'
import { asSignedInUser } from './auth-emulator.js'
import {
    buildActionPayload,
    rawHttpRequest,
    submitAndExpectDuplicate,
    submitAndExpectSuccess,
    submitAndExpectValidationError,
} from './http-submit-action.js'
import { readOrganization, readProject } from './test-helpers.js'

const { test } = t

test('Given OrganizationCreated action', t => {
    t.test('When OrganizationCreated is submitted Then Firestore and metadata reflect token UID', async t => {
        await asSignedInUser('org-created', async ({ namespace, token, actorUserId }) => {
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()

            const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'City of San Francisco' })
            const result = await submitAndExpectSuccess({ action, namespace, token })

            t.equal(result.status, 'completed', 'Then action request completes')
            t.ok(result.processedAt, 'Then processedAt timestamp is set')

            const organization = await readOrganization({ namespace, organizationId, projectId })
            const project = await readProject({ namespace, organizationId, projectId })

            t.equal(organization.createdBy, actorUserId, 'Then organization.createdBy matches token userId')
            t.equal(organization.updatedBy, actorUserId, 'Then organization.updatedBy matches token userId')
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

            const organization = await readOrganization({ namespace, organizationId, projectId })
            t.equal(organization, null, 'Then organization document is not created')
        })
        t.end()
    })

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
