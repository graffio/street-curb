/*  ParseResult generated from: modules/types-generation/src/types/parse-result.type.js

    typeDefinition: "Object",
    imports       : "Array",
    functions     : "Array",
    sourceContent : "String"

*/

import * as R from '@graffio/types-generation'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const ParseResult = function ParseResult(typeDefinition, imports, functions, sourceContent) {
    R.validateArgumentLength('ParseResult(typeDefinition, imports, functions, sourceContent)', 4, arguments)
    R.validateObject(
        'ParseResult(typeDefinition, imports, functions, sourceContent)',
        'typeDefinition',
        false,
        typeDefinition,
    )
    R.validateTag('ParseResult(typeDefinition, imports, functions, sourceContent)', 'Array', 'imports', false, imports)
    R.validateTag(
        'ParseResult(typeDefinition, imports, functions, sourceContent)',
        'Array',
        'functions',
        false,
        functions,
    )
    R.validateString(
        'ParseResult(typeDefinition, imports, functions, sourceContent)',
        'sourceContent',
        false,
        sourceContent,
    )

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
const prototype = {
    toString: function () {
        return `ParseResult(${R._toString(this.typeDefinition)}, ${R._toString(this.imports)}, ${R._toString(this.functions)}, ${R._toString(this.sourceContent)})`
    },
    toJSON() {
        return this
    },
}

ParseResult.prototype = prototype
prototype.constructor = ParseResult

Object.defineProperty(prototype, '@@typeName', { value: 'ParseResult' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ParseResult.toString = () => 'ParseResult'
ParseResult.is = v => v && v['@@typeName'] === 'ParseResult'
ParseResult.from = o => ParseResult(o.typeDefinition, o.imports, o.functions, o.sourceContent)

export { ParseResult }
