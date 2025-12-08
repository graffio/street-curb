// ABOUTME: Root reducer for application state
// ABOUTME: Manages transaction filter state and application initialization

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
    switch (action.type) {
        case 'SET_TRANSACTION_FILTER':
            return { ...state, transactionFilters: { ...state.transactionFilters, ...action.payload } }

        case 'RESET_TRANSACTION_FILTERS':
            return { ...state, transactionFilters: { ...initialState.transactionFilters, dateRangeKey: 'all' } }

        default:
            return state
    }
}

export { rootReducer }
