/*  TypeDefinition generated from: modules/cli-type-generator/type-definitions/type-definition.type.js

    Tagged
        name  : "String",
        kind  : "String",
        fields: "Object"
    TaggedSum
        name    : "String",
        kind    : "String",
        variants: "Object"

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
const TypeDefinitionPrototype = {
    match(variants) {
        // Validate all variants are handled
        const requiredVariants = ['Tagged', 'TaggedSum']
        requiredVariants.map(variant => {
            if (!variants[variant]) throw new TypeError("Constructors given to match didn't include: " + variant)
            return variant
        })

        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    },
}

// Add hidden properties
Object.defineProperty(TypeDefinition, '@@typeName', { value: 'TypeDefinition' })
Object.defineProperty(TypeDefinition, '@@tagNames', { value: ['Tagged', 'TaggedSum'] })

TypeDefinitionPrototype.constructor = TypeDefinition
TypeDefinition.prototype = TypeDefinitionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant TypeDefinition.Tagged constructor
//
// -------------------------------------------------------------------------------------------------------------
const TaggedConstructor = function Tagged(name, kind, fields) {
    R.validateArgumentLength('TypeDefinition.Tagged(name, kind, fields)', 3, arguments)
    R.validateString('TypeDefinition.Tagged(name, kind, fields)', 'name', false, name)
    R.validateString('TypeDefinition.Tagged(name, kind, fields)', 'kind', false, kind)
    R.validateObject('TypeDefinition.Tagged(name, kind, fields)', 'fields', false, fields)

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
const TaggedPrototype = Object.create(TypeDefinitionPrototype)
Object.defineProperty(TaggedPrototype, '@@tagName', { value: 'Tagged' })
Object.defineProperty(TaggedPrototype, '@@typeName', { value: 'TypeDefinition' })

TaggedPrototype.toString = function () {
    return `TypeDefinition.Tagged(${R._toString(this.name)}, ${R._toString(this.kind)}, ${R._toString(this.fields)})`
}

TaggedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

TaggedConstructor.prototype = TaggedPrototype
TaggedPrototype.constructor = TaggedConstructor

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
    R.validateArgumentLength('TypeDefinition.TaggedSum(name, kind, variants)', 3, arguments)
    R.validateString('TypeDefinition.TaggedSum(name, kind, variants)', 'name', false, name)
    R.validateString('TypeDefinition.TaggedSum(name, kind, variants)', 'kind', false, kind)
    R.validateObject('TypeDefinition.TaggedSum(name, kind, variants)', 'variants', false, variants)

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
const TaggedSumPrototype = Object.create(TypeDefinitionPrototype)
Object.defineProperty(TaggedSumPrototype, '@@tagName', { value: 'TaggedSum' })
Object.defineProperty(TaggedSumPrototype, '@@typeName', { value: 'TypeDefinition' })

TaggedSumPrototype.toString = function () {
    return `TypeDefinition.TaggedSum(${R._toString(this.name)}, ${R._toString(this.kind)}, ${R._toString(this.variants)})`
}

TaggedSumPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

TaggedSumConstructor.prototype = TaggedSumPrototype
TaggedSumPrototype.constructor = TaggedSumConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant TypeDefinition.TaggedSum: static functions:
//
// -------------------------------------------------------------------------------------------------------------
TaggedSumConstructor.is = val => val && val.constructor === TaggedSumConstructor
TaggedSumConstructor.toString = () => 'TypeDefinition.TaggedSum'
TaggedSumConstructor.from = o => TypeDefinition.TaggedSum(o.name, o.kind, o.variants)

export { TypeDefinition }
