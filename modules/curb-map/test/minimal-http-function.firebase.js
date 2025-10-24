import admin from 'firebase-admin'
import { test } from 'tap'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { Action, ActionRequest, FieldTypes } from '../src/types/index.js'
import { signInWithEmailLink, uniqueEmail, withAuthTestEnvironment } from './helpers/auth-emulator.js'
import {
    rawHttpRequest,
    submitActionRequest,
    submitAndExpectDuplicate,
    submitAndExpectSuccess,
    submitAndExpectValidationError,
} from './helpers/http-submit-action.js'

const withHttpAuth = (label, effect) =>
    withAuthTestEnvironment(async ({ namespace, projectId }) => {
        const { token, uid, userId: actorUserId } = await signInWithEmailLink(uniqueEmail(label))
        const completedActionsFacade = FirestoreAdminFacade(ActionRequest, `${namespace}/`)

        await completedActionsFacade.recursiveDelete()
        try {
            await effect({ namespace, projectId, token, uid, actorUserId, completedActionsFacade })
        } finally {
            await completedActionsFacade.recursiveDelete()
        }
    })

const buildOrgAction = overrides => {
    const organizationId = overrides?.organizationId || FieldTypes.newOrganizationId()
    const projectId = overrides?.projectId || FieldTypes.newProjectId()
    const name = overrides?.name || 'Test Org'
    return Action.OrganizationCreated.from({ organizationId, projectId, name })
}

test('Given submitActionRequest minimal HTTP flow', t => {
    t.test('When a valid action is submitted Then response is completed', async t => {
        await withHttpAuth('http-success', async ({ namespace, token }) => {
            const action = buildOrgAction()
            const result = await submitAndExpectSuccess({ action, namespace, token })

            t.equal(result.status, 'completed', 'Then status is completed')
            t.ok(result.processedAt, 'Then processedAt timestamp is present')
        })
        t.end()
    })

    t.test('When processed Then entry appears in completedActions with actor from token UID', async t => {
        await withHttpAuth(
            'http-completed-actions',
            async ({ namespace, token, actorUserId, completedActionsFacade }) => {
                const action = buildOrgAction()
                const idempotencyKey = FieldTypes.newIdempotencyKey()

                await submitAndExpectSuccess({ action, namespace, token, idempotencyKey })

                const results = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])
                const completed = results[0]

                t.ok(completed, 'Then completedActions entry exists')
                t.equal(completed.actorId, actorUserId, 'Then actorId equals custom claim userId')
                t.ok(completed.processedAt, 'Then processedAt stored as Date')
            },
        )
        t.end()
    })

    t.test('When processed Then server timestamps are used', async t => {
        await withHttpAuth('http-timestamps', async ({ namespace, token, completedActionsFacade }) => {
            const action = buildOrgAction()
            const idempotencyKey = FieldTypes.newIdempotencyKey()

            await submitAndExpectSuccess({ action, namespace, token, idempotencyKey })

            const [completed] = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])
            const diff = Math.abs(completed.processedAt.getTime() - completed.createdAt.getTime())
            t.ok(diff < 100, `Then createdAt and processedAt are nearly identical (${diff}ms)`)
        })
        t.end()
    })

    t.test('When duplicate submission occurs Then duplicate status returned', async t => {
        await withHttpAuth('http-duplicate', async ({ namespace, token }) => {
            const action = buildOrgAction()
            const idempotencyKey = FieldTypes.newIdempotencyKey()

            await submitAndExpectSuccess({ action, namespace, token, idempotencyKey })
            const duplicate = await submitAndExpectDuplicate({ action, namespace, token, idempotencyKey })

            t.equal(duplicate.status, 'duplicate', 'Then duplicate status is returned')
        })
        t.end()
    })

    t.test('When concurrent duplicates arrive Then one 200 and one 409', async t => {
        await withHttpAuth('http-concurrent', async ({ namespace, token, completedActionsFacade }) => {
            const action = buildOrgAction()
            const idempotencyKey = FieldTypes.newIdempotencyKey()

            const [first, second] = await Promise.all([
                submitActionRequest({ action, namespace, token, idempotencyKey }),
                submitActionRequest({ action, namespace, token, idempotencyKey }),
            ])

            const statuses = [first.status, second.status].sort()
            t.same(statuses, [200, 409], 'Then one succeeds and one is duplicate')

            const duplicates = [first, second].find(r => r.status === 409)
            t.equal(duplicates.data.status, 'duplicate', 'Then duplicate payload indicates duplicate')

            const results = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])
            t.equal(results.length, 1, 'Then exactly one completed action exists')
        })
        t.end()
    })

    t.test('When request lacks token Then HTTP 401 returned and no write occurs', async t => {
        await withHttpAuth('http-missing-token', async ({ namespace, completedActionsFacade }) => {
            const action = buildOrgAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                namespace,
            }

            const result = await rawHttpRequest({ body: payload })

            t.equal(result.status, 401, 'Then HTTP 401 returned')
            t.equal(result.data.status, 'unauthorized', 'Then payload marks unauthorized')

            const results = await completedActionsFacade.list()
            t.same(results, [], 'Then no completed actions were written')
        })
        t.end()
    })

    t.test('When token is malformed Then specific error message returned', async t => {
        await withHttpAuth('http-malformed-token', async ({ namespace }) => {
            const action = buildOrgAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                namespace,
            }

            // Send a completely malformed token (not even JWT format)
            const result = await rawHttpRequest({ body: payload, token: 'not-a-valid-jwt-token' })

            t.equal(result.status, 401, 'Then HTTP 401 returned')
            t.equal(result.data.status, 'unauthorized', 'Then payload marks unauthorized')
            t.match(
                result.data.error,
                /malformed|invalid/i,
                'Then error message indicates token is malformed or invalid',
            )
        })
        t.end()
    })

    t.test('When token has invalid signature Then specific error message returned', async t => {
        await withHttpAuth('http-invalid-signature', async ({ namespace }) => {
            const action = buildOrgAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                namespace,
            }

            // Create a JWT-like token with invalid signature
            // Format: header.payload.signature (all base64)
            const fakeHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64')
            const fakePayload = Buffer.from(
                JSON.stringify({ sub: 'fake-uid', userId: 'usr_fake', exp: Date.now() / 1000 + 3600 }),
            ).toString('base64')
            const fakeSignature = 'invalid-signature'
            const invalidToken = `${fakeHeader}.${fakePayload}.${fakeSignature}`

            const result = await rawHttpRequest({ body: payload, token: invalidToken })

            t.equal(result.status, 401, 'Then HTTP 401 returned')
            t.equal(result.data.status, 'unauthorized', 'Then payload marks unauthorized')
            t.match(
                result.data.error,
                /invalid|expired|malformed/i,
                'Then error message indicates token verification failed',
            )
        })
        t.end()
    })

    t.test('When token missing userId claim Then specific error message returned', async t => {
        await withAuthTestEnvironment(async ({ namespace }) => {
            const action = buildOrgAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                namespace,
            }

            // Create a valid Firebase Auth user but don't set userId claim
            const tempEmail = `no-claim-${Date.now()}@example.com`
            const authUser = await admin.auth().createUser({ email: tempEmail, password: 'Test123!' })

            // Create a custom token without userId claim
            const customToken = await admin.auth().createCustomToken(authUser.uid)

            // Exchange for ID token
            const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'
            const authUrl = `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-key`
            const signInResponse = await fetch(authUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: customToken, returnSecureToken: true }),
            })
            const { idToken } = await signInResponse.json()

            const result = await rawHttpRequest({ body: payload, token: idToken })

            t.equal(result.status, 401, 'Then HTTP 401 returned')
            t.equal(result.data.status, 'unauthorized', 'Then payload marks unauthorized')
            t.match(result.data.error, /missing userId claim/i, 'Then error message indicates missing userId claim')

            // Cleanup
            await admin.auth().deleteUser(authUser.uid)
        })
        t.end()
    })

    t.test('When required fields missing Then validation-failed returned', async t => {
        await withHttpAuth('http-missing-fields', async ({ namespace, token }) => {
            const result = await submitAndExpectValidationError({
                action: null,
                idempotencyKey: null,
                correlationId: null,
                namespace,
                token,
            })

            t.equal(result.status, 'validation-failed', 'Then validation-failed status returned')
        })
        t.end()
    })

    t.test('When action payload invalid Then validation error returned', async t => {
        await withHttpAuth('http-invalid-action', async ({ namespace, token }) => {
            const invalidAction = { '@@tagName': 'OrganizationCreated', name: 'Invalid' }
            const result = await submitAndExpectValidationError({ action: invalidAction, namespace, token })

            t.equal(result.status, 'validation-failed', 'Then invalid payload rejected')
        })
        t.end()
    })

    t.end()
})
