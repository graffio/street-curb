// ABOUTME: TaggedSum type for query execution results
// ABOUTME: Five variants matching IRComputation — computation shape is orthogonal to data shape (QueryResultTree)

import { FieldTypes } from './field-types.js'

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
        Comparison:       { left: 'QueryResultTree', right: 'QueryResultTree', source: FieldTypes.sourceName },
        Scalar:           { value: 'Number', expression: 'Object' },
        FilteredEntities: { entities: '[Account]', source: FieldTypes.sourceName },
        TimeSeries:       { snapshots: '[Object]', source: FieldTypes.sourceName },
    },
}
