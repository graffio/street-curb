// ABOUTME: Page component for RunningBalance QueryResult — renders register-style flat DataTable
// ABOUTME: Wired via metadata.page in ENGINE_METADATA for RunningBalanceQuery results

import { Flex, Text } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { CellRenderers } from '../columns/CellRenderers.jsx'
import { DataTable } from '../components/DataTable.jsx'
import { FilterChipRow } from '../components/FilterChipRow.jsx'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'

const { FilterEntry, QUERY_DESCRIPTION_STYLE } = FilterChipRow

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const COLUMNS = [
    { id: 'date',    accessorKey: 'date',    header: 'Date',    size: 140, cell: CellRenderers.DateCell },
    { id: 'payee',   accessorKey: 'payee',   header: 'Payee',   size: 200 },
    { id: 'amount',  accessorKey: 'amount',  header: 'Amount',  size: 120, cell: CellRenderers.CurrencyCell, textAlign: 'right' },
    { id: 'balance', accessorKey: 'balance', header: 'Balance', size: 120, cell: CellRenderers.CurrencyCell, textAlign: 'right' },
]

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * RunningBalance result page — register-style flat table with cumulative balance
 * @sig RunningBalanceResultPage :: ({ viewId: String, metadata: Object }) -> ReactElement
 */
const RunningBalanceResultPage = ({ viewId, metadata }) => {
    const { defaultQueryIR, filters } = metadata
    const result = useSelector(state => S.QueryResult.fromIR(state, viewId, defaultQueryIR))
    const queryDescription = useSelector(state => S.QueryResult.description(state, viewId, defaultQueryIR))
    const columnSizing = useSelector(state => S.UI.columnSizing(state, viewId))
    const columnOrder = useSelector(state => S.UI.columnOrder(state, viewId))
    const highlightedRowId = useSelector(state => S.UI.highlightedRowId(state, viewId))

    const entries = result?.entries
    if (!entries) return undefined

    const dataTableProps = {
        columns: COLUMNS,
        data: entries,
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
            <FilterChipRow viewId={viewId}>
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

export { RunningBalanceResultPage }
