/** {@link module:ImportInfo} */
/*  ImportInfo generated from: modules/cli-type-generator/type-definitions/import-info.type.js
 *
 *  source    : "String",
 *  specifiers: "Array"
 *
 */

import * as R from '@graffio/cli-type-generator'

import { Array } from './array.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const ImportInfo = function ImportInfo(source, specifiers) {
    const constructorName = 'ImportInfo(source, specifiers)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'source', false, source)
    R.validateTag(constructorName, 'Array', 'specifiers', false, specifiers)

    const result = Object.create(prototype)
    result.source = source
    result.specifiers = specifiers
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'ImportInfo', enumerable: false },

    toString: {
        value: function () {
            return `ImportInfo(${R._toString(this.source)}, ${R._toString(this.specifiers)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return this
        },
        enumerable: false,
    },

    constructor: {
        value: ImportInfo,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

ImportInfo.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ImportInfo.toString = () => 'ImportInfo'
ImportInfo.is = v => v && v['@@typeName'] === 'ImportInfo'

ImportInfo._from = o => ImportInfo(o.source, o.specifiers)
ImportInfo.from = ImportInfo._from

ImportInfo._toFirestore = (o, encodeTimestamps) => {
    const result = {
        source: o.source,
        specifiers: Array.toFirestore(o.specifiers, encodeTimestamps),
    }

    return result
}

ImportInfo._fromFirestore = (doc, decodeTimestamps) =>
    ImportInfo._from({
        source: doc.source,
        specifiers: Array.fromFirestore
            ? Array.fromFirestore(doc.specifiers, decodeTimestamps)
            : Array.from(doc.specifiers),
    })

// Public aliases (override if necessary)
ImportInfo.toFirestore = ImportInfo._toFirestore
ImportInfo.fromFirestore = ImportInfo._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ImportInfo }
