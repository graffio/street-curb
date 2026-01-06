// ABOUTME: Generated type definition for SortMode
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/sort-mode.type.js - do not edit manually

/*  SortMode generated from: modules/quicken-web-app/type-definitions/sort-mode.type.js
 *
 *  Alphabetical
 *  ByAmount
 *  ByType
 *  Manual
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// SortMode constructor
//
// -------------------------------------------------------------------------------------------------------------
const SortMode = {
    toString: () => 'SortMode',
}

// Add hidden properties
Object.defineProperty(SortMode, '@@typeName', { value: 'SortMode', enumerable: false })
Object.defineProperty(SortMode, '@@tagNames', {
    value: ['Alphabetical', 'ByAmount', 'ByType', 'Manual'],
    enumerable: false,
})

// Type prototype with match method
const SortModePrototype = {}

Object.defineProperty(SortModePrototype, 'match', {
    value: R.match(SortMode['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(SortModePrototype, 'constructor', {
    value: SortMode,
    enumerable: false,
    writable: true,
    configurable: true,
})

SortMode.prototype = SortModePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    alphabetical: function () { return `SortMode.Alphabetical()` },
    byAmount    : function () { return `SortMode.ByAmount()` },
    byType      : function () { return `SortMode.ByType()` },
    manual      : function () { return `SortMode.Manual()` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    alphabetical: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    byAmount    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    byType      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    manual      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a SortMode.Alphabetical instance
 * @sig Alphabetical :: () -> SortMode.Alphabetical
 */
const AlphabeticalConstructor = function Alphabetical() {
    const constructorName = 'SortMode.Alphabetical()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(AlphabeticalPrototype)

    return result
}

SortMode.Alphabetical = AlphabeticalConstructor

/*
 * Construct a SortMode.ByAmount instance
 * @sig ByAmount :: () -> SortMode.ByAmount
 */
const ByAmountConstructor = function ByAmount() {
    const constructorName = 'SortMode.ByAmount()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(ByAmountPrototype)

    return result
}

SortMode.ByAmount = ByAmountConstructor

/*
 * Construct a SortMode.ByType instance
 * @sig ByType :: () -> SortMode.ByType
 */
const ByTypeConstructor = function ByType() {
    const constructorName = 'SortMode.ByType()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(ByTypePrototype)

    return result
}

SortMode.ByType = ByTypeConstructor

/*
 * Construct a SortMode.Manual instance
 * @sig Manual :: () -> SortMode.Manual
 */
const ManualConstructor = function Manual() {
    const constructorName = 'SortMode.Manual()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(ManualPrototype)

    return result
}

SortMode.Manual = ManualConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const AlphabeticalPrototype = Object.create(SortModePrototype, {
    '@@tagName': { value: 'Alphabetical', enumerable: false },
    '@@typeName': { value: 'SortMode', enumerable: false },
    toString: { value: toString.alphabetical, enumerable: false },
    toJSON: { value: toJSON.alphabetical, enumerable: false },
    constructor: { value: AlphabeticalConstructor, enumerable: false, writable: true, configurable: true },
})

const ByAmountPrototype = Object.create(SortModePrototype, {
    '@@tagName': { value: 'ByAmount', enumerable: false },
    '@@typeName': { value: 'SortMode', enumerable: false },
    toString: { value: toString.byAmount, enumerable: false },
    toJSON: { value: toJSON.byAmount, enumerable: false },
    constructor: { value: ByAmountConstructor, enumerable: false, writable: true, configurable: true },
})

const ByTypePrototype = Object.create(SortModePrototype, {
    '@@tagName': { value: 'ByType', enumerable: false },
    '@@typeName': { value: 'SortMode', enumerable: false },
    toString: { value: toString.byType, enumerable: false },
    toJSON: { value: toJSON.byType, enumerable: false },
    constructor: { value: ByTypeConstructor, enumerable: false, writable: true, configurable: true },
})

const ManualPrototype = Object.create(SortModePrototype, {
    '@@tagName': { value: 'Manual', enumerable: false },
    '@@typeName': { value: 'SortMode', enumerable: false },
    toString: { value: toString.manual, enumerable: false },
    toJSON: { value: toJSON.manual, enumerable: false },
    constructor: { value: ManualConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
AlphabeticalConstructor.prototype = AlphabeticalPrototype
ByAmountConstructor.prototype = ByAmountPrototype
ByTypeConstructor.prototype = ByTypePrototype
ManualConstructor.prototype = ManualPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
AlphabeticalConstructor.is = val => val && val.constructor === AlphabeticalConstructor
ByAmountConstructor.is = val => val && val.constructor === ByAmountConstructor
ByTypeConstructor.is = val => val && val.constructor === ByTypeConstructor
ManualConstructor.is = val => val && val.constructor === ManualConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
AlphabeticalConstructor.toString = () => 'SortMode.Alphabetical'
ByAmountConstructor.toString = () => 'SortMode.ByAmount'
ByTypeConstructor.toString = () => 'SortMode.ByType'
ManualConstructor.toString = () => 'SortMode.Manual'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
AlphabeticalConstructor._from = _input => SortMode.Alphabetical()
ByAmountConstructor._from = _input => SortMode.ByAmount()
ByTypeConstructor._from = _input => SortMode.ByType()
ManualConstructor._from = _input => SortMode.Manual()
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
AlphabeticalConstructor.from = AlphabeticalConstructor._from
ByAmountConstructor.from = ByAmountConstructor._from
ByTypeConstructor.from = ByTypeConstructor._from
ManualConstructor.from = ManualConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

AlphabeticalConstructor.toFirestore = o => ({ ...o })
AlphabeticalConstructor.fromFirestore = AlphabeticalConstructor._from

ByAmountConstructor.toFirestore = o => ({ ...o })
ByAmountConstructor.fromFirestore = ByAmountConstructor._from

ByTypeConstructor.toFirestore = o => ({ ...o })
ByTypeConstructor.fromFirestore = ByTypeConstructor._from

ManualConstructor.toFirestore = o => ({ ...o })
ManualConstructor.fromFirestore = ManualConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a SortMode instance
 * @sig is :: Any -> Boolean
 */
SortMode.is = v => {
    const { Alphabetical, ByAmount, ByType, Manual } = SortMode
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === Alphabetical || constructor === ByAmount || constructor === ByType || constructor === Manual
}

/**
 * Serialize SortMode to Firestore format
 * @sig _toFirestore :: (SortMode, Function) -> Object
 */
SortMode._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = SortMode[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize SortMode from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> SortMode
 */
SortMode._fromFirestore = (doc, decodeTimestamps) => {
    const { Alphabetical, ByAmount, ByType, Manual } = SortMode
    const tagName = doc['@@tagName']
    if (tagName === 'Alphabetical') return Alphabetical.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ByAmount') return ByAmount.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ByType') return ByType.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Manual') return Manual.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized SortMode variant: ${tagName}`)
}

// Public aliases (can be overridden)
SortMode.toFirestore = SortMode._toFirestore
SortMode.fromFirestore = SortMode._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { SortMode }
