// Auto-generated static tagged sum type: InfrastructureAdapter
// Generated from: ./types/infrastructure-adapter.type.js
// fields from: { Alice: { name: {  }}, Bob: { name: {  }}, Charlie: { name: {  }}}

import * as R from '@graffio/types-runtime'

// -------------------------------------------------------------------------------------------------------------
//
// InfrastructureAdapter constructor
//
// -------------------------------------------------------------------------------------------------------------
const InfrastructureAdapter = {
    '@@typeName': 'InfrastructureAdapter',
    '@@tagNames': ['Alice', 'Bob', 'Charlie'],
    toString: () => 'InfrastructureAdapter',
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return (
            constructor === InfrastructureAdapter.Alice ||
            constructor === InfrastructureAdapter.Bob ||
            constructor === InfrastructureAdapter.Charlie
        )
    },
}

// -------------------------------------------------------------------------------------------------------------
//
// Set up InfrastructureAdapter's prototype as InfrastructureAdapterPrototype
//
// -------------------------------------------------------------------------------------------------------------
// Type prototype with match method
const InfrastructureAdapterPrototype = {
    match(variants) {
        // Validate all variants are handled
        const requiredVariants = ['Alice', 'Bob', 'Charlie']
        requiredVariants.map(variant => {
            if (!variants[variant]) throw new TypeError("Constructors given to match didn't include: " + variant)
            return variant
        })

        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    },
}

// Add hidden properties
Object.defineProperty(InfrastructureAdapter, '@@typeName', { value: 'InfrastructureAdapter' })
Object.defineProperty(InfrastructureAdapter, '@@tagNames', { value: ['Alice', 'Bob', 'Charlie'] })

InfrastructureAdapterPrototype.constructor = InfrastructureAdapter
InfrastructureAdapter.prototype = InfrastructureAdapterPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant InfrastructureAdapter.Alice constructor
//
// -------------------------------------------------------------------------------------------------------------
const AliceConstructor = function Alice(name) {
    R.validateArgumentLength('InfrastructureAdapter.Alice(name)', 1, arguments)
    R.validateRegex('InfrastructureAdapter.Alice(name)', /alice/, 'name', false, name)

    const result = Object.create(AlicePrototype)
    result.name = name
    return result
}

InfrastructureAdapter.Alice = AliceConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant InfrastructureAdapter.Alice prototype
//
// -------------------------------------------------------------------------------------------------------------
const AlicePrototype = Object.create(InfrastructureAdapterPrototype)
Object.defineProperty(AlicePrototype, '@@tagName', { value: 'Alice' })
Object.defineProperty(AlicePrototype, '@@typeName', { value: 'InfrastructureAdapter' })

AlicePrototype.toString = function () {
    return `InfrastructureAdapter.Alice(${R._toString(this.name)})`
}

AlicePrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

AliceConstructor.prototype = AlicePrototype
AlicePrototype.constructor = AliceConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant InfrastructureAdapter.Alice: static functions:
//
// -------------------------------------------------------------------------------------------------------------
AliceConstructor.is = val => val && val.constructor === AliceConstructor
AliceConstructor.toString = () => 'InfrastructureAdapter.Alice'
AliceConstructor.from = o => InfrastructureAdapter.Alice(o.name)

// -------------------------------------------------------------------------------------------------------------
//
// Variant InfrastructureAdapter.Bob constructor
//
// -------------------------------------------------------------------------------------------------------------
const BobConstructor = function Bob(name) {
    R.validateArgumentLength('InfrastructureAdapter.Bob(name)', 1, arguments)
    R.validateRegex('InfrastructureAdapter.Bob(name)', /bob/, 'name', false, name)

    const result = Object.create(BobPrototype)
    result.name = name
    return result
}

InfrastructureAdapter.Bob = BobConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant InfrastructureAdapter.Bob prototype
//
// -------------------------------------------------------------------------------------------------------------
const BobPrototype = Object.create(InfrastructureAdapterPrototype)
Object.defineProperty(BobPrototype, '@@tagName', { value: 'Bob' })
Object.defineProperty(BobPrototype, '@@typeName', { value: 'InfrastructureAdapter' })

BobPrototype.toString = function () {
    return `InfrastructureAdapter.Bob(${R._toString(this.name)})`
}

BobPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

BobConstructor.prototype = BobPrototype
BobPrototype.constructor = BobConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant InfrastructureAdapter.Bob: static functions:
//
// -------------------------------------------------------------------------------------------------------------
BobConstructor.is = val => val && val.constructor === BobConstructor
BobConstructor.toString = () => 'InfrastructureAdapter.Bob'
BobConstructor.from = o => InfrastructureAdapter.Bob(o.name)

// -------------------------------------------------------------------------------------------------------------
//
// Variant InfrastructureAdapter.Charlie constructor
//
// -------------------------------------------------------------------------------------------------------------
const CharlieConstructor = function Charlie(name) {
    R.validateArgumentLength('InfrastructureAdapter.Charlie(name)', 1, arguments)
    R.validateRegex('InfrastructureAdapter.Charlie(name)', /charlie/, 'name', false, name)

    const result = Object.create(CharliePrototype)
    result.name = name
    return result
}

InfrastructureAdapter.Charlie = CharlieConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant InfrastructureAdapter.Charlie prototype
//
// -------------------------------------------------------------------------------------------------------------
const CharliePrototype = Object.create(InfrastructureAdapterPrototype)
Object.defineProperty(CharliePrototype, '@@tagName', { value: 'Charlie' })
Object.defineProperty(CharliePrototype, '@@typeName', { value: 'InfrastructureAdapter' })

CharliePrototype.toString = function () {
    return `InfrastructureAdapter.Charlie(${R._toString(this.name)})`
}

CharliePrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

CharlieConstructor.prototype = CharliePrototype
CharliePrototype.constructor = CharlieConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant InfrastructureAdapter.Charlie: static functions:
//
// -------------------------------------------------------------------------------------------------------------
CharlieConstructor.is = val => val && val.constructor === CharlieConstructor
CharlieConstructor.toString = () => 'InfrastructureAdapter.Charlie'
CharlieConstructor.from = o => InfrastructureAdapter.Charlie(o.name)

export { InfrastructureAdapter }
