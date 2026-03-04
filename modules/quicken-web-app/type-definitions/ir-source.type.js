// ABOUTME: Tagged type for query data sources with domain, filters, and date range
// ABOUTME: Keyed by name — collected into LookupTable in Query

import { FieldTypes } from './field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IRSource = {
    name: 'IRSource',
    kind: 'tagged',
    fields: {
        name:      FieldTypes.sourceName,
        domain:    'IRDomain',
        filters:   '[IRFilter]',
        dateRange: 'IRDateRange?',
        groupBy:   { pattern: FieldTypes.groupDimension, optional: true },
        metrics:   '[String]?',
    },
}
