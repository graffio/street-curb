import { test } from 'tap'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { Action, FieldTypes, QueueItem, SystemFlags } from '../src/types/index.js'

const namespace = `tests/ns_${Date.now()}_${Math.random().toString(36).slice(2)}`
const adminFacade = FirestoreAdminFacade(QueueItem, `${namespace}/`)
const flagsFacade = FirestoreAdminFacade(SystemFlags, `${namespace}/`)

const queueItemId = FieldTypes.newQueueItemId()
const actorId = FieldTypes.newUserId()

const defaultQueueItem = status =>
    QueueItem.from({
        id: queueItemId,
        actorId,
        action: Action.UserAdded.from({
            organizationId: FieldTypes.newOrganizationId(),
            user: { id: FieldTypes.newUserId(), email: 'queue@example.com' },
        }),
        idempotencyKey: FieldTypes.newIdempotencyKey(),
        status,
        resultData: undefined,
        error: undefined,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        processedAt: undefined,
    })

const writeQueueItem = async status => {
    const item = defaultQueueItem(status)
    await adminFacade.write(item)
    return item
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const disableTriggers = async () => await flagsFacade.write(SystemFlags('flags', false))
const enableTriggers = async () => await flagsFacade.write(SystemFlags('flags', true))

const waitForQueueItemStatus = async (id, timeout = 5000) => {
    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
        const item = await adminFacade.read(id)
        if (item.status !== 'pending') return item

        await wait(200)
    }
    throw new Error(`Timeout waiting for queue item ${id} to change status`)
}

test('Given the minimal giant function', t => {
    t.test('When triggers are disabled Then queue items remain untouched', async t => {
        await disableTriggers()
        const item = await writeQueueItem('pending')

        await wait(500)

        const stored = await adminFacade.read(item.id)
        t.equal(stored.status, 'pending', 'Then the queue item retains pending status')
        await enableTriggers()
    })

    t.test('When a pending queue item is processed Then its status becomes completed', async t => {
        const item = await writeQueueItem('pending')
        const stored = await waitForQueueItemStatus(item.id)

        t.equal(stored.status, 'completed', 'Then the queue item is marked completed')
        t.ok(stored.processedAt, 'Then processedAt timestamp is set')
    })

    t.end()
})
