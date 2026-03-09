// ABOUTME: Page component for FilteredEntities QueryResult — renders flat account list DataTable
// ABOUTME: Wired via metadata.page in ENGINE_METADATA for AccountQuery results

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
    { id: 'name',        accessorFn: row => row.account.name, header: 'Account',  size: 200 },
    { id: 'accountType', accessorFn: row => row.account.type, header: 'Type',     size: 120 },
    { id: 'balance',     accessorKey: 'balance',              header: 'Balance',  size: 140, cell: CellRenderers.CurrencyCell, textAlign: 'right' },
]

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * FilteredEntities result page — flat account list table
 * @sig FilteredEntitiesResultPage :: ({ viewId: String, metadata: Object }) -> ReactElement
 */
const FilteredEntitiesResultPage = ({ viewId, metadata }) => {
    const { defaultQueryIR, filters } = metadata
    const result = useSelector(state => S.QueryResult.fromIR(state, viewId, defaultQueryIR))
    const queryDescription = useSelector(state => S.QueryResult.description(state, viewId, defaultQueryIR))
    const columnSizing = useSelector(state => S.UI.columnSizing(state, viewId))
    const columnOrder = useSelector(state => S.UI.columnOrder(state, viewId))
    const highlightedRowId = useSelector(state => S.UI.highlightedRowId(state, viewId))

    const entities = result?.entities
    if (!entities) return undefined

    const dataTableProps = {
        columns: COLUMNS,
        data: entities,
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

export { FilteredEntitiesResultPage }
