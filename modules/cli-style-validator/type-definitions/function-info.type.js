/** @module FunctionInfo */

// Tagged type for function with location and AST node reference
export const FunctionInfo = {
    name: 'FunctionInfo',
    kind: 'tagged',
    fields: { name: 'String', line: 'Number', node: 'Object' },
}
