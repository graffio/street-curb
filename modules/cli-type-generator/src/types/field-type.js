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
import { RegExp } from './reg-exp.js'

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

// Add hidden properties
Object.defineProperty(FieldType, '@@typeName', { value: 'FieldType', enumerable: false })
Object.defineProperty(FieldType, '@@tagNames', {
    value: ['StringType', 'RegexType', 'ImportPlaceholder'],
    enumerable: false,
})

// Type prototype with match method
const FieldTypePrototype = {}

Object.defineProperty(FieldTypePrototype, 'match', {
    value: R.match(FieldType['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(FieldTypePrototype, 'constructor', {
    value: FieldType,
    enumerable: false,
    writable: true,
    configurable: true,
})

FieldType.prototype = FieldTypePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant FieldType.StringType
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

const StringTypePrototype = Object.create(FieldTypePrototype, {
    '@@tagName': { value: 'StringType', enumerable: false },
    '@@typeName': { value: 'FieldType', enumerable: false },

    toString: {
        value: function () {
            return `FieldType.StringType(${R._toString(this.value)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: StringTypeConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

StringTypeConstructor.prototype = StringTypePrototype
StringTypeConstructor.is = val => val && val.constructor === StringTypeConstructor
StringTypeConstructor.toString = () => 'FieldType.StringType'
StringTypeConstructor._from = o => FieldType.StringType(o.value)
StringTypeConstructor.from = StringTypeConstructor._from

StringTypeConstructor.toFirestore = o => ({ ...o })
StringTypeConstructor.fromFirestore = StringTypeConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant FieldType.RegexType
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

const RegexTypePrototype = Object.create(FieldTypePrototype, {
    '@@tagName': { value: 'RegexType', enumerable: false },
    '@@typeName': { value: 'FieldType', enumerable: false },

    toString: {
        value: function () {
            return `FieldType.RegexType(${R._toString(this.value)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: RegexTypeConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

RegexTypeConstructor.prototype = RegexTypePrototype
RegexTypeConstructor.is = val => val && val.constructor === RegexTypeConstructor
RegexTypeConstructor.toString = () => 'FieldType.RegexType'
RegexTypeConstructor._from = o => FieldType.RegexType(o.value)
RegexTypeConstructor.from = RegexTypeConstructor._from

RegexTypeConstructor._toFirestore = (o, encodeTimestamps) => ({
    value: RegExp.toFirestore(o.value, encodeTimestamps),
})

RegexTypeConstructor._fromFirestore = (doc, decodeTimestamps) =>
    RegexTypeConstructor._from({
        value: RegExp.fromFirestore ? RegExp.fromFirestore(doc.value, decodeTimestamps) : RegExp.from(doc.value),
    })

// Public aliases (can be overridden)
RegexTypeConstructor.toFirestore = RegexTypeConstructor._toFirestore
RegexTypeConstructor.fromFirestore = RegexTypeConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant FieldType.ImportPlaceholder
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

const ImportPlaceholderPrototype = Object.create(FieldTypePrototype, {
    '@@tagName': { value: 'ImportPlaceholder', enumerable: false },
    '@@typeName': { value: 'FieldType', enumerable: false },

    toString: {
        value: function () {
            return `FieldType.ImportPlaceholder(${R._toString(this.__importPlaceholder)}, ${R._toString(this.source)}, ${R._toString(this.localName)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: ImportPlaceholderConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

ImportPlaceholderConstructor.prototype = ImportPlaceholderPrototype
ImportPlaceholderConstructor.is = val => val && val.constructor === ImportPlaceholderConstructor
ImportPlaceholderConstructor.toString = () => 'FieldType.ImportPlaceholder'
ImportPlaceholderConstructor._from = o => FieldType.ImportPlaceholder(o.__importPlaceholder, o.source, o.localName)
ImportPlaceholderConstructor.from = ImportPlaceholderConstructor._from

ImportPlaceholderConstructor.toFirestore = o => ({ ...o })
ImportPlaceholderConstructor.fromFirestore = ImportPlaceholderConstructor._from

FieldType._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = FieldType[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

FieldType._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'StringType') return FieldType.StringType.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'RegexType') return FieldType.RegexType.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ImportPlaceholder') return FieldType.ImportPlaceholder.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized FieldType variant: ${tagName}`)
}

// Public aliases (can be overridden)
FieldType.toFirestore = FieldType._toFirestore
FieldType.fromFirestore = FieldType._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { FieldType }
