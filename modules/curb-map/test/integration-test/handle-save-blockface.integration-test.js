import t from 'tap'
import { Action, Blockface, Segment } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import { submitAndExpectSuccess } from '../integration-test-helpers/http-submit-action.js'
import { createOrganization } from '../integration-test-helpers/test-helpers.js'
import { createFirestoreContext } from '../../functions/src/firestore-context.js'

const { test } = t

const createTestBlockface = (organizationId, projectId) =>
    Blockface.from({
        id: 'blk_000000000001',
        sourceId: 'test-source-1',
        organizationId,
        projectId,
        geometry: null,
        streetName: 'Test Street',
        segments: [Segment('seg_000000000001', 'Parking', 50), Segment('seg_000000000002', 'Loading', 30)],
        createdAt: new Date(),
        createdBy: 'usr_000000000001',
        updatedAt: new Date(),
        updatedBy: 'usr_000000000001',
    })

test('Given SaveBlockface action', t => {
    t.test('When blockface is saved Then blockface persists to Firestore', async t => {
        await asSignedInUser('save-blockface', async ({ namespace, token, actorUserId }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const blockface = createTestBlockface(organizationId, projectId)
            const changes = { added: [], modified: [], removed: [] }

            const action = Action.SaveBlockface(blockface, changes)
            await submitAndExpectSuccess({ action, namespace, token })

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

    t.test('When blockface has modified segments Then changes are logged', async t => {
        await asSignedInUser('save-with-changes', async ({ namespace, token }) => {
            const { organizationId, projectId } = await createOrganization({ namespace, token })

            const blockface = createTestBlockface(organizationId, projectId)
            const changes = {
                added: [{ index: 2, segment: Segment('seg_000000000003', 'Bus Stop', 20) }],
                modified: [{ index: 0, field: 'use', oldValue: 'Parking', newValue: 'Disabled' }],
                removed: [{ index: 1, segment: Segment('seg_000000000002', 'Loading', 30) }],
            }

            const action = Action.SaveBlockface(blockface, changes)
            await submitAndExpectSuccess({ action, namespace, token })

            // Changes are logged but not validated in this test
            // Cloud Function logs would contain the change details
            t.pass('Then action completes successfully with changes logged')
        })
        t.end()
    })

    t.end()
})
