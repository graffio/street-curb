// ABOUTME: TaggedSum type for query execution results
// ABOUTME: Three variants — Identity, TimeSeries, Pivot

import { FieldTypes } from '../field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const QueryResult = {
    name: 'QueryResult',
    kind: 'taggedSum',
    variants: {
        Identity:         { tree: 'QueryResultTree', source: FieldTypes.sourceName },
        TimeSeries:       { snapshots: '[Object]', source: FieldTypes.sourceName },
        Pivot:            { columns: '[String]', rows: '[String]', cells: 'Object', computed: 'Object', rowTotals: 'Object' },
    },
}
