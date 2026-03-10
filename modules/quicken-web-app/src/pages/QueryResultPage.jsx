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
    // Build a value column def for one 2D tree column key
    // @sig toTreeValueColumn :: (String, Object?) -> ColumnDef
    toTreeValueColumn: (col, computed) => ({
        id: `col_${col}`,
        accessorFn: ({ isComputed, rowLabel, aggregate }) =>
            isComputed ? computed?.[rowLabel]?.[col] : aggregate.columns?.[col],
        header: col,
        size: 120,
        cell: ({ getValue, row }) =>
            row.original.isComputed ? PivotPercentCell({ getValue }) : PivotCurrencyCell({ getValue }),
        textAlign: 'right',
    }),

    // Build TanStack column defs for a 2D tree (row label + value columns + total)
    // @sig toTreePivotColumns :: ([String], Object?) -> [ColumnDef]
    toTreePivotColumns: (columns, computed) => {
        const labelCol = {
            id: 'rowLabel',
            accessorFn: ({ isComputed, rowLabel, id }) => (isComputed ? rowLabel : id),
            header: '',
            size: 200,
            cell: PivotRowLabelCell,
        }
        const valueCols = columns.map(col => F.toTreeValueColumn(col, computed))
        const totalCol = {
            id: 'total',
            accessorFn: ({ isComputed, aggregate }) => (isComputed ? undefined : aggregate.total),
            header: 'Total',
            size: 120,
            cell: PivotCurrencyCell,
            textAlign: 'right',
        }
        return [labelCol, ...valueCols, totalCol]
    },

    // Convert computed row map to flat row objects for appending to tree data
    // @sig toComputedRows :: Object? -> [{ rowLabel, isComputed, children }]
    toComputedRows: computed =>
        Object.keys(computed || {}).map(name => ({ rowLabel: name, isComputed: true, children: [] })),

    // Extract chart-ready data from snapshots (positions domain)
    // @sig toChartData :: [{ date, total }] -> [{ date, value }]
    toChartData: snapshots => snapshots.map(s => ({ date: s.date, value: s.total })),

    // Extract chart-ready data from a 2D tree with date-point columns (ungrouped snapshot)
    // @sig toChartDataFromTree :: ([String], [CategoryTreeNode]) -> [{ date, value }]
    toChartDataFromTree: (columns, nodes) =>
        nodes.length === 1 ? columns.map(col => ({ date: col, value: nodes[0].aggregate?.columns?.[col] ?? 0 })) : [],
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
    const { chart, columns, defaultQueryIR, filters, getChildRows, getRowCanExpand, hiddenColumnsByGroup } = metadata
    const result = useSelector(state => S.QueryResult.fromIR(state, viewId, defaultQueryIR))
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const expanded = useSelector(state => S.UI.treeExpansion(state, viewId))
    const columnSizing = useSelector(state => S.UI.columnSizing(state, viewId))
    const columnOrder = useSelector(state => S.UI.columnOrder(state, viewId))
    const highlightedRowId = useSelector(state => S.UI.highlightedRowId(state, viewId))
    const queryDescription = useSelector(state => S.QueryResult.description(state, viewId, defaultQueryIR))

    if (!result) return undefined

    const { columns: resultColumns, computed, nodes, snapshots } = result
    const chipRowProps = { viewId, itemLabel: metadata.itemLabel }

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

    // 2D tree result — drillable tree with dynamic value columns from aggregate.columns
    if (nodes && resultColumns) {
        const treeColumns = F.toTreePivotColumns(resultColumns, computed)
        const computedRows = F.toComputedRows(computed)
        const chartData = chart ? F.toChartDataFromTree(resultColumns, nodes) : undefined
        const pivotTreeExtraProps = {
            columns: treeColumns,
            data: nodes.concat(computedRows),
            getChildRows: row => row.children,
            getRowCanExpand: row => row.original.children?.length > 0,
            expanded,
            onExpandedChange: updater => post(Action.SetViewUiState(viewId, { treeExpansion: updater })),
        }
        return (
            <Flex direction="column" style={{ height: '100%' }}>
                {chipRow}
                {chartData && chartData.length > 0 && (
                    <Flex style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--gray-5)' }}>
                        <TimeSeriesChart data={chartData} height={160} />
                    </Flex>
                )}
                <DataTable {...sharedTableProps} {...pivotTreeExtraProps} />
            </Flex>
        )
    }

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
