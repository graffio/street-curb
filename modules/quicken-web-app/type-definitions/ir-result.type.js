// ABOUTME: TaggedSum type for query execution results
// ABOUTME: Four variants matching IRComputation — computation shape is orthogonal to data shape (IRResultTree)

import { FieldTypes } from './field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IRResult = {
    name: 'IRResult',
    kind: 'taggedSum',
    variants: {
        Identity:         { tree: 'IRResultTree', source: FieldTypes.sourceName },
        Comparison:       { left: 'IRResultTree', right: 'IRResultTree', source: FieldTypes.sourceName },
        Scalar:           { value: 'Number', expression: 'IRExpression' },
        FilteredEntities: { entities: '[Account]', source: FieldTypes.sourceName },
    },
}
