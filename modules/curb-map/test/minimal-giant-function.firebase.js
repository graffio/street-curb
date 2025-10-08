import { test } from 'tap'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { Action, ActionRequest, FieldTypes, SystemFlags } from '../src/types/index.js'

const namespace = `tests/ns_${Date.now()}_${Math.random().toString(36).slice(2)}`
const adminFacade = FirestoreAdminFacade(ActionRequest, `${namespace}/`)
const completedActionsFacade = FirestoreAdminFacade(ActionRequest, `${namespace}/`, undefined, 'completedActions')
const flagsFacade = FirestoreAdminFacade(SystemFlags, `${namespace}/`)

const actionRequestId = FieldTypes.newActionRequestId()
const actorId = FieldTypes.newUserId()
const organizationId = FieldTypes.newOrganizationId()
const subjectId = FieldTypes.newUserId()

const defaultActionRequest = status =>
    ActionRequest.from({
        id: actionRequestId,
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

    t.test('When a pending action request is processed Then it is copied to completedActions', async t => {
        const item = await writeActionRequest('pending')
        await waitForActionRequestStatus(item.id)

        await wait(500) // give time for completedActions write

        const completedAction = await completedActionsFacade.read(item.id)
        t.equal(completedAction.id, item.id, 'Then the completed action has the same ID')
        t.equal(completedAction.status, 'completed', 'Then the completed action has completed status')
        t.equal(completedAction.idempotencyKey, item.idempotencyKey, 'Then the idempotency key is preserved')
        t.ok(completedAction.processedAt, 'Then processedAt is set in completedActions')
    })

    t.test('When a duplicate idempotency key is submitted Then it is marked as duplicate', async t => {
        const item = await writeActionRequest('pending')
        await waitForActionRequestStatus(item.id)

        await wait(500) // ensure completedActions write completes

        // submit a second action request with the same idempotency key but different ID
        const duplicateId = FieldTypes.newActionRequestId()
        const duplicate = ActionRequest.from({ ...item, id: duplicateId })
        await adminFacade.write(duplicate)

        const duplicateStored = await waitForActionRequestStatus(duplicateId)

        t.equal(duplicateStored.status, 'completed', 'Then the duplicate request is marked completed')
        t.ok(duplicateStored.processedAt, 'Then the duplicate request has processedAt timestamp')
        t.ok(duplicateStored.resultData, 'Then the duplicate request has resultData')
        t.equal(
            duplicateStored.resultData.duplicateOf,
            item.id,
            'Then resultData references the original action request',
        )

        // verify only one entry in completedActions (duplicates are not copied)
        const allCompleted = await completedActionsFacade.list()
        const matchingIdempotencyKey = allCompleted.filter(ca => ca.idempotencyKey === item.idempotencyKey)
        t.equal(matchingIdempotencyKey.length, 1, 'Then only one completedAction exists for this idempotency key')
        t.equal(matchingIdempotencyKey[0].id, item.id, 'Then the original action request is in completedActions')
    })

    t.end()
})
