// ABOUTME: Generated type definition for IRFilter
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir-filter.type.js - do not edit manually

/*  IRFilter generated from: modules/quicken-web-app/type-definitions/ir-filter.type.js
 *
 *  Equals
 *      field: /^(category|account|payee|accountType)$/,
 *      value: "String"
 *  OlderThan
 *      field: /^lastActivity$/,
 *      days : "Number"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// IRFilter constructor
//
// -------------------------------------------------------------------------------------------------------------
const IRFilter = {
    toString: () => 'IRFilter',
}

// Add hidden properties
Object.defineProperty(IRFilter, '@@typeName', { value: 'IRFilter', enumerable: false })
Object.defineProperty(IRFilter, '@@tagNames', { value: ['Equals', 'OlderThan'], enumerable: false })

// Type prototype with match method
const IRFilterPrototype = {}

Object.defineProperty(IRFilterPrototype, 'match', {
    value: R.match(IRFilter['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(IRFilterPrototype, 'constructor', {
    value: IRFilter,
    enumerable: false,
    writable: true,
    configurable: true,
})

IRFilter.prototype = IRFilterPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    equals   : function () { return `IRFilter.Equals(${R._toString(this.field)}, ${R._toString(this.value)})` },
    olderThan: function () { return `IRFilter.OlderThan(${R._toString(this.field)}, ${R._toString(this.days)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    equals   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    olderThan: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a IRFilter.Equals instance
 * @sig Equals :: (Field, String) -> IRFilter.Equals
 *     Field = /^(category|account|payee|accountType)$/
 */
const EqualsConstructor = function Equals(field, value) {
    const constructorName = 'IRFilter.Equals(field, value)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, /^(category|account|payee|accountType)$/, 'field', false, field)
    R.validateString(constructorName, 'value', false, value)

    const result = Object.create(EqualsPrototype)
    result.field = field
    result.value = value
    return result
}

IRFilter.Equals = EqualsConstructor

/*
 * Construct a IRFilter.OlderThan instance
 * @sig OlderThan :: (Field, Number) -> IRFilter.OlderThan
 *     Field = /^lastActivity$/
 */
const OlderThanConstructor = function OlderThan(field, days) {
    const constructorName = 'IRFilter.OlderThan(field, days)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, /^lastActivity$/, 'field', false, field)
    R.validateNumber(constructorName, 'days', false, days)

    const result = Object.create(OlderThanPrototype)
    result.field = field
    result.days = days
    return result
}

IRFilter.OlderThan = OlderThanConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const EqualsPrototype = Object.create(IRFilterPrototype, {
    '@@tagName': { value: 'Equals', enumerable: false },
    '@@typeName': { value: 'IRFilter', enumerable: false },
    toString: { value: toString.equals, enumerable: false },
    toJSON: { value: toJSON.equals, enumerable: false },
    constructor: { value: EqualsConstructor, enumerable: false, writable: true, configurable: true },
})

const OlderThanPrototype = Object.create(IRFilterPrototype, {
    '@@tagName': { value: 'OlderThan', enumerable: false },
    '@@typeName': { value: 'IRFilter', enumerable: false },
    toString: { value: toString.olderThan, enumerable: false },
    toJSON: { value: toJSON.olderThan, enumerable: false },
    constructor: { value: OlderThanConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor.prototype = EqualsPrototype
OlderThanConstructor.prototype = OlderThanPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor.is = val => val && val.constructor === EqualsConstructor
OlderThanConstructor.is = val => val && val.constructor === OlderThanConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor.toString = () => 'IRFilter.Equals'
OlderThanConstructor.toString = () => 'IRFilter.OlderThan'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor._from = _input => IRFilter.Equals(_input.field, _input.value)
OlderThanConstructor._from = _input => IRFilter.OlderThan(_input.field, _input.days)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor.from = EqualsConstructor._from
OlderThanConstructor.from = OlderThanConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRFilter instance
 * @sig is :: Any -> Boolean
 */
IRFilter.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === IRFilter.Equals || constructor === IRFilter.OlderThan
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRFilter }
