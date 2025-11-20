import t from 'tap'
import { Action } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { submitAndExpectSuccess } from '../integration-test-helpers/http-submit-action.js'
import { createOrganization, readOrganization } from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given OrganizationSuspended action', t => {
    t.test('When OrganizationSuspended runs Then organization status becomes suspended', async t => {
        await asSignedInUser('success', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const action = Action.OrganizationSuspended.from({})
            await submitAndExpectSuccess({ action, namespace, token, organizationId, projectId })

            const organization = await readOrganization({ namespace, organizationId, projectId })
            t.equal(organization.status, 'suspended', 'Then suspended state persisted')
        })
        t.end()
    })

    t.end()
})
