// ABOUTME: Column definitions for category spending report
// ABOUTME: Hierarchical tree display with expand/collapse and aggregate totals

import { ColumnDefinition } from '@graffio/design-system/src/types/column-definition.js'
import { LookupTable } from '@graffio/functional'
import { CurrencyCell, ExpandableCategoryCell } from './cell-renderers.jsx'

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
const categoryReportColumns = LookupTable([
    ColumnDefinition.from({ id: 'category', accessorKey: 'key',             header: 'Category', size: 300, minSize: 150, cell: ExpandableCategoryCell, enableResizing: true  }),
    ColumnDefinition.from({ id: 'total',    accessorKey: 'aggregate.total', header: 'Total',    size: 120, minSize: 80,  cell: CurrencyCell,           enableResizing: false, textAlign: 'right' }),
    ColumnDefinition.from({ id: 'count',    accessorKey: 'aggregate.count', header: 'Count',    size: 80,  minSize: 60,  cell: CountCell,              enableResizing: false, textAlign: 'right' }),
], ColumnDefinition, 'id')

export { categoryReportColumns }
