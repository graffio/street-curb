// ABOUTME: Generic metadata-driven report page that replaces domain-specific report pages
// ABOUTME: Renders tree views with configurable columns, filters, and chip row from metadata constants

import { Flex } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { DataTable } from '../components/DataTable.jsx'
import { FilterChipRow } from '../components/FilterChipRow.jsx'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'

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

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Generic report page driven by a static metadata constant
 * @sig QueryResultPage :: ({ viewId: String, metadata: Object, height?: String }) -> ReactElement
 */
const QueryResultPage = ({ viewId, metadata, height = '100%' }) => {
    const { columns, countSelector, filters, getChildRows, getRowCanExpand, hiddenColumnsByGroup, selector } = metadata
    const treeData = useSelector(state => selector(state, viewId))
    const countSource = useSelector(state => (countSelector ? countSelector(state, viewId) : undefined))
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const expanded = useSelector(state => S.UI.treeExpansion(state, viewId))
    const columnSizing = useSelector(state => S.UI.columnSizing(state, viewId))
    const columnOrder = useSelector(state => S.UI.columnOrder(state, viewId))
    const highlightedRowId = useSelector(state => S.UI.highlightedRowId(state, viewId))

    const filteredCount = countSource ? countSource.length : undefined
    const chipRowProps = { viewId, filteredCount, totalCount: filteredCount, itemLabel: metadata.itemLabel }

    const dataTableProps = {
        columns,
        data: treeData,
        height,
        rowHeight: 40,
        getChildRows,
        getRowCanExpand,
        columnVisibility: hiddenColumnsByGroup?.[groupBy],
        expanded,
        onExpandedChange: updater => post(Action.SetViewUiState(viewId, { treeExpansion: updater })),
        columnSizing,
        onColumnSizingChange: updater => post(Action.SetViewUiState(viewId, { columnSizing: updater })),
        columnOrder,
        onColumnOrderChange: order => post(Action.SetViewUiState(viewId, { columnOrder: order })),
        highlightedId: highlightedRowId,
        actionContext: viewId,
        onHighlightChange: newId => post(Action.SetViewUiState(viewId, { highlightedRowId: newId })),
        context: { groupBy },
    }

    return (
        <Flex direction="column" style={{ height: '100%' }}>
            <FilterChipRow {...chipRowProps}>
                {filters.map((entry, i) => (
                    <FilterEntry key={i} entry={entry} viewId={viewId} />
                ))}
            </FilterChipRow>
            <DataTable {...dataTableProps} />
        </Flex>
    )
}

export { QueryResultPage }
