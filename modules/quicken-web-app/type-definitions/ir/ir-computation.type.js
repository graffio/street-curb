// ABOUTME: TaggedSum type for query computation strategies
// ABOUTME: Five variants dispatched by execution engine via .match()

import { FieldTypes } from '../field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IRComputation = {
    name: 'IRComputation',
    kind: 'taggedSum',
    variants: {
        Identity:       { source: FieldTypes.sourceName },
        Compare:        { left: FieldTypes.sourceName, right: FieldTypes.sourceName },
        Expression:     { expression: 'IRExpression' },
        FilterEntities: { source: FieldTypes.sourceName },
        TimeSeries:     { source: FieldTypes.sourceName, interval: FieldTypes.timeSeriesInterval },
    },
}
