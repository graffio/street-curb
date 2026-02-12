// ABOUTME: Type definition for TransactionFilter - per-view filter criteria
// ABOUTME: Contains only filter criteria (dateRange, selectedCategories, etc.) — ephemeral UI state is in ViewUiState

import { FieldTypes } from './field-types.js'
import { Transaction } from './transaction.js'

export const TransactionFilter = {
    name: 'TransactionFilter',
    kind: 'tagged',
    fields: {
        id: FieldTypes.viewId,
        asOfDate: 'String?',
        dateRange: 'Object?',
        dateRangeKey: 'String',
        filterQuery: 'String',
        searchQuery: 'String',
        selectedCategories: '[String]',
        selectedAccounts: '[String]',
        selectedSecurities: '[String]',
        selectedInvestmentActions: '[String]',
        groupBy: 'String?',
        customStartDate: 'Object?',
        customEndDate: 'Object?',
    },
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

// Investment action types for filter chip dropdowns
// @sig INVESTMENT_ACTIONS :: [{ id: String, label: String }]
TransactionFilter.INVESTMENT_ACTIONS = [
    { id: 'Buy', label: 'Buy' },
    { id: 'Sell', label: 'Sell' },
    { id: 'Div', label: 'Dividend' },
    { id: 'ReinvDiv', label: 'Reinvest Dividend' },
    { id: 'XIn', label: 'Transfer In' },
    { id: 'XOut', label: 'Transfer Out' },
    { id: 'ContribX', label: 'Contribution' },
    { id: 'WithdrwX', label: 'Withdrawal' },
    { id: 'ShtSell', label: 'Short Sell' },
    { id: 'CvrShrt', label: 'Cover Short' },
    { id: 'CGLong', label: 'Long-Term Gain' },
    { id: 'CGShort', label: 'Short-Term Gain' },
    { id: 'MargInt', label: 'Margin Interest' },
    { id: 'ShrsIn', label: 'Shares In' },
    { id: 'ShrsOut', label: 'Shares Out' },
    { id: 'StkSplit', label: 'Stock Split' },
    { id: 'Exercise', label: 'Exercise Option' },
    { id: 'Expire', label: 'Expire Option' },
]

// -----------------------------------------------------------------------------
// Predicates
// -----------------------------------------------------------------------------

// Checks if any filter field differs from defaults (dateRangeKey, filterQuery, selectedCategories, etc.)
// @sig isActive :: TransactionFilter -> Boolean
TransactionFilter.isActive = filter =>
    filter.dateRangeKey !== 'all' ||
    filter.filterQuery.length > 0 ||
    filter.selectedCategories.length > 0 ||
    filter.selectedAccounts.length > 0 ||
    filter.selectedSecurities.length > 0 ||
    filter.selectedInvestmentActions.length > 0

// -----------------------------------------------------------------------------
// Filter Application Methods
// -----------------------------------------------------------------------------

// Applies all filter criteria to a transaction list
// @sig apply :: (TransactionFilter, [Transaction], LookupTable<Category>, LookupTable<Security>) -> [Transaction]
TransactionFilter.apply = (filter, transactions, categories, securities) => {
    const { dateRange, filterQuery, selectedAccounts, selectedCategories } = filter
    return transactions
        .filter(Transaction.matchesText(filterQuery, categories, securities))
        .filter(Transaction.isInDateRange(dateRange))
        .filter(Transaction.matchesCategories(selectedCategories, categories))
        .filter(t => !selectedAccounts.length || selectedAccounts.includes(t.accountId))
}

// Applies investment-specific filters on top of base filtering, optionally scoped to one account
// @sig applyInvestment :: (TransactionFilter, [Transaction], Categories, Securities, String?) -> [Transaction]
TransactionFilter.applyInvestment = (filter, transactions, categories, securities, accountId) => {
    const { selectedInvestmentActions, selectedSecurities } = filter
    return TransactionFilter.apply(filter, transactions, categories, securities)
        .filter(t => !accountId || t.accountId === accountId)
        .filter(Transaction.matchesSecurities(selectedSecurities))
        .filter(Transaction.matchesInvestmentActions(selectedInvestmentActions))
}
