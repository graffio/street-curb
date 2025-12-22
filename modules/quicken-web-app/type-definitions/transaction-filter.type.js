import { FieldTypes } from './field-types.js'

export const TransactionFilter = {
    name: 'TransactionFilter',
    kind: 'tagged',
    fields: {
        id: FieldTypes.viewId,
        dateRange: 'Object?',
        dateRangeKey: 'String',
        filterQuery: 'String',
        searchQuery: 'String',
        selectedCategories: '[String]',
        selectedAccounts: '[String]',
        groupBy: 'String?',
        currentSearchIndex: 'Number',
        currentRowIndex: 'Number',
        customStartDate: 'Object?',
        customEndDate: 'Object?',
    },
}
