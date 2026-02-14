// ABOUTME: Unified register page component parameterized by config
// ABOUTME: Shared logic for bank and investment transaction registers (filtering, search, table layout)
// COMPLEXITY: react-redux-separation — 2 useEffect lifecycle dispatches need infrastructure to eliminate

import { Flex } from '@radix-ui/themes'
import { DataTable } from '../components/DataTable.jsx'
import { KeymapModule } from '@graffio/keymap'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { currentStore } from '../store/index.js'
import { FilterChipRow } from '../components/index.js'
import { RegisterNavigation } from '../store/register-navigation.js'
import * as S from '../store/selectors.js'
import { Action, TableLayout } from '../types/index.js'

const { ActionRegistry } = KeymapModule

const pageContainerStyle = { height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }

// Module-level ref for search input — only one register page is active at a time
const searchInputRef = { current: null }

const E = {
    // Navigate to next/prev search match — reads fresh state from store (for ActionRegistry execute handlers)
    // @sig handleSearchNavigate :: (RegisterCtx, Number) -> void
    handleSearchNavigate: (ctx, dir) => {
        const { sortSelector, highlightSelector, viewId, accountId, tableLayoutId, columns } = ctx
        const state = currentStore().getState()
        const data = sortSelector(state, viewId, accountId, tableLayoutId, columns)
        const searchMatches = S.Transactions.searchMatches(state, viewId, accountId)
        const highlightedId = highlightSelector(state, viewId, accountId, tableLayoutId, columns)
        E.handleNavigateMatch(data, searchMatches, highlightedId, viewId, dir)
    },

    // Navigate to match using pre-fetched data (component handlers with selector data in scope)
    // @sig handleNavigateMatch :: ([Row], [String], String, String, Number) -> void
    handleNavigateMatch: (data, searchMatches, highlightedId, viewId, dir) => {
        if (searchMatches.length === 0) return
        const currentIdx = searchMatches.indexOf(highlightedId)
        const rowIdx =
            currentIdx >= 0
                ? RegisterNavigation.toAdjacentMatchRowIdx(data, searchMatches, currentIdx, dir)
                : RegisterNavigation.toNearestMatchRowIdx(
                      data,
                      searchMatches,
                      RegisterNavigation.toRowIndex(data, highlightedId),
                      dir,
                  )
        if (rowIdx >= 0) post(Action.SetViewUiState(viewId, { currentRowIndex: rowIdx }))
    },

    // Highlight a transaction row by ID
    // @sig handleHighlightRow :: ([Row], String, String) -> void
    handleHighlightRow: (data, viewId, newId) => {
        const idx = RegisterNavigation.toRowIndex(data, newId)
        if (idx >= 0) post(Action.SetViewUiState(viewId, { currentRowIndex: idx }))
    },

    // Register search-related keyboard actions for a view — returns cleanup function
    // @sig registerSearchActions :: (RegisterCtx, Ref) -> () -> (() -> void)
    registerSearchActions: (ctx, ref) => () =>
        ActionRegistry.register(ctx.viewId, [
            { id: 'select', description: 'Next match', execute: () => E.handleSearchNavigate(ctx, 1) },
            { id: 'search:prev', description: 'Previous match', execute: () => E.handleSearchNavigate(ctx, -1) },
            { id: 'search:open', description: 'Open search', execute: () => ref.current?.focus() },
        ]),

    // Initialize date range to last 12 months if not already set
    // @sig handleInitDateRange :: (String, DateRange | null, String) -> void
    handleInitDateRange: (dateRangeKey, dateRange, viewId) => {
        if (RegisterNavigation.shouldInitializeDateRange(dateRangeKey, dateRange))
            post(Action.SetTransactionFilter(viewId, { dateRange: RegisterNavigation.toDefaultDateRange() }))
    },
}

/*
 * Parameterized register page — bank and investment share this component via config objects
 *
 * @sig RegisterPageView :: ({ accountId: String, height?: Number, config: RegisterConfig }) -> ReactElement
 */
const RegisterPageView = ({ accountId, height = '100%', config }) => {
    const { columns, prefix, sortSelector, highlightSelector, filterChipRowProps, useManualCounts } = config
    const viewId = `reg_${accountId}`
    const tableLayoutId = RegisterNavigation.toTableLayoutId(prefix, accountId)
    const ctx = { sortSelector, highlightSelector, viewId, accountId, tableLayoutId, columns }

    // --- Effects (remaining lifecycle concerns — each documents why useEffect is needed) ---
    useEffect(E.registerSearchActions(ctx, searchInputRef), [viewId])
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const dateRange = useSelector(state => S.UI.dateRange(state, viewId))
    useEffect(() => E.handleInitDateRange(dateRangeKey, dateRange, viewId), [dateRangeKey, dateRange, viewId])

    // --- Selectors ---
    const searchQuery = useSelector(state => S.UI.searchQuery(state, viewId))
    const searchMatches = useSelector(state => S.Transactions.searchMatches(state, viewId, accountId))
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const tableLayout = useSelector(state => S.tableLayoutOrDefault(state, tableLayoutId, columns))
    const { sorting, columnSizing, columnOrder } = TableLayout.toDataTableProps(tableLayout)
    const data = useSelector(state => sortSelector(state, viewId, accountId, tableLayoutId, columns))
    const highlightedId = useSelector(state => highlightSelector(state, viewId, accountId, tableLayoutId, columns))

    const filteredCount = useSelector(state =>
        useManualCounts ? S.Transactions.filteredForInvestment(state, viewId, accountId).length : 0,
    )
    const totalCount = useSelector(state =>
        useManualCounts ? S.Transactions.forAccount(state, viewId, accountId).length : 0,
    )

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow
                viewId={viewId}
                {...(!useManualCounts && { accountId })}
                {...(useManualCounts && { filteredCount, totalCount })}
                {...filterChipRowProps}
                searchQuery={searchQuery}
                searchMatches={searchMatches}
                highlightedId={highlightedId}
                searchInputRef={searchInputRef}
                onSearchNext={() => E.handleNavigateMatch(data, searchMatches, highlightedId, viewId, 1)}
                onSearchPrev={() => E.handleNavigateMatch(data, searchMatches, highlightedId, viewId, -1)}
            />
            <div style={mainContentStyle}>
                <DataTable
                    columns={columns}
                    data={data}
                    height={height}
                    rowHeight={60}
                    highlightedId={highlightedId}
                    sorting={sorting}
                    columnSizing={columnSizing}
                    columnOrder={columnOrder}
                    onSortingChange={updater =>
                        post(Action.SetTableLayout(TableLayout.applySortingChange(tableLayout, updater(sorting))))
                    }
                    onColumnSizingChange={updater =>
                        post(Action.SetTableLayout(TableLayout.applySizingChange(tableLayout, updater(columnSizing))))
                    }
                    onColumnOrderChange={newOrder =>
                        post(Action.SetTableLayout(TableLayout.applyOrderChange(tableLayout, newOrder)))
                    }
                    onRowClick={row => row.transaction && E.handleHighlightRow(data, viewId, row.transaction.id)}
                    onHighlightChange={newId => E.handleHighlightRow(data, viewId, newId)}
                    onEscape={() => searchQuery && post(Action.SetTransactionFilter(viewId, { searchQuery: '' }))}
                    actionContext={viewId}
                    context={{ searchQuery: searchQuery || filterQuery }}
                />
            </div>
        </Flex>
    )
}

export { RegisterPageView }
