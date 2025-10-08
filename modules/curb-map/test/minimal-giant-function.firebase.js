import { test } from 'tap'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { Action, ActionRequest, FieldTypes, SystemFlags } from '../src/types/index.js'

const namespace = `tests/ns_${Date.now()}_${Math.random().toString(36).slice(2)}`
const adminFacade = FirestoreAdminFacade(ActionRequest, `${namespace}/`)
const flagsFacade = FirestoreAdminFacade(SystemFlags, `${namespace}/`)

const actionRequestId = FieldTypes.newActionRequestId()
const actorId = FieldTypes.newUserId()
const organizationId = FieldTypes.newOrganizationId()
const subjectId = FieldTypes.newUserId()

const defaultActionRequest = status =>
    ActionRequest.from({
        id: actionRequestId,
        eventId: FieldTypes.newEventId(),
        actorId,
        subjectId,
        subjectType: 'user',
        action: Action.UserAdded.from({ organizationId, user: { id: subjectId, email: 'action@example.com' } }),
        organizationId,
        projectId: undefined,
        idempotencyKey: FieldTypes.newIdempotencyKey(),
        status,
        resultData: undefined,
        error: undefined,
        correlationId: FieldTypes.newCorrelationId(),
        schemaVersion: 1,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        processedAt: undefined,
    })

const writeActionRequest = async status => {
    const item = defaultActionRequest(status)
    await adminFacade.write(item)
    return item
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const disableTriggers = async () => await flagsFacade.write(SystemFlags('flags', false))
const enableTriggers = async () => await flagsFacade.write(SystemFlags('flags', true))

const waitForActionRequestStatus = async (id, timeout = 5000) => {
    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
        const item = await adminFacade.read(id)
        if (item.status !== 'pending') return item

        await wait(200)
    }
    throw new Error(`Timeout waiting for action request ${id} to change status`)
}

test('Given the minimal giant function', t => {
    t.test('When triggers are disabled Then action requests remain untouched', async t => {
        await disableTriggers()
        const item = await writeActionRequest('pending')

        await wait(500)

        const stored = await adminFacade.read(item.id)
        t.equal(stored.status, 'pending', 'Then the action request retains pending status')
        await enableTriggers()
    })

    t.test('When a pending action request is processed Then its status becomes completed', async t => {
        const item = await writeActionRequest('pending')
        const stored = await waitForActionRequestStatus(item.id)

        t.equal(stored.status, 'completed', 'Then the action request is marked completed')
        t.ok(stored.processedAt, 'Then processedAt timestamp is set')
    })

    t.end()
})
