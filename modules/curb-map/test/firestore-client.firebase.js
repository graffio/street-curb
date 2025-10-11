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
            Action.UserCreated.from({
                organizationId,
                userId: FieldTypes.newUserId(),
                email: 'action@example.com',
                displayName: 'Action!',
                role: 'admin',
            }),
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

    const clientFacade = FirestoreClientFacade(ActionRequest, `${namespace}/`)
    // Use admin facade for cleanup since client facade doesn't have recursiveDelete
    const adminFacade = FirestoreAdminFacade(ActionRequest, `${namespace}/`)

    const clearNamespace = async () => {
        await adminFacade.recursiveDelete()
    }
    await clearNamespace()

    try {
        await effect({ clientFacade, namespace, clearNamespace })
    } finally {
        await clearNamespace()
        restoreEnv(snapshot)
    }
}

test('Given the Firestore client facade', async t => {
    await t.test('When an action request is written and read via the client facade', async tt => {
        await withFacades(async ({ clientFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildActionRequest()
            await clientFacade.write(item)
            const stored = await clientFacade.read(item.id)

            tt.equal(stored.id, item.id, 'Then the stored action request retains its identifier')
            tt.equal(stored.status, 'pending', 'Then the stored action request keeps the pending status')
        })
    })

    await t.test('When query is used to filter documents', async tt => {
        await withFacades(async ({ clientFacade, clearNamespace }) => {
            await clearNamespace()
            const orgId = FieldTypes.newOrganizationId()
            const item1 = buildActionRequest({ organizationId: orgId, status: 'pending' })
            const item2 = buildActionRequest({ organizationId: orgId, status: 'completed' })
            const item3 = buildActionRequest({ status: 'pending' }) // different org

            await clientFacade.write(item1)
            await clientFacade.write(item2)
            await clientFacade.write(item3)

            const results = await clientFacade.query([['organizationId', '==', orgId]])

            tt.equal(results.length, 2, 'Then only documents matching the query are returned')
            tt.ok(
                results.every(r => r.organizationId === orgId),
                'Then all results match the organization ID',
            )
        })
    })
})

test('Given the Firestore client facade update method', async t => {
    await t.test('When update is called with partial fields', async tt => {
        await withFacades(async ({ clientFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildActionRequest({ status: 'pending' })
            await clientFacade.write(item)

            // Update only status field
            await clientFacade.update(item.id, { status: 'completed' })

            const updated = await clientFacade.read(item.id)
            tt.equal(updated.status, 'completed', 'Then the status field is updated')
            tt.equal(updated.id, item.id, 'Then other fields remain unchanged')
        })
    })

    await t.test('When update is called on non-existent document', async tt => {
        await withFacades(async ({ clientFacade, clearNamespace }) => {
            await clearNamespace()
            const nonExistentId = FieldTypes.newActionRequestId()

            try {
                await clientFacade.update(nonExistentId, { status: 'completed' })
                tt.fail('Then update should throw an error')
            } catch (error) {
                tt.match(error.message, /Failed to update/, 'Then error message indicates update failed')
            }
        })
    })

    await t.test('When write is called with invalid status value', async tt => {
        await withFacades(async ({ clientFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildActionRequest({ status: 'pending' })

            // Try to create an ActionRequest with invalid status
            try {
                const invalidItem = { ...item, status: 'invalid' }
                await clientFacade.write(invalidItem)
                tt.fail('Then write should throw a validation error')
            } catch (error) {
                tt.match(error.message, /not of type/, 'Then error indicates type validation failed')
            }
        })
    })
})

test('Given the Firestore client facade listenToDocument method', async t => {
    await t.test('When listening to a document that gets created', async tt => {
        await withFacades(async ({ clientFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildActionRequest()
            const updates = []

            return new Promise((resolve, reject) => {
                const unsubscribe = clientFacade.listenToDocument(item.id, (doc, error) => {
                    if (error) {
                        unsubscribe()
                        reject(error)
                        return
                    }
                    updates.push(doc)

                    if (doc !== null) {
                        unsubscribe()
                        tt.equal(updates[0], null, 'Then first callback receives null (doc does not exist)')
                        tt.equal(updates[1].id, item.id, 'Then second callback receives the created document')
                        resolve()
                    }
                })

                // Write document after listener is set up
                setTimeout(() => clientFacade.write(item), 100)
            })
        })
    })

    await t.test('When listening to a document that gets updated', async tt => {
        await withFacades(async ({ clientFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildActionRequest({ status: 'pending' })
            await clientFacade.write(item)

            const updates = []

            return new Promise((resolve, reject) => {
                const unsubscribe = clientFacade.listenToDocument(item.id, (doc, error) => {
                    if (error) {
                        unsubscribe()
                        reject(error)
                        return
                    }
                    updates.push(doc)

                    if (updates.length === 2) {
                        unsubscribe()
                        tt.equal(updates[0].status, 'pending', 'Then first callback has pending status')
                        tt.equal(updates[1].status, 'completed', 'Then second callback has updated status')
                        resolve()
                    }
                })

                // Update document after listener is set up
                setTimeout(() => clientFacade.update(item.id, { status: 'completed' }), 100)
            })
        })
    })
})

test('Given the Firestore client facade listenToCollection method', async t => {
    await t.test('When listening to a collection with new documents added', async tt => {
        await withFacades(async ({ clientFacade, clearNamespace }) => {
            await clearNamespace()
            const orgId = FieldTypes.newOrganizationId()
            const item1 = buildActionRequest({ organizationId: orgId, status: 'pending' })
            const item2 = buildActionRequest({ organizationId: orgId, status: 'pending' })

            const updates = []

            return new Promise((resolve, reject) => {
                const unsubscribe = clientFacade.listenToCollection(
                    [['organizationId', '==', orgId]],
                    (docs, error) => {
                        if (error) {
                            unsubscribe()
                            reject(error)
                            return
                        }
                        updates.push(docs)

                        if (updates.length === 3) {
                            unsubscribe()
                            tt.equal(updates[0].length, 0, 'Then first callback has empty collection')
                            tt.equal(updates[1].length, 1, 'Then second callback has one document')
                            tt.equal(updates[2].length, 2, 'Then third callback has two documents')
                            resolve()
                        }
                    },
                )

                // Write documents after listener is set up
                setTimeout(() => clientFacade.write(item1), 100)
                setTimeout(() => clientFacade.write(item2), 200)
            })
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
