// ABOUTME: Unified report page that renders all FinancialQuery result shapes
// ABOUTME: Tree views, pivot tables, and time series charts — driven by metadata constants

import { isNil } from '@graffio/functional'
import { Flex, Text } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { CellRenderers } from '../columns/CellRenderers.jsx'
import { DataTable } from '../components/DataTable.jsx'
import { FilterChipRow } from '../components/FilterChipRow.jsx'
import { TimeSeriesChart } from '../components/TimeSeriesChart.jsx'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { Formatters } from '../utils/formatters.js'

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
    // @sig toPivotColumns :: ({ columns, cells, computed, rowTotals }) -> [ColumnDef]
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
    // @sig toPivotData :: ([String], Object) -> [{ rowLabel, isComputed }]
    toPivotData: (rows, computed) => {
        const dataRows = rows.map(r => ({ rowLabel: r, isComputed: false }))
        const computedRows = Object.keys(computed).map(r => ({ rowLabel: r, isComputed: true }))
        return [...dataRows, ...computedRows]
    },

    // Extract chart-ready data from snapshots
    // @sig toChartData :: [{ date, total }] -> [{ date, value }]
    toChartData: snapshots => snapshots.map(s => ({ date: s.date, value: s.total })),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Renders a single filter entry from metadata — component + optional extra props
// @sig FilterEntry :: { entry: { component, props? }, viewId: String } -> ReactElement
const FilterEntry = ({ entry, viewId }) => {
    const Component = entry.component
    return <Component viewId={viewId} {...entry.props} />
}

// Row label with italic + separator for computed rows
// @sig PivotRowLabelCell :: { getValue, row } -> ReactElement
const PivotRowLabelCell = ({ getValue, row }) => {
    const value = getValue()
    const isComputed = row.original.isComputed
    const style = isComputed ? { fontStyle: 'italic', borderTop: '1px solid var(--gray-6)', paddingTop: 4 } : undefined
    return <span style={style}>{value}</span>
}

// Currency cell for pivot values — handles nil/zero
// @sig PivotCurrencyCell :: { getValue } -> ReactElement
const PivotCurrencyCell = ({ getValue }) => {
    const value = getValue()
    if (isNil(value)) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    const formatted = Formatters.formatCurrency(value)
    const color = value >= 0 ? 'var(--green-11)' : 'var(--red-11)'
    return <span style={{ color, fontWeight: '500', textAlign: 'right', display: 'block' }}>{formatted}</span>
}

// Percentage cell for computed rows
// @sig PivotPercentCell :: { getValue } -> ReactElement
const PivotPercentCell = ({ getValue }) => {
    const value = getValue()
    if (isNil(value) || isNaN(value)) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    const formatted = Formatters.formatPercentage(value)
    return (
        <span style={{ fontStyle: 'italic', fontWeight: '500', textAlign: 'right', display: 'block' }}>
            {formatted}
        </span>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const QUERY_DESCRIPTION_STYLE = { fontStyle: 'italic', width: '100%', paddingBottom: 'var(--space-1)' }

// prettier-ignore
const TIME_SERIES_COLUMNS = [
    { id: 'date',  accessorKey: 'date',  header: 'Date',  size: 140, cell: CellRenderers.DateCell },
    { id: 'total', accessorKey: 'total', header: 'Total', size: 140, cell: CellRenderers.CurrencyCell, textAlign: 'right' },
]

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Unified report page — renders tree, pivot, or time series based on result shape
 * @sig QueryResultPage :: ({ viewId, metadata, height? }) -> ReactElement
 */
const QueryResultPage = ({ viewId, metadata, height = '100%' }) => {
    // prettier-ignore
    const { chart, columns, countSelector, defaultQueryIR, filters, getChildRows, getRowCanExpand,
        hiddenColumnsByGroup, selector } = metadata
    const result = useSelector(state =>
        defaultQueryIR ? S.QueryResult.fromIR(state, viewId, defaultQueryIR) : selector(state, viewId),
    )
    const countSource = useSelector(state => (countSelector ? countSelector(state, viewId) : undefined))
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const expanded = useSelector(state => S.UI.treeExpansion(state, viewId))
    const columnSizing = useSelector(state => S.UI.columnSizing(state, viewId))
    const columnOrder = useSelector(state => S.UI.columnOrder(state, viewId))
    const highlightedRowId = useSelector(state => S.UI.highlightedRowId(state, viewId))
    const queryDescription = useSelector(state =>
        defaultQueryIR ? S.QueryResult.description(state, viewId, defaultQueryIR) : '',
    )

    if (!result) return undefined

    const { cells, computed, nodes, rows, snapshots } = result
    const filteredCount = countSource ? countSource.length : undefined
    const chipRowProps = { viewId, filteredCount, totalCount: filteredCount, itemLabel: metadata.itemLabel }

    const chipRow = (
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
    )

    const sharedTableProps = {
        height,
        rowHeight: 40,
        columnSizing,
        onColumnSizingChange: updater => post(Action.SetViewUiState(viewId, { columnSizing: updater })),
        columnOrder,
        onColumnOrderChange: order => post(Action.SetViewUiState(viewId, { columnOrder: order })),
        highlightedId: highlightedRowId,
        actionContext: viewId,
        onHighlightChange: newId => post(Action.SetViewUiState(viewId, { highlightedRowId: newId })),
    }

    // TimeSeries result — chart + flat table
    if (snapshots) {
        const chartData = F.toChartData(snapshots)
        return (
            <Flex direction="column" style={{ height: '100%' }}>
                {chipRow}
                {chart && (
                    <Flex style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--gray-5)' }}>
                        <TimeSeriesChart data={chartData} height={160} />
                    </Flex>
                )}
                <DataTable {...sharedTableProps} columns={TIME_SERIES_COLUMNS} data={snapshots} />
            </Flex>
        )
    }

    // Pivot result — dynamic column table
    if (cells) {
        const pivotColumns = F.toPivotColumns(result)
        const pivotData = F.toPivotData(rows, computed)
        return (
            <Flex direction="column" style={{ height: '100%' }}>
                {chipRow}
                <DataTable {...sharedTableProps} columns={pivotColumns} data={pivotData} />
            </Flex>
        )
    }

    // Tree result (engine {nodes} shape) or flat array (selector path — CategoryReportPage, InvestmentReportPage)
    const treeData = nodes ?? result
    const treeExtraProps = {
        columns,
        data: treeData,
        getChildRows,
        getRowCanExpand,
        expanded,
        onExpandedChange: updater => post(Action.SetViewUiState(viewId, { treeExpansion: updater })),
        columnVisibility: hiddenColumnsByGroup?.[groupBy],
        context: { groupBy },
    }
    return (
        <Flex direction="column" style={{ height: '100%' }}>
            {chipRow}
            <DataTable {...sharedTableProps} {...treeExtraProps} />
        </Flex>
    )
}

export { QueryResultPage }
