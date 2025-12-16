// ABOUTME: Generated type definition for ImportInfo
// ABOUTME: Auto-generated from modules/cli-type-generator/type-definitions/import-info.type.js - do not edit manually

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
/**
 * Construct a ImportInfo instance
 * @sig ImportInfo :: (String, Array) -> ImportInfo
 */
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
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Convert to string representation
 * @sig importinfoToString :: () -> String
 */
const importinfoToString = function () {
    return `ImportInfo(${R._toString(this.source)}, ${R._toString(this.specifiers)})`
}

/**
 * Convert to JSON representation
 * @sig importinfoToJSON :: () -> Object
 */
const importinfoToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'ImportInfo', enumerable: false },
    toString: { value: importinfoToString, enumerable: false },
    toJSON: { value: importinfoToJSON, enumerable: false },
    constructor: { value: ImportInfo, enumerable: false, writable: true, configurable: true },
})

ImportInfo.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ImportInfo.toString = () => 'ImportInfo'
ImportInfo.is = v => v && v['@@typeName'] === 'ImportInfo'

ImportInfo._from = _input => ImportInfo(_input.source, _input.specifiers)
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
