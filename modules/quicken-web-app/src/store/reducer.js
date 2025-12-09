// ABOUTME: Root reducer for application state
// ABOUTME: Manages transactions (LookupTable) and transaction filter state

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Action } from '../types/action.js'
import { Transaction } from '../types/transaction.js'

const initialState = {
    initialized: true,
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
        LoadFile: ({ transactions }) => ({ ...state, transactions }),
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
