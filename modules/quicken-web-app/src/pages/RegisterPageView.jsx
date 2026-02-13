// ABOUTME: Unified register page component parameterized by config
// ABOUTME: Shared logic for bank and investment transaction registers (filtering, search, table layout)
// COMPLEXITY: react-redux-separation — 4 useEffect lifecycle dispatches need infrastructure to eliminate

import { Flex } from '@radix-ui/themes'
import { DataTable } from '../components/DataTable.jsx'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { FilterChipRow } from '../components/index.js'
import { RegisterPage } from '../services/register-page.js'
import * as S from '../store/selectors.js'
import { Action, TableLayout } from '../types/index.js'

const pageContainerStyle = { height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }

// Module-level ref for search input — only one register page is active at a time
const searchInputRef = { current: null }

/*
 * Parameterized register page — bank and investment share this component via config objects
 *
 * @sig RegisterPageView :: ({ accountId: String, height?: Number, config: RegisterConfig }) -> ReactElement
 */
const RegisterPageView = ({ accountId, height = '100%', config }) => {
    const { columns, prefix, sortSelector, highlightSelector, filterChipRowProps, useManualCounts } = config
    const viewId = `reg_${accountId}`
    const tableLayoutId = RegisterPage.toTableLayoutId(prefix, accountId)
    const ctx = { sortSelector, highlightSelector, viewId, accountId, tableLayoutId, columns }

    // --- Effects (remaining lifecycle concerns — each documents why useEffect is needed) ---
    useEffect(RegisterPage.ensureTableLayoutEffect(tableLayoutId, columns), [tableLayoutId])
    useEffect(RegisterPage.searchActionsEffect(ctx, searchInputRef), [viewId])
    const accountName = useSelector(state => S.accountName(state, accountId))
    const [pageTitle, pageSubtitle] = config.pageTitle(accountName)
    useEffect(() => post(Action.SetPageTitle(pageTitle, pageSubtitle)), [pageTitle, pageSubtitle])
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const dateRange = useSelector(state => S.UI.dateRange(state, viewId))
    useEffect(
        () => RegisterPage.initDateRangeIfNeeded(dateRangeKey, dateRange, viewId),
        [dateRangeKey, dateRange, viewId],
    )

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
                onSearchNext={() => RegisterPage.navigateSearchMatch(ctx, 1)}
                onSearchPrev={() => RegisterPage.navigateSearchMatch(ctx, -1)}
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
                    onSortingChange={updater => RegisterPage.updateSorting(tableLayoutId, updater)}
                    onColumnSizingChange={updater => RegisterPage.updateColumnSizing(tableLayoutId, updater)}
                    onColumnOrderChange={newOrder => RegisterPage.updateColumnOrder(tableLayoutId, newOrder)}
                    onRowClick={row => row.transaction && RegisterPage.highlightTransaction(ctx, row.transaction.id)}
                    onHighlightChange={newId => RegisterPage.highlightTransaction(ctx, newId)}
                    onEscape={() => RegisterPage.clearSearch(viewId)}
                    actionContext={viewId}
                    context={{ searchQuery: searchQuery || filterQuery }}
                />
            </div>
        </Flex>
    )
}

export { RegisterPageView }
