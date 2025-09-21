/*  ImportInfo generated from: modules/cli-type-generator/type-definitions/import-info.type.js

    source    : "String",
    specifiers: "Array"

*/

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const ImportInfo = function ImportInfo(source, specifiers) {
    R.validateArgumentLength('ImportInfo(source, specifiers)', 2, arguments)
    R.validateString('ImportInfo(source, specifiers)', 'source', false, source)
    R.validateTag('ImportInfo(source, specifiers)', 'Array', 'specifiers', false, specifiers)

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
const prototype = {
    toString: function () {
        return `ImportInfo(${R._toString(this.source)}, ${R._toString(this.specifiers)})`
    },
    toJSON() {
        return this
    },
}

ImportInfo.prototype = prototype
prototype.constructor = ImportInfo

Object.defineProperty(prototype, '@@typeName', { value: 'ImportInfo' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ImportInfo.toString = () => 'ImportInfo'
ImportInfo.is = v => v && v['@@typeName'] === 'ImportInfo'
ImportInfo.from = o => ImportInfo(o.source, o.specifiers)

export { ImportInfo }
