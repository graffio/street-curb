// ABOUTME: Mock authentication data for Storybook and testing
// ABOUTME: Provides minimal User and Organization fixtures

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Member, Organization, OrganizationMember, User } from '../types/index.js'

const organizationId = 'org_story0000001'
const aliceId = 'usr_alice0000000'
const date = new Date('2024-01-01')

/**
 * Mock user for stories and tests
 * @sig mockUser :: User
 */
export const mockUser = User.from({
    id: 'usr_alice0000000',
    email: 'usr_alice0000000@example.com',
    displayName: 'Alice Aardvark',
    organizations: LookupTable([OrganizationMember(organizationId, 'admin')], OrganizationMember, 'organizationId'),
    createdAt: date,
    createdBy: aliceId,
    updatedAt: date,
    updatedBy: aliceId,
})

const aliceMember = Member.from({
    userId: 'usr_alice0000000',
    displayName: 'Alice Aardvark',
    role: 'admin',
    addedAt: date,
    addedBy: 'usr_system000000',
})

/**
 * Mock organization for stories and tests
 * @sig mockOrganization :: Organization
 */
export const mockOrganization = Organization.from({
    id: 'org_story00000001',
    projectId: 'test-project',
    name: 'Storybook Org',
    status: 'active',
    members: LookupTable([aliceMember], Member, 'userId'),
    defaultProjectId: 'prj_story0000001',
    createdAt: date,
    createdBy: aliceId,
    updatedAt: date,
    updatedBy: aliceId,
})
