import t from 'tap'
import { Action, FieldTypes } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { submitActionRequest } from '../integration-test-helpers/http-submit-action.js'
import { createOrganization } from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given OrganizationCreated action', t => {
    // t.test('When creating first organization Then succeeds', async t => {
    //     await asSignedInUser('first-org', async ({ namespace, token }) => {
    //         const organizationId = FieldTypes.newOrganizationId()
    //         const projectId = FieldTypes.newProjectId()
    //         const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'First Org' })
    //
    //         await submitAndExpectSuccess({ action, namespace, token })
    //         t.pass('Then first organization created successfully')
    //     })
    //     t.end()
    // })
    //
    // t.test('When creating second organization Then succeeds', async t => {
    //     await asSignedInUser('second-org', async ({ namespace, token }) => {
    //         // First org created by asSignedInUser
    //         const { organizationId } = await createOrganization({ namespace, token, name: 'Second Org' })
    //
    //         t.ok(organizationId, 'Then second organization created successfully')
    //     })
    //     t.end()
    // })

    t.test('RBAC: When user tries to create third organization Then returns 401 unauthorized', async t => {
        await asSignedInUser('third-org-denied', async ({ namespace, token }) => {
            await createOrganization({ namespace, token, name: 'First Org' })
            await createOrganization({ namespace, token, name: 'Second Org' })

            // Try to create third org (should fail due to limit)
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()
            const action = Action.OrganizationCreated.from({ projectId, name: 'Third Org' })
            const result = await submitActionRequest({ action, namespace, token, organizationId, projectId })

            t.equal(result.status, 401, 'Then HTTP status is 401')
            t.equal(result.data.status, 'unauthorized', 'Then status is unauthorized')
            t.match(result.data.error, /can't create another organization/, 'Then error mentions org limit')
        })
        t.end()
    })

    t.end()
})
