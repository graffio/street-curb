import admin from 'firebase-admin'
import { deleteApp, getApps } from 'firebase/app'
import { test } from 'tap'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { FirestoreClientFacade } from '../src/firestore-facade/firestore-client-facade.js'
import { Organization, FieldTypes } from '../src/types/index.js'

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

// @sig buildOrganization :: Object -> Organization
const buildOrganization = overrides => {
    const organizationId = overrides?.id || FieldTypes.newOrganizationId()
    const actorId = overrides?.createdBy || FieldTypes.newUserId()

    return Organization.from({
        id: organizationId,
        name: overrides?.name || 'Test Organization',
        status: overrides?.status || 'active',
        defaultProjectId: overrides?.defaultProjectId || FieldTypes.newProjectId(),
        createdBy: actorId,
        createdAt: overrides?.createdAt || new Date('2025-01-01T00:00:00Z'),
        updatedBy: overrides?.updatedBy || actorId,
        updatedAt: overrides?.updatedAt || new Date('2025-01-01T00:00:00Z'),
        schemaVersion: overrides?.schemaVersion || 1,
    })
}

// @sig withFacades :: (Context -> Promise Any) -> Promise Void
const withFacades = async effect => {
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '-').replace('Z', '')
    const namespace = `tests/ns_${timestamp}`
    const snapshot = captureEnv(envKeys)

    const configuration = {
        GCLOUD_PROJECT: process.env.GCLOUD_PROJECT || defaultProjectId,
        GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT || defaultProjectId,
        FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST || defaultFirestoreHost,
        FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST || defaultAuthHost,
        FIREBASE_TEST_MODE: '1',
    }

    restoreEnv(configuration)

    const clientFacade = FirestoreClientFacade(Organization, `${namespace}/`)
    // Use admin facade for seeding and cleanup (client facade is read-only in HTTP architecture)
    const adminFacade = FirestoreAdminFacade(Organization, `${namespace}/`)

    const clearNamespace = async () => {
        await adminFacade.recursiveDelete()
    }
    await clearNamespace()

    try {
        await effect({ clientFacade, adminFacade, namespace, clearNamespace })
    } finally {
        await clearNamespace()
        restoreEnv(snapshot)
    }
}

test('Given the Firestore client facade', async t => {
    await t.test('When reading an organization seeded by admin', async tt => {
        await withFacades(async ({ clientFacade, adminFacade, clearNamespace }) => {
            await clearNamespace()
            const org = buildOrganization({ name: 'Test Org' })
            await adminFacade.write(org)
            const stored = await clientFacade.read(org.id)

            tt.equal(stored.id, org.id, 'Then the client can read the organization')
            tt.equal(stored.name, 'Test Org', 'Then the name is correct')
            tt.equal(stored.status, 'active', 'Then the status is correct')
        })
    })

    await t.test('When query is used to filter organizations', async tt => {
        await withFacades(async ({ clientFacade, adminFacade, clearNamespace }) => {
            await clearNamespace()
            const org1 = buildOrganization({ name: 'Active Org 1', status: 'active' })
            const org2 = buildOrganization({ name: 'Active Org 2', status: 'active' })
            const org3 = buildOrganization({ name: 'Suspended Org', status: 'suspended' })

            await adminFacade.write(org1)
            await adminFacade.write(org2)
            await adminFacade.write(org3)

            const results = await clientFacade.query([['status', '==', 'active']])

            tt.equal(results.length, 2, 'Then only active organizations are returned')
            tt.ok(
                results.every(r => r.status === 'active'),
                'Then all results have active status',
            )
        })
    })
})

test('Given the Firestore client facade listenToDocument method', async t => {
    await t.test('When listening to an organization that gets created', async tt => {
        await withFacades(async ({ clientFacade, adminFacade, clearNamespace }) => {
            await clearNamespace()
            const org = buildOrganization({ name: 'New Org' })
            const updates = []

            return new Promise((resolve, reject) => {
                const unsubscribe = clientFacade.listenToDocument(org.id, (doc, error) => {
                    if (error) {
                        unsubscribe()
                        reject(error)
                        return
                    }
                    updates.push(doc)

                    if (doc !== null) {
                        unsubscribe()
                        tt.equal(updates[0], null, 'Then first callback receives null (doc does not exist)')
                        tt.equal(updates[1].id, org.id, 'Then second callback receives the created organization')
                        tt.equal(updates[1].name, 'New Org', 'Then the organization name is correct')
                        resolve()
                    }
                })

                // Write document via admin after listener is set up
                setTimeout(() => adminFacade.write(org), 100)
            })
        })
    })

    await t.test('When listening to an organization that gets updated', async tt => {
        await withFacades(async ({ clientFacade, adminFacade, clearNamespace }) => {
            await clearNamespace()
            const org = buildOrganization({ name: 'Original Name', status: 'active' })
            await adminFacade.write(org)

            const updates = []

            return new Promise((resolve, reject) => {
                const unsubscribe = clientFacade.listenToDocument(org.id, (doc, error) => {
                    if (error) {
                        unsubscribe()
                        reject(error)
                        return
                    }
                    updates.push(doc)

                    if (updates.length === 2) {
                        unsubscribe()
                        tt.equal(updates[0].name, 'Original Name', 'Then first callback has original name')
                        tt.equal(updates[1].name, 'Updated Name', 'Then second callback has updated name')
                        resolve()
                    }
                })

                // Update document via admin after listener is set up
                setTimeout(() => adminFacade.update(org.id, { name: 'Updated Name' }), 100)
            })
        })
    })
})

test('Given the Firestore client facade listenToCollection method', async t => {
    await t.test('When listening to organizations collection with new documents added', async tt => {
        await withFacades(async ({ clientFacade, adminFacade, clearNamespace }) => {
            await clearNamespace()
            const org1 = buildOrganization({ name: 'Org 1', status: 'active' })
            const org2 = buildOrganization({ name: 'Org 2', status: 'active' })

            const updates = []

            return new Promise((resolve, reject) => {
                const unsubscribe = clientFacade.listenToCollection([['status', '==', 'active']], (docs, error) => {
                    if (error) {
                        unsubscribe()
                        reject(error)
                        return
                    }
                    updates.push(docs)

                    if (updates.length === 3) {
                        unsubscribe()
                        tt.equal(updates[0].length, 0, 'Then first callback has empty collection')
                        tt.equal(updates[1].length, 1, 'Then second callback has one organization')
                        tt.equal(updates[2].length, 2, 'Then third callback has two organizations')
                        resolve()
                    }
                })

                // Write documents via admin after listener is set up
                setTimeout(() => adminFacade.write(org1), 100)
                setTimeout(() => adminFacade.write(org2), 200)
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
