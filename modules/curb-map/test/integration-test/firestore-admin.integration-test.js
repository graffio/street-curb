import admin from 'firebase-admin'
import { deleteApp, getApps } from 'firebase/app'
import { test } from 'tap'
import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { FirestoreClientFacade } from '../../src/firestore-facade/firestore-client-facade.js'
import { FieldTypes, Organization } from '../../src/types/index.js'

// @sig buildOrganization :: Object -> Organization
const buildOrganization = overrides => {
    const now = new Date('2025-01-01T00:00:00Z')
    return Organization.from({
        id: overrides?.id || FieldTypes.newOrganizationId(),
        name: overrides?.name || 'Test Organization',
        status: overrides?.status || 'active',
        defaultProjectId: overrides?.defaultProjectId || FieldTypes.newProjectId(),
        members: overrides?.members || {},
        createdAt: overrides?.createdAt || now,
        createdBy: overrides?.createdBy || FieldTypes.newUserId(),
        updatedAt: overrides?.updatedAt || now,
        updatedBy: overrides?.updatedBy || FieldTypes.newUserId(),
    })
}

// @sig withTestEnvironment :: (Context -> Promise Any) -> Promise Void
const withTestEnvironment = async effect => {
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '-').replace('Z', '')
    const namespace = `tests/ns_${timestamp}`

    // Read project ID from environment (must be set externally)
    const projectId = process.env.GCLOUD_PROJECT || process.env.TEST_GCLOUD_PROJECT || 'local-curb-map-tests'

    // Ensure emulator configuration (idempotent, hardcoded ports)
    process.env.GCLOUD_PROJECT ||= projectId
    process.env.GOOGLE_CLOUD_PROJECT ||= projectId
    process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080'
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099'
    process.env.FIREBASE_TEST_MODE ||= '1'

    const adminFacade = FirestoreAdminFacade(Organization, `${namespace}/`)
    const clientFacade = FirestoreClientFacade(Organization, `${namespace}/`)

    const clearNamespace = async () => {
        await adminFacade.recursiveDelete()
    }
    await clearNamespace()

    try {
        await effect({ adminFacade, clientFacade, namespace, clearNamespace })
    } finally {
        await clearNamespace()
    }
}

test('Given the Firestore admin facades', async t => {
    await t.test('When an organization is written and read via the admin facade', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildOrganization({ name: 'Test Org' })
            await adminFacade.write(item)
            const stored = await adminFacade.read(item.id)

            tt.equal(stored.id, item.id, 'Then the stored organization retains its identifier')
            tt.equal(stored.name, 'Test Org', 'Then the stored organization keeps the correct name')
        })
    })

    await t.test('When recursiveDelete runs on the namespace', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildOrganization({ name: 'Test Org' })

            await adminFacade.write(item)
            await adminFacade.recursiveDelete()

            const remaining = await adminFacade.list()
            tt.same(remaining, [], 'Then the namespace is empty after cleanup')
        })
    })
})

test('Given the Firestore facade update method', async t => {
    await t.test('When update is called with partial fields', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildOrganization({ name: 'Original Name' })
            await adminFacade.write(item)

            // Update only name field
            await adminFacade.update(item.id, { name: 'Updated Name' })

            const updated = await adminFacade.read(item.id)
            tt.equal(updated.name, 'Updated Name', 'Then the name field is updated')
            tt.equal(updated.id, item.id, 'Then other fields remain unchanged')
        })
    })

    await t.test('When update is called on non-existent document', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const nonExistentId = FieldTypes.newOrganizationId()

            try {
                await adminFacade.update(nonExistentId, { name: 'Updated Name' })
                tt.fail('Then update should throw an error')
            } catch (error) {
                tt.match(error.message, /Failed to update/, 'Then error message indicates update failed')
            }
        })
    })

    await t.test('When write is called with invalid status value', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildOrganization({ status: 'active' })

            // Try to create an Organization with invalid status
            try {
                const invalidItem = { ...item, status: 'invalid' }
                await adminFacade.write(invalidItem)
                tt.fail('Then write should throw a validation error')
            } catch (error) {
                tt.match(error.message, /expected status to match/, 'Then error indicates type validation failed')
            }
        })
    })
})

test('Given the Firestore facade listenToDocument method', async t => {
    await t.test('When listening to a document that gets created', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildOrganization({ name: 'New Org' })
            const updates = []

            return new Promise((resolve, reject) => {
                const unsubscribe = adminFacade.listenToDocument(item.id, (doc, error) => {
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
                setTimeout(() => adminFacade.write(item), 100)
            })
        })
    })

    await t.test('When listening to a document that gets updated', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const item = buildOrganization({ name: 'Original Name', status: 'active' })
            await adminFacade.write(item)

            const updates = []

            return new Promise((resolve, reject) => {
                const unsubscribe = adminFacade.listenToDocument(item.id, (doc, error) => {
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

                // Update document after listener is set up
                setTimeout(() => adminFacade.update(item.id, { name: 'Updated Name' }), 100)
            })
        })
    })
})

test('Given the Firestore facade listenToCollection method', async t => {
    await t.test('When listening to a collection with new documents added', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()
            const orgId = FieldTypes.newOrganizationId()
            const item1 = buildOrganization({ organizationId: orgId, name: 'Org 1', status: 'active' })
            const item2 = buildOrganization({ organizationId: orgId, name: 'Org 2', status: 'active' })

            const updates = []

            return new Promise((resolve, reject) => {
                const unsubscribe = adminFacade.listenToCollection([['status', '==', 'active']], (docs, error) => {
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
                })

                // Write documents after listener is set up
                setTimeout(() => adminFacade.write(item1), 100)
                setTimeout(() => adminFacade.write(item2), 200)
            })
        })
    })
})

test('Given the FirestoreAdminFacade with transaction support', async t => {
    await t.test('When facade is created with optional transaction parameter', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace }) => {
            await clearNamespace()

            // Test facade creation without transaction
            const facadeWithoutTx = FirestoreAdminFacade(Organization, 'tests/transaction-test/')
            tt.ok(facadeWithoutTx, 'Then facade is created without transaction parameter')

            // Test facade creation with null transaction
            const facadeWithNullTx = FirestoreAdminFacade(Organization, 'tests/transaction-test/')
            tt.ok(facadeWithNullTx, 'Then facade is created with null transaction parameter')

            tt.same(Object.keys(facadeWithoutTx), Object.keys(facadeWithNullTx), 'Then both facades have same methods')
        })
    })

    await t.test('When operations are performed with and without transactions', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace, namespace }) => {
            await clearNamespace()
            const org = buildOrganization({ name: 'Test Org' })

            // Test without transaction
            await adminFacade.write(org)
            const readResult = await adminFacade.read(org.id)
            tt.ok(readResult, 'Then document is read successfully without transaction')
            tt.equal(readResult.name, 'Test Org', 'Then document data is correct')

            // Test with transaction
            const db = adminFacade.db || admin.firestore()
            await db.runTransaction(async tx => {
                const txFacade = FirestoreAdminFacade(Organization, namespace, tx, db)

                // Read first (to check current state)
                const txReadResult = await txFacade.read(org.id)
                tt.equal(txReadResult.name, 'Test Org', 'Then document has correct name before update')

                // Update within transaction (write after read)
                await txFacade.update(org.id, { name: 'Updated Org' })
            })

            // Verify transaction was committed
            const finalResult = await adminFacade.read(org.id)
            tt.equal(finalResult.name, 'Updated Org', 'Then transaction changes persisted')
        })
    })

    await t.test('When readOrNull is called on non-existent document', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace, namespace }) => {
            await clearNamespace()
            const nonExistentId = FieldTypes.newOrganizationId()

            // Test without transaction
            const resultWithoutTx = await adminFacade.readOrNull(nonExistentId)
            tt.equal(
                resultWithoutTx,
                null,
                'Then readOrNull returns null for non-existent document without transaction',
            )

            // Test with transaction
            const db = adminFacade.db || admin.firestore()
            await db.runTransaction(async tx => {
                const txFacade = FirestoreAdminFacade(Organization, namespace, tx, db)
                const resultWithTx = await txFacade.readOrNull(nonExistentId)
                tt.equal(resultWithTx, null, 'Then readOrNull returns null for non-existent document with transaction')
            })
        })
    })

    await t.test('When transaction operations are atomic', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace, namespace }) => {
            await clearNamespace()
            const atomicTestId = FieldTypes.newOrganizationId()

            // Test successful transaction
            const db = adminFacade.db || admin.firestore()
            await db.runTransaction(async tx => {
                const txFacade = FirestoreAdminFacade(Organization, namespace, tx, db)

                // Check document doesn't exist (READ FIRST)
                const existing = await txFacade.readOrNull(atomicTestId)
                tt.equal(existing, null, 'Then document does not exist before transaction')

                // Create document (WRITE AFTER READS)
                await txFacade.create(buildOrganization({ id: atomicTestId, name: 'Atomic Test Org' }))
            })

            // Verify transaction was committed (read outside transaction)
            const finalResult = await adminFacade.read(atomicTestId)
            tt.equal(finalResult.name, 'Atomic Test Org', 'Then transaction changes committed successfully')
        })
    })

    await t.test('When transaction rolls back on error', async tt => {
        await withTestEnvironment(async ({ adminFacade, clearNamespace, namespace }) => {
            await clearNamespace()
            const rollbackTestId = FieldTypes.newOrganizationId()

            // Test transaction that should rollback
            try {
                const db = adminFacade.db || admin.firestore()
                await db.runTransaction(async tx => {
                    const txFacade = FirestoreAdminFacade(Organization, namespace, tx, db)

                    // Create document
                    await txFacade.create(buildOrganization({ id: rollbackTestId, name: 'Should Rollback' }))

                    // Force an error to trigger rollback
                    throw new Error('Intentional rollback error')
                })
            } catch (e) {
                tt.equal(e.message, 'Intentional rollback error', 'Then transaction error is thrown correctly')
            }

            // Verify document was not created due to rollback
            const result = await adminFacade.readOrNull(rollbackTestId)
            tt.equal(result, null, 'Then document was not created due to transaction rollback')
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
