// ABOUTME: Page component for Pivot QueryResult — renders dynamic-column DataTable
// ABOUTME: Wired via metadata.page in ENGINE_METADATA for pivot-grouped TransactionQuery results

import { isNil } from '@graffio/functional'
import { Flex, Text } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { DataTable } from '../components/DataTable.jsx'
import { FilterChipRow } from '../components/FilterChipRow.jsx'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { Formatters } from '../utils/formatters.js'

const { FilterEntry, QUERY_DESCRIPTION_STYLE } = FilterChipRow

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Build a value column def for one pivot column bucket
    // @sig toValueColumn :: (String, Object, Object) -> ColumnDef
    toValueColumn: (col, cells, computed) => ({
        id: `col_${col}`,
        accessorFn: ({ isComputed, rowLabel }) => (isComputed ? computed[rowLabel]?.[col] : cells[rowLabel]?.[col]),
        header: col,
        size: 120,
        cell: ({ getValue, row }) =>
            row.original.isComputed ? PivotPercentCell({ getValue }) : PivotCurrencyCell({ getValue }),
        textAlign: 'right',
    }),

    // Build TanStack column defs from pivot result shape
    // @sig toPivotColumns :: ({ columns: [String], cells: Object, computed: Object, rowTotals: Object }) -> [ColumnDef]
    toPivotColumns: ({ columns, cells, computed, rowTotals }) => {
        const rowLabelCol = { id: 'rowLabel', accessorKey: 'rowLabel', header: '', size: 200, cell: PivotRowLabelCell }
        const valueCols = columns.map(col => F.toValueColumn(col, cells, computed))
        const totalCol = {
            id: 'total',
            accessorFn: ({ isComputed, rowLabel }) => (isComputed ? undefined : rowTotals[rowLabel]),
            header: 'Total',
            size: 120,
            cell: PivotCurrencyCell,
            textAlign: 'right',
        }
        return [rowLabelCol, ...valueCols, totalCol]
    },

    // Build flat data array from rows + computed row names
    // @sig toPivotData :: ([String], Object) -> [{ rowLabel: String, isComputed: Boolean }]
    toPivotData: (rows, computed) => {
        const dataRows = rows.map(r => ({ rowLabel: r, isComputed: false }))
        const computedRows = Object.keys(computed).map(r => ({ rowLabel: r, isComputed: true }))
        return [...dataRows, ...computedRows]
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Row label with italic + separator for computed rows
// @sig PivotRowLabelCell :: { getValue: Function, row: Row } -> ReactElement
const PivotRowLabelCell = ({ getValue, row }) => {
    const value = getValue()
    const isComputed = row.original.isComputed
    const style = isComputed ? { fontStyle: 'italic', borderTop: '1px solid var(--gray-6)', paddingTop: 4 } : undefined
    return <span style={style}>{value}</span>
}

// Currency cell for pivot values — handles nil/zero
// @sig PivotCurrencyCell :: { getValue: Function } -> ReactElement
const PivotCurrencyCell = ({ getValue }) => {
    const value = getValue()
    if (isNil(value)) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    const formatted = Formatters.formatCurrency(value)
    const color = value >= 0 ? 'var(--green-11)' : 'var(--red-11)'
    return <span style={{ color, fontWeight: '500', textAlign: 'right', display: 'block' }}>{formatted}</span>
}

// Percentage cell for computed rows
// @sig PivotPercentCell :: { getValue: Function } -> ReactElement
const PivotPercentCell = ({ getValue }) => {
    const value = getValue()
    if (isNil(value) || isNaN(value)) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    const formatted = Formatters.formatPercentage(value)
    const style = { fontStyle: 'italic', fontWeight: '500', textAlign: 'right', display: 'block' }
    return <span style={style}>{formatted}</span>
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Pivot result page — dynamic columns from pivot query result
 * @sig PivotResultPage :: ({ viewId: String, metadata: Object }) -> ReactElement
 */
const PivotResultPage = ({ viewId, metadata }) => {
    const { defaultQueryIR, filters } = metadata
    const result = useSelector(state => S.QueryResult.fromIR(state, viewId, defaultQueryIR))
    const queryDescription = useSelector(state => S.QueryResult.description(state, viewId, defaultQueryIR))
    const columnSizing = useSelector(state => S.UI.columnSizing(state, viewId))
    const columnOrder = useSelector(state => S.UI.columnOrder(state, viewId))
    const highlightedRowId = useSelector(state => S.UI.highlightedRowId(state, viewId))

    const { columns: pivotColumns, rows, cells, computed, rowTotals } = result ?? {}
    if (!pivotColumns) return undefined

    const columns = F.toPivotColumns({ columns: pivotColumns, cells, computed, rowTotals })
    const data = F.toPivotData(rows, computed)

    const chipRowProps = { viewId }
    const dataTableProps = {
        columns,
        data,
        height: '100%',
        rowHeight: 40,
        columnSizing,
        onColumnSizingChange: updater => post(Action.SetViewUiState(viewId, { columnSizing: updater })),
        columnOrder,
        onColumnOrderChange: order => post(Action.SetViewUiState(viewId, { columnOrder: order })),
        highlightedId: highlightedRowId,
        actionContext: viewId,
        onHighlightChange: newId => post(Action.SetViewUiState(viewId, { highlightedRowId: newId })),
    }

    return (
        <Flex direction="column" style={{ height: '100%' }}>
            <FilterChipRow {...chipRowProps}>
                {queryDescription && (
                    <Text size="1" color="gray" style={QUERY_DESCRIPTION_STYLE}>
                        {queryDescription}
                    </Text>
                )}
                {filters.map((entry, i) => (
                    <FilterEntry key={i} entry={entry} viewId={viewId} />
                ))}
            </FilterChipRow>
            <DataTable {...dataTableProps} />
        </Flex>
    )
}

export { PivotResultPage }
