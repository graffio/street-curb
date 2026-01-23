// ABOUTME: Type definition for TransactionFilter - per-view filter and UI state
// ABOUTME: Contains filter criteria (dateRange, selectedCategories) and UI state (columnSizing, treeExpansion)
// TODO: Split into FilterCriteria (what to show) and ViewUIState (how to show it)

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
        currentSearchIndex: 'Number',
        currentRowIndex: 'Number',
        customStartDate: 'Object?',
        customEndDate: 'Object?',
        treeExpansion: 'Object?',
        columnSizing: 'Object?',
        columnOrder: '[String]?',
    },
}

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
