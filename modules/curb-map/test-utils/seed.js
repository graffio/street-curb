import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { Action, ActionRequest } from '../src/types/index.js'

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
const subjectId = 'usr_123456789abc'
const actionRequest1Id = 'acr_xmsvnmfk2n0e'
const actionRequest2Id = 'acr_xmsvnmfk2n0f'
const idempotencyKey1 = 'idm_123456789abc'
const idempotencyKey2 = 'idm_123456789abd'
const correlationId1 = 'cor_123456789abc'
const correlationId2 = 'cor_123456789abd'

const seed = async () => {
    if (!process.env.DISABLE_TRIGGERS)
        console.warn(
            'WARNING: seed() called without DISABLE_TRIGGERS set. ' +
                'Firebase functions may trigger during seeding, causing unexpected side effects.',
        )

    const namespace = process.env.FS_BASE
    if (!namespace) throw new Error('FS_BASE environment variable must be set before seeding')

    const actionRequestFacade = FirestoreAdminFacade(ActionRequest, `${namespace}/`)

    const actionRequests = [
        ActionRequest.from({
            id: actionRequest1Id,
            actorId,
            subjectId,
            subjectType: 'user',
            action: Action.UserAdded.from({ organizationId, user: { id: actorId, email: 'john@example.com' } }),
            organizationId,
            projectId: undefined,
            idempotencyKey: idempotencyKey1,
            correlationId: correlationId1,
            schemaVersion: 1,
            status: 'pending',
            resultData: undefined,
            error: undefined,
            createdAt: new Date('2025-01-01T10:00:00Z'),
            processedAt: undefined,
        }),
        ActionRequest.from({
            id: actionRequest2Id,
            actorId,
            subjectId: organizationId,
            subjectType: 'organization',
            action: Action.OrganizationAdded.from({
                organizationId,
                metadata: { name: 'Seed Org', createdBy: actorId },
            }),
            organizationId,
            projectId: undefined,
            idempotencyKey: idempotencyKey2,
            correlationId: correlationId2,
            schemaVersion: 1,
            status: 'completed',
            resultData: { id: actionRequest2Id },
            error: undefined,
            createdAt: new Date('2025-01-01T11:00:00Z'),
            processedAt: new Date('2025-01-01T11:05:00Z'),
        }),
    ]

    for (const item of actionRequests) await actionRequestFacade.write(item)

    return actionRequests
}

export { seed }
