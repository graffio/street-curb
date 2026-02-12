// ABOUTME: Transaction register page with filtering, search, and table layout persistence
// ABOUTME: Displays account transactions with sorting, column reordering, and running balances

import { DataTable, Flex } from '@graffio/design-system'
import React, { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { TransactionColumns } from '../columns/index.js'
import { FilterChipRow } from '../components/index.js'
import { RegisterPage } from '../services/register-page.js'
import * as S from '../store/selectors.js'
import { Action, TableLayout } from '../types/index.js'
import { post } from '../commands/post.js'

const { bankColumns } = TransactionColumns

const { T, E } = RegisterPage

const pageContainerStyle = { height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }

/*
 * Transaction Register page with filtering, search, and navigation
 *
 * @sig TransactionRegisterPage :: (TransactionRegisterPageProps) -> ReactElement
 *     TransactionRegisterPageProps = { accountId: String, height?: Number }
 */
const TransactionRegisterPage = ({ accountId, height = '100%' }) => {
    // -----------------------------------------------------------------------------------------------------------------
    // Derived values (computed from props)
    // -----------------------------------------------------------------------------------------------------------------
    // Use reg_ prefix to match View.Register's id pattern (FieldTypes.viewId)
    const viewId = `reg_${accountId}`
    const tableLayoutId = T.toTableLayoutId('account', accountId)

    // -----------------------------------------------------------------------------------------------------------------
    // Hooks (selectors)
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(E.ensureTableLayoutEffect(tableLayoutId, bankColumns), [tableLayoutId])

    const dateRange = useSelector(state => S.UI.dateRange(state, viewId))
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const searchQuery = useSelector(state => S.UI.searchQuery(state, viewId))
    const allTableLayouts = useSelector(S.tableLayouts)
    const searchMatches = useSelector(state => S.Transactions.searchMatches(state, viewId, accountId))
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))

    // -----------------------------------------------------------------------------------------------------------------
    // Selectors (derived state)
    // -----------------------------------------------------------------------------------------------------------------
    const tableLayout = allTableLayouts?.[tableLayoutId]
    const { sorting, columnSizing, columnOrder } = useSelector(state => S.tableLayoutProps(state, tableLayoutId))
    const data = useSelector(state =>
        S.Transactions.sortedForBankDisplay(state, viewId, accountId, tableLayoutId, bankColumns),
    )

    // Ref to access current data in callbacks without adding to deps (prevents keymap recreation)
    const dataRef = useRef(data)
    dataRef.current = data

    const highlightedId = useSelector(state =>
        S.Transactions.highlightedIdForBank(state, viewId, accountId, tableLayoutId, bankColumns),
    )
    const searchInputRef = useRef(null)
    const searchHandlersRef = useRef({})
    searchHandlersRef.current = {
        onSearchNext: () => E.navigateToMatch(dataRef.current, searchMatches, highlightedId, viewId, 1),
        onSearchPrev: () => E.navigateToMatch(dataRef.current, searchMatches, highlightedId, viewId, -1),
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

    // Uses getData() to access current data without adding to deps (prevents keymap registration loop)
    const getData = useCallback(() => dataRef.current, [])
    const handleHighlightChange = useCallback(E.dispatchHighlightChange(getData, viewId), [getData, viewId])

    const handleEscape = useCallback(() => E.clearSearch(searchQuery, viewId), [searchQuery, viewId])

    const handleRowClick = useCallback(row => handleHighlightChange(row.transaction?.id), [handleHighlightChange])

    // -----------------------------------------------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(
        () => post(Action.SetPageTitle('Checking Account', 'View and filter your checking account transactions')),
        [],
    )

    useEffect(() => E.initDateRangeIfNeeded(dateRangeKey, dateRange, viewId), [dateRangeKey, dateRange, viewId])
    useEffect(E.searchActionsEffect(viewId, searchHandlersRef, searchInputRef), [viewId])

    // Wait for EnsureTableLayout to populate Redux on first render
    if (!tableLayout) return null

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow
                viewId={viewId}
                accountId={accountId}
                searchQuery={searchQuery}
                searchMatches={searchMatches}
                highlightedId={highlightedId}
                searchInputRef={searchInputRef}
                onSearchNext={() => searchHandlersRef.current.onSearchNext()}
                onSearchPrev={() => searchHandlersRef.current.onSearchPrev()}
            />
            <div style={mainContentStyle}>
                <DataTable
                    columns={bankColumns}
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

export { TransactionRegisterPage }
