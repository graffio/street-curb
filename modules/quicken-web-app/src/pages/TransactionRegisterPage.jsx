// ABOUTME: Bank transaction register page — filtering, search, and sortable transaction table
// ABOUTME: Composes filter chips and SearchChip as children of FilterChipRow

import { KeymapModule } from '@graffio/keymap'
import { Flex } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { TransactionColumns } from '../columns/index.js'
import { FocusRegistry } from '../commands/data-sources/focus-registry.js'
import { post } from '../commands/post.js'
import { DataTable } from '../components/DataTable.jsx'
import { CategoryFilterColumn, DateFilterColumn, FilterChipRow, SearchFilterColumn } from '../components/index.js'
import { SearchChip } from '../components/SearchChip.jsx'
import { RegisterNavigation } from '../store/register-navigation.js'
import * as S from '../store/selectors.js'
import { Action as A, TableLayout as TL } from '../types/index.js'

const { ActionRegistry } = KeymapModule
const { bankColumns } = TransactionColumns

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Registers keyboard actions and initializes date range on page mount
    // @sig registerPageActions :: Element? -> void
    registerPageActions: element => {
        actionCleanup?.()
        actionCleanup = undefined

        if (!element) return

        actionCleanup = ActionRegistry.register(pageState.viewId, actions)
        post(A.SetTransactionFilter(pageState.viewId, { initDateRange: true }))
    },

    // Clears search input DOM value and resets search filter
    // @sig clearSearch :: () -> void
    clearSearch: () => {
        const el = FocusRegistry.get('search_' + pageState.viewId)

        if (el) el.value = ''

        post(A.SetTransactionFilter(pageState.viewId, { searchQuery: '' }))
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const pageContainerStyle = { height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }

// prettier-ignore
const actions = [
    { id: 'select'     , description: 'Next match'    , execute: () => post(A.SetViewUiState(pageState.viewId, { navigateSearch: 1 })) },
    { id: 'search:prev', description: 'Previous match', execute: () => post(A.SetViewUiState(pageState.viewId, { navigateSearch: -1 })) },
    { id: 'search:open', description: 'Open search'   , execute: () => FocusRegistry.focus('search_' + pageState.viewId) },
]

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

let pageState = { viewId: undefined }
let actionCleanup

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Bank transaction register with filtering, search, and sortable table
 *
 * @sig TransactionRegisterPage :: ({ accountId: String, height?: Number }) -> ReactElement
 */
const TransactionRegisterPage = ({ accountId, height = '100%' }) => {
    const viewId = `reg_${accountId}`
    const tableLayoutId = RegisterNavigation.toTableLayoutId('account', accountId)
    pageState = { viewId }

    // --- Selectors ---
    const searchQuery = useSelector(state => S.UI.searchQuery(state, viewId))
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const tableLayout = useSelector(state => S.tableLayoutOrDefault(state, tableLayoutId, bankColumns))
    const { sorting, columnSizing, columnOrder } = TL.toDataTableProps(tableLayout)
    const data = useSelector(state =>
        S.Transactions.sortedForBankDisplay(state, viewId, accountId, tableLayoutId, bankColumns),
    )
    const highlightedId = useSelector(state =>
        S.Transactions.highlightedIdForBank(state, viewId, accountId, tableLayoutId, bankColumns),
    )

    const searchChipProps = {
        viewId,
        accountId,
        highlightedId,
        onNext: () => post(A.SetViewUiState(viewId, { navigateSearch: 1 })),
        onPrev: () => post(A.SetViewUiState(viewId, { navigateSearch: -1 })),
        onClear: E.clearSearch,
    }

    const dataTableProps = {
        columns: bankColumns,
        data,
        height,
        rowHeight: 60,
        highlightedId,
        sorting,
        columnSizing,
        columnOrder,
        onSortingChange: updater => post(A.SetTableLayout(TL.applySortingChange(tableLayout, updater(sorting)))),
        onColumnSizingChange: updater =>
            post(A.SetTableLayout(TL.applySizingChange(tableLayout, updater(columnSizing)))),
        onColumnOrderChange: newOrder => post(A.SetTableLayout(TL.applyOrderChange(tableLayout, newOrder))),
        onRowClick: row => row.transaction && post(A.SetViewUiState(viewId, { highlightRow: row.transaction.id })),
        onHighlightChange: newId => post(A.SetViewUiState(viewId, { highlightRow: newId })),
        onEscape: () => searchQuery && E.clearSearch(),
        actionContext: viewId,
        context: { searchQuery: searchQuery || filterQuery },
    }

    return (
        <Flex direction="column" style={pageContainerStyle} ref={E.registerPageActions}>
            <FilterChipRow viewId={viewId} accountId={accountId}>
                <DateFilterColumn viewId={viewId} />
                <CategoryFilterColumn viewId={viewId} />
                <SearchFilterColumn viewId={viewId} />
                <SearchChip {...searchChipProps} />
            </FilterChipRow>
            <div style={mainContentStyle}>
                <DataTable {...dataTableProps} />
            </div>
        </Flex>
    )
}

export { TransactionRegisterPage }
