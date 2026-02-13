// ABOUTME: User-specific table component with role management
// ABOUTME: Renders member data with role dropdown for admins and date formatting
// COMPLEXITY: cohesion-structure — curb-map is mothballed; standalone helpers are clear in context
// COMPLEXITY: line-length — curb-map is mothballed; existing formatting preserved
// COMPLEXITY: react-component-cohesion — curb-map is mothballed; render helper shares component state
// COMPLEXITY: sig-documentation — curb-map is mothballed; JSDoc already present

import { Select, Tooltip } from '@radix-ui/themes'
import { lookupTablePropType } from '../prop-types/lookup-table-prop-type.js'
import { Table } from './Table.jsx'
import PropTypes from 'prop-types'
import { Member } from '../types/index.js'

/**
 * Format date to display format (e.g., "March 15, 2024")
 * @sig formatDate :: Date -> String
 */
const monthDayYearFormat = { year: 'numeric', month: 'long', day: 'numeric' }
const formatDate = date => (date ? new Intl.DateTimeFormat('en-US', monthDayYearFormat).format(date) : '')

/**
 * Role dropdown component with disabled state and tooltip
 * @sig RoleDropdown :: { String, Boolean, String?, Handler })
 *  Handler = Role -> ()
 */
const RoleDropdown = ({ value, disabled, tooltip, onChange }) => {
    const trigger = <Select.Trigger style={{ minWidth: '120px' }} />

    return (
        <Select.Root value={value} onValueChange={onChange} disabled={disabled} size="1">
            {disabled && tooltip ? <Tooltip content={tooltip}>{trigger}</Tooltip> : trigger}
            <Select.Content>
                <Select.Item value="admin">Admin</Select.Item>
                <Select.Item value="member">Member</Select.Item>
                <Select.Item value="viewer">Viewer</Select.Item>
            </Select.Content>
        </Select.Root>
    )
}

/**
 * Check if member is the current user
 * @sig isOwnEntry :: (Member, Id) -> Boolean
 */
const isOwnEntry = (member, currentUserId) => member.userId === currentUserId

/**
 * UserTable component - displays member data with role management for admins
 * @sig UserTable :: ({ members, currentTab, isAdmin, currentUserId, onRoleChange, sortBy, sortDirection, onSort }) -> JSXElement
 */
const AdminUsersTable = ({
    members,
    currentTab,
    isAdmin,
    currentUserId,
    onRoleChange,
    sortBy,
    sortDirection,
    onSort,
}) => {
    const renderRoleDropdown = member => (
        <RoleDropdown
            value={member.role}
            disabled={isOwnEntry(member, currentUserId)}
            tooltip={isOwnEntry(member, currentUserId) ? 'You cannot change your own role' : null}
            onChange={newRole => onRoleChange(member.userId, newRole)}
        />
    )

    // prettier-ignore
    const removedTabColumns = [
        { key: 'displayName', label: 'Name',       width: '40%', sortable: true },
        { key: 'role',        label: 'Role',       width: '30%', sortable: true },
        { key: 'removedAt',   label: 'Removed At', width: '30%', sortable: true, render: m => formatDate(m.removedAt) },
    ]

    // prettier-ignore
    const activeTabColumns = [
        { key: 'displayName', label: 'Name', width: '60%', sortable: true },
        { key: 'role',        label: 'Role', width: '40%', sortable: true, render: m => (isAdmin ? renderRoleDropdown(m) : m.role) },
    ]

    const columns = currentTab === 'active' ? activeTabColumns : removedTabColumns

    return (
        <Table
            columnDescriptors={columns}
            lookupTable={members}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={onSort}
        />
    )
}

AdminUsersTable.propTypes = {
    members: lookupTablePropType.of(Member).isRequired,
    currentTab: PropTypes.oneOf(['active', 'removed']).isRequired,
    isAdmin: PropTypes.bool.isRequired,
    currentUserId: PropTypes.string.isRequired,
    onRoleChange: PropTypes.func,
    sortBy: PropTypes.string,
    sortDirection: PropTypes.oneOf(['asc', 'desc']),
    onSort: PropTypes.func,
}

export { AdminUsersTable }
