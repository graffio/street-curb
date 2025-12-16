/** @module ImportInfo */

import { FieldTypes } from './field-types.js'

// Tagged type definition for ImportInfo
// Represents an ES6 import statement with source module and specifiers
export const ImportInfo = {
    name: 'ImportInfo',
    kind: 'tagged',
    fields: { source: FieldTypes.modulePath, specifiers: '[ImportSpecifier]' },
}
