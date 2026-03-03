// ABOUTME: Tagged type for query data sources with domain, filters, and date range
// ABOUTME: Keyed by name — collected into LookupTable in QueryIR

import { FieldTypes } from './field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const QuerySource = {
    name: 'QuerySource',
    kind: 'tagged',
    fields: {
        name:      FieldTypes.sourceName,
        domain:    'Domain',
        filters:   '[QueryFilter]',
        dateRange: 'DateRange?',
        groupBy:   { pattern: FieldTypes.groupDimension, optional: true },
    },
}
