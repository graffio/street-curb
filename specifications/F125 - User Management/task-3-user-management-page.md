---
summary: "Task 3: Build UserManagementPage container component"
status: "pending"
depends-on: "task-2-user-table.md"
---

# Task 3: Build UserManagementPage Component

## Goal
Create the container component that manages tabs, filters, sorting, and orchestrates the entire user management UI.

## Prerequisites
- Task 1 complete (Table component exists)
- Task 2 complete (UserTable component exists)

## Location
`/modules/curb-map/src/components/UserManagementPage.jsx`
`/modules/curb-map/stories/UserManagementPage.stories.jsx`

## Component Requirements

### Responsibilities
- Manage tab state (active/removed)
- Manage filter state (search text, role filter)
- Manage sort state (column, direction)
- Filter members based on search + role + tab
- Sort filtered members
- Render toolbar with search and role filter
- Render tabs (if admin)
- Render UserTable with filtered/sorted data

### Props API

```javascript
<UserManagementPage
  members={membersLookupTable}  // LookupTable of Member objects (all members)
  currentUserId="usr_xyz789"    // For determining "own entry"
  isAdmin={true}                // Controls tabs and actions
  onRoleChange={(userId, newRole) => {}}  // Phase 1: console.log
/>
```

### State Management

```javascript
const [currentTab, setCurrentTab] = useState('active')  // 'active' | 'removed'
const [searchText, setSearchText] = useState('')
const [roleFilter, setRoleFilter] = useState('all')     // 'all' | 'admin' | 'member' | 'viewer'
const [sortBy, setSortBy] = useState('displayName')
const [sortDirection, setSortDirection] = useState('asc')  // 'asc' | 'desc'
```

## Filtering Logic

```javascript
const filteredMembers = useMemo(() => {
  return members.filter(member => {
    // Text search on display name (case-insensitive)
    const matchesSearch = member.displayName
      .toLowerCase()
      .includes(searchText.toLowerCase())

    // Role dropdown filter
    const matchesRole = roleFilter === 'all' || member.role === roleFilter

    // Tab filter (active vs removed)
    const matchesTab = currentTab === 'active'
      ? !member.removedAt
      : !!member.removedAt

    return matchesSearch && matchesRole && matchesTab
  })
}, [members, searchText, roleFilter, currentTab])
```

## Sorting Logic

```javascript
const roleOrder = { admin: 0, member: 1, viewer: 2 }

const sortedMembers = useMemo(() => {
  const sorted = [...filteredMembers].sort((a, b) => {
    let result = 0

    if (sortBy === 'displayName') {
      result = a.displayName.localeCompare(b.displayName)
    } else if (sortBy === 'role') {
      result = roleOrder[a.role] - roleOrder[b.role]
    } else if (sortBy === 'removedAt') {
      result = (a.removedAt?.getTime() || 0) - (b.removedAt?.getTime() || 0)
    }

    return sortDirection === 'asc' ? result : -result
  })

  return sorted
}, [filteredMembers, sortBy, sortDirection])
```

## Sort Handler

```javascript
const handleSort = (columnKey) => {
  if (sortBy === columnKey) {
    // Toggle direction if already sorting by this column
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  } else {
    // New column: sort ascending
    setSortBy(columnKey)
    setSortDirection('asc')
  }
}
```

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Tabs: [Active Users] [Removed Users]  (admin only)     │
├─────────────────────────────────────────────────────────┤
│ Toolbar:                                                │
│   Search: [_____________]  Role: [All ▼]               │
├─────────────────────────────────────────────────────────┤
│ UserTable                                               │
│   [Display Name ↑] [Role]                              │
│   Alice Admin      [Admin ▼]                           │
│   Bob Member       [Member ▼]                          │
│   ...                                                   │
└─────────────────────────────────────────────────────────┘
```

## Toolbar Component

Can be inline or separate component:

```javascript
const Toolbar = ({ searchText, onSearchChange, roleFilter, onRoleFilterChange }) => (
  <Flex gap="3" style={{ padding: 'var(--space-3)', backgroundColor: 'var(--gray-2)' }}>
    <TextField
      placeholder="Search by name..."
      value={searchText}
      onChange={(e) => onSearchChange(e.target.value)}
      style={{ flex: 1, maxWidth: '300px' }}
    />
    <Select.Root value={roleFilter} onValueChange={onRoleFilterChange}>
      <Select.Trigger style={{ minWidth: '150px' }} />
      <Select.Content>
        <Select.Item value="all">All Roles</Select.Item>
        <Select.Item value="admin">Admin</Select.Item>
        <Select.Item value="member">Member</Select.Item>
        <Select.Item value="viewer">Viewer</Select.Item>
      </Select.Content>
    </Select.Root>
  </Flex>
)
```

## Tab Rendering

```javascript
// Admin view: show tabs
{isAdmin ? (
  <Tabs.Root value={currentTab} onValueChange={setCurrentTab}>
    <Tabs.List>
      <Tabs.Trigger value="active">Active Users</Tabs.Trigger>
      <Tabs.Trigger value="removed">Removed Users</Tabs.Trigger>
    </Tabs.List>
  </Tabs.Root>
) : (
  // Member view: just a heading
  <Heading size="6">Users</Heading>
)}
```

## Complete Component Structure

```javascript
const UserManagementPage = ({ members, currentUserId, isAdmin, onRoleChange }) => {
  // State
  const [currentTab, setCurrentTab] = useState('active')
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('displayName')
  const [sortDirection, setSortDirection] = useState('asc')

  // Filtering
  const filteredMembers = useMemo(() => { /* ... */ }, [members, searchText, roleFilter, currentTab])

  // Sorting
  const sortedMembers = useMemo(() => { /* ... */ }, [filteredMembers, sortBy, sortDirection])

  // Handlers
  const handleSort = (columnKey) => { /* ... */ }

  return (
    <Box>
      {/* Tabs (admin) or Heading (member) */}
      {isAdmin ? (
        <Tabs.Root value={currentTab} onValueChange={setCurrentTab}>
          <Tabs.List>
            <Tabs.Trigger value="active">Active Users</Tabs.Trigger>
            <Tabs.Trigger value="removed">Removed Users</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      ) : (
        <Heading size="6" style={{ padding: 'var(--space-3)' }}>Users</Heading>
      )}

      {/* Toolbar */}
      <Toolbar
        searchText={searchText}
        onSearchChange={setSearchText}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      {/* Table */}
      <UserTable
        members={sortedMembers}
        currentTab={currentTab}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        onRoleChange={onRoleChange}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </Box>
  )
}
```

## Storybook Stories

Create `/modules/curb-map/stories/UserManagementPage.stories.jsx`:

### Story 1: Admin View
```javascript
import { generateMockMembers } from '../test/fixtures/mock-members.js'

export const AdminView = {
  args: {
    members: generateMockMembers(),
    currentUserId: 'usr_alice001',
    isAdmin: true,
    onRoleChange: (userId, newRole) =>
      console.log(`Role change requested: ${userId} -> ${newRole}`)
  }
}
```

### Story 2: Member View
```javascript
export const MemberView = {
  args: {
    members: generateMockMembers(),
    currentUserId: 'usr_bob00002',
    isAdmin: false,
    onRoleChange: undefined  // Members can't change roles
  }
}
```

### Story 3: Empty State
```javascript
const emptyMembers = LookupTable([], Member, 'userId')

export const EmptyState = {
  args: {
    members: emptyMembers,
    currentUserId: 'usr_alice001',
    isAdmin: true,
  }
}
```


## Verification via Storybook

Verify in Storybook:

### Tab Functionality
1. Admin view shows two tabs: "Active Users" and "Removed Users"
2. Member view shows only "Users" heading, no tabs
3. Clicking tabs switches between active and removed views
4. Active tab shows only members with removedAt = null
5. Removed tab shows only members with removedAt != null

### Search Filter
6. Typing in search box filters by display name (case-insensitive)
7. Search works on both active and removed tabs
8. Empty search shows all members (for current tab)

### Role Filter
9. Role filter defaults to "All Roles"
10. Selecting "Admin" shows only admins
11. Selecting "Member" shows only members
12. Selecting "Viewer" shows only viewers
13. Role filter works on both tabs

### Combined Filters
14. Search + role filter work together (AND logic)
15. Switching tabs maintains search and role filter values

### Sorting
16. Clicking "Display Name" header sorts alphabetically
17. Clicking again reverses sort direction
18. Clicking "Role" header sorts by admin > member > viewer
19. Clicking "Removed At" header sorts by date (removed tab only)
20. Sort direction indicator shows in header (↑ or ↓)

### Role Change
21. Clicking role dropdown shows 3 options
22. Selecting new role logs to console
23. Own entry dropdown is disabled with tooltip
24. Other user dropdowns are enabled

### Edge Cases
25. Empty state shows empty table (not error)
26. Filtering to no results shows empty table
27. All filters can be cleared/reset

## Definition of Done

- [ ] UserManagementPage component renders
- [ ] Admin view shows two tabs, member view shows heading only
- [ ] Tabs switch between active and removed members
- [ ] Search filter works on display name (case-insensitive)
- [ ] Role filter works on all/admin/member/viewer
- [ ] Filters combine correctly (search AND role AND tab)
- [ ] Sorting works on all sortable columns
- [ ] Sort direction toggles correctly
- [ ] Role change dropdown logs to console when changed
- [ ] Toolbar appears above table
- [ ] Storybook has 3 stories covering different scenarios
- [ ] All verification items confirmed in Storybook
