import admin from 'firebase-admin'
import { deleteApp, getApps } from 'firebase/app'
import { test } from 'tap'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { FirestoreClientFacade } from '../src/firestore-facade/firestore-client-facade.js'
import { Action, FieldTypes, QueueItem } from '../src/types/index.js'

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

// @sig buildQueueItem :: Object -> QueueItem
const buildQueueItem = overrides =>
    QueueItem.from({
        id: overrides?.id || FieldTypes.newQueueItemId(),
        actorId: overrides?.actorId || FieldTypes.newUserId(),
        action:
            overrides?.action ||
            Action.UserAdded.from({
                organizationId: FieldTypes.newOrganizationId(),
                user: { id: FieldTypes.newUserId(), email: 'queue@example.com' },
            }),
        idempotencyKey: overrides?.idempotencyKey || FieldTypes.newIdempotencyKey(),
        status: overrides?.status || 'pending',
        resultData: overrides?.resultData,
        error: overrides?.error,
        createdAt: overrides?.createdAt || new Date('2025-01-01T00:00:00Z'),
        processedAt: overrides?.processedAt,
    })

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

    const adminFacade = FirestoreAdminFacade(QueueItem, `${namespace}/`)
    const clientFacade = FirestoreClientFacade(QueueItem, `${namespace}/`)

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

test('Given the Firestore facades infrastructure', async t => {
    await t.test('When a queue item is written and read via the admin facade', async tt => {
        await withFacades(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildQueueItem()
            await adminFacade.write(item)
            const stored = await adminFacade.read(item.id)

            tt.equal(stored.id, item.id, 'Then the stored queue item retains its identifier')
            tt.equal(stored.status, 'pending', 'Then the stored queue item keeps the pending status')
        })
    })

    await t.test('When recursiveDelete runs on the namespace', async tt => {
        await withFacades(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildQueueItem({ status: 'pending' })

            await adminFacade.write(item)
            await adminFacade.recursiveDelete()

            const remaining = await adminFacade.list()
            tt.same(remaining, [], 'Then the namespace is empty after cleanup')
        })
    })
})

test('Teardown', t => {
    t.teardown(async () => {
        await Promise.all(admin.apps.map(app => app.delete()))
        await Promise.all(getApps().map(app => deleteApp(app)))
    })
    t.end()
})
