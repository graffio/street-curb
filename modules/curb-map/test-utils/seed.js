import { createFirestoreContext } from '../functions/src/firestore-context.js'
import { Action, ActionRequest, Organization, User, Project } from '../src/types/index.js'

/*
 * Seed test data into Firestore using the HTTP function architecture.
 * Seeds both domain collections (organizations, users, projects) and
 * completedActions audit trail to create a realistic test environment.
 *
 * @sig seed :: () -> Promise<Object>
 *
 * @example
 * process.env.FS_BASE = 'tests/ns_123'
 * const seededData = await seed()
 * // Returns: { organizations: [...], users: [...], projects: [...], completedActions: [...] }
 */

// Test data IDs
const organizationId = 'org_123456789abc'
const projectId = 'prj_123456789abc'
const actorId = 'usr_123456789abc'
const userId2 = 'usr_234567890bcd'

const seed = async () => {
    const namespace = process.env.FS_BASE
    if (!namespace) throw new Error('FS_BASE environment variable must be set before seeding')

    const fsContext = createFirestoreContext(namespace, organizationId, projectId)

    /*
     * Seed domain collections (current state)
     */

    // Organization
    const organization = Organization.from({
        id: organizationId,
        name: 'Seed Organization',
        status: 'active',
        defaultProjectId: projectId,
        members: {},
        createdBy: actorId,
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedBy: actorId,
        updatedAt: new Date('2025-01-01T10:00:00Z'),
        schemaVersion: 1,
    })
    await fsContext.organizations.write(organization)

    // Default Project
    const project = Project.from({
        id: projectId,
        organizationId,
        name: 'Default Project',
        createdBy: actorId,
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedBy: actorId,
        updatedAt: new Date('2025-01-01T10:00:00Z'),
        schemaVersion: 1,
    })
    await fsContext.projects.write(project)

    // Users
    const user1 = User.from({
        id: actorId,
        email: 'actor@example.com',
        displayName: 'Actor User',
        organizations: { [organizationId]: 'admin' },
        createdBy: actorId,
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedBy: actorId,
        updatedAt: new Date('2025-01-01T10:00:00Z'),
    })
    await fsContext.users.write(user1)

    const user2 = User.from({
        id: userId2,
        email: 'member@example.com',
        displayName: 'Member User',
        organizations: { [organizationId]: 'member' },
        createdBy: actorId,
        createdAt: new Date('2025-01-01T11:00:00Z'),
        updatedBy: actorId,
        updatedAt: new Date('2025-01-01T11:00:00Z'),
    })
    await fsContext.users.write(user2)

    /*
     * Seed completedActions audit trail (history)
     * These represent the actions that created the domain state above
     */

    const completedActions = [
        // Action 1: OrganizationCreated
        ActionRequest.from({
            id: 'acr_seed001',
            actorId,
            subjectId: organizationId,
            subjectType: 'organization',
            action: Action.OrganizationCreated.from({ organizationId, projectId, name: 'Seed Organization' }),
            organizationId,
            projectId,
            idempotencyKey: 'idm_seed001',
            correlationId: 'cor_seed001',
            status: 'completed',
            resultData: undefined,
            error: undefined,
            schemaVersion: 1,
            createdAt: new Date('2025-01-01T10:00:00Z'),
            processedAt: new Date('2025-01-01T10:00:01Z'),
        }),

        // Action 2: UserCreated (actor)
        ActionRequest.from({
            id: 'acr_seed002',
            actorId,
            subjectId: actorId,
            subjectType: 'user',
            action: Action.UserCreated.from({
                userId: actorId,
                email: 'actor@example.com',
                displayName: 'Actor User',
                authUid: 'auth_seed_actor', // Seed data - not processed
            }),
            organizationId,
            projectId,
            idempotencyKey: 'idm_seed002',
            correlationId: 'cor_seed002',
            status: 'completed',
            resultData: undefined,
            error: undefined,
            schemaVersion: 1,
            createdAt: new Date('2025-01-01T10:00:00Z'),
            processedAt: new Date('2025-01-01T10:00:02Z'),
        }),

        // Action 3: UserCreated (member)
        ActionRequest.from({
            id: 'acr_seed003',
            actorId,
            subjectId: userId2,
            subjectType: 'user',
            action: Action.UserCreated.from({
                userId: userId2,
                email: 'member@example.com',
                displayName: 'Member User',
                authUid: 'auth_seed_member', // Seed data - not processed
            }),
            organizationId,
            projectId,
            idempotencyKey: 'idm_seed003',
            correlationId: 'cor_seed003',
            status: 'completed',
            resultData: undefined,
            error: undefined,
            schemaVersion: 1,
            createdAt: new Date('2025-01-01T11:00:00Z'),
            processedAt: new Date('2025-01-01T11:00:01Z'),
        }),
    ]

    for (const actionRequest of completedActions) await fsContext.completedActions.write(actionRequest)

    return { organizations: [organization], users: [user1, user2], projects: [project], completedActions }
}

export { seed }
