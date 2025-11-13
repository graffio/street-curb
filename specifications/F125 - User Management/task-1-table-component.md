---
summary: "Task 1: Build generic Table component in design-system"
status: "pending"
---

# Task 1: Build Generic Table Component

## Goal
Create a thin wrapper around Radix Themes Table that adds sortable column headers. This is a controlled component - parent manages sort state and data sorting.

## Location
`/modules/design-system/src/components/Table.jsx`
`/modules/design-system/stories/Table.stories.jsx`

## Architecture

**Controlled Component Pattern:**
- Parent component maintains sort state (`sortBy`, `sortDirection`)
- Parent component sorts the data before passing to Table
- Table displays data as-is (already sorted)
- Table shows sort indicators based on props
- When user clicks header, Table calls `onSort(columnKey)` callback
- Parent handles callback, updates state, re-renders with new sorted data

**Built on Radix Themes:**
- Uses Radix Table primitives: `Table.Root`, `Table.Header`, `Table.Row`, `Table.ColumnHeaderCell`, `Table.Body`, `Table.Cell`
- Adds clickable header behavior for sorting
- Adds sort indicators (↑/↓)
- Does NOT use TanStack Table (overkill for our needs)

## Component Requirements

### Responsibilities
- Render table structure using Radix Table primitives
- Display sort indicators in column headers
- Make sortable headers clickable
- Support custom cell rendering via `render` functions
- Does NOT maintain sort state internally
- Does NOT sort data
- Does NOT handle filtering or data fetching

### Props API

```javascript
<Table
    columns={[
        { key: 'name', label: 'Name', sortable: true },
        { key: 'age', label: 'Age', sortable: true, width: '100px', align: 'right' },
        { key: 'actions', label: 'Actions', render: (row) => <Button>Edit</Button> }
    ]}
    data={lookupTablePropType}         // MUST be a LookupTable (already sorted by parent)
    sortBy="name"              // Current sort column (controlled by parent)
    sortDirection="asc"        // Current sort direction: 'asc' | 'desc' (controlled by parent)
    onSort={(columnKey) => {}} // Callback when user clicks sortable header
/>
```

**All props are controlled by parent except `columns` and `data`:**
- `data` - MUST be a LookupTable (validated via PropTypes)
- `sortBy` tells Table which column is currently sorted (shows indicator)
- `sortDirection` tells Table which direction (shows ↑ or ↓)
- `onSort` callback lets parent update its state when user clicks header

### Column Configuration

Each column object supports:

- `key` (required): string - field name to access in data objects
- `label` (required): string - display text for header
- `sortable` (optional): boolean - whether column can be sorted (default: false)
- `render` (optional): function - custom cell rendering `(rowData) => ReactNode`
  - If not provided, displays `rowData[key]` as plain text
- `width` (optional): string - fixed width for column (e.g., "100px", "10%")
- `align` (optional): "left" | "center" | "right" - text alignment (Radix Table prop)

### Sorting Behavior

**Controlled pattern - Table does NOT sort data:**
- Parent sorts data and passes sorted array
- Parent maintains `sortBy` and `sortDirection` state
- Table displays data as-is
- Table shows sort indicators based on props

**When user clicks sortable column header:**
1. Table calls `onSort(columnKey)`
2. Parent receives callback
3. Parent updates its state (sortBy, sortDirection)
4. Parent re-sorts data
5. Parent re-renders Table with new props

**Sort indicator display:**
- If `sortBy === column.key` and `sortDirection === 'asc'`: Show ↑
- If `sortBy === column.key` and `sortDirection === 'desc'`: Show ↓
- Otherwise: No indicator

**Example parent logic:**
```javascript
const [sortBy, setSortBy] = useState('name')
const [sortDirection, setSortDirection] = useState('asc')

const handleSort = (columnKey) => {
  if (sortBy === columnKey) {
    // Toggle direction
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  } else {
    // New column: sort ascending
    setSortBy(columnKey)
    setSortDirection('asc')
  }
}

const sortedData = useMemo(() => {
  // Parent does the sorting logic here
  return [...data].sort((a, b) => {
    // Custom sort logic based on sortBy and sortDirection
  })
}, [data, sortBy, sortDirection])

<Table
  data={sortedData}
  sortBy={sortBy}
  sortDirection={sortDirection}
  onSort={handleSort}
  columns={columns}
/>
```

## Styling Approach

**Use Radix Themes Table primitives:**
- `Table.Root` - Main container
- `Table.Header` - Header section
- `Table.Row` - Table rows
- `Table.ColumnHeaderCell` - Header cells (clickable for sort)
- `Table.Body` - Body section
- `Table.Cell` - Data cells

**Minimal custom styling:**
- Use Radix's default table styling
- Add cursor: pointer to sortable headers
- Add sort indicator (↑/↓) inline with header text
- Use Radix tokens where needed: `var(--space-2)`, `var(--gray-11)`
- No Vanilla Extract - inline styles or style prop only

**Example structure:**
```jsx
<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.ColumnHeaderCell
        style={{ cursor: sortable ? 'pointer' : 'default' }}
        onClick={handleHeaderClick}
      >
        Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
      </Table.ColumnHeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {data.map(row => (
      <Table.Row key={row.id}>
        <Table.Cell>{row.name}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table.Root>
```

## PropTypes Validator for LookupTable

Create `/modules/design-system/src/prop-types/lookup-table-prop-type.js`:

```javascript
import LookupTable from '@graffio/functional/lookup-table'

/**
 * PropTypes validator for LookupTable
 * @sig lookupTablePropType :: (Props, String, String) -> Error?
 */
export const lookupTablePropType = (props, propName, componentName) => {
  const value = props[propName]

  if (value == null) {
    return null // Allow null/undefined if not required
  }

  if (!LookupTable.is(value)) {
    return new Error(
      `Invalid prop \`${propName}\` supplied to \`${componentName}\`. ` +
      `Expected a LookupTable, but received ${typeof value}.`
    )
  }

  return null
}

/**
 * Required LookupTable validator
 */
lookupTablePropType.isRequired = (props, propName, componentName) => {
  const value = props[propName]

  if (value == null) {
    return new Error(
      `Required prop \`${propName}\` was not supplied to \`${componentName}\`.`
    )
  }

  return lookupTablePropType(props, propName, componentName)
}
```

Usage in Table component:
```javascript
import PropTypes from 'prop-types'
import { lookupTablePropType } from '../prop-types/lookup-table-prop-type.js'

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
    render: PropTypes.func,
    width: PropTypes.string,
    align: PropTypes.oneOf(['left', 'center', 'right'])
  })).isRequired,
  data: lookupTablePropType.isRequired,
  sortBy: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  onSort: PropTypes.func
}
```

## Export from Design System

Update `/modules/design-system/src/index.js`:

```javascript
import { Table } from './components/Table.jsx'
import { lookupTablePropType } from './prop-types/lookup-table-prop-type.js'

export {
  // ... existing exports
  Table,
  lookupTablePropType, // Export for use in other components
}
```

## Storybook Stories

Create `/modules/design-system/stories/Table.stories.jsx` with examples showing controlled parent pattern:

### Story 1: Basic Sortable Table
```javascript
import { useState, useMemo } from 'react'
import { Table } from '../src/index.js'
import LookupTable from '@graffio/functional/lookup-table'

// Define a simple type for the story
const Person = { name: 'Person', kind: 'tagged', fields: {} }

const BasicTable = () => {
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  const data = LookupTable([
    { id: '1', name: 'Alice', age: 30, city: 'NYC' },
    { id: '2', name: 'Bob', age: 25, city: 'SF' },
    { id: '3', name: 'Carol', age: 35, city: 'LA' },
  ], Person, 'id')

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'age', label: 'Age', sortable: true, width: '80px', align: 'right' },
    { key: 'city', label: 'City', sortable: true },
  ]

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(columnKey)
      setSortDirection('asc')
    }
  }

  const sortedData = useMemo(() => {
    // LookupTable.sort() returns a new LookupTable
    return data.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      const result = typeof aVal === 'string'
        ? aVal.localeCompare(bVal)
        : aVal - bVal
      return sortDirection === 'asc' ? result : -result
    })
  }, [data, sortBy, sortDirection])

  return (
    <Table
      columns={columns}
      data={sortedData}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={handleSort}
    />
  )
}

export const Basic = () => <BasicTable />
```

### Story 2: Custom Cell Rendering
```javascript
const StatusPerson = { name: 'StatusPerson', kind: 'tagged', fields: {} }

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <Badge color={row.status === 'active' ? 'green' : 'gray'}>
        {row.status}
      </Badge>
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (row) => <Button size="1">Edit</Button>
  }
]

const data = LookupTable([
  { id: '1', name: 'Alice', status: 'active' },
  { id: '2', name: 'Bob', status: 'inactive' },
], StatusPerson, 'id')

// ... wrap in controlled parent like Story 1
```

### Story 3: Large Dataset
Table with 100+ rows (as LookupTable) to verify performance and scrolling.

## Verification via Storybook

Use Storybook for manual verification during development:
1. Clicking sortable headers calls onSort with correct column key (check console)
2. Sort indicator (↑/↓) displays correctly based on sortBy/sortDirection props
3. Custom rendering works via `render` functions
4. Column width/alignment props work
5. Non-sortable columns don't show cursor pointer or indicator
6. Table displays data in the order passed (doesn't re-sort)
7. ARIA attributes are present on column headers (check with dev tools)

## Implementation Notes

**Component structure:**
```javascript
import { Table as RadixTable } from '@radix-ui/themes'

const Table = ({ columns, data, sortBy, sortDirection, onSort }) => {
  const handleHeaderClick = (column) => {
    if (column.sortable && onSort) {
      onSort(column.key)
    }
  }

  const getSortIndicator = (columnKey) => {
    if (sortBy !== columnKey) return null
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  const getAriaSort = (columnKey) => {
    if (!column.sortable) return undefined
    if (sortBy !== columnKey) return 'none'
    return sortDirection === 'asc' ? 'ascending' : 'descending'
  }

  return (
    <RadixTable.Root>
      <RadixTable.Header>
        <RadixTable.Row>
          {columns.map(column => (
            <RadixTable.ColumnHeaderCell
              key={column.key}
              style={{
                cursor: column.sortable ? 'pointer' : 'default',
                width: column.width
              }}
              align={column.align}
              onClick={() => handleHeaderClick(column)}
              aria-sort={getAriaSort(column.key)}
            >
              {column.label}{getSortIndicator(column.key)}
            </RadixTable.ColumnHeaderCell>
          ))}
        </RadixTable.Row>
      </RadixTable.Header>
      <RadixTable.Body>
        {data.map((row, idx) => (
          <RadixTable.Row key={row.id || idx}>
            {columns.map(column => (
              <RadixTable.Cell
                key={column.key}
                align={column.align}
              >
                {column.render ? column.render(row) : row[column.key]}
              </RadixTable.Cell>
            ))}
          </RadixTable.Row>
        ))}
      </RadixTable.Body>
    </RadixTable.Root>
  )
}
```

**Key decisions:**
- Use Radix Table primitives directly (no custom wrapper divs)
- Table is purely presentational (controlled component)
- Parent manages all state and data manipulation
- Simple inline sort indicators (just text arrows)

## Definition of Done

- [ ] PropTypes validator for LookupTable created and exported
- [ ] Table component has PropTypes validation for all props
- [ ] Table component renders using Radix Table primitives
- [ ] Table displays data in order passed (doesn't sort internally)
- [ ] Table validates data prop is a LookupTable (console warning if not)
- [ ] Clicking sortable headers calls onSort callback with column key
- [ ] Sort indicator (↑/↓) displays based on sortBy/sortDirection props
- [ ] ARIA sort attributes present on column headers
- [ ] Non-sortable columns don't show pointer cursor or indicators
- [ ] Custom `render` functions work for cells
- [ ] Column width and align props work correctly
- [ ] Component and lookupTablePropType validator exported from design-system index
- [ ] Storybook has 3 stories with controlled parent examples using LookupTable
- [ ] Works with large datasets (100+ rows)
- [ ] All verification items confirmed in Storybook
