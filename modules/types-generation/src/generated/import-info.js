// Auto-generated static tagged type: ImportInfo
// Generated from: modules/types-generation/src/types/import-info.type.js
// {
//     source    : "String"
//     specifiers: "Array"
// }

import * as R from '@graffio/types-runtime'

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
