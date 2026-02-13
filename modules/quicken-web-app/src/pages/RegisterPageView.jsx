// ABOUTME: Unified register page component parameterized by config
// ABOUTME: Shared logic for bank and investment transaction registers (filtering, search, table layout)

import { DataTable, Flex } from '@graffio/design-system'
import React, { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { FilterChipRow } from '../components/index.js'
import { RegisterPage } from '../services/register-page.js'
import * as S from '../store/selectors.js'
import { Action, TableLayout } from '../types/index.js'
import { post } from '../commands/post.js'

const pageContainerStyle = { height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }

/*
 * Parameterized register page — bank and investment share this component via config objects
 *
 * @sig RegisterPageView :: ({ accountId: String, height?: Number, config: RegisterConfig }) -> ReactElement
 */
const RegisterPageView = ({ accountId, height = '100%', config }) => {
    const { columns, prefix, sortSelector, highlightSelector, filterChipRowProps, useManualCounts } = config
    const toPageTitle = config.pageTitle

    // -----------------------------------------------------------------------------------------------------------------
    // Derived values
    // -----------------------------------------------------------------------------------------------------------------
    const viewId = `reg_${accountId}`
    const tableLayoutId = RegisterPage.toTableLayoutId(prefix, accountId)

    // -----------------------------------------------------------------------------------------------------------------
    // Hooks (selectors)
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(RegisterPage.ensureTableLayoutEffect(tableLayoutId, columns), [tableLayoutId])

    const dateRange = useSelector(state => S.UI.dateRange(state, viewId))
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const searchQuery = useSelector(state => S.UI.searchQuery(state, viewId))
    const allTableLayouts = useSelector(S.tableLayouts)
    const searchMatches = useSelector(state => S.Transactions.searchMatches(state, viewId, accountId))
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const accountName = useSelector(state => S.accountName(state, accountId))

    // Investment-only: compute filtered/total counts when config requires manual counts
    const filteredCount = useSelector(state =>
        useManualCounts ? S.Transactions.filteredForInvestment(state, viewId, accountId).length : 0,
    )
    const totalCount = useSelector(state =>
        useManualCounts ? S.Transactions.forAccount(state, viewId, accountId).length : 0,
    )

    // -----------------------------------------------------------------------------------------------------------------
    // Selectors (derived state)
    // -----------------------------------------------------------------------------------------------------------------
    const tableLayout = allTableLayouts?.[tableLayoutId]

    // prettier-ignore
    const { sorting, columnSizing, columnOrder } = useSelector(state => S.tableLayoutProps(state, tableLayoutId))
    const data = useSelector(state => sortSelector(state, viewId, accountId, tableLayoutId, columns))

    const dataRef = useRef(data)
    dataRef.current = data

    const highlightedId = useSelector(state => highlightSelector(state, viewId, accountId, tableLayoutId, columns))

    const searchInputRef = useRef(null)
    const searchHandlersRef = useRef({})
    searchHandlersRef.current = {
        onSearchNext: () => RegisterPage.navigateToMatch(dataRef.current, searchMatches, highlightedId, viewId, 1),
        onSearchPrev: () => RegisterPage.navigateToMatch(dataRef.current, searchMatches, highlightedId, viewId, -1),
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Callbacks
    // -----------------------------------------------------------------------------------------------------------------
    const handleSortingChange = useCallback(
        updater => post(Action.SetTableLayout(TableLayout.applySortingChange(tableLayout, updater(sorting)))),
        [tableLayout, sorting],
    )

    const handleColumnSizingChange = useCallback(
        updater => post(Action.SetTableLayout(TableLayout.applySizingChange(tableLayout, updater(columnSizing)))),
        [tableLayout, columnSizing],
    )

    const handleColumnOrderChange = useCallback(
        newOrder => post(Action.SetTableLayout(TableLayout.applyOrderChange(tableLayout, newOrder))),
        [tableLayout],
    )

    const getData = useCallback(() => dataRef.current, [])
    const handleHighlightChange = useCallback(RegisterPage.dispatchHighlightChange(getData, viewId), [getData, viewId])
    const handleEscape = useCallback(() => RegisterPage.clearSearch(searchQuery, viewId), [searchQuery, viewId])
    const handleRowClick = useCallback(row => handleHighlightChange(row.transaction?.id), [handleHighlightChange])

    // -----------------------------------------------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------------------------------------------
    const [pageTitle, pageSubtitle] = toPageTitle(accountName)
    useEffect(() => post(Action.SetPageTitle(pageTitle, pageSubtitle)), [pageTitle, pageSubtitle])

    useEffect(
        () => RegisterPage.initDateRangeIfNeeded(dateRangeKey, dateRange, viewId),
        [dateRangeKey, dateRange, viewId],
    )
    useEffect(RegisterPage.searchActionsEffect(viewId, searchHandlersRef, searchInputRef), [viewId])

    if (!tableLayout) return null

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
                onSearchNext={() => searchHandlersRef.current.onSearchNext()}
                onSearchPrev={() => searchHandlersRef.current.onSearchPrev()}
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
                    onSortingChange={handleSortingChange}
                    onColumnSizingChange={handleColumnSizingChange}
                    onColumnOrderChange={handleColumnOrderChange}
                    onRowClick={handleRowClick}
                    onHighlightChange={handleHighlightChange}
                    onEscape={handleEscape}
                    actionContext={viewId}
                    context={{ searchQuery: searchQuery || filterQuery }}
                />
            </div>
        </Flex>
    )
}

export { RegisterPageView }
