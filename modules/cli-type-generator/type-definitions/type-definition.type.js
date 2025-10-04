/** @module TypeDefinition */

// TaggedSum type for TypeDefinition union
// This represents the union of TaggedType | TaggedSumType

export const TypeDefinition = {
    name: 'TypeDefinition',
    kind: 'taggedSum',
    variants: {
        Tagged: {
            name: 'String',
            kind: 'String', // 'tagged'
            fields: 'Object', // FieldMap
        },
        TaggedSum: {
            name: 'String',
            kind: 'String', // 'taggedSum'
            variants: 'Object', // VariantMap
        },
    },
}
