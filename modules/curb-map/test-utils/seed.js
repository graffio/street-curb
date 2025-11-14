import { LookupTable } from '@graffio/functional'
import admin from 'firebase-admin'
import { createFirestoreContext } from '../functions/src/firestore-context.js'
import { Member, Organization, OrganizationMember, Project, User } from '../src/types/index.js'

const EMULATOR_HUB_PORT = 4400 // Default Emulator Hub port

const disableTriggers = async () => {
    try {
        await fetch(`http://localhost:${EMULATOR_HUB_PORT}/functions/disableBackgroundTriggers`, { method: 'PUT' })
    } catch (error) {
        console.warn('Failed to disable triggers via Emulator Hub API:', error.message)
    }
}

const enableTriggers = async () => {
    try {
        await fetch(`http://localhost:${EMULATOR_HUB_PORT}/functions/enableBackgroundTriggers`, { method: 'PUT' })
    } catch (error) {
        console.warn('Failed to enable triggers via Emulator Hub API:', error.message)
    }
}

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
const organizationId = 'org_acme00000000'
const projectId = 'prj_holes0000000'
const aliceId = 'usr_alice0000000'
const actorId = aliceId // Alice is the current user / actor
const date = new Date('2025-01-01T10:00:00Z')

const createAuthUsers = async members => {
    const createAuthUser = async member => {
        await admin.auth().createUser({
            uid: member.userId,
            email: `${member.userId}@example.com`,
            displayName: member.displayName,
            password: 'password123', // Development only
        })
        console.log('Created Auth user for ' + member.userId)
    }

    // Create Auth user for Alice (triggers still disabled)
    for (const member of members) await createAuthUser(member)
}

const createUsers = async (fsContext, members) => {
    const createUser = async member => {
        const items = member.removedAt ? [] : [OrganizationMember.from({ organizationId, role: member.role })]
        const organizations = LookupTable(items, OrganizationMember, 'organizationId')

        const user = User.from({
            id: member.userId,
            email: `${member.userId}@example.com`,
            displayName: member.displayName,
            organizations,
            createdBy: member.userId,
            createdAt: date,
            updatedBy: member.userId,
            updatedAt: date,
        })

        console.log('Created User ' + member.userId)
        await fsContext.users.write(user)
        users.push(user)
    }

    const users = []
    for (const member of members) await createUser(member)
    return users
}

const createOrganizationsAndProjects = async (fsContext, members) => {
    const organization = Organization.from({
        id: organizationId,
        name: 'Acme',
        status: 'active',
        defaultProjectId: projectId,
        members: LookupTable(members, Member, 'userId'),
        createdBy: actorId,
        createdAt: date,
        updatedBy: actorId,
        updatedAt: date,
        schemaVersion: 1,
    })

    // Default Project
    const project = Project.from({
        id: projectId,
        organizationId,
        name: 'Default Project',
        createdBy: actorId,
        createdAt: date,
        updatedBy: actorId,
        updatedAt: date,
        schemaVersion: 1,
    })

    // Write to Firestore (with triggers disabled via Emulator Hub API)
    await fsContext.organizations.write(organization)
    await fsContext.projects.write(project)

    return { organizations: [organization], projects: [project] }
}
const seed = async () => {
    // Configure emulator connection
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

    // Disable Cloud Functions triggers for seeding (using official Emulator Hub API)
    await disableTriggers()

    // const namespace = process.env.FS_BASE
    // if (!namespace) throw new Error('FS_BASE environment variable must be set before seeding')
    const namespace = ''

    const fsContext = createFirestoreContext(namespace, organizationId, projectId)

    /*
     * Seed domain collections (current state)
     */

    // prettier-ignore
    const members = [
        Member.from({ userId: 'usr_alice0000000', displayName: 'Alice Aardvark' , role: 'admin' , addedAt: new Date('2024-01-01'), addedBy: 'usr_system000000', }),
        Member.from({ userId: 'usr_bob000000000', displayName: 'Bob Beckler'    , role: 'member', addedAt: new Date('2024-01-15'), addedBy: 'usr_alice0000000', }),
        Member.from({ userId: 'usr_carol0000000', displayName: 'Carol Cleveland', role: 'viewer', addedAt: new Date('2024-02-01'), addedBy: 'usr_alice0000000', }),
        Member.from({ userId: 'usr_dave00000000', displayName: 'Dave Duffy'     , role: 'admin' , addedAt: new Date('2023-12-01'), addedBy: 'usr_system000000', removedAt: new Date('2024-03-01'), removedBy: 'usr_alice0000000', }),
        Member.from({ userId: 'usr_eve000000000', displayName: 'Eve Ellen'      , role: 'member', addedAt: new Date('2024-01-20'), addedBy: 'usr_alice0000000', removedAt: new Date('2024-02-15'), removedBy: 'usr_alice0000000', }),
        Member.from({ userId: 'usr_frank0000000', displayName: 'Frank Furter'   , role: 'admin' , addedAt: new Date('2024-02-10'), addedBy: 'usr_alice0000000', }),
        Member.from({ userId: 'usr_grace0000000', displayName: 'Grace Goalie'   , role: 'member', addedAt: new Date('2024-02-20'), addedBy: 'usr_alice0000000', }),
        Member.from({ userId: 'usr_hank00000000', displayName: 'Hank Hoover'    , role: 'viewer', addedAt: new Date('2024-03-01'), addedBy: 'usr_frank0000000', }),
        Member.from({ userId: 'usr_ivy000000000', displayName: 'Ivy Ivory'      , role: 'member', addedAt: new Date('2024-03-05'), addedBy: 'usr_alice0000000', }),
        Member.from({ userId: 'usr_jack00000000', displayName: 'Jack Jackson'   , role: 'member', addedAt: new Date('2024-01-10'), addedBy: 'usr_alice0000000', removedAt: new Date('2024-03-10'), removedBy: 'usr_jack00000000', }),
    ]

    const users = await createUsers(fsContext, members)
    const { organizations, projects } = await createOrganizationsAndProjects(fsContext, members)
    await createAuthUsers(members)

    // Re-enable Cloud Functions triggers after all seeding is complete
    await enableTriggers()

    return { organizations, users, projects }
}

await seed()

export { seed }
