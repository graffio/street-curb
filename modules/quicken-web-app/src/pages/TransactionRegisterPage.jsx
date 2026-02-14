// ABOUTME: Bank transaction register page — filtering, search, and sortable transaction table
// ABOUTME: Composes filter chips and SearchChip as children of FilterChipRow
// COMPLEXITY: react-redux-separation — 2 useEffect lifecycle dispatches need infrastructure to eliminate

import { Flex } from '@radix-ui/themes'
import { DataTable } from '../components/DataTable.jsx'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { CategoryFilterColumn, DateFilterColumn, FilterChipRow, SearchFilterColumn } from '../components/index.js'
import { SearchChip } from '../components/SearchChip.jsx'
import { TransactionColumns } from '../columns/index.js'
import { RegisterNavigation } from '../store/register-navigation.js'
import { RegisterPageCommands } from './register-page-commands.js'
import * as S from '../store/selectors.js'
import { Action, TableLayout } from '../types/index.js'

const { bankColumns } = TransactionColumns
const { searchInputRef } = RegisterPageCommands

const pageContainerStyle = { height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }
const bankFilterConfig = { categories: true, date: true, search: true }

/*
 * Bank transaction register with filtering, search, and sortable table
 *
 * @sig TransactionRegisterPage :: ({ accountId: String, height?: Number }) -> ReactElement
 */
const TransactionRegisterPage = ({ accountId, height = '100%' }) => {
    const viewId = `reg_${accountId}`
    const tableLayoutId = RegisterNavigation.toTableLayoutId('account', accountId)
    const ctx = {
        sortSelector: S.Transactions.sortedForBankDisplay,
        highlightSelector: S.Transactions.highlightedIdForBank,
        viewId,
        accountId,
        tableLayoutId,
        columns: bankColumns,
    }

    // --- Effects (remaining lifecycle concerns — each documents why useEffect is needed) ---
    useEffect(RegisterPageCommands.registerSearchActions(ctx), [viewId])
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const dateRange = useSelector(state => S.UI.dateRange(state, viewId))
    useEffect(
        () => RegisterPageCommands.initDateRange(dateRangeKey, dateRange, viewId),
        [dateRangeKey, dateRange, viewId],
    )

    // --- Selectors ---
    const searchQuery = useSelector(state => S.UI.searchQuery(state, viewId))
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const tableLayout = useSelector(state => S.tableLayoutOrDefault(state, tableLayoutId, bankColumns))
    const { sorting, columnSizing, columnOrder } = TableLayout.toDataTableProps(tableLayout)
    const data = useSelector(state =>
        S.Transactions.sortedForBankDisplay(state, viewId, accountId, tableLayoutId, bankColumns),
    )
    const highlightedId = useSelector(state =>
        S.Transactions.highlightedIdForBank(state, viewId, accountId, tableLayoutId, bankColumns),
    )

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow viewId={viewId} accountId={accountId} filterConfig={bankFilterConfig}>
                <DateFilterColumn viewId={viewId} />
                <CategoryFilterColumn viewId={viewId} />
                <SearchFilterColumn viewId={viewId} />
                <SearchChip
                    viewId={viewId}
                    accountId={accountId}
                    highlightedId={highlightedId}
                    inputRef={searchInputRef}
                    onNext={() => RegisterPageCommands.handleSearchNavigate(ctx, 1)}
                    onPrev={() => RegisterPageCommands.handleSearchNavigate(ctx, -1)}
                />
            </FilterChipRow>
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
                    onSortingChange={updater =>
                        post(Action.SetTableLayout(TableLayout.applySortingChange(tableLayout, updater(sorting))))
                    }
                    onColumnSizingChange={updater =>
                        post(Action.SetTableLayout(TableLayout.applySizingChange(tableLayout, updater(columnSizing))))
                    }
                    onColumnOrderChange={newOrder =>
                        post(Action.SetTableLayout(TableLayout.applyOrderChange(tableLayout, newOrder)))
                    }
                    onRowClick={row =>
                        row.transaction && RegisterPageCommands.highlightRow(data, viewId, row.transaction.id)
                    }
                    onHighlightChange={newId => RegisterPageCommands.highlightRow(data, viewId, newId)}
                    onEscape={() => searchQuery && post(Action.SetTransactionFilter(viewId, { searchQuery: '' }))}
                    actionContext={viewId}
                    context={{ searchQuery: searchQuery || filterQuery }}
                />
            </div>
        </Flex>
    )
}

export { TransactionRegisterPage }
