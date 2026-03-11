// ABOUTME: Generated type definition for IRFilter
// ABOUTME: Auto-generated from modules/query-language/type-definitions/ir-filter.type.js - do not edit manually

/*  IRFilter generated from: modules/query-language/type-definitions/ir-filter.type.js
 *
 *  Equals
 *      field: /^(category|account|payee|accountType)$/,
 *      value: "String"
 *  In
 *      field : "String",
 *      values: "[String]"
 *  GreaterThan
 *      field: "String",
 *      value: "Number"
 *  LessThan
 *      field: "String",
 *      value: "Number"
 *  Between
 *      field: "String",
 *      low  : "Number",
 *      high : "Number"
 *  Matches
 *      field  : "String",
 *      pattern: "String"
 *  And
 *      filters: "[IRFilter]"
 *  Or
 *      filters: "[IRFilter]"
 *  Not
 *      filter: "IRFilter"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// IRFilter constructor
//
// -------------------------------------------------------------------------------------------------------------
const IRFilter = { toString: () => 'IRFilter' }

// Add hidden properties
Object.defineProperty(IRFilter, '@@typeName', { value: 'IRFilter', enumerable: false })
Object.defineProperty(IRFilter, '@@tagNames', {
    value: ['Equals', 'In', 'GreaterThan', 'LessThan', 'Between', 'Matches', 'And', 'Or', 'Not'],
    enumerable: false,
})

// Type prototype with match method
const IRFilterPrototype = {}

Object.defineProperty(IRFilterPrototype, 'match', { value: R.match(IRFilter['@@tagNames']), enumerable: false })

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
    equals     : function () { return `IRFilter.Equals(${R._toString(this.field)}, ${R._toString(this.value)})` },
    in         : function () { return `IRFilter.In(${R._toString(this.field)}, ${R._toString(this.values)})` },
    greaterThan: function () { return `IRFilter.GreaterThan(${R._toString(this.field)}, ${R._toString(this.value)})` },
    lessThan   : function () { return `IRFilter.LessThan(${R._toString(this.field)}, ${R._toString(this.value)})` },
    between    : function () { return `IRFilter.Between(${R._toString(this.field)}, ${R._toString(this.low)}, ${R._toString(this.high)})` },
    matches    : function () { return `IRFilter.Matches(${R._toString(this.field)}, ${R._toString(this.pattern)})` },
    and        : function () { return `IRFilter.And(${R._toString(this.filters)})` },
    or         : function () { return `IRFilter.Or(${R._toString(this.filters)})` },
    not        : function () { return `IRFilter.Not(${R._toString(this.filter)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    equals     : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    in         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    greaterThan: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    lessThan   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    between    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    matches    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    and        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    or         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    not        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
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
 * Construct a IRFilter.In instance
 * @sig In :: (String, [String]) -> IRFilter.In
 */
const InConstructor = function In(field, values) {
    const constructorName = 'IRFilter.In(field, values)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'field', false, field)
    R.validateArray(constructorName, 1, 'String', undefined, 'values', false, values)

    const result = Object.create(InPrototype)
    result.field = field
    result.values = values
    return result
}

IRFilter.In = InConstructor

/*
 * Construct a IRFilter.GreaterThan instance
 * @sig GreaterThan :: (String, Number) -> IRFilter.GreaterThan
 */
const GreaterThanConstructor = function GreaterThan(field, value) {
    const constructorName = 'IRFilter.GreaterThan(field, value)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'field', false, field)
    R.validateNumber(constructorName, 'value', false, value)

    const result = Object.create(GreaterThanPrototype)
    result.field = field
    result.value = value
    return result
}

IRFilter.GreaterThan = GreaterThanConstructor

/*
 * Construct a IRFilter.LessThan instance
 * @sig LessThan :: (String, Number) -> IRFilter.LessThan
 */
const LessThanConstructor = function LessThan(field, value) {
    const constructorName = 'IRFilter.LessThan(field, value)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'field', false, field)
    R.validateNumber(constructorName, 'value', false, value)

    const result = Object.create(LessThanPrototype)
    result.field = field
    result.value = value
    return result
}

IRFilter.LessThan = LessThanConstructor

/*
 * Construct a IRFilter.Between instance
 * @sig Between :: (String, Number, Number) -> IRFilter.Between
 */
const BetweenConstructor = function Between(field, low, high) {
    const constructorName = 'IRFilter.Between(field, low, high)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'field', false, field)
    R.validateNumber(constructorName, 'low', false, low)
    R.validateNumber(constructorName, 'high', false, high)

    const result = Object.create(BetweenPrototype)
    result.field = field
    result.low = low
    result.high = high
    return result
}

IRFilter.Between = BetweenConstructor

/*
 * Construct a IRFilter.Matches instance
 * @sig Matches :: (String, String) -> IRFilter.Matches
 */
const MatchesConstructor = function Matches(field, pattern) {
    const constructorName = 'IRFilter.Matches(field, pattern)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'field', false, field)
    R.validateString(constructorName, 'pattern', false, pattern)

    const result = Object.create(MatchesPrototype)
    result.field = field
    result.pattern = pattern
    return result
}

IRFilter.Matches = MatchesConstructor

/*
 * Construct a IRFilter.And instance
 * @sig And :: ([IRFilter]) -> IRFilter.And
 */
const AndConstructor = function And(filters) {
    const constructorName = 'IRFilter.And(filters)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'IRFilter', 'filters', false, filters)

    const result = Object.create(AndPrototype)
    result.filters = filters
    return result
}

IRFilter.And = AndConstructor

/*
 * Construct a IRFilter.Or instance
 * @sig Or :: ([IRFilter]) -> IRFilter.Or
 */
const OrConstructor = function Or(filters) {
    const constructorName = 'IRFilter.Or(filters)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'IRFilter', 'filters', false, filters)

    const result = Object.create(OrPrototype)
    result.filters = filters
    return result
}

IRFilter.Or = OrConstructor

/*
 * Construct a IRFilter.Not instance
 * @sig Not :: (IRFilter) -> IRFilter.Not
 */
const NotConstructor = function Not(filter) {
    const constructorName = 'IRFilter.Not(filter)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'IRFilter', 'filter', false, filter)

    const result = Object.create(NotPrototype)
    result.filter = filter
    return result
}

IRFilter.Not = NotConstructor

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

const InPrototype = Object.create(IRFilterPrototype, {
    '@@tagName': { value: 'In', enumerable: false },
    '@@typeName': { value: 'IRFilter', enumerable: false },
    toString: { value: toString.in, enumerable: false },
    toJSON: { value: toJSON.in, enumerable: false },
    constructor: { value: InConstructor, enumerable: false, writable: true, configurable: true },
})

const GreaterThanPrototype = Object.create(IRFilterPrototype, {
    '@@tagName': { value: 'GreaterThan', enumerable: false },
    '@@typeName': { value: 'IRFilter', enumerable: false },
    toString: { value: toString.greaterThan, enumerable: false },
    toJSON: { value: toJSON.greaterThan, enumerable: false },
    constructor: { value: GreaterThanConstructor, enumerable: false, writable: true, configurable: true },
})

const LessThanPrototype = Object.create(IRFilterPrototype, {
    '@@tagName': { value: 'LessThan', enumerable: false },
    '@@typeName': { value: 'IRFilter', enumerable: false },
    toString: { value: toString.lessThan, enumerable: false },
    toJSON: { value: toJSON.lessThan, enumerable: false },
    constructor: { value: LessThanConstructor, enumerable: false, writable: true, configurable: true },
})

const BetweenPrototype = Object.create(IRFilterPrototype, {
    '@@tagName': { value: 'Between', enumerable: false },
    '@@typeName': { value: 'IRFilter', enumerable: false },
    toString: { value: toString.between, enumerable: false },
    toJSON: { value: toJSON.between, enumerable: false },
    constructor: { value: BetweenConstructor, enumerable: false, writable: true, configurable: true },
})

const MatchesPrototype = Object.create(IRFilterPrototype, {
    '@@tagName': { value: 'Matches', enumerable: false },
    '@@typeName': { value: 'IRFilter', enumerable: false },
    toString: { value: toString.matches, enumerable: false },
    toJSON: { value: toJSON.matches, enumerable: false },
    constructor: { value: MatchesConstructor, enumerable: false, writable: true, configurable: true },
})

const AndPrototype = Object.create(IRFilterPrototype, {
    '@@tagName': { value: 'And', enumerable: false },
    '@@typeName': { value: 'IRFilter', enumerable: false },
    toString: { value: toString.and, enumerable: false },
    toJSON: { value: toJSON.and, enumerable: false },
    constructor: { value: AndConstructor, enumerable: false, writable: true, configurable: true },
})

const OrPrototype = Object.create(IRFilterPrototype, {
    '@@tagName': { value: 'Or', enumerable: false },
    '@@typeName': { value: 'IRFilter', enumerable: false },
    toString: { value: toString.or, enumerable: false },
    toJSON: { value: toJSON.or, enumerable: false },
    constructor: { value: OrConstructor, enumerable: false, writable: true, configurable: true },
})

const NotPrototype = Object.create(IRFilterPrototype, {
    '@@tagName': { value: 'Not', enumerable: false },
    '@@typeName': { value: 'IRFilter', enumerable: false },
    toString: { value: toString.not, enumerable: false },
    toJSON: { value: toJSON.not, enumerable: false },
    constructor: { value: NotConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor.prototype = EqualsPrototype
InConstructor.prototype = InPrototype
GreaterThanConstructor.prototype = GreaterThanPrototype
LessThanConstructor.prototype = LessThanPrototype
BetweenConstructor.prototype = BetweenPrototype
MatchesConstructor.prototype = MatchesPrototype
AndConstructor.prototype = AndPrototype
OrConstructor.prototype = OrPrototype
NotConstructor.prototype = NotPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor.is = val => val && val.constructor === EqualsConstructor
InConstructor.is = val => val && val.constructor === InConstructor
GreaterThanConstructor.is = val => val && val.constructor === GreaterThanConstructor
LessThanConstructor.is = val => val && val.constructor === LessThanConstructor
BetweenConstructor.is = val => val && val.constructor === BetweenConstructor
MatchesConstructor.is = val => val && val.constructor === MatchesConstructor
AndConstructor.is = val => val && val.constructor === AndConstructor
OrConstructor.is = val => val && val.constructor === OrConstructor
NotConstructor.is = val => val && val.constructor === NotConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor.toString = () => 'IRFilter.Equals'
InConstructor.toString = () => 'IRFilter.In'
GreaterThanConstructor.toString = () => 'IRFilter.GreaterThan'
LessThanConstructor.toString = () => 'IRFilter.LessThan'
BetweenConstructor.toString = () => 'IRFilter.Between'
MatchesConstructor.toString = () => 'IRFilter.Matches'
AndConstructor.toString = () => 'IRFilter.And'
OrConstructor.toString = () => 'IRFilter.Or'
NotConstructor.toString = () => 'IRFilter.Not'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor._from = _input => IRFilter.Equals(_input.field, _input.value)
InConstructor._from = _input => IRFilter.In(_input.field, _input.values)
GreaterThanConstructor._from = _input => IRFilter.GreaterThan(_input.field, _input.value)
LessThanConstructor._from = _input => IRFilter.LessThan(_input.field, _input.value)
BetweenConstructor._from = _input => {
    const { field, low, high } = _input
    return IRFilter.Between(field, low, high)
}
MatchesConstructor._from = _input => IRFilter.Matches(_input.field, _input.pattern)
AndConstructor._from = _input => IRFilter.And(_input.filters)
OrConstructor._from = _input => IRFilter.Or(_input.filters)
NotConstructor._from = _input => IRFilter.Not(_input.filter)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor.from = EqualsConstructor._from
InConstructor.from = InConstructor._from
GreaterThanConstructor.from = GreaterThanConstructor._from
LessThanConstructor.from = LessThanConstructor._from
BetweenConstructor.from = BetweenConstructor._from
MatchesConstructor.from = MatchesConstructor._from
AndConstructor.from = AndConstructor._from
OrConstructor.from = OrConstructor._from
NotConstructor.from = NotConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRFilter instance
 * @sig is :: Any -> Boolean
 */
IRFilter.is = v => {
    const { Equals, In, GreaterThan, LessThan, Between, Matches, And, Or, Not } = IRFilter
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === Equals ||
        constructor === In ||
        constructor === GreaterThan ||
        constructor === LessThan ||
        constructor === Between ||
        constructor === Matches ||
        constructor === And ||
        constructor === Or ||
        constructor === Not
    )
}

IRFilter.fromJSON = json => {
    if (json == null) return json
    const tag = json['@@tagName']
    if (!tag) throw new TypeError(`IRFilter.fromJSON: missing @@tagName on ${R._toString(json)}`)
    if (!IRFilter['@@tagNames'].includes(tag)) throw new TypeError(`IRFilter.fromJSON: unknown variant "${tag}"`)
    const revived = { ...json }
    if (revived.filters) revived.filters = revived.filters.map(item => IRFilter.fromJSON(item))
    if (revived.filter) revived.filter = IRFilter.fromJSON(revived.filter)
    return IRFilter[tag]._from(revived)
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRFilter }
