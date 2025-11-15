/** {@link module:ParseResult} */
/*  ParseResult generated from: modules/cli-type-generator/type-definitions/parse-result.type.js
 *
 *  typeDefinition: "Object",
 *  imports       : "Array",
 *  functions     : "Array",
 *  sourceContent : "String"
 *
 */

import * as R from '@graffio/cli-type-generator'

import { Array } from './array.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const ParseResult = function ParseResult(typeDefinition, imports, functions, sourceContent) {
    const constructorName = 'ParseResult(typeDefinition, imports, functions, sourceContent)'
    R.validateArgumentLength(constructorName, 4, arguments)
    R.validateObject(constructorName, 'typeDefinition', false, typeDefinition)
    R.validateTag(constructorName, 'Array', 'imports', false, imports)
    R.validateTag(constructorName, 'Array', 'functions', false, functions)
    R.validateString(constructorName, 'sourceContent', false, sourceContent)

    const result = Object.create(prototype)
    result.typeDefinition = typeDefinition
    result.imports = imports
    result.functions = functions
    result.sourceContent = sourceContent
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'ParseResult', enumerable: false },

    toString: {
        value: function () {
            return `ParseResult(${R._toString(this.typeDefinition)}, ${R._toString(this.imports)}, ${R._toString(this.functions)}, ${R._toString(this.sourceContent)})`
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
        value: ParseResult,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

ParseResult.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ParseResult.toString = () => 'ParseResult'
ParseResult.is = v => v && v['@@typeName'] === 'ParseResult'

ParseResult._from = o => ParseResult(o.typeDefinition, o.imports, o.functions, o.sourceContent)
ParseResult.from = ParseResult._from

ParseResult._toFirestore = (o, encodeTimestamps) => {
    const result = {
        typeDefinition: o.typeDefinition,
        imports: Array.toFirestore(o.imports, encodeTimestamps),
        functions: Array.toFirestore(o.functions, encodeTimestamps),
        sourceContent: o.sourceContent,
    }

    return result
}

ParseResult._fromFirestore = (doc, decodeTimestamps) =>
    ParseResult._from({
        typeDefinition: doc.typeDefinition,
        imports: Array.fromFirestore ? Array.fromFirestore(doc.imports, decodeTimestamps) : Array.from(doc.imports),
        functions: Array.fromFirestore
            ? Array.fromFirestore(doc.functions, decodeTimestamps)
            : Array.from(doc.functions),
        sourceContent: doc.sourceContent,
    })

// Public aliases (override if necessary)
ParseResult.toFirestore = ParseResult._toFirestore
ParseResult.fromFirestore = ParseResult._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ParseResult }
