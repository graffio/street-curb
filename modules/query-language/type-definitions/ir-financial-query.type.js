// ABOUTME: TaggedSum for domain-specific financial queries
// ABOUTME: Three variants — each carries domain-relevant fields, dispatched via .match() in the engine

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
        TransactionQuery:   { name: 'String', description: 'String?', filter: 'IRFilter?', dateRange: 'IRDateRange?', grouping: 'IRGrouping', computed: '[IRComputedRow]?' },
        PositionQuery:      { name: 'String', description: 'String?', filter: 'IRFilter?', dateRange: 'IRDateRange?', grouping: 'IRGrouping?', metrics: '[String]?', orderByField: 'String?', orderByDirection: { pattern: FieldTypes.sortDirection, optional: true }, limit: 'Number?' },
        SnapshotQuery:      { name: 'String', description: 'String?', domain: FieldTypes.snapshotDomain, filter: 'IRFilter?', grouping: 'IRGrouping?', dateRange: 'IRDateRange', interval: FieldTypes.timeSeriesInterval },
    },
}
