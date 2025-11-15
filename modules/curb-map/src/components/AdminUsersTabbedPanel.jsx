// ABOUTME: User management page container component
// ABOUTME: Manages tabs, filters, sorting, and orchestrates the entire user management UI

import { Box, Flex, lookupTablePropType, Select, Tabs, TextField } from '@graffio/design-system'
import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { Member } from '../types/index.js'
import { AdminUsersTable } from './AdminUsersTable.jsx'

/**
 * Role ordering for sorting
 * @sig roleOrder :: { admin: Number, member: Number, viewer: Number }
 */
const roleOrder = { admin: 0, member: 1, viewer: 2 }

/**
 * Toolbar component with search and role filter
 * @sig Toolbar :: ({ String, Handler, String, Handler }) -> JSXElement
 *  Handler = String -> ()
 */
const Toolbar = ({ searchText, onSearchChange, roleFilter, onRoleFilterChange }) => (
    <Flex gap="3" style={{ padding: 'var(--space-3)', backgroundColor: 'var(--gray-2)' }}>
        <TextField.Root
            placeholder="Search by name..."
            value={searchText}
            onChange={e => onSearchChange(e.target.value)}
            style={{ flex: 1, width: '60%' }}
        />
        <Select.Root value={roleFilter} onValueChange={onRoleFilterChange}>
            <Select.Trigger style={{ minWidth: '150px', width: '40%' }} />
            <Select.Content>
                <Select.Item value="all">All Roles</Select.Item>
                <Select.Item value="admin">Admin</Select.Item>
                <Select.Item value="member">Member</Select.Item>
                <Select.Item value="viewer">Viewer</Select.Item>
            </Select.Content>
        </Select.Root>
    </Flex>
)

/**
 * UserManagementPage component - container for user management UI
 * @sig UserManagementPage :: ({ LookupTable, Id, Boolean, Handler }) -> JSXElement
 *  Handler = String -> ()
 */
const AdminUsersTabbedPanel = ({ members, currentUserId, isAdmin, onRoleChange }) => {
    const filterAndSort = () => {
        const filter = member => {
            const matchesSearch = member.displayName.toLowerCase().includes(searchText.toLowerCase())
            const matchesRole = roleFilter === 'all' || member.role === roleFilter
            const matchesTab = currentTab === 'active' ? !member.removedAt : !!member.removedAt
            return matchesSearch && matchesRole && matchesTab
        }

        const sorter = (a, b) => {
            let result = 0

            if (sortBy === 'displayName') result = a.displayName.localeCompare(b.displayName)
            else if (sortBy === 'role') result = roleOrder[a.role] - roleOrder[b.role]
            else if (sortBy === 'removedAt') result = (a.removedAt?.getTime() || 0) - (b.removedAt?.getTime() || 0)

            return sortDirection === 'asc' ? result : -result
        }

        return members.filter(filter).sort(sorter)
    }

    const [currentTab, setCurrentTab] = useState('active')
    const [searchText, setSearchText] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [sortBy, setSortBy] = useState('displayName')
    const [sortDirection, setSortDirection] = useState('asc')

    const dependencies = [members, sortBy, sortDirection, searchText, roleFilter, currentTab]
    const filteredAndSortedMembers = useMemo(filterAndSort, dependencies)

    const handleSort = columnKey => {
        if (sortBy === columnKey) return setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))

        setSortBy(columnKey)
        setSortDirection('asc')
    }

    return (
        <Box>
            <Tabs.Root value={currentTab} onValueChange={setCurrentTab}>
                <Tabs.List>
                    <Tabs.Trigger value="active">Active Users</Tabs.Trigger>
                    {isAdmin && <Tabs.Trigger value="removed">Removed Users</Tabs.Trigger>}
                </Tabs.List>
            </Tabs.Root>

            <Toolbar
                searchText={searchText}
                onSearchChange={setSearchText}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
            />

            <AdminUsersTable
                members={filteredAndSortedMembers}
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

AdminUsersTabbedPanel.propTypes = {
    members: lookupTablePropType.of(Member).isRequired,
    currentUserId: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onRoleChange: PropTypes.func,
}

export { AdminUsersTabbedPanel }
