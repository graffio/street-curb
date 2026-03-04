// ABOUTME: TaggedSum type for query execution results
// ABOUTME: Four variants matching Computation — computation shape is orthogonal to data shape (ResultTree)

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
        Identity:         { tree: 'ResultTree', source: 'String' },
        Comparison:       { left: 'ResultTree', right: 'ResultTree', source: 'String' },
        Scalar:           { value: 'Number', expression: 'ExpressionNode' },
        FilteredEntities: { entities: '[Account]', source: 'String' },
    },
}
