// ABOUTME: TaggedSum type for query computation strategies
// ABOUTME: Four variants dispatched by execution engine via .match()

import { FieldTypes } from './field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const Computation = {
    name: 'Computation',
    kind: 'taggedSum',
    variants: {
        Identity:       { source: FieldTypes.sourceName },
        Compare:        { left: FieldTypes.sourceName, right: FieldTypes.sourceName },
        Expression:     { expression: 'ExpressionNode' },
        FilterEntities: { source: FieldTypes.sourceName },
    },
}
