import { FieldTypes } from './field-types.js'

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
    },
}
