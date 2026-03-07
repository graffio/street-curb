// ABOUTME: TaggedSum type for date range specifications in query source clauses
// ABOUTME: Five variants covering absolute and relative date ranges

import { FieldTypes } from '../field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IRDateRange = {
    name: 'IRDateRange',
    kind: 'taggedSum',
    variants: {
        Year:     { year: 'Number' },
        Quarter:  { quarter: 'Number', year: 'Number' },
        Month:    { month: 'Number', year: 'Number' },
        Relative: { unit: FieldTypes.timeUnit, count: 'Number' },
        Range:    { start: 'String', end: 'String' },
    },
}
