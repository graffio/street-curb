import admin from 'firebase-admin'
import { deleteApp, getApps } from 'firebase/app'
import { test } from 'tap'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { FirestoreClientFacade } from '../src/firestore-facade/firestore-client-facade.js'
import { Action, ActionRequest, FieldTypes } from '../src/types/index.js'

const envKeys = [
    'GCLOUD_PROJECT',
    'GOOGLE_CLOUD_PROJECT',
    'FIRESTORE_EMULATOR_HOST',
    'FIREBASE_AUTH_EMULATOR_HOST',
    'FIREBASE_TEST_MODE',
]

const defaultProjectId = 'local-curb-map-tests'
const defaultFirestoreHost = '127.0.0.1:8080'
const defaultAuthHost = '127.0.0.1:9099'

// @sig captureEnv :: [String] -> Object
const captureEnv = keys => keys.reduce((snapshot, key) => ({ ...snapshot, [key]: process.env[key] }), {})

// @sig restoreEnv :: Object -> Void
const restoreEnv = snapshot =>
    Object.entries(snapshot).forEach(([key, value]) => {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
    })

// @sig buildActionRequest :: Object -> ActionRequest
const buildActionRequest = overrides => {
    const organizationId = overrides?.organizationId || FieldTypes.newOrganizationId()
    const subjectId = overrides?.subjectId || FieldTypes.newUserId()

    return ActionRequest.from({
        id: overrides?.id || FieldTypes.newActionRequestId(),
        actorId: overrides?.actorId || FieldTypes.newUserId(),
        subjectId,
        subjectType: overrides?.subjectType || 'user',
        action:
            overrides?.action ||
            Action.UserAdded.from({ organizationId, user: { id: subjectId, email: 'action@example.com' } }),
        organizationId,
        projectId: overrides?.projectId,
        idempotencyKey: overrides?.idempotencyKey || FieldTypes.newIdempotencyKey(),
        status: overrides?.status || 'pending',
        resultData: overrides?.resultData,
        error: overrides?.error,
        correlationId: overrides?.correlationId || FieldTypes.newCorrelationId(),
        schemaVersion: overrides?.schemaVersion || 1,
        createdAt: overrides?.createdAt || new Date('2025-01-01T00:00:00Z'),
        processedAt: overrides?.processedAt,
    })
}

// @sig withFacades :: (Context -> Promise Any) -> Promise Void
const withFacades = async effect => {
    const namespace = `tests/ns_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const snapshot = captureEnv(envKeys)

    const configuration = {
        GCLOUD_PROJECT: process.env.GCLOUD_PROJECT || defaultProjectId,
        GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT || defaultProjectId,
        FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST || defaultFirestoreHost,
        FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST || defaultAuthHost,
        FIREBASE_TEST_MODE: '1',
    }

    restoreEnv(configuration)

    const adminFacade = FirestoreAdminFacade(ActionRequest, `${namespace}/`)
    const clientFacade = FirestoreClientFacade(ActionRequest, `${namespace}/`)

    const clearNamespace = async () => {
        await adminFacade.recursiveDelete()
    }
    await clearNamespace()

    try {
        await effect({ adminFacade, clientFacade, namespace, clearNamespace })
    } finally {
        await clearNamespace()
        restoreEnv(snapshot)
    }
}

test('Given the Firestore admin facades', async t => {
    await t.test('When an action request is written and read via the admin facade', async tt => {
        await withFacades(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildActionRequest()
            await adminFacade.write(item)
            const stored = await adminFacade.read(item.id)

            tt.equal(stored.id, item.id, 'Then the stored action request retains its identifier')
            tt.equal(stored.status, 'pending', 'Then the stored action request keeps the pending status')
        })
    })

    await t.test('When recursiveDelete runs on the namespace', async tt => {
        await withFacades(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildActionRequest({ status: 'pending' })

            await adminFacade.write(item)
            await adminFacade.recursiveDelete()

            const remaining = await adminFacade.list()
            tt.same(remaining, [], 'Then the namespace is empty after cleanup')
        })
    })
})

test('Given the completedActions collection', async t => {
    const namespace = `tests/ns_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const completedActionsFacade = FirestoreAdminFacade(ActionRequest, `${namespace}/`, undefined, 'completedActions')

    await t.test('When a completed action is written and read', async tt => {
        const item = buildActionRequest({
            status: 'completed',
            resultData: { success: true },
            processedAt: new Date('2025-01-01T00:01:00Z'),
        })
        await completedActionsFacade.write(item)
        const stored = await completedActionsFacade.read(item.id)

        tt.equal(stored.id, item.id, 'Then the completed action ID is preserved')
        tt.equal(stored.status, 'completed', 'Then the status is completed')
        tt.ok(stored.resultData, 'Then result data is preserved')
        tt.ok(stored.processedAt, 'Then processedAt timestamp is preserved')
    })
})

test('Teardown', t => {
    t.teardown(async () => {
        await Promise.all(admin.apps.map(app => app.delete()))
        await Promise.all(getApps().map(app => deleteApp(app)))
    })
    t.end()
})
