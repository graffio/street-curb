// ABOUTME: Generated type definition for FunctionInfo
// ABOUTME: Auto-generated from modules/cli-type-generator/type-definitions/function-info.type.js - do not edit manually

/** {@link module:FunctionInfo} */
/*  FunctionInfo generated from: modules/cli-type-generator/type-definitions/function-info.type.js
 *
 *  typeName    : "String",
 *  functionName: "String",
 *  node        : "Object",
 *  sourceCode  : "String"
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
 * @sig FunctionInfo :: (String, String, Object, String) -> FunctionInfo
 */
const FunctionInfo = function FunctionInfo(typeName, functionName, node, sourceCode) {
    const constructorName = 'FunctionInfo(typeName, functionName, node, sourceCode)'
    R.validateArgumentLength(constructorName, 4, arguments)
    R.validateString(constructorName, 'typeName', false, typeName)
    R.validateString(constructorName, 'functionName', false, functionName)
    R.validateObject(constructorName, 'node', false, node)
    R.validateString(constructorName, 'sourceCode', false, sourceCode)

    const result = Object.create(prototype)
    result.typeName = typeName
    result.functionName = functionName
    result.node = node
    result.sourceCode = sourceCode
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/** JMG
 * Convert to string representation
 * @sig functioninfoToString :: () -> String
 */
const functioninfoToString = function () {
    return `FunctionInfo(${R._toString(this.typeName)},
        ${R._toString(this.functionName)},
        ${R._toString(this.node)},
        ${R._toString(this.sourceCode)})`
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
    const { typeName, functionName, node, sourceCode } = _input
    return FunctionInfo(typeName, functionName, node, sourceCode)
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
