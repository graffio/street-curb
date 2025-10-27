import t from 'tap'
import { createFirestoreContext } from '../../functions/src/firestore-context.js'
import { Action } from '../../src/types/index.js'
import { asSignedInUser } from './auth-emulator.js'
import { submitAndExpectSuccess } from './http-submit-action.js'
import { createOrganization } from './test-helpers.js'

const { test } = t

test('Given OrganizationDeleted action', t => {
    t.test('When OrganizationDeleted runs Then organization document is removed', async t => {
        await asSignedInUser('org-delete', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const action = Action.OrganizationDeleted.from({ organizationId })
            await submitAndExpectSuccess({ action, namespace, token })

            const fsContext = createFirestoreContext(namespace, organizationId, projectId)
            await t.rejects(fsContext.organizations.read(organizationId), /not found/, 'Then organization is deleted')
        })
        t.end()
    })

    t.end()
})
