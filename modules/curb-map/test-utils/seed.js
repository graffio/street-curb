import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { FieldTypes } from '../src/types/field-types.js'
import { Action, QueueItem } from '../src/types/index.js'

/*
 * Seed test data into Firestore
 * Should only be called with DISABLE_TRIGGERS=1 to prevent
 * Firebase functions from triggering during test data setup
 * @sig seed :: () -> Promise
 *
 * @example
 * process.env.FS_BASE = 'tests/ns_123'
 * process.env.DISABLE_TRIGGERS = '1'
 * await seed()
 * delete process.env.DISABLE_TRIGGERS
 */

const organizationId = 'org_123456789abc'
const actorId = 'usr_123456789abc'
const queryItem1Id = 'que_xmsvnmfk2n0e'
const queryItem2Id = 'que_xmsvnmfk2n0f'
const idempotencyKey = 'idm_123456789abc'

const seed = async () => {
    if (!process.env.DISABLE_TRIGGERS)
        console.warn(
            'WARNING: seed() called without DISABLE_TRIGGERS set. ' +
                'Firebase functions may trigger during seeding, causing unexpected side effects.',
        )

    const namespace = process.env.FS_BASE
    if (!namespace) throw new Error('FS_BASE environment variable must be set before seeding')

    const queueFacade = FirestoreAdminFacade(QueueItem, `${namespace}/`)

    const queueItems = [
        QueueItem.from({
            id: queryItem1Id,
            actorId,
            action: Action.UserAdded.from({ organizationId, user: { id: actorId, email: 'john@example.com' } }),
            idempotencyKey,
            status: 'pending',
            resultData: undefined,
            error: undefined,
            createdAt: new Date('2025-01-01T10:00:00Z'),
            processedAt: undefined,
        }),
        QueueItem.from({
            id: queryItem2Id,
            actorId,
            action: Action.OrganizationAdded.from({
                organizationId,
                metadata: { name: 'Seed Org', createdBy: actorId },
            }),
            idempotencyKey,
            status: 'completed',
            resultData: { eventId: FieldTypes.newCorrelationId() },
            error: undefined,
            createdAt: new Date('2025-01-01T11:00:00Z'),
            processedAt: new Date('2025-01-01T11:05:00Z'),
        }),
    ]

    for (const item of queueItems) await queueFacade.write(item)

    return queueItems
}

export { seed }
