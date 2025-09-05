// Auto-generated static tagged sum type: InfrastructureAdapter
// Generated from: ./types/infrastructure-adapter.type.js
// fields from: { Firebase: { name: {  }}, Alice: { name: {  }}, Bob: { name: {  }}}

import * as R from '@graffio/types-runtime'

// -------------------------------------------------------------------------------------------------------------
//
// InfrastructureAdapter constructor
//
// -------------------------------------------------------------------------------------------------------------
const InfrastructureAdapter = {
    '@@typeName': 'InfrastructureAdapter',
    '@@tagNames': ['Firebase', 'Alice', 'Bob'],
    toString: () => 'InfrastructureAdapter',
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return (
            constructor === InfrastructureAdapter.Firebase ||
            constructor === InfrastructureAdapter.Alice ||
            constructor === InfrastructureAdapter.Bob
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
        const requiredVariants = ['Firebase', 'Alice', 'Bob']
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
Object.defineProperty(InfrastructureAdapter, '@@tagNames', { value: ['Firebase', 'Alice', 'Bob'] })

InfrastructureAdapterPrototype.constructor = InfrastructureAdapter
InfrastructureAdapter.prototype = InfrastructureAdapterPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant InfrastructureAdapter.Firebase constructor
//
// -------------------------------------------------------------------------------------------------------------
const FirebaseConstructor = function Firebase(name) {
    R.validateArgumentLength('InfrastructureAdapter.Firebase(name)', 1, arguments)
    R.validateRegex('InfrastructureAdapter.Firebase(name)', /firebase/, 'name', false, name)

    const result = Object.create(FirebasePrototype)
    result.name = name
    return result
}

InfrastructureAdapter.Firebase = FirebaseConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant InfrastructureAdapter.Firebase prototype
//
// -------------------------------------------------------------------------------------------------------------
const FirebasePrototype = Object.create(InfrastructureAdapterPrototype)
Object.defineProperty(FirebasePrototype, '@@tagName', { value: 'Firebase' })
Object.defineProperty(FirebasePrototype, '@@typeName', { value: 'InfrastructureAdapter' })

FirebasePrototype.toString = function () {
    return `InfrastructureAdapter.Firebase(${R._toString(this.name)})`
}

FirebasePrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

FirebaseConstructor.prototype = FirebasePrototype
FirebasePrototype.constructor = FirebaseConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant InfrastructureAdapter.Firebase: static functions:
//
// -------------------------------------------------------------------------------------------------------------
FirebaseConstructor.is = val => val && val.constructor === FirebaseConstructor
FirebaseConstructor.toString = () => 'InfrastructureAdapter.Firebase'
FirebaseConstructor.from = o => InfrastructureAdapter.Firebase(o.name)

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

export { InfrastructureAdapter }
