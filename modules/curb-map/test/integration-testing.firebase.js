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

test('Given the Firestore admin facade', async t => {
    await t.test('When a queue item is written and read', async tt => {
        await withFacades(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildQueueItem()
            await adminFacade.write(item)
            const stored = await adminFacade.read(item.id)

            tt.equal(stored.id, item.id, 'Then the stored queue item retains the identifier')
            tt.equal(stored.status, 'pending', 'Then the stored queue item keeps the pending status')
            tt.equal(stored.action['@@tagName'], 'UserAdded', 'Then the stored queue item preserves the action tag')
        })
    })

    await t.test('When queue items are queried by status', async tt => {
        await withFacades(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const pending = buildQueueItem({ status: 'pending' })
            const completed = buildQueueItem({ status: 'completed', processedAt: new Date('2025-01-01T01:00:00Z') })

            await adminFacade.write(pending)
            await adminFacade.write(completed)

            const byStatus = await adminFacade.query([['status', '==', 'completed']])
            const identifiers = byStatus.map(item => item.id)

            tt.same(identifiers, [completed.id], 'Then only the completed queue item is returned')

            const references = await adminFacade.list()
            const paths = references.map(ref => ref.path)

            tt.ok(
                paths.every(path => path.includes('/queueItems/')),
                'Then the document references stay inside the queue items path',
            )
        })
    })

    await t.test('When a queue item is deleted', async tt => {
        await withFacades(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const doomed = buildQueueItem({ status: 'failed', error: 'validation-error' })

            await adminFacade.write(doomed)
            await adminFacade.delete(doomed.id)

            await tt.rejects(
                () => adminFacade.read(doomed.id),
                /not found/,
                'Then reading the deleted queue item fails',
            )
        })
    })
})

test('Given the admin facade descendant helper', async t => {
    await t.test('When a queue item is written through a valid descendant path', async tt => {
        await withFacades(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const descendant = adminFacade.descendent('organizations/org_archive')
            const item = buildQueueItem({ status: 'completed', processedAt: new Date('2025-01-02T00:00:00Z') })

            await descendant.write(item)
            const stored = await descendant.read(item.id)

            tt.equal(stored.status, 'completed', 'Then the descendant facade returns the stored queue item')
        })
    })

    await t.test('When the descendant path contains an odd number of segments', async tt => {
        await withFacades(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()

            tt.throws(
                () => adminFacade.descendent('archive'),
                /Suffix must have an even number of segments/,
                'Then the descendant helper rejects odd segment counts',
            )
        })
    })
})

test('Given the Firestore client facade', async t => {
    await t.test('When a queue item is written by the client facade', async tt => {
        await withFacades(async ({ adminFacade, clientFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildQueueItem({ status: 'pending' })

            await clientFacade.write(item)
            const fromAdmin = await adminFacade.read(item.id)
            const fromClient = await clientFacade.read(item.id)

            tt.equal(fromAdmin.id, item.id, 'Then the admin facade reads the client-written queue item')
            tt.equal(fromClient.id, item.id, 'And  the client facade reads the client-written queue item')
        })
    })

    await t.test('When queue items are queried by the client facade', async tt => {
        await withFacades(async ({ adminFacade, clientFacade, clearNamespace }) => {
            await clearNamespace()
            const seedItems = [
                buildQueueItem({ status: 'pending' }),
                buildQueueItem({ status: 'completed', processedAt: new Date('2025-01-03T01:00:00Z') }),
            ]

            await Promise.all(seedItems.map(adminFacade.write))

            const results = await clientFacade.query([['status', '==', 'completed']])
            tt.equal(results.length, 1, 'Then the client query returns 1 out of 2 items')
            tt.equal(results[0].status, 'completed', 'And  it finds the right one')
        })
    })
})

test('Given the admin facade cleanup helper', async t => {
    await t.test('When recursiveDelete runs', async tt => {
        await withFacades(async ({ adminFacade, clientFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildQueueItem({ status: 'pending' })

            await clientFacade.write(item)
            await adminFacade.recursiveDelete()

            const remaining = await adminFacade.list()
            tt.same(remaining, [], 'Then the namespace is empty after recursive delete runs')
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
