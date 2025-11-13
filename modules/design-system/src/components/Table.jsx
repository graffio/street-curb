// ABOUTME: Generic sortable table component wrapping Radix Themes Table
// ABOUTME: Controlled component - parent manages sort state and sorts data

import { Table as RadixTable } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import { lookupTablePropType } from '../prop-types/lookup-table-prop-type.js'

/**
 * Generic sortable table component
 * @sig Table :: ({ [ColumnShape], LookupTable, String?, /asc|desc/?, OnSortFunction? }) -> JSXElement
 *  OnSortFunction = String -> ()
 */
const Table = ({ columnDescriptors, lookupTable, sortBy, sortDirection, onSort }) => {
    const renderSortIndicator = column => {
        const { key, sortable } = column
        const style = { marginLeft: 'var(--space-1)' }

        // Active sort - full opacity
        if (sortBy === key) return <span style={style}>{sortDirection === 'asc' ? '↑' : '↓'}</span>

        if (sortable) style.color = 'var(--gray-a8)'
        if (!sortable) style.visibility = 'hidden'
        return <span style={style}>↑</span>
    }

    const getAriaSort = column => {
        if (!column.sortable) return undefined
        if (sortBy !== column.key) return 'none'
        return sortDirection === 'asc' ? 'ascending' : 'descending'
    }

    const renderColumnHeader = column => {
        const resort = () => sortable && onSort && onSort(key)

        const { key, label, align, sortable, width } = column
        const style = { cursor: sortable ? 'pointer' : 'default', width }
        const ariaSort = getAriaSort(column)

        return (
            <RadixTable.ColumnHeaderCell key={key} style={style} align={align} onClick={resort} aria-sort={ariaSort}>
                {label}
                {renderSortIndicator(column)}
            </RadixTable.ColumnHeaderCell>
        )
    }

    const renderCell = row => column => (
        <RadixTable.Cell key={column.key} align={column.align}>
            {column.render ? column.render(row) : row[column.key]}
        </RadixTable.Cell>
    )

    const renderRow = item => (
        <RadixTable.Row key={lookupTable.idForItem(item)}>{columnDescriptors.map(renderCell(item))}</RadixTable.Row>
    )

    return (
        <RadixTable.Root>
            <RadixTable.Header>
                <RadixTable.Row>{columnDescriptors.map(renderColumnHeader)}</RadixTable.Row>
            </RadixTable.Header>
            <RadixTable.Body>{lookupTable.map(renderRow)}</RadixTable.Body>
        </RadixTable.Root>
    )
}

const ColumnShape = {
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,

    align: PropTypes.oneOf(['left', 'center', 'right']),
    sortable: PropTypes.bool,
    width: PropTypes.string,
    render: PropTypes.func,
}

Table.propTypes = {
    columnDescriptors: PropTypes.arrayOf(PropTypes.shape(ColumnShape)).isRequired,
    lookupTable: lookupTablePropType.isRequired,
    sortBy: PropTypes.string,
    sortDirection: PropTypes.oneOf(['asc', 'desc']),
    onSort: PropTypes.func,
}

export { Table }
