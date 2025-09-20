/*  FunctionInfo generated from: modules/types-generation/src/types/function-info.type.js

    typeName    : "String",
    functionName: "String",
    node        : "Object",
    sourceCode  : "String"

*/

import * as R from '@graffio/types-generation'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const FunctionInfo = function FunctionInfo(typeName, functionName, node, sourceCode) {
    R.validateArgumentLength('FunctionInfo(typeName, functionName, node, sourceCode)', 4, arguments)
    R.validateString('FunctionInfo(typeName, functionName, node, sourceCode)', 'typeName', false, typeName)
    R.validateString('FunctionInfo(typeName, functionName, node, sourceCode)', 'functionName', false, functionName)
    R.validateObject('FunctionInfo(typeName, functionName, node, sourceCode)', 'node', false, node)
    R.validateString('FunctionInfo(typeName, functionName, node, sourceCode)', 'sourceCode', false, sourceCode)

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
