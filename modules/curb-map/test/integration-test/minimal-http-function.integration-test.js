import admin from 'firebase-admin'
import { test } from 'tap'
import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { Action, ActionRequest, FieldTypes } from '../../src/types/index.js'
import { asSignedInUser } from '../integration-test-helpers/auth-emulator.js'
import {
    rawHttpRequest,
    submitActionRequest,
    submitAndExpectDuplicate,
    submitAndExpectSuccess,
    submitAndExpectValidationError,
} from '../integration-test-helpers/http-submit-action.js'

const withHttpAuth = (label, effect) =>
    asSignedInUser(label, async ({ namespace, token, actorUserId }) => {
        const completedActionsFacade = FirestoreAdminFacade(ActionRequest, `${namespace}/`)

        await completedActionsFacade.recursiveDelete()
        try {
            await effect({ namespace, token, actorUserId, completedActionsFacade })
        } finally {
            await completedActionsFacade.recursiveDelete()
        }
    })

const buildOrganizationCreatedAction = overrides => {
    const organizationId = overrides?.organizationId || FieldTypes.newOrganizationId()
    const projectId = overrides?.projectId || FieldTypes.newProjectId()
    const name = overrides?.name || 'Test Org'
    const action = Action.OrganizationCreated.from({ projectId, name })
    return { action, organizationId, projectId }
}

test('Given submitActionRequest minimal HTTP flow', t => {
    t.test('When a valid action is submitted Then response is success', async t => {
        await withHttpAuth('http-success', async ({ namespace, token }) => {
            const { action, organizationId, projectId } = buildOrganizationCreatedAction()
            const result = await submitAndExpectSuccess({ action, namespace, token, organizationId, projectId })

            t.same(result, { status: 'completed' }, 'Then response is Success')
        })
        t.end()
    })

    t.test('When processed Then entry appears in completedActions with actor from token UID', async t => {
        await withHttpAuth(
            'http-completed-actions',
            async ({ namespace, token, actorUserId, completedActionsFacade }) => {
                const { action, organizationId, projectId } = buildOrganizationCreatedAction()
                const idempotencyKey = FieldTypes.newIdempotencyKey()

                await submitAndExpectSuccess({ action, namespace, token, idempotencyKey, organizationId, projectId })

                const results = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])
                const completed = results[0]

                t.ok(completed, 'Then completedActions entry exists')
                t.equal(completed.actorId, actorUserId, 'Then actorId equals userId')
                t.ok(completed.processedAt, 'Then processedAt stored as Date')
            },
        )
        t.end()
    })

    t.test('When processed Then server timestamps are used', async t => {
        await withHttpAuth('http-timestamps', async ({ namespace, token, completedActionsFacade }) => {
            const { action, organizationId, projectId } = buildOrganizationCreatedAction()
            const idempotencyKey = FieldTypes.newIdempotencyKey()

            await submitAndExpectSuccess({ action, namespace, token, idempotencyKey, organizationId, projectId })

            const [completed] = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])
            const diff = Math.abs(completed.processedAt.getTime() - completed.createdAt.getTime())
            t.ok(diff < 100, `Then createdAt and processedAt are nearly identical (${diff}ms)`)
        })
        t.end()
    })

    t.test('When duplicate submission occurs Then duplicate message returned', async t => {
        await withHttpAuth('http-duplicate', async ({ namespace, token }) => {
            const { action, organizationId, projectId } = buildOrganizationCreatedAction()
            const idempotencyKey = FieldTypes.newIdempotencyKey()

            await submitAndExpectSuccess({ action, namespace, token, idempotencyKey, organizationId, projectId })
            const duplicate = await submitAndExpectDuplicate({
                action,
                namespace,
                token,
                idempotencyKey,
                organizationId,
                projectId,
            })

            t.match(duplicate, /Already processed/i, 'Then duplicate message is returned')
        })
        t.end()
    })

    t.test('When concurrent duplicates arrive Then one 200 and one 409', async t => {
        await withHttpAuth('http-concurrent', async ({ namespace, token, completedActionsFacade }) => {
            const { action, organizationId, projectId } = buildOrganizationCreatedAction()
            const idempotencyKey = FieldTypes.newIdempotencyKey()

            const [first, second] = await Promise.all([
                submitActionRequest({ action, namespace, token, idempotencyKey, organizationId, projectId }),
                submitActionRequest({ action, namespace, token, idempotencyKey, organizationId, projectId }),
            ])

            const statuses = [first.status, second.status].sort()
            t.same(statuses, [200, 409], 'Then one succeeds and one is duplicate')

            const duplicates = [first, second].find(r => r.status === 409)
            t.match(duplicates.data, /Already processed/i, 'Then duplicate message indicates duplicate')

            const results = await completedActionsFacade.query([['idempotencyKey', '==', idempotencyKey]])
            t.equal(results.length, 1, 'Then exactly one completed action exists')
        })
        t.end()
    })

    t.test('When request lacks token Then HTTP 401 returned and no write occurs', async t => {
        await withHttpAuth('http-missing-token', async ({ namespace, completedActionsFacade }) => {
            const { action } = buildOrganizationCreatedAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                namespace,
            }

            const result = await rawHttpRequest({ body: payload })

            t.equal(result.status, 401, 'Then HTTP 401 returned')
            t.match(
                result.data,
                /Missing or invalid Authorization header/i,
                'Then error message indicates unauthorized',
            )

            const results = await completedActionsFacade.list()
            t.same(results, [], 'Then no completed actions were written')
        })
        t.end()
    })

    t.test('When token is malformed Then specific error message returned', async t => {
        await withHttpAuth('http-malformed-token', async ({ namespace }) => {
            const { action } = buildOrganizationCreatedAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                namespace,
            }

            // Send a completely malformed token (not even JWT format)
            const result = await rawHttpRequest({ body: payload, token: 'not-a-valid-jwt-token' })

            t.equal(result.status, 401, 'Then HTTP 401 returned')
            t.match(result.data, /malformed|invalid/i, 'Then error message indicates token is malformed or invalid')
        })
        t.end()
    })

    t.test('When token has invalid signature Then specific error message returned', async t => {
        await withHttpAuth('http-invalid-signature', async ({ namespace }) => {
            const { action } = buildOrganizationCreatedAction()
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
            t.match(result.data, /invalid|expired|malformed/i, 'Then error message indicates token verification failed')
        })
        t.end()
    })

    t.test('When user document does not exist Then specific error message returned', async t => {
        await asSignedInUser('missing-user-doc', async ({ namespace }) => {
            const { action, organizationId, projectId } = buildOrganizationCreatedAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                organizationId,
                projectId,
                namespace,
            }

            // Create a valid Firebase Auth user but don't create Firestore user document
            const tempEmail = `no-doc-${Date.now()}@example.com`
            const userId = FieldTypes.newUserId()
            await admin.auth().createUser({ uid: userId, email: tempEmail, password: 'Test123!' })

            // Create a custom token
            const customToken = await admin.auth().createCustomToken(userId)

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

            t.equal(result.status, 500, 'Then HTTP 500 returned')
            t.match(result.data, /User not found/i, 'Then error message indicates user not found')

            // Cleanup
            await admin.auth().deleteUser(userId)
        })
        t.end()
    })

    t.test('When required fields missing Then validation error returned', async t => {
        await withHttpAuth('http-missing-fields', async ({ namespace, token }) => {
            const result = await submitAndExpectValidationError({
                action: null,
                idempotencyKey: null,
                correlationId: null,
                namespace,
                token,
            })

            t.match(result, /required|missing/i, 'Then validation error message returned')
        })
        t.end()
    })

    t.test('When action payload invalid Then validation error returned', async t => {
        await withHttpAuth('http-invalid-action', async ({ namespace, token }) => {
            const invalidAction = { '@@tagName': 'OrganizationCreated', name: 'Invalid' }
            const result = await submitAndExpectValidationError({ action: invalidAction, namespace, token })

            t.match(result, /expected.*projectId|projectId.*expected/i, 'Then invalid payload rejected')
        })
        t.end()
    })

    t.test('When token contains invalid uid Then HTTP 401 returned', async t => {
        await withHttpAuth('http-invalid-uid', async ({ namespace }) => {
            const { action, organizationId, projectId } = buildOrganizationCreatedAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                organizationId,
                projectId,
                namespace,
            }

            // Create a token with an invalid uid format (not matching userId pattern)
            const invalidUid = 'not-a-valid-user-id'
            const customToken = await admin.auth().createCustomToken(invalidUid)
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
            t.match(result.data, /Malformed uid.*not a valid userId/i, 'Then error indicates malformed uid')
        })
        t.end()
    })

    t.test('When Bearer header has extra spaces Then token parsed correctly', async t => {
        await withHttpAuth('http-bearer-spaces', async ({ namespace, token }) => {
            const { action, organizationId, projectId } = buildOrganizationCreatedAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                organizationId,
                projectId,
                namespace,
            }

            // Add extra spaces in Bearer header
            const result = await rawHttpRequest({ body: payload, token: `  ${token}  ` })

            t.equal(result.status, 200, 'Then HTTP 200 returned')
            t.same(result.data, { status: 'completed' }, 'Then response is Success')
        })
        t.end()
    })

    t.test('When authorization header is lowercase Then still works', async t => {
        await withHttpAuth('http-lowercase-auth', async ({ namespace, token }) => {
            const { action, organizationId, projectId } = buildOrganizationCreatedAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                organizationId,
                projectId,
                namespace,
            }

            // HTTP headers are case-insensitive per RFC 7230
            const url = `${process.env.FUNCTIONS_EMULATOR_ORIGIN || 'http://127.0.0.1:5001'}/${process.env.GCLOUD_PROJECT}/us-central1/submitActionRequest`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${token}`, // lowercase - should work
                },
                body: JSON.stringify(payload),
            })

            const text = await response.text()
            const data = text.startsWith('{') ? JSON.parse(text) : text

            t.equal(response.status, 200, 'Then HTTP 200 returned')
            t.same(data, { status: 'completed' }, 'Then response is Success')
        })
        t.end()
    })

    t.test('When token has invalid format Then specific error returned', async t => {
        await withHttpAuth('http-invalid-format', async ({ namespace }) => {
            const { action } = buildOrganizationCreatedAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                namespace,
            }

            // Use a token with only 2 parts instead of 3
            const invalidToken = 'header.payload'

            const result = await rawHttpRequest({ body: payload, token: invalidToken })

            t.equal(result.status, 401, 'Then HTTP 401 returned')
            t.match(result.data, /malformed|invalid/i, 'Then error indicates malformed token')
        })
        t.end()
    })

    t.test('When bearer scheme is missing Then rejected', async t => {
        await withHttpAuth('http-no-bearer', async ({ namespace, token }) => {
            const { action } = buildOrganizationCreatedAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                namespace,
            }

            // Send token without 'Bearer ' prefix
            const url = `${process.env.FUNCTIONS_EMULATOR_ORIGIN || 'http://127.0.0.1:5001'}/${process.env.GCLOUD_PROJECT}/us-central1/submitActionRequest`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token, // No 'Bearer ' prefix
                },
                body: JSON.stringify(payload),
            })

            const text = await response.text()
            const data = text.startsWith('{') ? JSON.parse(text) : text

            t.equal(response.status, 401, 'Then HTTP 401 returned')
            t.match(data, /Missing or invalid Authorization header/i, 'Then error indicates invalid header')
        })
        t.end()
    })

    t.test('When authorization header is empty string Then rejected', async t => {
        await withHttpAuth('http-empty-auth', async ({ namespace }) => {
            const { action } = buildOrganizationCreatedAction()
            const payload = {
                action: Action.toFirestore(action),
                idempotencyKey: FieldTypes.newIdempotencyKey(),
                correlationId: FieldTypes.newCorrelationId(),
                namespace,
            }

            const url = `${process.env.FUNCTIONS_EMULATOR_ORIGIN || 'http://127.0.0.1:5001'}/${process.env.GCLOUD_PROJECT}/us-central1/submitActionRequest`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: '', // Empty string
                },
                body: JSON.stringify(payload),
            })

            const text = await response.text()
            const data = text.startsWith('{') ? JSON.parse(text) : text

            t.equal(response.status, 401, 'Then HTTP 401 returned')
            t.match(data, /Missing or invalid Authorization header/i, 'Then error indicates missing header')
        })
        t.end()
    })

    t.end()
})
