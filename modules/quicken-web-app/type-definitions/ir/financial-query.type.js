// ABOUTME: TaggedSum for domain-specific financial queries — replaces Query+IRSource+IRDomain+IRComputation
// ABOUTME: Six variants — each carries only its domain-relevant fields, dispatched via .match() in the execution engine

import { FieldTypes } from '../field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const FinancialQuery = {
    name: 'FinancialQuery',
    kind: 'taggedSum',
    variants: {
        TransactionQuery:   { name: 'String', description: 'String?', filter: 'IRFilter?', dateRange: 'IRDateRange?', grouping: 'IRGrouping?', computed: '[ComputedRow]?' },
        PositionQuery:      { name: 'String', description: 'String?', filter: 'IRFilter?', dateRange: 'IRDateRange?', grouping: 'IRGrouping?', metrics: '[String]?', orderByField: 'String?', orderByDirection: { pattern: FieldTypes.sortDirection, optional: true }, limit: 'Number?' },
        AccountQuery:       { name: 'String', description: 'String?', filter: 'IRFilter?' },
        ExpressionQuery:    { name: 'String', description: 'String?', left: 'FinancialQuery', right: 'FinancialQuery', expression: 'IRExpression' },
        SnapshotQuery:      { name: 'String', description: 'String?', domain: FieldTypes.snapshotDomain, filter: 'IRFilter?', dateRange: 'IRDateRange', interval: FieldTypes.timeSeriesInterval },
        RunningBalanceQuery: { name: 'String', description: 'String?', filter: 'IRFilter?', dateRange: 'IRDateRange?' },
    },
}
