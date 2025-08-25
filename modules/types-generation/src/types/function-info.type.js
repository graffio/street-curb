// Tagged type definition for FunctionInfo
export const FunctionInfo = {
    name: 'FunctionInfo',
    kind: 'tagged',
    fields: {
        typeName: 'String', // name of type this function belongs to
        functionName: 'String', // name of the function
        node: 'Object', // AST node
        sourceCode: 'String', // generated source code
    },
}
