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

// -------------------------------------------------------------------------------------------------------------
//
// Set up TypeDefinition's prototype as TypeDefinitionPrototype
//
// -------------------------------------------------------------------------------------------------------------
// Type prototype with match method
const TypeDefinitionPrototype = {}

Object.defineProperty(TypeDefinitionPrototype, 'match', {
    value: function (variants) {
        // Validate all variants are handled
        const requiredVariants = ['Tagged', 'TaggedSum']
        requiredVariants.map(variant => {
            if (!variants[variant]) throw new TypeError("Constructors given to match didn't include: " + variant)
            return variant
        })

        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    },
    enumerable: false,
})

Object.defineProperty(TypeDefinitionPrototype, 'constructor', {
    value: TypeDefinition,
    enumerable: false,
    writable: true,
    configurable: true,
})

// Add hidden properties
Object.defineProperty(TypeDefinition, '@@typeName', { value: 'TypeDefinition', enumerable: false })
Object.defineProperty(TypeDefinition, '@@tagNames', { value: ['Tagged', 'TaggedSum'], enumerable: false })

TypeDefinition.prototype = TypeDefinitionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant TypeDefinition.Tagged constructor
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

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant TypeDefinition.Tagged prototype
//
// -------------------------------------------------------------------------------------------------------------

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

// -------------------------------------------------------------------------------------------------------------
//
// Variant TypeDefinition.Tagged: static functions:
//
// -------------------------------------------------------------------------------------------------------------
TaggedConstructor.is = val => val && val.constructor === TaggedConstructor
TaggedConstructor.toString = () => 'TypeDefinition.Tagged'
TaggedConstructor.from = o => TypeDefinition.Tagged(o.name, o.kind, o.fields)

// -------------------------------------------------------------------------------------------------------------
//
// Variant TypeDefinition.TaggedSum constructor
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

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant TypeDefinition.TaggedSum prototype
//
// -------------------------------------------------------------------------------------------------------------

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

// -------------------------------------------------------------------------------------------------------------
//
// Variant TypeDefinition.TaggedSum: static functions:
//
// -------------------------------------------------------------------------------------------------------------
TaggedSumConstructor.is = val => val && val.constructor === TaggedSumConstructor
TaggedSumConstructor.toString = () => 'TypeDefinition.TaggedSum'
TaggedSumConstructor.from = o => TypeDefinition.TaggedSum(o.name, o.kind, o.variants)

export { TypeDefinition }
