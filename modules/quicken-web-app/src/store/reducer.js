// ABOUTME: Root reducer for application state
// ABOUTME: Manages transaction filter state and application initialization

import { Action } from '../types/action.js'

const initialState = {
    initialized: true,
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
