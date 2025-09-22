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
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = {
    toString: function () {
        return `FunctionInfo(${R._toString(this.typeName)}, ${R._toString(this.functionName)}, ${R._toString(this.node)}, ${R._toString(this.sourceCode)})`
    },
    toJSON() {
        return this
    },
}

FunctionInfo.prototype = prototype
prototype.constructor = FunctionInfo

Object.defineProperty(prototype, '@@typeName', { value: 'FunctionInfo' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
FunctionInfo.toString = () => 'FunctionInfo'
FunctionInfo.is = v => v && v['@@typeName'] === 'FunctionInfo'
FunctionInfo.from = o => FunctionInfo(o.typeName, o.functionName, o.node, o.sourceCode)

export { FunctionInfo }
