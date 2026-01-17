// ABOUTME: Column definitions for category spending report
// ABOUTME: Hierarchical tree display with expand/collapse and aggregate totals

import { ColumnDefinition } from '@graffio/design-system/src/types/column-definition.js'
import { LookupTable } from '@graffio/functional'
import { CellRenderers } from './CellRenderers.jsx'

const { CurrencyCell: Currency, ExpandableCategoryCell: Category } = CellRenderers

const R = { enableResizing: false, textAlign: 'right' }
const E = { enableResizing: true }
const col = ColumnDefinition.from

// Cell renderer for count column with right alignment
// @sig CountCell :: { getValue: Function } -> ReactElement
const CountCell = ({ getValue }) => {
    const value = getValue()
    return <span style={{ textAlign: 'right', display: 'block' }}>{value}</span>
}

/*
 * Column definitions for category spending report
 * Row structure is TreeNode with { key, value, children, aggregate: { total, count } }
 */
// prettier-ignore
const columns = LookupTable([
    col({ id: 'category', accessorKey: 'key', header: 'Category', size: 300, minSize: 150, cell: Category, ...E }),
    col({ id: 'total', accessorKey: 'aggregate.total', header: 'Total', size: 120, minSize: 80, cell: Currency, ...R }),
    col({ id: 'count', accessorKey: 'aggregate.count', header: 'Count', size: 80, minSize: 60, cell: CountCell, ...R }),
], ColumnDefinition, 'id')

const CategoryReportColumns = { columns }

export { CategoryReportColumns }
