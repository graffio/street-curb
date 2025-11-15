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
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return constructor === TypeDefinition.Tagged || constructor === TypeDefinition.TaggedSum
    },
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
// Variant TypeDefinition.Tagged
//
// -------------------------------------------------------------------------------------------------------------
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

const TaggedPrototype = Object.create(TypeDefinitionPrototype, {
    '@@tagName': { value: 'Tagged', enumerable: false },
    '@@typeName': { value: 'TypeDefinition', enumerable: false },

    toString: {
        value: function () {
            return `TypeDefinition.Tagged(${R._toString(this.name)}, ${R._toString(this.kind)}, ${R._toString(this.fields)})`
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
        value: TaggedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

TaggedConstructor.prototype = TaggedPrototype
TaggedConstructor.is = val => val && val.constructor === TaggedConstructor
TaggedConstructor.toString = () => 'TypeDefinition.Tagged'
TaggedConstructor._from = o => TypeDefinition.Tagged(o.name, o.kind, o.fields)
TaggedConstructor.from = TaggedConstructor._from

TaggedConstructor.toFirestore = o => ({ ...o })
TaggedConstructor.fromFirestore = TaggedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant TypeDefinition.TaggedSum
//
// -------------------------------------------------------------------------------------------------------------
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

const TaggedSumPrototype = Object.create(TypeDefinitionPrototype, {
    '@@tagName': { value: 'TaggedSum', enumerable: false },
    '@@typeName': { value: 'TypeDefinition', enumerable: false },

    toString: {
        value: function () {
            return `TypeDefinition.TaggedSum(${R._toString(this.name)}, ${R._toString(this.kind)}, ${R._toString(this.variants)})`
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
        value: TaggedSumConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

TaggedSumConstructor.prototype = TaggedSumPrototype
TaggedSumConstructor.is = val => val && val.constructor === TaggedSumConstructor
TaggedSumConstructor.toString = () => 'TypeDefinition.TaggedSum'
TaggedSumConstructor._from = o => TypeDefinition.TaggedSum(o.name, o.kind, o.variants)
TaggedSumConstructor.from = TaggedSumConstructor._from

TaggedSumConstructor.toFirestore = o => ({ ...o })
TaggedSumConstructor.fromFirestore = TaggedSumConstructor._from

TypeDefinition._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = TypeDefinition[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

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
