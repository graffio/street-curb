// ABOUTME: Root reducer for application state
// ABOUTME: Manages all entities (LookupTables) and transaction filter state

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Account } from '../types/account.js'
import { Action } from '../types/action.js'
import { Category } from '../types/category.js'
import { Security } from '../types/security.js'
import { Split } from '../types/split.js'
import { Tag } from '../types/tag.js'
import { Transaction } from '../types/transaction.js'

const initialState = {
    initialized: true,
    accounts: LookupTable([], Account, 'id'),
    categories: LookupTable([], Category, 'id'),
    securities: LookupTable([], Security, 'id'),
    tags: LookupTable([], Tag, 'id'),
    splits: LookupTable([], Split, 'id'),
    transactions: LookupTable([], Transaction, 'id'),
    transactionFilters: {
        dateRange: null,
        dateRangeKey: 'lastTwelveMonths',
        filterQuery: '',
        searchQuery: '',
        selectedCategories: [],
        currentSearchIndex: 0,
        currentRowIndex: 0,
        customStartDate: null,
        customEndDate: null,
    },
}

const rootReducer = (state = initialState, action) => {
    if (!Action.is(action.payload)) return state

    return action.payload.match({
        LoadFile: ({ accounts, categories, securities, tags, splits, transactions }) => ({
            ...state,
            accounts,
            categories,
            securities,
            tags,
            splits,
            transactions,
        }),
        SetTransactionFilter: ({ payload }) => ({
            ...state,
            transactionFilters: { ...state.transactionFilters, ...payload },
        }),
        ResetTransactionFilters: () => ({
            ...state,
            transactionFilters: { ...initialState.transactionFilters, dateRangeKey: 'all' },
        }),
    })
}

export { rootReducer }
