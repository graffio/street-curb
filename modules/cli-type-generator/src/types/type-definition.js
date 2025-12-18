// ABOUTME: Generated type definition for TypeDefinition
// ABOUTME: Auto-generated from modules/cli-type-generator/type-definitions/type-definition.type.js - do not edit manually

/*  TypeDefinition generated from: modules/cli-type-generator/type-definitions/type-definition.type.js
 *
 *  Tagged
 *      name  : "String",
 *      kind  : "String",
 *      fields: "Object"
 *  TaggedSum
 *      name    : "String",
 *      kind    : "String",
 *      variants: "Object"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// TypeDefinition constructor
//
// -------------------------------------------------------------------------------------------------------------
const TypeDefinition = {
    toString: () => 'TypeDefinition',
}

// Add hidden properties
Object.defineProperty(TypeDefinition, '@@typeName', { value: 'TypeDefinition', enumerable: false })
Object.defineProperty(TypeDefinition, '@@tagNames', { value: ['Tagged', 'TaggedSum'], enumerable: false })

// Type prototype with match method
const TypeDefinitionPrototype = {}

Object.defineProperty(TypeDefinitionPrototype, 'match', {
    value: R.match(TypeDefinition['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(TypeDefinitionPrototype, 'constructor', {
    value: TypeDefinition,
    enumerable: false,
    writable: true,
    configurable: true,
})

TypeDefinition.prototype = TypeDefinitionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    tagged   : function () { return `TypeDefinition.Tagged(${R._toString(this.name)}, ${R._toString(this.kind)}, ${R._toString(this.fields)})` },
    taggedSum: function () { return `TypeDefinition.TaggedSum(${R._toString(this.name)}, ${R._toString(this.kind)}, ${R._toString(this.variants)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    tagged   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    taggedSum: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a TypeDefinition.Tagged instance
 * @sig Tagged :: (String, String, Object) -> TypeDefinition.Tagged
 */
const TaggedConstructor = function Tagged(name, kind, fields) {
    const constructorName = 'TypeDefinition.Tagged(name, kind, fields)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'kind', false, kind)
    R.validateObject(constructorName, 'fields', false, fields)

    const result = Object.create(TaggedPrototype)
    result.name = name
    result.kind = kind
    result.fields = fields
    return result
}

TypeDefinition.Tagged = TaggedConstructor

/*
 * Construct a TypeDefinition.TaggedSum instance
 * @sig TaggedSum :: (String, String, Object) -> TypeDefinition.TaggedSum
 */
const TaggedSumConstructor = function TaggedSum(name, kind, variants) {
    const constructorName = 'TypeDefinition.TaggedSum(name, kind, variants)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'kind', false, kind)
    R.validateObject(constructorName, 'variants', false, variants)

    const result = Object.create(TaggedSumPrototype)
    result.name = name
    result.kind = kind
    result.variants = variants
    return result
}

TypeDefinition.TaggedSum = TaggedSumConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const TaggedPrototype = Object.create(TypeDefinitionPrototype, {
    '@@tagName': { value: 'Tagged', enumerable: false },
    '@@typeName': { value: 'TypeDefinition', enumerable: false },
    toString: { value: toString.tagged, enumerable: false },
    toJSON: { value: toJSON.tagged, enumerable: false },
    constructor: { value: TaggedConstructor, enumerable: false, writable: true, configurable: true },
})

const TaggedSumPrototype = Object.create(TypeDefinitionPrototype, {
    '@@tagName': { value: 'TaggedSum', enumerable: false },
    '@@typeName': { value: 'TypeDefinition', enumerable: false },
    toString: { value: toString.taggedSum, enumerable: false },
    toJSON: { value: toJSON.taggedSum, enumerable: false },
    constructor: { value: TaggedSumConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
//
// Variant static methods
//
// -------------------------------------------------------------------------------------------------------------
TaggedConstructor.prototype = TaggedPrototype
TaggedSumConstructor.prototype = TaggedSumPrototype

TaggedConstructor.is = val => val && val.constructor === TaggedConstructor
TaggedSumConstructor.is = val => val && val.constructor === TaggedSumConstructor

TaggedConstructor.toString = () => 'TypeDefinition.Tagged'
TaggedSumConstructor.toString = () => 'TypeDefinition.TaggedSum'

TaggedConstructor._from = _input => {
    const { name, kind, fields } = _input
    return TypeDefinition.Tagged(name, kind, fields)
}
TaggedSumConstructor._from = _input => {
    const { name, kind, variants } = _input
    return TypeDefinition.TaggedSum(name, kind, variants)
}

TaggedConstructor.from = TaggedConstructor._from
TaggedSumConstructor.from = TaggedSumConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

TaggedConstructor.toFirestore = o => ({ ...o })
TaggedConstructor.fromFirestore = TaggedConstructor._from

TaggedSumConstructor.toFirestore = o => ({ ...o })
TaggedSumConstructor.fromFirestore = TaggedSumConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a TypeDefinition instance
 * @sig is :: Any -> Boolean
 */
TypeDefinition.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === TypeDefinition.Tagged || constructor === TypeDefinition.TaggedSum
}

/**
 * Serialize TypeDefinition to Firestore format
 * @sig _toFirestore :: (TypeDefinition, Function) -> Object
 */
TypeDefinition._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = TypeDefinition[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize TypeDefinition from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> TypeDefinition
 */
TypeDefinition._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'Tagged') return TypeDefinition.Tagged.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'TaggedSum') return TypeDefinition.TaggedSum.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized TypeDefinition variant: ${tagName}`)
}

// Public aliases (can be overridden)
TypeDefinition.toFirestore = TypeDefinition._toFirestore
TypeDefinition.fromFirestore = TypeDefinition._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { TypeDefinition }
