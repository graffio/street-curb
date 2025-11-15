// ABOUTME: Storybook stories for UserManagementPage component
// ABOUTME: Demonstrates admin view, member view, and empty state

import { LookupTable } from '@graffio/functional'
import { generateMockMembers } from '../../test/fixtures/mock-members.js'
import { AdminUsersTabbedPanel } from '../components/AdminUsersTabbedPanel.jsx'
import { Member } from '../types/member.js'

export default { title: 'AdminUsersTabbedPanel', component: AdminUsersTabbedPanel }

// Story 1: Admin View
export const AdminView = {
    args: {
        members: generateMockMembers(),
        currentUserId: 'usr_alice0000001',
        isAdmin: true,
        onRoleChange: (userId, newRole) => console.log(`Role change requested: ${userId} -> ${newRole}`),
    },
}

// Story 2: Member View
export const MemberView = {
    args: { members: generateMockMembers(), currentUserId: 'usr_bob00000002', isAdmin: false, onRoleChange: undefined },
}

// Story 3: Empty State
const emptyMembers = LookupTable([], Member, 'userId')

export const EmptyState = {
    args: {
        members: emptyMembers,
        currentUserId: 'usr_alice0000001',
        isAdmin: true,
        onRoleChange: (userId, newRole) => console.log(`Role change requested: ${userId} -> ${newRole}`),
    },
}
