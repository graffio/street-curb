---
summary: "Task 2: Build UserTable component and mock data"
status: "pending"
depends-on: "task-1-table-component.md"
---

# Task 2: Build UserTable Component

## Goal
Create user-specific table component that wraps the generic Table component with user management columns and role dropdown functionality.

## Prerequisites
- Task 1 complete (Table component exists)

## Location
`/modules/curb-map/src/components/UserTable.jsx`
`/modules/curb-map/stories/UserTable.stories.jsx`
`/modules/curb-map/test/fixtures/mock-members.js` (or similar location for mock data)

## Component Requirements

### Responsibilities
- Wrap generic Table component
- Define columns for active users tab
- Define columns for removed users tab
- Render role dropdown in admin view (Phase 1: non-functional, just UI)
- Resolve "Removed By" userId to display name
- Handle disabled states for role dropdown (own entry, last admin)

### Props API

```javascript
<UserTable
  members={filteredAndSortedArray}  // Array of Member objects (already filtered/sorted)
  currentTab="active"                // "active" | "removed"
  isAdmin={true}                     // Controls role dropdown visibility
  currentUserId="usr_xyz789"         // For determining "own entry"
  onRoleChange={(userId, newRole) => {}}  // Callback (Phase 1: just console.log)
  sortBy="displayName"
  sortDirection="asc"
  onSort={(columnKey) => {}}
/>
```

### Column Definitions

**Active Users Tab:**
```javascript
const activeColumns = [
  {
    key: 'displayName',
    label: 'Display Name',
    sortable: true
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    render: (member) => isAdmin ? (
      <RoleDropdown
        value={member.role}
        disabled={shouldDisable(member)}
        tooltip={getDisabledReason(member)}
        onChange={(newRole) => onRoleChange(member.userId, newRole)}
      />
    ) : member.role
  }
]
```

**Removed Users Tab:**
```javascript
const removedColumns = [
  {
    key: 'displayName',
    label: 'Display Name',
    sortable: true
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true
  },
  {
    key: 'removedAt',
    label: 'Removed At',
    sortable: true,
    render: (member) => formatDate(member.removedAt)  // Date only format
  }
]
```

## RoleDropdown Component

Small inline component (can be in same file or separate):

```javascript
const RoleDropdown = ({ value, disabled, tooltip, onChange }) => {
  const dropdown = (
    <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="admin">Admin</Select.Item>
        <Select.Item value="member">Member</Select.Item>
        <Select.Item value="viewer">Viewer</Select.Item>
      </Select.Content>
    </Select.Root>
  )

  // Wrap in tooltip if disabled
  if (disabled && tooltip) {
    return (
      <Tooltip content={tooltip}>
        {dropdown}
      </Tooltip>
    )
  }

  return dropdown
}
```

## Disabled Logic

```javascript
const isOwnEntry = (member, currentUserId) =>
  member.userId === currentUserId

const shouldDisable = (member) =>
  isOwnEntry(member, currentUserId)

const getDisabledReason = (member) => {
  if (isOwnEntry(member, currentUserId)) {
    return "You cannot change your own role"
  }
  return null
}
```

**Why no "last admin" check?**
The UI prevents having zero admins through a simple rule: admins cannot change their own role. Therefore:
- If current user can see role dropdowns, they must be an admin
- They cannot demote themselves
- At least one admin always remains (the current user)

## Date Formatting

```javascript
const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}
// Example output: "March 15, 2024"
```

## Mock Data Helper

Create `/modules/curb-map/test/fixtures/mock-members.js`:

```javascript
import LookupTable from '@graffio/functional/lookup-table'
import { Member } from '../../type-definitions/member.type.js'

export const generateMockMembers = () => LookupTable([
  Member.from({
    userId: 'usr_alice001',
    displayName: 'Alice Admin',
    role: 'admin',
    addedAt: new Date('2024-01-01'),
    addedBy: 'usr_system00',
    removedAt: null,
    removedBy: null
  }),
  Member.from({
    userId: 'usr_bob00002',
    displayName: 'Bob Member',
    role: 'member',
    addedAt: new Date('2024-01-15'),
    addedBy: 'usr_alice001',
    removedAt: null,
    removedBy: null
  }),
  Member.from({
    userId: 'usr_carol003',
    displayName: 'Carol Viewer',
    role: 'viewer',
    addedAt: new Date('2024-02-01'),
    addedBy: 'usr_alice001',
    removedAt: null,
    removedBy: null
  }),
  Member.from({
    userId: 'usr_dave0004',
    displayName: 'Dave Former-Admin',
    role: 'admin',
    addedAt: new Date('2023-12-01'),
    addedBy: 'usr_system00',
    removedAt: new Date('2024-03-01'),
    removedBy: 'usr_alice001'
  }),
  Member.from({
    userId: 'usr_eve00005',
    displayName: 'Eve Former-Member',
    role: 'member',
    addedAt: new Date('2024-01-20'),
    addedBy: 'usr_alice001',
    removedAt: new Date('2024-02-15'),
    removedBy: 'usr_alice001'
  }),
  Member.from({
    userId: 'usr_frank006',
    displayName: 'Frank Admin',
    role: 'admin',
    addedAt: new Date('2024-02-10'),
    addedBy: 'usr_alice001',
    removedAt: null,
    removedBy: null
  }),
  Member.from({
    userId: 'usr_grace007',
    displayName: 'Grace Member',
    role: 'member',
    addedAt: new Date('2024-02-20'),
    addedBy: 'usr_alice001',
    removedAt: null,
    removedBy: null
  }),
  Member.from({
    userId: 'usr_hank0008',
    displayName: 'Hank Viewer',
    role: 'viewer',
    addedAt: new Date('2024-03-01'),
    addedBy: 'usr_frank006',
    removedAt: null,
    removedBy: null
  }),
  Member.from({
    userId: 'usr_ivy00009',
    displayName: 'Ivy Member',
    role: 'member',
    addedAt: new Date('2024-03-05'),
    addedBy: 'usr_alice001',
    removedAt: null,
    removedBy: null
  }),
  Member.from({
    userId: 'usr_jack0010',
    displayName: 'Jack Forgotten',
    role: 'member',
    addedAt: new Date('2024-01-10'),
    addedBy: 'usr_alice001',
    removedAt: new Date('2024-03-10'),
    removedBy: 'usr_jack0010'  // Self-removal (forgotten)
  }),
], Member, 'userId')
```

**Mock data breakdown:**
- 2 active admins (Alice, Frank)
- 3 active members (Bob, Grace, Ivy)
- 2 active viewers (Carol, Hank)
- 1 removed admin (Dave)
- 1 removed member (Eve)
- 1 forgotten member (Jack - self-removal)

## Storybook Stories

Create `/modules/curb-map/stories/UserTable.stories.jsx`:

### Story 1: Active Users (Admin View)
```javascript
export const ActiveUsersAdmin = {
  args: {
    members: [...generateMockMembers()].filter(m => !m.removedAt),
    currentTab: 'active',
    isAdmin: true,
    currentUserId: 'usr_alice001',
    onRoleChange: (userId, newRole) => console.log(`Change ${userId} to ${newRole}`),
    sortBy: 'displayName',
    sortDirection: 'asc',
    onSort: (column) => console.log(`Sort by ${column}`)
  }
}
```

### Story 2: Active Users (Member View)
```javascript
export const ActiveUsersMember = {
  args: {
    members: [...generateMockMembers()].filter(m => !m.removedAt),
    currentTab: 'active',
    isAdmin: false,
    currentUserId: 'usr_bob00002',
    sortBy: 'displayName',
    sortDirection: 'asc',
  }
}
```

### Story 3: Removed Users (Admin View)
```javascript
export const RemovedUsersAdmin = {
  args: {
    members: [...generateMockMembers()].filter(m => m.removedAt),
    currentTab: 'removed',
    isAdmin: true,
    currentUserId: 'usr_alice001',
    sortBy: 'removedAt',
    sortDirection: 'desc',
    onSort: (column) => console.log(`Sort by ${column}`)
  }
}
```


## Verification via Storybook

Verify in Storybook:
1. Active users table shows displayName and role columns
2. Admin view shows role dropdown, member view shows plain text
3. Removed users table shows 3 columns (displayName, role, removedAt)
4. Date formatting works (shows "March 15, 2024" format)
5. Own entry dropdown is disabled with tooltip explaining why
6. Sorting works on all sortable columns
7. Role dropdown shows all 3 roles (admin/member/viewer)
8. onChange callback fires when role selection changes (check console)

## Definition of Done

- [ ] UserTable component renders both active and removed views
- [ ] Column definitions differ based on currentTab prop
- [ ] Role dropdown appears only in admin view
- [ ] Role dropdown is disabled for own entry with tooltip
- [ ] Date formatting displays date-only format
- [ ] Mock data helper generates 10 members (various roles and states)
- [ ] Storybook has 3 stories covering different scenarios
- [ ] onChange callback fires correctly (visible in console)
- [ ] All verification items confirmed in Storybook
