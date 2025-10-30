import t from 'tap'
import { Action } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { submitAndExpectSuccess } from '../integration-test-helpers/http-submit-action.js'
import { createOrganization, readOrganization } from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given OrganizationUpdated action', t => {
    t.test('When OrganizationUpdated changes name Then name is updated', async t => {
        await asSignedInUser('name', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token, name: 'Original Name' })

            const action = Action.OrganizationUpdated.from({ organizationId, name: 'Updated Name' })
            await submitAndExpectSuccess({ action, namespace, token })

            const organization = await readOrganization({ namespace, organizationId, projectId })
            t.equal(organization.name, 'Updated Name', 'Then name updated')
        })
        t.end()
    })

    t.test('When OrganizationUpdated changes status Then status is updated', async t => {
        await asSignedInUser('status', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const action = Action.OrganizationUpdated.from({ organizationId, status: 'suspended' })
            await submitAndExpectSuccess({ action, namespace, token })

            const organization = await readOrganization({ namespace, organizationId, projectId })
            t.equal(organization.status, 'suspended', 'Then status updated')
        })
        t.end()
    })

    t.end()
})
