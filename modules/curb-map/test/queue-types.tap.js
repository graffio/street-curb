import admin from 'firebase-admin'
import { test } from 'tap'
import { Action, FieldTypes, QueueItem } from '../src/types/index.js'

/**
 * {@link module:QueueItem}
 */

// Initialize Firebase Admin for testing (using a test project)
if (!admin.apps || admin.apps.length === 0) admin.initializeApp({ projectId: 'test-project' })

const idempotencyKey = FieldTypes.newIdempotencyKey()
const organizationId = FieldTypes.newOrganizationId()
const queueItemId = FieldTypes.newQueueItemId()
const actorId = FieldTypes.newUserId()
const actorId1 = FieldTypes.newUserId()

test('Given an Action.UserAdded is created', t => {
    t.test('When the UserAdded contains user data', t => {
        const userAdded = Action.UserAdded.from({ organizationId, user: { id: actorId, email: 'john@example.com' } })

        t.ok(Action.UserAdded.is(userAdded), 'Then the action is identified as a UserAdded event')
        t.equal(userAdded.organizationId, organizationId, 'Then the organization ID is preserved')
        t.same(userAdded.user, { id: actorId, email: 'john@example.com' }, 'Then the user payload is preserved')
        t.end()
    })

    t.test('When the UserAdded event is converted to Firestore format', t => {
        const userAdded = Action.UserAdded.from({ organizationId, user: { id: actorId, email: 'john@example.com' } })

        const firestoreData = Action.toFirestore(userAdded)
        t.ok(typeof firestoreData === 'string', 'Then a JSON string is returned')
        t.end()
    })

    t.test('When the UserAdded event is converted to Firestore and back', t => {
        const userAdded = Action.UserAdded.from({ organizationId, user: { id: actorId, email: 'john@example.com' } })

        const firestoreData = Action.toFirestore(userAdded)
        const parsedAction = Action.fromFirestore(JSON.parse(firestoreData))

        t.ok(Action.UserAdded.is(parsedAction), 'Then the UserAdded event is recreated correctly')
        t.equal(
            parsedAction.organizationId,
            organizationId,
            'Then the organization ID is preserved through the round-trip',
        )
        t.end()
    })
    t.end()
})

test('Given a QueueItem is created with pending status', t => {
    t.test('When the QueueItem contains all required fields', t => {
        const userAdded = Action.UserAdded.from({ organizationId, user: { id: actorId1, email: 'john@example.com' } })

        const createdAt = admin.firestore.FieldValue.serverTimestamp()

        const queueItem = QueueItem.from({
            id: queueItemId,
            action: userAdded,
            idempotencyKey,
            actorId: actorId1,
            createdAt,
            status: 'pending',
        })

        t.equal(queueItem.id, queueItemId, 'Then the queue ID is preserved')
        t.ok(Action.UserAdded.is(queueItem.action), 'Then the action is preserved')
        t.equal(queueItem.idempotencyKey, idempotencyKey, 'Then the idempotency key is preserved')
        t.equal(queueItem.actorId, actorId1, 'Then the user ID is preserved')
        t.equal(queueItem.createdAt, createdAt, 'Then the server createdAt is preserved')
        t.equal(queueItem.status, 'pending', 'Then the status is preserved')
        t.equal(queueItem.resultData, undefined, 'Then the result data is undefined by default')
        t.equal(queueItem.error, undefined, 'Then the error is undefined by default')
        t.equal(queueItem.processedAt, undefined, 'Then the processed createdAt is undefined by default')
        t.end()
    })

    t.test('When an invalid status is provided', t => {
        const userAdded = Action.UserAdded.from({ organizationId, user: { id: actorId1, email: 'john@example.com' } })

        const createdAt = admin.firestore.FieldValue.serverTimestamp()

        const validQueueItem = QueueItem.from({
            id: queueItemId,
            action: userAdded,
            idempotencyKey,
            actorId: actorId1,
            createdAt,
            status: 'pending',
        })

        t.throws(() => {
            QueueItem.from({ ...validQueueItem, status: 'invalid_status' })
        }, 'Then an error is thrown')
        t.end()
    })

    t.test('When the QueueItem is converted to Firestore format', t => {
        const userAdded = Action.UserAdded.from({ organizationId, user: { id: actorId1, email: 'john@example.com' } })

        const createdAt = admin.firestore.FieldValue.serverTimestamp()

        const queueItem = QueueItem.from({
            id: queueItemId,
            action: userAdded,
            idempotencyKey,
            actorId: actorId1,
            createdAt,
            status: 'pending',
        })

        const firestoreData = QueueItem.toFirestore(queueItem)
        t.ok(firestoreData.id, 'Then the queue ID is preserved')
        t.ok(firestoreData.action, 'Then the action is preserved')
        t.ok(firestoreData.createdAt, 'Then the createdAt is preserved')
        t.equal(firestoreData.status, 'pending', 'Then the status is preserved')
        t.end()
    })

    t.test('When the QueueItem is converted to Firestore and back', t => {
        const userAdded = Action.UserAdded.from({ organizationId, user: { id: actorId1, email: 'john@example.com' } })

        const createdAt = admin.firestore.FieldValue.serverTimestamp()

        const queueItem = QueueItem.from({
            id: queueItemId,
            action: userAdded,
            idempotencyKey,
            actorId: actorId1,
            createdAt,
            status: 'pending',
        })

        const firestoreData = QueueItem.toFirestore(queueItem)
        const parsedItem = QueueItem.fromFirestore(firestoreData)

        t.equal(parsedItem.id, queueItemId, 'Then the queue ID is recreated correctly')
        t.ok(Action.UserAdded.is(parsedItem.action), 'Then the action is recreated correctly')
        t.equal(parsedItem.status, 'pending', 'Then the status is recreated correctly')
        t.end()
    })
    t.end()
})

test('Given a QueueItem is created with completed status', t => {
    t.test('When the QueueItem includes optional result data', t => {
        const userAdded = Action.UserAdded.from({ organizationId, user: { id: actorId, email: 'john@example.com' } })

        const createdAt = admin.firestore.FieldValue.serverTimestamp()
        const processedAt = admin.firestore.FieldValue.serverTimestamp()

        const queueItem = QueueItem.from({
            id: queueItemId,
            action: userAdded,
            idempotencyKey,
            actorId,
            createdAt,
            status: 'completed',
            resultData: { eventId: 'evt_xyz789' },
            error: null,
            processedAt,
        })

        t.equal(queueItem.status, 'completed', 'Then the status is completed')
        t.same(queueItem.resultData, { eventId: 'evt_xyz789' }, 'Then the result data is preserved')
        t.equal(queueItem.error, undefined, 'Then the error is undefined')
        t.equal(queueItem.processedAt, processedAt, 'Then the processed createdAt is preserved')
        t.end()
    })

    t.test('When the QueueItem is created with failed status and error message', t => {
        const user = { firstName: 'John', lastName: 'Doe' }
        const userAdded = Action.UserAdded.from({ organizationId, user })

        const createdAt = admin.firestore.FieldValue.serverTimestamp()
        const processedAt = admin.firestore.FieldValue.serverTimestamp()

        const queueItem = QueueItem.from({
            id: queueItemId,
            action: userAdded,
            idempotencyKey,
            actorId,
            createdAt,
            status: 'completed',
            resultData: { eventId: 'evt_xyz789' },
            error: null,
            processedAt,
        })

        const failedItem = QueueItem.from({
            ...queueItem,
            status: 'failed',
            resultData: null,
            error: 'Validation failed: invalid email format',
        })

        t.equal(failedItem.status, 'failed', 'Then the status is failed')
        t.equal(failedItem.resultData, undefined, 'Then the result data is undefined')
        t.equal(failedItem.error, 'Validation failed: invalid email format', 'Then the error message is preserved')
        t.end()
    })
    t.end()
})
