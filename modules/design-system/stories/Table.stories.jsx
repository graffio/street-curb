// ABOUTME: Storybook stories for Table component
// ABOUTME: Demonstrates controlled component pattern with sortable headers

import { Member } from '@graffio/curb-map/src/types/index.js'
import { LookupTable } from '@graffio/functional'
import { useMemo, useState } from 'react'
import { Badge, Button, Table } from '../src/index.js'

export default { title: 'Table', component: Table }

// Story 1: Basic Sortable Table
const BasicTableComponent = () => {
    const [sortBy, setSortBy] = useState('displayName')
    const [sortDirection, setSortDirection] = useState('asc')

    const data = LookupTable(
        [
            Member.from({
                userId: 'usr_alice0000001',
                displayName: 'Alice',
                role: 'admin',
                addedAt: new Date('2024-01-01'),
                addedBy: 'usr_system000000',
            }),
            Member.from({
                userId: 'usr_bob000000002',
                displayName: 'Bob',
                role: 'member',
                addedAt: new Date('2024-01-02'),
                addedBy: 'usr_system000000',
            }),
            Member.from({
                userId: 'usr_carol0000003',
                displayName: 'Carol',
                role: 'viewer',
                addedAt: new Date('2024-01-03'),
                addedBy: 'usr_system000000',
            }),
            Member.from({
                userId: 'usr_dave00000004',
                displayName: 'Dave',
                role: 'member',
                addedAt: new Date('2024-01-04'),
                addedBy: 'usr_system000000',
            }),
            Member.from({
                userId: 'usr_eve000000005',
                displayName: 'Eve',
                role: 'admin',
                addedAt: new Date('2024-01-05'),
                addedBy: 'usr_system000000',
            }),
        ],
        Member,
        'userId',
    )

    const columns = [
        { key: 'displayName', label: 'Name', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
    ]

    const handleSort = columnKey => {
        if (sortBy === columnKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortBy(columnKey)
            setSortDirection('asc')
        }
    }

    const sortedData = useMemo(
        () =>
            // LookupTable.sort() returns a new LookupTable
            data.sort((a, b) => {
                const aVal = a[sortBy]
                const bVal = b[sortBy]
                const result = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
                return sortDirection === 'asc' ? result : -result
            }),
        [data, sortBy, sortDirection],
    )

    return (
        <Table
            columnDescriptors={columns}
            lookupTable={sortedData}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
        />
    )
}

export const Basic = () => <BasicTableComponent />

// Story 2: Custom Cell Rendering
const CustomRenderingComponent = () => {
    const [sortBy, setSortBy] = useState('displayName')
    const [sortDirection, setSortDirection] = useState('asc')

    // prettier-ignore
    const data = LookupTable(
        [
            Member.from({ userId: 'usr_alice0000001', displayName: 'Alice', role: 'admin',  addedAt: new Date('2024-01-01'), addedBy: 'usr_system000000', }),
            Member.from({ userId: 'usr_bob000000002', displayName: 'Bob',   role: 'member', addedAt: new Date('2024-01-02'), addedBy: 'usr_system000000', removedAt: new Date('2024-03-01'), removedBy: 'usr_alice0000001', }),
            Member.from({ userId: 'usr_carol0000003', displayName: 'Carol', role: 'viewer', addedAt: new Date('2024-01-03'), addedBy: 'usr_system000000', }),
            Member.from({ userId: 'usr_dave00000004', displayName: 'Dave',  role: 'member', addedAt: new Date('2024-01-04'), addedBy: 'usr_system000000', removedAt: new Date('2024-02-15'), removedBy: 'usr_alice0000001', }),
            Member.from({ userId: 'usr_eve000000005', displayName: 'Eve',   role: 'admin',  addedAt: new Date('2024-01-05'), addedBy: 'usr_system000000', }),
        ],
        Member,
        'userId',
    )

    const columns = [
        { key: 'displayName', label: 'Name', sortable: true },
        {
            key: 'status',
            label: 'Status',
            render: row => (
                <Badge color={row.removedAt ? 'gray' : 'green'}>{row.removedAt ? 'inactive' : 'active'}</Badge>
            ),
            sortable: true,
        },
        { key: 'actions', label: 'Actions', render: () => <Button size="1">Edit</Button> },
    ]

    const handleSort = columnKey => {
        // same column as last time; reverse direction
        if (sortBy === columnKey) return setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))

        setSortBy(columnKey)
        setSortDirection('asc')
    }

    const defaultSortBy = (a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        const result = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
        return sortDirection === 'asc' ? result : -result
    }

    const statusSortBy = (a, b) => {
        const sortRemovedFirst = () => {
            if (a.removedAt && !b.removedAt) return -1
            if (b.removedAt && !a.removedAt) return 1
            return a.displayName.localeCompare(b.displayName)
        }

        return sortDirection === 'asc' ? sortRemovedFirst() : -sortRemovedFirst()
    }

    const sortedData = data ? data.sort(sortBy === 'status' ? statusSortBy : defaultSortBy) : []

    return (
        <Table
            columnDescriptors={columns}
            lookupTable={sortedData}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
        />
    )
}

export const CustomRendering = () => <CustomRenderingComponent />

// Story 3: Large Dataset
const LargeDatasetComponent = () => {
    const [sortBy, setSortBy] = useState('displayName')
    const [sortDirection, setSortDirection] = useState('asc')

    const data = useMemo(() => {
        const items = []
        const roles = ['admin', 'member', 'viewer']
        for (let i = 1; i <= 100; i++)
            items.push(
                Member.from({
                    userId: `usr_person${String(i).padStart(6, '0')}`,
                    displayName: `Person ${i}`,
                    role: roles[Math.floor(Math.random() * 3)],
                    addedAt: new Date(2024, 0, Math.floor(Math.random() * 28) + 1),
                    addedBy: 'usr_system000000',
                }),
            )

        return LookupTable(items, Member, 'userId')
    }, [])

    const columns = [
        { key: 'displayName', label: 'Name', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
    ]

    const handleSort = columnKey => {
        if (sortBy === columnKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortBy(columnKey)
            setSortDirection('asc')
        }
    }

    const sortedData = useMemo(
        () =>
            data.sort((a, b) => {
                const aVal = a[sortBy]
                const bVal = b[sortBy]
                const result = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
                return sortDirection === 'asc' ? result : -result
            }),
        [data, sortBy, sortDirection],
    )

    return (
        <Table
            columnDescriptors={columns}
            lookupTable={sortedData}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
        />
    )
}

export const LargeDataset = () => <LargeDatasetComponent />
