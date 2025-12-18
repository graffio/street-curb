// ABOUTME: Generated type definition for FieldType
// ABOUTME: Auto-generated from modules/cli-type-generator/type-definitions/field-type.type.js - do not edit manually

/*  FieldType generated from: modules/cli-type-generator/type-definitions/field-type.type.js
 *
 *  StringType
 *      value: "String"
 *  RegexType
 *      value: "RegExp"
 *  ImportPlaceholder
 *      isImportPlaceholder: "Boolean",
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
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
            stringType       : function () { return `FieldType.StringType(${R._toString(this.value)})` },
            regexType        : function () { return `FieldType.RegexType(${R._toString(this.value)})` },
            importPlaceholder: function () { return `FieldType.ImportPlaceholder(${R._toString(this.isImportPlaceholder)}, ${R._toString(this.source)}, ${R._toString(this.localName)})` },
        }

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    stringType       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    regexType        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    importPlaceholder: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a FieldType.StringType instance
 * @sig StringType :: (String) -> FieldType.StringType
 */
const StringTypeConstructor = function StringType(value) {
    const constructorName = 'FieldType.StringType(value)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'value', false, value)

    const result = Object.create(StringTypePrototype)
    result.value = value
    return result
}

FieldType.StringType = StringTypeConstructor

/*
 * Construct a FieldType.RegexType instance
 * @sig RegexType :: (RegExp) -> FieldType.RegexType
 */
const RegexTypeConstructor = function RegexType(value) {
    const constructorName = 'FieldType.RegexType(value)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'RegExp', 'value', false, value)

    const result = Object.create(RegexTypePrototype)
    result.value = value
    return result
}

FieldType.RegexType = RegexTypeConstructor

/*
 * Construct a FieldType.ImportPlaceholder instance
 * @sig ImportPlaceholder :: (Boolean, String, String) -> FieldType.ImportPlaceholder
 */
const ImportPlaceholderConstructor = function ImportPlaceholder(isImportPlaceholder, source, localName) {
    const constructorName = 'FieldType.ImportPlaceholder(isImportPlaceholder, source, localName)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateBoolean(constructorName, 'isImportPlaceholder', false, isImportPlaceholder)
    R.validateString(constructorName, 'source', false, source)
    R.validateString(constructorName, 'localName', false, localName)

    const result = Object.create(ImportPlaceholderPrototype)
    result.isImportPlaceholder = isImportPlaceholder
    result.source = source
    result.localName = localName
    return result
}

FieldType.ImportPlaceholder = ImportPlaceholderConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const StringTypePrototype = Object.create(FieldTypePrototype, {
    '@@tagName': { value: 'StringType', enumerable: false },
    '@@typeName': { value: 'FieldType', enumerable: false },
    toString: { value: toString.stringType, enumerable: false },
    toJSON: { value: toJSON.stringType, enumerable: false },
    constructor: { value: StringTypeConstructor, enumerable: false, writable: true, configurable: true },
})

const RegexTypePrototype = Object.create(FieldTypePrototype, {
    '@@tagName': { value: 'RegexType', enumerable: false },
    '@@typeName': { value: 'FieldType', enumerable: false },
    toString: { value: toString.regexType, enumerable: false },
    toJSON: { value: toJSON.regexType, enumerable: false },
    constructor: { value: RegexTypeConstructor, enumerable: false, writable: true, configurable: true },
})

const ImportPlaceholderPrototype = Object.create(FieldTypePrototype, {
    '@@tagName': { value: 'ImportPlaceholder', enumerable: false },
    '@@typeName': { value: 'FieldType', enumerable: false },
    toString: { value: toString.importPlaceholder, enumerable: false },
    toJSON: { value: toJSON.importPlaceholder, enumerable: false },
    constructor: { value: ImportPlaceholderConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
//
// Variant static methods
//
// -------------------------------------------------------------------------------------------------------------
StringTypeConstructor.prototype = StringTypePrototype
StringTypeConstructor.is = val => val && val.constructor === StringTypeConstructor
StringTypeConstructor.toString = () => 'FieldType.StringType'
StringTypeConstructor._from = _input => FieldType.StringType(_input.value)
StringTypeConstructor.from = StringTypeConstructor._from

RegexTypeConstructor.prototype = RegexTypePrototype
RegexTypeConstructor.is = val => val && val.constructor === RegexTypeConstructor
RegexTypeConstructor.toString = () => 'FieldType.RegexType'
RegexTypeConstructor._from = _input => FieldType.RegexType(_input.value)
RegexTypeConstructor.from = RegexTypeConstructor._from

ImportPlaceholderConstructor.prototype = ImportPlaceholderPrototype
ImportPlaceholderConstructor.is = val => val && val.constructor === ImportPlaceholderConstructor
ImportPlaceholderConstructor.toString = () => 'FieldType.ImportPlaceholder'
ImportPlaceholderConstructor._from = _input => {
    const { isImportPlaceholder, source, localName } = _input
    return FieldType.ImportPlaceholder(isImportPlaceholder, source, localName)
}
ImportPlaceholderConstructor.from = ImportPlaceholderConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

StringTypeConstructor.toFirestore = o => ({ ...o })
StringTypeConstructor.fromFirestore = StringTypeConstructor._from

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

ImportPlaceholderConstructor.toFirestore = o => ({ ...o })
ImportPlaceholderConstructor.fromFirestore = ImportPlaceholderConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a FieldType instance
 * @sig is :: Any -> Boolean
 */
FieldType.is = v => {
    const { StringType, RegexType, ImportPlaceholder } = FieldType
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === StringType || constructor === RegexType || constructor === ImportPlaceholder
}

/**
 * Serialize FieldType to Firestore format
 * @sig _toFirestore :: (FieldType, Function) -> Object
 */
FieldType._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = FieldType[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize FieldType from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> FieldType
 */
FieldType._fromFirestore = (doc, decodeTimestamps) => {
    const { StringType, RegexType, ImportPlaceholder } = FieldType
    const tagName = doc['@@tagName']
    if (tagName === 'StringType') return StringType.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'RegexType') return RegexType.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ImportPlaceholder') return ImportPlaceholder.fromFirestore(doc, decodeTimestamps)
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
