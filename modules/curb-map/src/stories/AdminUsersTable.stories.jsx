// ABOUTME: Storybook stories for UserTable component
// ABOUTME: Demonstrates admin and member views with role management and date formatting

import { useMemo, useState } from 'react'
import { generateMockMembers } from '../../test/fixtures/mock-members.js'
import { AdminUsersTable } from '../components/AdminUsersTable.jsx'

export default { title: 'AdminUsersTable', component: AdminUsersTable }

// Story 1: Active Users (Admin View)
const ActiveUsersAdminComponent = () => {
    const [sortBy, setSortBy] = useState('displayName')
    const [sortDirection, setSortDirection] = useState('asc')

    const allMembers = generateMockMembers()
    const activeMembers = allMembers.filter(m => !m.removedAt)

    const handleSort = columnKey => {
        if (sortBy === columnKey) return setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))

        setSortBy(columnKey)
        setSortDirection('asc')
    }

    const handleRoleChange = (userId, newRole) => {
        console.log(`Change ${userId} to ${newRole}`)
    }

    const sortedMembers = useMemo(
        () =>
            activeMembers.sort((a, b) => {
                const aVal = a[sortBy]
                const bVal = b[sortBy]
                const result = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
                return sortDirection === 'asc' ? result : -result
            }),
        [activeMembers, sortBy, sortDirection],
    )

    return (
        <AdminUsersTable
            members={sortedMembers}
            currentTab="active"
            isAdmin={true}
            currentUserId="usr_alice0000001"
            onRoleChange={handleRoleChange}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
        />
    )
}

export const ActiveUsersAdmin = () => <ActiveUsersAdminComponent />

// Story 2: Active Users (Member View)
const ActiveUsersMemberComponent = () => {
    const [sortBy, setSortBy] = useState('displayName')
    const [sortDirection, setSortDirection] = useState('asc')

    const allMembers = generateMockMembers()
    const activeMembers = allMembers.filter(m => !m.removedAt)

    const handleSort = columnKey => {
        if (sortBy === columnKey) return setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))

        setSortBy(columnKey)
        setSortDirection('asc')
    }

    const sortedMembers = useMemo(
        () =>
            activeMembers.sort((a, b) => {
                const aVal = a[sortBy]
                const bVal = b[sortBy]
                const result = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
                return sortDirection === 'asc' ? result : -result
            }),
        [activeMembers, sortBy, sortDirection],
    )

    return (
        <AdminUsersTable
            members={sortedMembers}
            currentTab="active"
            isAdmin={false}
            currentUserId="usr_bob00000002"
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
        />
    )
}

export const ActiveUsersMember = () => <ActiveUsersMemberComponent />

// Story 3: Removed Users (Admin View)
const RemovedUsersAdminComponent = () => {
    const [sortBy, setSortBy] = useState('removedAt')
    const [sortDirection, setSortDirection] = useState('desc')

    const allMembers = generateMockMembers()
    const removedMembers = allMembers.filter(m => m.removedAt)

    const handleSort = columnKey => {
        if (sortBy === columnKey) return setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))

        setSortBy(columnKey)
        setSortDirection('asc')
    }

    const sortedMembers = useMemo(
        () =>
            removedMembers.sort((a, b) => {
                const aVal = a[sortBy]
                const bVal = b[sortBy]
                if (!aVal || !bVal) return 0
                const result = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
                return sortDirection === 'asc' ? result : -result
            }),
        [removedMembers, sortBy, sortDirection],
    )

    return (
        <AdminUsersTable
            members={sortedMembers}
            currentTab="removed"
            isAdmin={true}
            currentUserId="usr_alice0000001"
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
        />
    )
}

export const RemovedUsersAdmin = () => <RemovedUsersAdminComponent />
