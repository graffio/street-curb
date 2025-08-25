// Tagged type definition for ParseResult
// This is "walking the walk" - using our own tagged type system to define the types
// used in the type definition schema validation system

export const ParseResult = {
    name: 'ParseResult',
    kind: 'tagged',
    fields: {
        typeDefinition: 'Object', // TypeDefinition (TaggedType | TaggedSumType)
        imports: 'Array', // [ImportInfo]
        functions: 'Array', // [FunctionInfo]
        sourceContent: 'String', // original source code
    },
}
