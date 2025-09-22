/*  FieldType generated from: modules/cli-type-generator/type-definitions/field-type.type.js
 *
 *  StringType
 *      value: "String"
 *  RegexType
 *      value: "RegExp"
 *  ImportPlaceholder
 *      __importPlaceholder: "Boolean",
 *      source             : "String",
 *      localName          : "String"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// FieldType constructor
//
// -------------------------------------------------------------------------------------------------------------
const FieldType = {
    toString: () => 'FieldType',
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return (
            constructor === FieldType.StringType ||
            constructor === FieldType.RegexType ||
            constructor === FieldType.ImportPlaceholder
        )
    },
}

// -------------------------------------------------------------------------------------------------------------
//
// Set up FieldType's prototype as FieldTypePrototype
//
// -------------------------------------------------------------------------------------------------------------
// Type prototype with match method
const FieldTypePrototype = {
    match(variants) {
        // Validate all variants are handled
        const requiredVariants = ['StringType', 'RegexType', 'ImportPlaceholder']
        requiredVariants.map(variant => {
            if (!variants[variant]) throw new TypeError("Constructors given to match didn't include: " + variant)
            return variant
        })

        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    },
}

// Add hidden properties
Object.defineProperty(FieldType, '@@typeName', { value: 'FieldType' })
Object.defineProperty(FieldType, '@@tagNames', { value: ['StringType', 'RegexType', 'ImportPlaceholder'] })

FieldTypePrototype.constructor = FieldType
FieldType.prototype = FieldTypePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant FieldType.StringType constructor
//
// -------------------------------------------------------------------------------------------------------------
const StringTypeConstructor = function StringType(value) {
    const constructorName = 'FieldType.StringType(value)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'value', false, value)

    const result = Object.create(StringTypePrototype)
    result.value = value
    return result
}

FieldType.StringType = StringTypeConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant FieldType.StringType prototype
//
// -------------------------------------------------------------------------------------------------------------
const StringTypePrototype = Object.create(FieldTypePrototype)
Object.defineProperty(StringTypePrototype, '@@tagName', { value: 'StringType' })
Object.defineProperty(StringTypePrototype, '@@typeName', { value: 'FieldType' })

StringTypePrototype.toString = function () {
    return `FieldType.StringType(${R._toString(this.value)})`
}

StringTypePrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

StringTypeConstructor.prototype = StringTypePrototype
StringTypePrototype.constructor = StringTypeConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant FieldType.StringType: static functions:
//
// -------------------------------------------------------------------------------------------------------------
StringTypeConstructor.is = val => val && val.constructor === StringTypeConstructor
StringTypeConstructor.toString = () => 'FieldType.StringType'
StringTypeConstructor.from = o => FieldType.StringType(o.value)

// -------------------------------------------------------------------------------------------------------------
//
// Variant FieldType.RegexType constructor
//
// -------------------------------------------------------------------------------------------------------------
const RegexTypeConstructor = function RegexType(value) {
    const constructorName = 'FieldType.RegexType(value)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'RegExp', 'value', false, value)

    const result = Object.create(RegexTypePrototype)
    result.value = value
    return result
}

FieldType.RegexType = RegexTypeConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant FieldType.RegexType prototype
//
// -------------------------------------------------------------------------------------------------------------
const RegexTypePrototype = Object.create(FieldTypePrototype)
Object.defineProperty(RegexTypePrototype, '@@tagName', { value: 'RegexType' })
Object.defineProperty(RegexTypePrototype, '@@typeName', { value: 'FieldType' })

RegexTypePrototype.toString = function () {
    return `FieldType.RegexType(${R._toString(this.value)})`
}

RegexTypePrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

RegexTypeConstructor.prototype = RegexTypePrototype
RegexTypePrototype.constructor = RegexTypeConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant FieldType.RegexType: static functions:
//
// -------------------------------------------------------------------------------------------------------------
RegexTypeConstructor.is = val => val && val.constructor === RegexTypeConstructor
RegexTypeConstructor.toString = () => 'FieldType.RegexType'
RegexTypeConstructor.from = o => FieldType.RegexType(o.value)

// -------------------------------------------------------------------------------------------------------------
//
// Variant FieldType.ImportPlaceholder constructor
//
// -------------------------------------------------------------------------------------------------------------
const ImportPlaceholderConstructor = function ImportPlaceholder(__importPlaceholder, source, localName) {
    const constructorName = 'FieldType.ImportPlaceholder(__importPlaceholder, source, localName)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateBoolean(constructorName, '__importPlaceholder', false, __importPlaceholder)
    R.validateString(constructorName, 'source', false, source)
    R.validateString(constructorName, 'localName', false, localName)

    const result = Object.create(ImportPlaceholderPrototype)
    result.__importPlaceholder = __importPlaceholder
    result.source = source
    result.localName = localName
    return result
}

FieldType.ImportPlaceholder = ImportPlaceholderConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant FieldType.ImportPlaceholder prototype
//
// -------------------------------------------------------------------------------------------------------------
const ImportPlaceholderPrototype = Object.create(FieldTypePrototype)
Object.defineProperty(ImportPlaceholderPrototype, '@@tagName', { value: 'ImportPlaceholder' })
Object.defineProperty(ImportPlaceholderPrototype, '@@typeName', { value: 'FieldType' })

ImportPlaceholderPrototype.toString = function () {
    return `FieldType.ImportPlaceholder(${R._toString(this.__importPlaceholder)}, ${R._toString(this.source)}, ${R._toString(this.localName)})`
}

ImportPlaceholderPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

ImportPlaceholderConstructor.prototype = ImportPlaceholderPrototype
ImportPlaceholderPrototype.constructor = ImportPlaceholderConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant FieldType.ImportPlaceholder: static functions:
//
// -------------------------------------------------------------------------------------------------------------
ImportPlaceholderConstructor.is = val => val && val.constructor === ImportPlaceholderConstructor
ImportPlaceholderConstructor.toString = () => 'FieldType.ImportPlaceholder'
ImportPlaceholderConstructor.from = o => FieldType.ImportPlaceholder(o.__importPlaceholder, o.source, o.localName)

export { FieldType }
