import { LookupTable } from '@graffio/functional'
import { test } from 'tap'
import { Action, FieldTypes, Member, Organization } from '../src/types/index.js'

const now = new Date()

test('Given Organization type with members field', t => {
    t.test('When creating organization with members map Then members field is validated', t => {
        const orgId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()
        const adminId = FieldTypes.newUserId()

        const member = Member.from({ userId, displayName: 'Alice Chen', role: 'admin', addedAt: now, addedBy: adminId })
        const orgData = {
            id: orgId,
            name: 'Test Organization',
            status: 'active',
            defaultProjectId: projectId,
            members: LookupTable([member], Member, 'userId'),
            createdAt: now,
            createdBy: adminId,
            updatedAt: now,
            updatedBy: adminId,
        }

        const org = Organization.from(orgData)

        t.ok(org, 'Then organization is created')
        t.ok(org.members, 'Then members field exists')
        t.equal(typeof org.members, 'object', 'Then members is an Object')
        t.ok(org.members[userId], 'Then member userId key exists in map')

        t.end()
    })

    t.test('When member is active Then removedAt and removedBy are null', t => {
        const orgId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()
        const adminId = FieldTypes.newUserId()

        const displayName = 'Bob Smith'
        const member0 = Member.from({ userId, displayName, role: 'member', addedAt: now, addedBy: adminId })

        const orgData = {
            id: orgId,
            name: 'Test Organization',
            status: 'active',
            defaultProjectId: projectId,
            members: LookupTable([member0], Member, 'userId'),
            createdAt: now,
            createdBy: adminId,
            updatedAt: now,
            updatedBy: adminId,
        }

        const org = Organization.from(orgData)
        const member = org.members[userId]

        t.notOk(member.removedAt, 'Then removedAt is undefined for active member')
        t.notOk(member.removedBy, 'Then removedBy is undefined for active member')

        t.end()
    })

    t.test('When member is removed Then removedAt and removedBy are set', t => {
        const orgId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const userId = FieldTypes.newUserId()
        const adminId = FieldTypes.newUserId()

        const member0 = Member.from({
            userId,
            displayName: 'Charlie Davis',
            role: 'viewer',
            addedAt: new Date('2024-01-01'),
            addedBy: adminId,
            removedAt: new Date('2024-06-01'),
            removedBy: adminId,
        })
        const orgData = {
            id: orgId,
            name: 'Test Organization',
            status: 'active',
            defaultProjectId: projectId,
            members: LookupTable([member0], Member, 'userId'),
            createdAt: now,
            createdBy: adminId,
            updatedAt: now,
            updatedBy: adminId,
        }

        const org = Organization.from(orgData)
        const member = org.members[userId]

        t.ok(member.removedAt, 'Then removedAt is set for removed member')
        t.ok(member.removedBy, 'Then removedBy is set for removed member')

        t.end()
    })

    t.test('When organization has multiple members Then all members are in map', t => {
        const orgId = FieldTypes.newOrganizationId()
        const projectId = FieldTypes.newProjectId()
        const aliceId = FieldTypes.newUserId()
        const bobId = FieldTypes.newUserId()
        const adminId = FieldTypes.newUserId()

        const members = [
            Member.from({ userId: aliceId, displayName: 'Alice Chen', role: 'admin', addedAt: now, addedBy: adminId }),
            Member.from({ userId: bobId, displayName: 'Bob Smith', role: 'member', addedAt: now, addedBy: adminId }),
        ]

        const orgData = {
            id: orgId,
            name: 'Test Organization',
            status: 'active',
            defaultProjectId: projectId,
            members: LookupTable(members, Member, 'userId'),
            createdAt: now,
            createdBy: adminId,
            updatedAt: now,
            updatedBy: adminId,
        }

        const org = Organization.from(orgData)

        t.equal(Object.keys(org.members).length, 2, 'Then members map contains 2 members')
        t.ok(org.members[aliceId], 'Then alice is in members map')
        t.ok(org.members[bobId], 'Then bob is in members map')

        t.end()
    })

    t.end()
})

test('Given Action type with member action variants', t => {
    t.test('When MemberAdded action is created Then all required fields are present', t => {
        const userId = FieldTypes.newUserId()
        const orgId = FieldTypes.newOrganizationId()

        const action = Action.MemberAdded.from({
            userId,
            organizationId: orgId,
            displayName: 'Alice Chen',
            role: 'admin',
        })

        t.ok(action, 'Then MemberAdded action is created')
        t.equal(action['@@tagName'], 'MemberAdded', 'Then action has MemberAdded tag')
        t.equal(action.userId, userId, 'Then userId is set')
        t.equal(action.organizationId, orgId, 'Then organizationId is set')
        t.equal(action.displayName, 'Alice Chen', 'Then displayName is set')
        t.equal(action.role, 'admin', 'Then role is set')

        t.end()
    })

    t.test('When MemberRemoved action is created Then userId and organizationId are present', t => {
        const userId = FieldTypes.newUserId()
        const orgId = FieldTypes.newOrganizationId()

        const action = Action.MemberRemoved.from({ userId, organizationId: orgId })

        t.ok(action, 'Then MemberRemoved action is created')
        t.equal(action['@@tagName'], 'MemberRemoved', 'Then action has MemberRemoved tag')
        t.equal(action.userId, userId, 'Then userId is set')
        t.equal(action.organizationId, orgId, 'Then organizationId is set')

        t.end()
    })

    t.test('When RoleChanged action is created Then userId, organizationId, and role are present', t => {
        const userId = FieldTypes.newUserId()
        const orgId = FieldTypes.newOrganizationId()

        const action = Action.RoleChanged.from({ userId, organizationId: orgId, role: 'member' })

        t.ok(action, 'Then RoleChanged action is created')
        t.equal(action['@@tagName'], 'RoleChanged', 'Then action has RoleChanged tag')
        t.equal(action.userId, userId, 'Then userId is set')
        t.equal(action.organizationId, orgId, 'Then organizationId is set')
        t.equal(action.role, 'member', 'Then role is set')

        t.end()
    })

    t.end()
})

test('Given Action.fromFirestore for member actions', t => {
    t.test('When deserializing MemberAdded from Firestore Then action is reconstructed', t => {
        const userId = FieldTypes.newUserId()
        const orgId = FieldTypes.newOrganizationId()

        const firestoreData = {
            '@@tagName': 'MemberAdded',
            userId,
            organizationId: orgId,
            displayName: 'Alice Chen',
            role: 'admin',
        }

        const action = Action.fromFirestore(firestoreData)

        t.ok(action, 'Then action is deserialized')
        t.equal(action['@@tagName'], 'MemberAdded', 'Then action type is MemberAdded')
        t.equal(action.userId, userId, 'Then userId is preserved')
        t.equal(action.organizationId, orgId, 'Then organizationId is preserved')
        t.equal(action.displayName, 'Alice Chen', 'Then displayName is preserved')
        t.equal(action.role, 'admin', 'Then role is preserved')

        t.end()
    })

    t.test('When deserializing MemberRemoved from Firestore Then action is reconstructed', t => {
        const userId = FieldTypes.newUserId()
        const orgId = FieldTypes.newOrganizationId()

        const firestoreData = { '@@tagName': 'MemberRemoved', userId, organizationId: orgId }

        const action = Action.fromFirestore(firestoreData)

        t.ok(action, 'Then action is deserialized')
        t.equal(action['@@tagName'], 'MemberRemoved', 'Then action type is MemberRemoved')
        t.equal(action.userId, userId, 'Then userId is preserved')
        t.equal(action.organizationId, orgId, 'Then organizationId is preserved')

        t.end()
    })

    t.test('When deserializing RoleChanged from Firestore Then action is reconstructed', t => {
        const userId = FieldTypes.newUserId()
        const orgId = FieldTypes.newOrganizationId()

        const firestoreData = { '@@tagName': 'RoleChanged', userId, organizationId: orgId, role: 'viewer' }

        const action = Action.fromFirestore(firestoreData)

        t.ok(action, 'Then action is deserialized')
        t.equal(action['@@tagName'], 'RoleChanged', 'Then action type is RoleChanged')
        t.equal(action.userId, userId, 'Then userId is preserved')
        t.equal(action.organizationId, orgId, 'Then organizationId is preserved')
        t.equal(action.role, 'viewer', 'Then role is preserved')

        t.end()
    })

    t.end()
})

test('Given Action.toLog for member actions', t => {
    t.test('When logging MemberAdded action Then PII is redacted', t => {
        const userId = FieldTypes.newUserId()
        const orgId = FieldTypes.newOrganizationId()

        const action = Action.MemberAdded.from({
            userId,
            organizationId: orgId,
            displayName: 'Alice Chen',
            role: 'admin',
        })

        const logged = Action.toLog(action)

        t.ok(logged, 'Then logged output exists')
        t.equal(logged.type, 'MemberAdded', 'Then action type is included')
        t.match(logged.displayName, /displayName: \d+/, 'Then displayName is redacted to length')
        t.equal(logged.role, 'admin', 'Then role is not redacted')

        t.end()
    })

    t.test('When logging MemberRemoved action Then no PII to redact', t => {
        const userId = FieldTypes.newUserId()
        const orgId = FieldTypes.newOrganizationId()

        const action = Action.MemberRemoved.from({ userId, organizationId: orgId })

        const logged = Action.toLog(action)

        t.ok(logged, 'Then logged output exists')
        t.equal(logged.type, 'MemberRemoved', 'Then action type is included')

        t.end()
    })

    t.test('When logging RoleChanged action Then no PII to redact', t => {
        const userId = FieldTypes.newUserId()
        const orgId = FieldTypes.newOrganizationId()

        const action = Action.RoleChanged.from({ userId, organizationId: orgId, role: 'member' })

        const logged = Action.toLog(action)

        t.ok(logged, 'Then logged output exists')
        t.equal(logged.type, 'RoleChanged', 'Then action type is included')
        t.equal(logged.role, 'member', 'Then role is included')

        t.end()
    })

    t.end()
})

test('Given Action.piiFields for member actions', t => {
    t.test('When checking PII fields for MemberAdded Then displayName is marked as PII', t => {
        const rawData = {
            '@@tagName': 'MemberAdded',
            userId: FieldTypes.newUserId(),
            organizationId: FieldTypes.newOrganizationId(),
            displayName: 'Alice Chen',
            role: 'admin',
        }

        const piiFields = Action.piiFields(rawData)

        t.ok(Array.isArray(piiFields), 'Then piiFields returns array')
        t.ok(piiFields.includes('displayName'), 'Then displayName is marked as PII')

        t.end()
    })

    t.test('When checking PII fields for MemberRemoved Then no PII fields exist', t => {
        const rawData = {
            '@@tagName': 'MemberRemoved',
            userId: FieldTypes.newUserId(),
            organizationId: FieldTypes.newOrganizationId(),
        }

        const piiFields = Action.piiFields(rawData)

        t.ok(Array.isArray(piiFields), 'Then piiFields returns array')
        t.equal(piiFields.length, 0, 'Then no PII fields for MemberRemoved')

        t.end()
    })

    t.test('When checking PII fields for RoleChanged Then no PII fields exist', t => {
        const rawData = {
            '@@tagName': 'RoleChanged',
            userId: FieldTypes.newUserId(),
            organizationId: FieldTypes.newOrganizationId(),
            role: 'member',
        }

        const piiFields = Action.piiFields(rawData)

        t.ok(Array.isArray(piiFields), 'Then piiFields returns array')
        t.equal(piiFields.length, 0, 'Then no PII fields for RoleChanged')

        t.end()
    })

    t.end()
})
