import { test } from 'tap'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { Action, ActionRequest, FieldTypes } from '../src/types/index.js'
import {
    rawHttpRequest,
    submitActionRequest,
    submitAndExpectDuplicate,
    submitAndExpectSuccess,
} from './helpers/http-submit-action.js'

const namespace = `tests/${new Date().toISOString().replace(/[:.]/g, '-')}`

// Set up environment for Firestore emulator
if (!process.env.GCLOUD_PROJECT) throw new Error('GCLOUD_PROJECT environment variable must be set for tests')

if (!process.env.FIRESTORE_EMULATOR_HOST)
    throw new Error('FIRESTORE_EMULATOR_HOST environment variable must be set for tests')

const completedActionsFacade = FirestoreAdminFacade(ActionRequest, `${namespace}/`, undefined, 'completedActions')

test('Given the HTTP action submission endpoint', t => {
    t.test('When a valid action request is submitted Then status is completed', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })

        console.log(`Test organizationId: ${organizationId}`)
        const result = await submitAndExpectSuccess({ action, namespace })

        t.equal(result.status, 'completed', 'Then the action request is marked completed')
        t.match(result.processedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Then processedAt is a valid ISO timestamp')
        t.notOk(result.id, 'Then action request ID is not exposed to client')
    })

    t.test('When an action request is processed Then it is written to completedActions', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })
        const idempotencyKey = FieldTypes.newIdempotencyKey()

        console.log(`Test organizationId: ${organizationId}`)
        await submitAndExpectSuccess({ action, namespace, idempotencyKey })

        // Find the completed action by idempotency key
        const results = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])
        const completedAction = results[0]

        t.ok(completedAction, 'Then a completed action exists with the idempotency key')
        t.equal(completedAction.idempotencyKey, idempotencyKey, 'Then the idempotency key is preserved')
        t.type(completedAction.processedAt, 'object', 'Then processedAt is set as a Date object in completedActions')
        t.ok(completedAction.processedAt.getTime(), 'Then processedAt is a valid Date')
    })

    t.test('When an action is processed Then timestamps are server-authoritative', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })
        const idempotencyKey = FieldTypes.newIdempotencyKey()

        console.log(`Test organizationId: ${organizationId}`)
        await submitAndExpectSuccess({ action, namespace, idempotencyKey })

        // Read from Firestore to check actual timestamps
        const results = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])
        const completedAction = results[0]

        // Verify timestamps are Firestore Timestamp objects (converted to Date by facade)
        t.type(completedAction.createdAt, 'object', 'Then createdAt is a Date object')
        t.type(completedAction.processedAt, 'object', 'Then processedAt is a Date object')
        t.ok(completedAction.createdAt.getTime(), 'Then createdAt has valid timestamp')
        t.ok(completedAction.processedAt.getTime(), 'Then processedAt has valid timestamp')

        // Verify single write: createdAt ≈ processedAt (within 100ms)
        const timeDiff = Math.abs(completedAction.processedAt.getTime() - completedAction.createdAt.getTime())
        t.ok(timeDiff < 100, `Then createdAt ≈ processedAt (diff: ${timeDiff}ms < 100ms)`)
    })

    t.test('When an action is processed Then completedActions is immutable (no pending status)', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })
        const idempotencyKey = FieldTypes.newIdempotencyKey()

        console.log(`Test organizationId: ${organizationId}`)
        await submitAndExpectSuccess({ action, namespace, idempotencyKey })

        // Query all records for this idempotency key
        const results = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])

        t.equal(results.length, 1, 'Then exactly one record exists')
        t.ok(results[0].processedAt, 'Then processedAt is present immediately')

        // Verify record doesn't change over time
        const initialProcessedAt = results[0].processedAt.toISOString()
        await new Promise(resolve => setTimeout(resolve, 100))

        const resultsAfter = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])
        t.equal(resultsAfter.length, 1, 'Then still exactly one record exists')
        t.equal(resultsAfter[0].processedAt.toISOString(), initialProcessedAt, 'Then processedAt never changes')
    })

    t.test('When a duplicate idempotency key is submitted Then it returns HTTP 409 duplicate', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })
        const idempotencyKey = FieldTypes.newIdempotencyKey()

        console.log(`Test organizationId: ${organizationId}`)
        // Submit first request
        // Submit duplicate with same idempotency key
        const result1 = await submitAndExpectSuccess({ action, namespace, idempotencyKey })
        const result2 = await submitAndExpectDuplicate({ action, namespace, idempotencyKey })

        t.equal(result2.status, 'duplicate', 'Then the response status is duplicate')
        t.equal(result2.message, 'Already processed', 'Then message indicates already processed')
        t.ok(result2.processedAt, 'Then processedAt timestamp is returned')
        t.notOk(result2.duplicate, 'Then old duplicate:true flag is not present')
        t.notOk(result2.id, 'Then action request ID is not exposed to client')
        t.notOk(result2.duplicateOf, 'Then internal action request ID is not exposed')

        // Verify both responses have same processedAt (same record)
        t.equal(result2.processedAt, result1.processedAt, 'Then duplicate returns same processedAt as original')

        // Verify only one entry in completedActions
        const matchingResults = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])
        t.equal(matchingResults.length, 1, 'Then only one completedAction exists for this idempotency key')
        t.equal(
            matchingResults[0].idempotencyKey,
            idempotencyKey,
            'Then the original action request is in completedActions',
        )
    })

    t.test(
        'When two requests with the same idempotency key are sent concurrently Then one succeeds and one returns 409',
        async t => {
            const organizationId = FieldTypes.newOrganizationId()
            const projectId = FieldTypes.newProjectId()
            const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })
            const idempotencyKey = FieldTypes.newIdempotencyKey()

            console.log(`Test organizationId: ${organizationId}`)
            // Fire two requests in parallel with same idempotency key
            const [result1, result2] = await Promise.all([
                submitActionRequest({ action, namespace, idempotencyKey }),
                submitActionRequest({ action, namespace, idempotencyKey }),
            ])

            // One should succeed (200), one should be duplicate (409)
            const statuses = [result1.status, result2.status].sort()
            t.same(statuses, [200, 409], 'Then one request returns 200 and one returns 409')

            const successResults = [result1, result2].filter(r => r.status === 200)
            const duplicateResults = [result1, result2].filter(r => r.status === 409)

            t.equal(successResults.length, 1, 'Then exactly one request succeeds')
            t.equal(duplicateResults.length, 1, 'Then exactly one request is duplicate')
            t.equal(duplicateResults[0].data.status, 'duplicate', 'Then duplicate has status: duplicate')

            // Verify only ONE completedAction exists
            const results = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])
            t.equal(results.length, 1, 'Then only one completedAction exists')
            t.equal(results[0].status, 'completed', 'Then the completedAction has completed status')
        },
    )

    t.test('When required fields are missing Then validation error is returned', async t => {
        // Submit with only an ID, missing action, idempotencyKey, correlationId
        const { status, data } = await submitActionRequest({
            action: null,
            idempotencyKey: null,
            correlationId: null,
            namespace,
        })

        t.equal(status, 400, 'Then HTTP 400 is returned')
        t.equal(data.status, 'validation-failed', 'Then status is validation-failed')
        t.match(data.error, /required fields/, 'Then error mentions required fields')
    })

    t.test('When action.organizationId is missing Then validation error is returned', async t => {
        const action = { '@@tagName': 'OrganizationCreated', name: 'Test' } // missing organizationId

        console.log(`Test: no organizationId (validation test)`)
        const { status, data } = await submitActionRequest({ action, namespace })

        t.equal(status, 400, 'Then HTTP 400 is returned')
        t.equal(data.status, 'validation-failed', 'Then status is validation-failed')
        t.match(data.error, /organizationId|required/i, 'Then error mentions missing organizationId')
    })

    t.test('When correlationId is missing Then validation error is returned', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })

        const { status, data } = await submitActionRequest({
            action,
            idempotencyKey: FieldTypes.newIdempotencyKey(),
            correlationId: null, // explicitly missing
            namespace,
        })

        t.equal(status, 400, 'Then HTTP 400 is returned')
        t.equal(data.status, 'validation-failed', 'Then status is validation-failed')
        t.match(data.error, /required fields/, 'Then error mentions required fields')
    })

    t.test('When correlationId has invalid format Then validation error is returned', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })

        const { status, data } = await submitActionRequest({
            action,
            idempotencyKey: FieldTypes.newIdempotencyKey(),
            correlationId: 'invalid-format', // should start with cor_
            namespace,
        })

        t.equal(status, 400, 'Then HTTP 400 is returned')
        t.equal(data.status, 'validation-failed', 'Then status is validation-failed')
        t.match(data.error, /correlationId|cor_/i, 'Then error mentions correlationId format issue')
    })

    t.test('When idempotencyKey has invalid format Then validation error is returned', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })

        const { status, data } = await submitActionRequest({
            action,
            idempotencyKey: 'bad-key', // should start with idm_
            correlationId: FieldTypes.newCorrelationId(),
            namespace,
        })

        t.equal(status, 400, 'Then HTTP 400 is returned')
        t.equal(data.status, 'validation-failed', 'Then status is validation-failed')
        t.match(data.error, /idempotencyKey|idm_/i, 'Then error mentions idempotencyKey format issue')
    })

    t.test('When HTTP method is GET Then method not allowed is returned', async t => {
        const { status, data } = await rawHttpRequest({ method: 'GET' })

        t.equal(status, 405, 'Then HTTP 405 is returned')
        t.equal(data.status, 'method-not-allowed', 'Then status is method-not-allowed')
        t.match(data.error, /POST/, 'Then error mentions POST method')
    })

    t.test('When action is null Then validation error is returned', async t => {
        const { status, data } = await submitActionRequest({
            action: null,
            idempotencyKey: FieldTypes.newIdempotencyKey(),
            correlationId: FieldTypes.newCorrelationId(),
            namespace,
        })

        t.equal(status, 400, 'Then HTTP 400 is returned')
        t.equal(data.status, 'validation-failed', 'Then status is validation-failed')
        t.match(data.error, /required fields/, 'Then error mentions required fields')
    })

    t.test('When idempotencyKey is empty string Then validation error is returned', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })

        const { status, data } = await submitActionRequest({
            action,
            idempotencyKey: '',
            correlationId: FieldTypes.newCorrelationId(),
            namespace,
        })

        t.equal(status, 400, 'Then HTTP 400 is returned')
        t.equal(data.status, 'validation-failed', 'Then status is validation-failed')
        t.match(data.error, /idempotencyKey|empty|required/i, 'Then error mentions idempotencyKey validation issue')
    })

    t.test('When action has malformed JSON Then validation error is returned', async t => {
        const { status, data } = await submitActionRequest({
            action: { '@@tagName': 'InvalidActionType', foo: 'bar' },
            idempotencyKey: FieldTypes.newIdempotencyKey(),
            correlationId: FieldTypes.newCorrelationId(),
            namespace,
        })

        t.equal(status, 400, 'Then HTTP 400 is returned')
        t.equal(data.status, 'validation-failed', 'Then status is validation-failed')
        t.match(data.error, /action|InvalidActionType|invalid/i, 'Then error mentions invalid action type')
    })

    t.test('When namespace is missing in emulator Then validation error is returned', async t => {
        const organizationId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const action = Action.OrganizationCreated.from({ organizationId, projectId, name: 'Test Org' })

        const { status, data } = await submitActionRequest({
            action,
            idempotencyKey: FieldTypes.newIdempotencyKey(),
            correlationId: FieldTypes.newCorrelationId(),
            namespace: undefined,
        })

        t.equal(status, 400, 'Then HTTP 400 is returned')
        t.equal(data.status, 'validation-failed', 'Then status is validation-failed')
        t.match(data.error, /namespace/i, 'Then error mentions namespace requirement')
        t.equal(data.field, 'namespace', 'Then field is set to namespace')
    })

    t.test(
        'When UserUpdated action without organizationId is submitted Then it succeeds',
        async t => {
            const userId = FieldTypes.newUserId()
            const action = Action.UserUpdated.from({
                userId,
                email: 'updated@example.com',
                displayName: 'Updated Name',
            })

            console.log(`Test userId: ${userId}`)
            const result = await submitAndExpectSuccess({ action, namespace })

            t.equal(result.status, 'completed', 'Then the action request is completed')
            t.match(
                result.processedAt,
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
                'Then processedAt is a valid ISO timestamp',
            )
            t.notOk(result.id, 'Then action request ID is not exposed to client')
        },
        { skip: true },
    )

    t.end()
})
