// ABOUTME: Generated type definition for ImportSpecifier
// ABOUTME: Auto-generated from modules/cli-type-generator/type-definitions/import-specifier.type.js - do not edit manually

/*  ImportSpecifier generated from: modules/cli-type-generator/type-definitions/import-specifier.type.js
 *
 *  Default
 *      local: FieldTypes.jsIdentifier
 *  Namespace
 *      local: FieldTypes.jsIdentifier
 *  Named
 *      imported: FieldTypes.jsIdentifier,
 *      local   : FieldTypes.jsIdentifier
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// ImportSpecifier constructor
//
// -------------------------------------------------------------------------------------------------------------
const ImportSpecifier = {
    toString: () => 'ImportSpecifier',
}

// Add hidden properties
Object.defineProperty(ImportSpecifier, '@@typeName', { value: 'ImportSpecifier', enumerable: false })
Object.defineProperty(ImportSpecifier, '@@tagNames', { value: ['Default', 'Namespace', 'Named'], enumerable: false })

// Type prototype with match method
const ImportSpecifierPrototype = {}

Object.defineProperty(ImportSpecifierPrototype, 'match', {
    value: R.match(ImportSpecifier['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(ImportSpecifierPrototype, 'constructor', {
    value: ImportSpecifier,
    enumerable: false,
    writable: true,
    configurable: true,
})

ImportSpecifier.prototype = ImportSpecifierPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig defaultToString :: () -> String
 */
const defaultToString = function () {
    return `ImportSpecifier.Default(${R._toString(this.local)})`
}

/**
 * Convert to string representation
 * @sig namespaceToString :: () -> String
 */
const namespaceToString = function () {
    return `ImportSpecifier.Namespace(${R._toString(this.local)})`
}

/**
 * Convert to string representation
 * @sig namedToString :: () -> String
 */
const namedToString = function () {
    return `ImportSpecifier.Named(${R._toString(this.imported)}, ${R._toString(this.local)})`
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to JSON representation with tag
 * @sig defaultToJSON :: () -> Object
 */
const defaultToJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

/*
 * Convert to JSON representation with tag
 * @sig namespaceToJSON :: () -> Object
 */
const namespaceToJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

/*
 * Convert to JSON representation with tag
 * @sig namedToJSON :: () -> Object
 */
const namedToJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a ImportSpecifier.Default instance
 * @sig Default :: (String) -> ImportSpecifier.Default
 */
const DefaultConstructor = function Default(local) {
    const constructorName = 'ImportSpecifier.Default(local)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateRegex(constructorName, FieldTypes.jsIdentifier, 'local', false, local)

    const result = Object.create(DefaultPrototype)
    result.local = local
    return result
}

ImportSpecifier.Default = DefaultConstructor

/*
 * Construct a ImportSpecifier.Namespace instance
 * @sig Namespace :: (String) -> ImportSpecifier.Namespace
 */
const NamespaceConstructor = function Namespace(local) {
    const constructorName = 'ImportSpecifier.Namespace(local)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateRegex(constructorName, FieldTypes.jsIdentifier, 'local', false, local)

    const result = Object.create(NamespacePrototype)
    result.local = local
    return result
}

ImportSpecifier.Namespace = NamespaceConstructor

/*
 * Construct a ImportSpecifier.Named instance
 * @sig Named :: (String, String) -> ImportSpecifier.Named
 */
const NamedConstructor = function Named(imported, local) {
    const constructorName = 'ImportSpecifier.Named(imported, local)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.jsIdentifier, 'imported', false, imported)
    R.validateRegex(constructorName, FieldTypes.jsIdentifier, 'local', false, local)

    const result = Object.create(NamedPrototype)
    result.imported = imported
    result.local = local
    return result
}

ImportSpecifier.Named = NamedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const DefaultPrototype = Object.create(ImportSpecifierPrototype, {
    '@@tagName': { value: 'Default', enumerable: false },
    '@@typeName': { value: 'ImportSpecifier', enumerable: false },
    toString: { value: defaultToString, enumerable: false },
    toJSON: { value: defaultToJSON, enumerable: false },
    constructor: { value: DefaultConstructor, enumerable: false, writable: true, configurable: true },
})

const NamespacePrototype = Object.create(ImportSpecifierPrototype, {
    '@@tagName': { value: 'Namespace', enumerable: false },
    '@@typeName': { value: 'ImportSpecifier', enumerable: false },
    toString: { value: namespaceToString, enumerable: false },
    toJSON: { value: namespaceToJSON, enumerable: false },
    constructor: { value: NamespaceConstructor, enumerable: false, writable: true, configurable: true },
})

const NamedPrototype = Object.create(ImportSpecifierPrototype, {
    '@@tagName': { value: 'Named', enumerable: false },
    '@@typeName': { value: 'ImportSpecifier', enumerable: false },
    toString: { value: namedToString, enumerable: false },
    toJSON: { value: namedToJSON, enumerable: false },
    constructor: { value: NamedConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
//
// Variant static methods
//
// -------------------------------------------------------------------------------------------------------------
DefaultConstructor.prototype = DefaultPrototype
DefaultConstructor.is = val => val && val.constructor === DefaultConstructor
DefaultConstructor.toString = () => 'ImportSpecifier.Default'
DefaultConstructor._from = _input => ImportSpecifier.Default(_input.local)
DefaultConstructor.from = DefaultConstructor._from

NamespaceConstructor.prototype = NamespacePrototype
NamespaceConstructor.is = val => val && val.constructor === NamespaceConstructor
NamespaceConstructor.toString = () => 'ImportSpecifier.Namespace'
NamespaceConstructor._from = _input => ImportSpecifier.Namespace(_input.local)
NamespaceConstructor.from = NamespaceConstructor._from

NamedConstructor.prototype = NamedPrototype
NamedConstructor.is = val => val && val.constructor === NamedConstructor
NamedConstructor.toString = () => 'ImportSpecifier.Named'
NamedConstructor._from = _input => ImportSpecifier.Named(_input.imported, _input.local)
NamedConstructor.from = NamedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

DefaultConstructor.toFirestore = o => ({ ...o })
DefaultConstructor.fromFirestore = DefaultConstructor._from

NamespaceConstructor.toFirestore = o => ({ ...o })
NamespaceConstructor.fromFirestore = NamespaceConstructor._from

NamedConstructor.toFirestore = o => ({ ...o })
NamedConstructor.fromFirestore = NamedConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a ImportSpecifier instance
 * @sig is :: Any -> Boolean
 */
ImportSpecifier.is = v => {
    const { Default, Namespace, Named } = ImportSpecifier
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === Default || constructor === Namespace || constructor === Named
}

/**
 * Serialize ImportSpecifier to Firestore format
 * @sig _toFirestore :: (ImportSpecifier, Function) -> Object
 */
ImportSpecifier._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = ImportSpecifier[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize ImportSpecifier from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ImportSpecifier
 */
ImportSpecifier._fromFirestore = (doc, decodeTimestamps) => {
    const { Default, Namespace, Named } = ImportSpecifier
    const tagName = doc['@@tagName']
    if (tagName === 'Default') return Default.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Namespace') return Namespace.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Named') return Named.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized ImportSpecifier variant: ${tagName}`)
}

// Public aliases (can be overridden)
ImportSpecifier.toFirestore = ImportSpecifier._toFirestore
ImportSpecifier.fromFirestore = ImportSpecifier._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ImportSpecifier }
