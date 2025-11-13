/** @module ImportInfo */

// Tagged type definition for ImportInfo
export const ImportInfo = {
    name: 'ImportInfo',
    kind: 'tagged',
    fields: {
        source: 'String', // module path
        specifiers: 'Array', // [ImportSpecifier]
    },
}
