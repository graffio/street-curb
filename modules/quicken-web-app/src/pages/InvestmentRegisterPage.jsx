// ABOUTME: Investment transaction register page — filtering, search, and sortable transaction table
// ABOUTME: Composes investment-specific filter chips and SearchChip as children of FilterChipRow

import { KeymapModule } from '@graffio/keymap'
import { Flex } from '@radix-ui/themes'
import { DataTable } from '../components/DataTable.jsx'
import React from 'react'
import { useSelector } from 'react-redux'
import { FocusRegistry } from '../commands/data-sources/focus-registry.js'
import { post } from '../commands/post.js'
import {
    ActionFilterColumn,
    DateFilterColumn,
    FilterChipRow,
    SearchFilterColumn,
    SecurityFilterColumn,
} from '../components/index.js'
import { SearchChip } from '../components/SearchChip.jsx'
import { TransactionColumns } from '../columns/index.js'
import { RegisterNavigation } from '../store/register-navigation.js'
import * as S from '../store/selectors.js'
import { Action, TableLayout } from '../types/index.js'

const { ActionRegistry } = KeymapModule
const { investmentColumns } = TransactionColumns

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
        actionCleanup = null
        if (element) {
            actionCleanup = ActionRegistry.register(pageState.viewId, [
                {
                    id: 'select',
                    description: 'Next match',
                    execute: () => post(Action.SetViewUiState(pageState.viewId, { navigateSearch: 1 })),
                },
                {
                    id: 'search:prev',
                    description: 'Previous match',
                    execute: () => post(Action.SetViewUiState(pageState.viewId, { navigateSearch: -1 })),
                },
                {
                    id: 'search:open',
                    description: 'Open search',
                    execute: () => FocusRegistry.focus('search_' + pageState.viewId),
                },
            ])
            post(Action.SetTransactionFilter(pageState.viewId, { initDateRange: true }))
        }
    },

    // Clears search input DOM value and resets search filter
    // @sig clearSearch :: () -> void
    clearSearch: () => {
        const el = FocusRegistry.get('search_' + pageState.viewId)
        if (el) el.value = ''
        post(Action.SetTransactionFilter(pageState.viewId, { searchQuery: '' }))
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const pageContainerStyle = { height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

let pageState = { viewId: null }
let actionCleanup = null

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Investment transaction register with filtering, search, and sortable table
 *
 * @sig InvestmentRegisterPage :: ({ accountId: String, height?: Number }) -> ReactElement
 */
const InvestmentRegisterPage = ({ accountId, height = '100%' }) => {
    const viewId = `reg_${accountId}`
    const tableLayoutId = RegisterNavigation.toTableLayoutId('investment', accountId)
    pageState = { viewId }

    // --- Selectors ---
    const searchQuery = useSelector(state => S.UI.searchQuery(state, viewId))
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const tableLayout = useSelector(state => S.tableLayoutOrDefault(state, tableLayoutId, investmentColumns))
    const { sorting, columnSizing, columnOrder } = TableLayout.toDataTableProps(tableLayout)
    const data = useSelector(state =>
        S.Transactions.sortedForDisplay(state, viewId, accountId, tableLayoutId, investmentColumns),
    )
    const highlightedId = useSelector(state =>
        S.Transactions.highlightedId(state, viewId, accountId, tableLayoutId, investmentColumns),
    )
    const filteredCount = useSelector(state => S.Transactions.filteredForInvestment(state, viewId, accountId).length)
    const totalCount = useSelector(state => S.Transactions.forAccount(state, viewId, accountId).length)

    const filterChipRowProps = { viewId, filteredCount, totalCount, itemLabel: 'transactions' }

    const searchChipProps = {
        viewId,
        accountId,
        highlightedId,
        onNext: () => post(Action.SetViewUiState(viewId, { navigateSearch: 1 })),
        onPrev: () => post(Action.SetViewUiState(viewId, { navigateSearch: -1 })),
        onClear: E.clearSearch,
    }

    const dataTableProps = {
        columns: investmentColumns,
        data,
        height,
        rowHeight: 60,
        highlightedId,
        sorting,
        columnSizing,
        columnOrder,
        onSortingChange: updater =>
            post(Action.SetTableLayout(TableLayout.applySortingChange(tableLayout, updater(sorting)))),
        onColumnSizingChange: updater =>
            post(Action.SetTableLayout(TableLayout.applySizingChange(tableLayout, updater(columnSizing)))),
        onColumnOrderChange: newOrder =>
            post(Action.SetTableLayout(TableLayout.applyOrderChange(tableLayout, newOrder))),
        onRowClick: row => row.transaction && post(Action.SetViewUiState(viewId, { highlightRow: row.transaction.id })),
        onHighlightChange: newId => post(Action.SetViewUiState(viewId, { highlightRow: newId })),
        onEscape: () => searchQuery && E.clearSearch(),
        actionContext: viewId,
        context: { searchQuery: searchQuery || filterQuery },
    }

    return (
        <Flex direction="column" style={pageContainerStyle} ref={E.registerPageActions}>
            <FilterChipRow {...filterChipRowProps}>
                <DateFilterColumn viewId={viewId} />
                <SecurityFilterColumn viewId={viewId} />
                <ActionFilterColumn viewId={viewId} />
                <SearchFilterColumn viewId={viewId} />
                <SearchChip {...searchChipProps} />
            </FilterChipRow>
            <div style={mainContentStyle}>
                <DataTable {...dataTableProps} />
            </div>
        </Flex>
    )
}

export { InvestmentRegisterPage }
