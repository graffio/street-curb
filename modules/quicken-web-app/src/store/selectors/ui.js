// ABOUTME: UI state selectors for ephemeral display state
// ABOUTME: Not persisted - resets on refresh
// COMPLEXITY: export-structure — UI is the standard acronym for "user interface"
// COMPLEXITY: signature-with-description — trivial accessors; names are self-documenting

// Default values for filter fields when no filter exists for a viewId
const defaults = {
    asOfDate: null, // Will use today's date when accessed if null
    dateRange: null,
    dateRangeKey: 'lastTwelveMonths',
    filterQuery: '',
    searchQuery: '',
    selectedCategories: [],
    selectedAccounts: [],
    selectedSecurities: [],
    selectedInvestmentActions: [],
    groupBy: null,
    currentSearchIndex: 0,
    currentRowIndex: 0,
    customStartDate: null,
    customEndDate: null,
}

const T = {
    toFilter: (state, viewId) => state.transactionFilters?.get(viewId),
    toDateRange: (state, viewId) => T.toFilter(state, viewId)?.dateRange ?? defaults.dateRange,
    toDateRangeKey: (state, viewId) => T.toFilter(state, viewId)?.dateRangeKey ?? defaults.dateRangeKey,
    toFilterQuery: (state, viewId) => T.toFilter(state, viewId)?.filterQuery ?? defaults.filterQuery,
    toSearchQuery: (state, viewId) => T.toFilter(state, viewId)?.searchQuery ?? defaults.searchQuery,
    toGroupBy: (state, viewId) => T.toFilter(state, viewId)?.groupBy ?? defaults.groupBy,

    toCurrentSearchIndex: (state, viewId) =>
        T.toFilter(state, viewId)?.currentSearchIndex ?? defaults.currentSearchIndex,

    toCurrentRowIndex: (state, viewId) => T.toFilter(state, viewId)?.currentRowIndex ?? defaults.currentRowIndex,
    toCustomStartDate: (state, viewId) => T.toFilter(state, viewId)?.customStartDate ?? defaults.customStartDate,
    toCustomEndDate: (state, viewId) => T.toFilter(state, viewId)?.customEndDate ?? defaults.customEndDate,

    toSelectedCategories: (state, viewId) =>
        T.toFilter(state, viewId)?.selectedCategories ?? defaults.selectedCategories,

    toSelectedAccounts: (state, viewId) => T.toFilter(state, viewId)?.selectedAccounts ?? defaults.selectedAccounts,

    toSelectedSecurities: (state, viewId) =>
        T.toFilter(state, viewId)?.selectedSecurities ?? defaults.selectedSecurities,

    toSelectedInvestmentActions: (state, viewId) =>
        T.toFilter(state, viewId)?.selectedInvestmentActions ?? defaults.selectedInvestmentActions,

    toAsOfDate: (state, viewId) => {
        const todayIso = () => new Date().toISOString().slice(0, 10)
        return T.toFilter(state, viewId)?.asOfDate ?? todayIso()
    },
}

const UI = {
    asOfDate: T.toAsOfDate,
    currentRowIndex: T.toCurrentRowIndex,
    currentSearchIndex: T.toCurrentSearchIndex,
    customEndDate: T.toCustomEndDate,
    customStartDate: T.toCustomStartDate,
    dateRange: T.toDateRange,
    dateRangeKey: T.toDateRangeKey,
    filterQuery: T.toFilterQuery,
    groupBy: T.toGroupBy,
    searchQuery: T.toSearchQuery,
    selectedAccounts: T.toSelectedAccounts,
    selectedCategories: T.toSelectedCategories,
    selectedInvestmentActions: T.toSelectedInvestmentActions,
    selectedSecurities: T.toSelectedSecurities,
    transactionFilter: T.toFilter,
}

export { UI }
