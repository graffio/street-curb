// ABOUTME: Page component for TimeSeries QueryResult — renders D3 chart + flat DataTable
// ABOUTME: Wired via metadata.page in ENGINE_METADATA for SnapshotQuery results

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

const { FilterEntry, QUERY_DESCRIPTION_STYLE } = FilterChipRow

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Extract chart-ready data from snapshots
    // @sig toChartData :: [{ date: String, total: Number }] -> [{ date: String, value: Number }]
    toChartData: snapshots => snapshots.map(s => ({ date: s.date, value: s.total })),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const COLUMNS = [
    { id: 'date',  accessorKey: 'date',  header: 'Date',  size: 140, cell: CellRenderers.DateCell },
    { id: 'total', accessorKey: 'total', header: 'Total', size: 140, cell: CellRenderers.CurrencyCell, textAlign: 'right' },
]

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * TimeSeries result page — line chart + flat snapshot table
 * @sig TimeSeriesResultPage :: ({ viewId: String, metadata: Object }) -> ReactElement
 */
const TimeSeriesResultPage = ({ viewId, metadata }) => {
    const { defaultQueryIR, filters } = metadata
    const result = useSelector(state => S.QueryResult.fromIR(state, viewId, defaultQueryIR))
    const queryDescription = useSelector(state => S.QueryResult.description(state, viewId, defaultQueryIR))
    const columnSizing = useSelector(state => S.UI.columnSizing(state, viewId))
    const columnOrder = useSelector(state => S.UI.columnOrder(state, viewId))
    const highlightedRowId = useSelector(state => S.UI.highlightedRowId(state, viewId))

    const snapshots = result?.snapshots
    if (!snapshots) return undefined

    const chartData = F.toChartData(snapshots)

    const chipRowProps = { viewId }
    const dataTableProps = {
        columns: COLUMNS,
        data: snapshots,
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
            <Flex style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--gray-5)' }}>
                <TimeSeriesChart data={chartData} height={160} />
            </Flex>
            <DataTable {...dataTableProps} />
        </Flex>
    )
}

export { TimeSeriesResultPage }
