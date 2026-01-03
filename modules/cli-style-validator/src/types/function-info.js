// ABOUTME: Generated type definition for FunctionInfo
// ABOUTME: Auto-generated from modules/cli-style-validator/type-definitions/function-info.type.js - do not edit manually

/** {@link module:FunctionInfo} */
/*  FunctionInfo generated from: modules/cli-style-validator/type-definitions/function-info.type.js
 *
 *  name: "String",
 *  line: "Number",
 *  node: "Object"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a FunctionInfo instance
 * @sig FunctionInfo :: (String, Number, Object) -> FunctionInfo
 */
const FunctionInfo = function FunctionInfo(name, line, node) {
    const constructorName = 'FunctionInfo(name, line, node)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'name', false, name)
    R.validateNumber(constructorName, 'line', false, line)
    R.validateObject(constructorName, 'node', false, node)

    const result = Object.create(prototype)
    result.name = name
    result.line = line
    result.node = node
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig functioninfoToString :: () -> String
 */
const functioninfoToString = function () {
    return `FunctionInfo(${R._toString(this.name)}, ${R._toString(this.line)}, ${R._toString(this.node)})`
}

/*
 * Convert to JSON representation
 * @sig functioninfoToJSON :: () -> Object
 */
const functioninfoToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'FunctionInfo', enumerable: false },
    toString: { value: functioninfoToString, enumerable: false },
    toJSON: { value: functioninfoToJSON, enumerable: false },
    constructor: { value: FunctionInfo, enumerable: false, writable: true, configurable: true },
})

FunctionInfo.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
FunctionInfo.toString = () => 'FunctionInfo'
FunctionInfo.is = v => v && v['@@typeName'] === 'FunctionInfo'

FunctionInfo._from = _input => {
    const { name, line, node } = _input
    return FunctionInfo(name, line, node)
}
FunctionInfo.from = FunctionInfo._from

FunctionInfo._toFirestore = (o, encodeTimestamps) => ({ ...o })

FunctionInfo._fromFirestore = (doc, decodeTimestamps) => FunctionInfo._from(doc)

// Public aliases (override if necessary)
FunctionInfo.toFirestore = FunctionInfo._toFirestore
FunctionInfo.fromFirestore = FunctionInfo._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { FunctionInfo }
