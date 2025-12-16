/** @module ImportSpecifier */

import { FieldTypes } from './field-types.js'

// TaggedSum type definition for ImportSpecifier
// Represents the three kinds of ES6 import specifiers:
// - Default: import Foo from 'module'
// - Namespace: import * as Foo from 'module'
// - Named: import { Foo } from 'module' or import { Foo as Bar } from 'module'
export const ImportSpecifier = {
    name: 'ImportSpecifier',
    kind: 'taggedSum',
    variants: {
        Default: { local: FieldTypes.jsIdentifier },
        Namespace: { local: FieldTypes.jsIdentifier },
        Named: { imported: FieldTypes.jsIdentifier, local: FieldTypes.jsIdentifier },
    },
}
