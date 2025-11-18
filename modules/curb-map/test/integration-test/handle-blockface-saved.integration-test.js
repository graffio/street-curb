import { LookupTable } from '@graffio/functional'
import t from 'tap'
import { createFirestoreContext } from '../../functions/src/firestore-context.js'
import { Action, Blockface, Segment } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { submitAndExpectSuccess } from '../integration-test-helpers/http-submit-action.js'
import { createOrganization } from '../integration-test-helpers/test-helpers.js'

const { test } = t

const createTestBlockface = (organizationId, projectId) =>
    Blockface.from({
        id: 'blk_000000000001',
        sourceId: 'test-source-1',
        organizationId,
        projectId,
        geometry: null,
        streetName: 'Test Street',
        segments: LookupTable(
            [Segment('seg_000000000001', 'Parking', 50), Segment('seg_000000000002', 'Loading', 30)],
            Segment,
        ),
        createdAt: new Date(),
        createdBy: 'usr_000000000001',
        updatedAt: new Date(),
        updatedBy: 'usr_000000000001',
    })

test('Given BlockfaceSaved action', t => {
    t.test('When blockface is saved Then blockface persists to Firestore', async t => {
        await asSignedInUser('save-blockface', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const blockface = createTestBlockface(organizationId, projectId)

            const action = Action.BlockfaceSaved(blockface)
            await submitAndExpectSuccess({ action, namespace, token, organizationId, projectId })

            // Read blockface from Firestore
            const fsContext = createFirestoreContext(namespace, organizationId, projectId)
            const savedBlockface = await fsContext.blockfaces.read(blockface.id)

            t.equal(savedBlockface.id, blockface.id, 'Then blockface ID matches')
            t.equal(savedBlockface.streetName, 'Test Street', 'Then street name persists')
            t.equal(savedBlockface.segments.length, 2, 'Then segments persist')
            t.equal(savedBlockface.segments[0].use, 'Parking', 'Then first segment use persists')
            t.equal(savedBlockface.segments[1].use, 'Loading', 'Then second segment use persists')
        })
        t.end()
    })

    t.test('When blockface is saved multiple times Then each version persists', async t => {
        await asSignedInUser('save-multiple-times', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const blockface = createTestBlockface(organizationId, projectId)
            const action = Action.BlockfaceSaved(blockface)
            await submitAndExpectSuccess({ action, namespace, token, organizationId, projectId })

            // Modify and save again
            const updatedBlockface = Blockface.from({ ...blockface, streetName: 'Updated Street' })
            const action2 = Action.BlockfaceSaved(updatedBlockface)
            await submitAndExpectSuccess({ action: action2, namespace, token, organizationId, projectId })

            // Read from Firestore
            const fsContext = createFirestoreContext(namespace, organizationId, projectId)
            const savedBlockface = await fsContext.blockfaces.read(blockface.id)

            t.equal(savedBlockface.streetName, 'Updated Street', 'Then updated street name persists')
        })
        t.end()
    })

    t.end()
})
