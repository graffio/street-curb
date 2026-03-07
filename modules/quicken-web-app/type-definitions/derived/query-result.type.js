// ABOUTME: TaggedSum type for query execution results
// ABOUTME: Six variants — Identity, Scalar, FilteredEntities, TimeSeries, Pivot, RunningBalance

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
        Scalar:           { value: 'Number', expression: 'Object' },
        FilteredEntities: { entities: '[Object]', source: FieldTypes.sourceName },
        TimeSeries:       { snapshots: '[Object]', source: FieldTypes.sourceName },
        Pivot:            { columns: '[String]', rows: '[String]', cells: 'Object', computed: 'Object', rowTotals: 'Object' },
        RunningBalance:   { entries: '[Object]' },
    },
}
