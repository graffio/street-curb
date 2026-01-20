// ABOUTME: UI state selectors for ephemeral display state
// ABOUTME: Not persisted - resets on refresh
// COMPLEXITY: export-structure — UI is the standard acronym for "user interface"
// COMPLEXITY: sig-documentation — trivial accessors; names are self-documenting

// Default values for filter fields when no filter exists for a viewId
const defaults = {
    asOfDate: null,
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

const asOfDate = (state, viewId) => {
    const todayIso = () => new Date().toISOString().slice(0, 10)
    return state.transactionFilters?.get(viewId)?.asOfDate ?? todayIso()
}

const transactionFilter = (state, viewId) => state.transactionFilters?.get(viewId)

// prettier-ignore
const UI = {
    asOfDate,
    currentRowIndex          : (state, viewId) => state.transactionFilters?.get(viewId)?.currentRowIndex           ?? defaults.currentRowIndex,
    currentSearchIndex       : (state, viewId) => state.transactionFilters?.get(viewId)?.currentSearchIndex        ?? defaults.currentSearchIndex,
    customEndDate            : (state, viewId) => state.transactionFilters?.get(viewId)?.customEndDate             ?? defaults.customEndDate,
    customStartDate          : (state, viewId) => state.transactionFilters?.get(viewId)?.customStartDate           ?? defaults.customStartDate,
    dateRange                : (state, viewId) => state.transactionFilters?.get(viewId)?.dateRange                 ?? defaults.dateRange,
    dateRangeKey             : (state, viewId) => state.transactionFilters?.get(viewId)?.dateRangeKey              ?? defaults.dateRangeKey,
    filterQuery              : (state, viewId) => state.transactionFilters?.get(viewId)?.filterQuery               ?? defaults.filterQuery,
    groupBy                  : (state, viewId) => state.transactionFilters?.get(viewId)?.groupBy                   ?? defaults.groupBy,
    searchQuery              : (state, viewId) => state.transactionFilters?.get(viewId)?.searchQuery               ?? defaults.searchQuery,
    selectedAccounts         : (state, viewId) => state.transactionFilters?.get(viewId)?.selectedAccounts          ?? defaults.selectedAccounts,
    selectedCategories       : (state, viewId) => state.transactionFilters?.get(viewId)?.selectedCategories        ?? defaults.selectedCategories,
    selectedInvestmentActions: (state, viewId) => state.transactionFilters?.get(viewId)?.selectedInvestmentActions ?? defaults.selectedInvestmentActions,
    selectedSecurities       : (state, viewId) => state.transactionFilters?.get(viewId)?.selectedSecurities        ?? defaults.selectedSecurities,
    transactionFilter,
}

export { UI }
