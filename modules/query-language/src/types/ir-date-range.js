// ABOUTME: Generated type definition for IRDateRange
// ABOUTME: Auto-generated from modules/query-language/type-definitions/ir-date-range.type.js - do not edit manually

/*  IRDateRange generated from: modules/query-language/type-definitions/ir-date-range.type.js
 *
 *  Year
 *      year: "Number"
 *  Quarter
 *      quarter: "Number",
 *      year   : "Number"
 *  Month
 *      month: "Number",
 *      year : "Number"
 *  Relative
 *      unit : FieldTypes.timeUnit,
 *      count: "Number"
 *  Range
 *      start: "String",
 *      end  : "String"
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// IRDateRange constructor
//
// -------------------------------------------------------------------------------------------------------------
const IRDateRange = { toString: () => 'IRDateRange' }

// Add hidden properties
Object.defineProperty(IRDateRange, '@@typeName', { value: 'IRDateRange', enumerable: false })
Object.defineProperty(IRDateRange, '@@tagNames', {
    value: ['Year', 'Quarter', 'Month', 'Relative', 'Range'],
    enumerable: false,
})

// Type prototype with match method
const IRDateRangePrototype = {}

Object.defineProperty(IRDateRangePrototype, 'match', { value: R.match(IRDateRange['@@tagNames']), enumerable: false })

Object.defineProperty(IRDateRangePrototype, 'constructor', {
    value: IRDateRange,
    enumerable: false,
    writable: true,
    configurable: true,
})

IRDateRange.prototype = IRDateRangePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    year    : function () { return `IRDateRange.Year(${R._toString(this.year)})` },
    quarter : function () { return `IRDateRange.Quarter(${R._toString(this.quarter)}, ${R._toString(this.year)})` },
    month   : function () { return `IRDateRange.Month(${R._toString(this.month)}, ${R._toString(this.year)})` },
    relative: function () { return `IRDateRange.Relative(${R._toString(this.unit)}, ${R._toString(this.count)})` },
    range   : function () { return `IRDateRange.Range(${R._toString(this.start)}, ${R._toString(this.end)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    year    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    quarter : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    month   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    relative: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    range   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a IRDateRange.Year instance
 * @sig Year :: (Number) -> IRDateRange.Year
 */
const YearConstructor = function Year(year) {
    const constructorName = 'IRDateRange.Year(year)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateNumber(constructorName, 'year', false, year)

    const result = Object.create(YearPrototype)
    result.year = year
    return result
}

IRDateRange.Year = YearConstructor

/*
 * Construct a IRDateRange.Quarter instance
 * @sig Quarter :: (Number, Number) -> IRDateRange.Quarter
 */
const QuarterConstructor = function Quarter(quarter, year) {
    const constructorName = 'IRDateRange.Quarter(quarter, year)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'quarter', false, quarter)
    R.validateNumber(constructorName, 'year', false, year)

    const result = Object.create(QuarterPrototype)
    result.quarter = quarter
    result.year = year
    return result
}

IRDateRange.Quarter = QuarterConstructor

/*
 * Construct a IRDateRange.Month instance
 * @sig Month :: (Number, Number) -> IRDateRange.Month
 */
const MonthConstructor = function Month(month, year) {
    const constructorName = 'IRDateRange.Month(month, year)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'month', false, month)
    R.validateNumber(constructorName, 'year', false, year)

    const result = Object.create(MonthPrototype)
    result.month = month
    result.year = year
    return result
}

IRDateRange.Month = MonthConstructor

/*
 * Construct a IRDateRange.Relative instance
 * @sig Relative :: (String, Number) -> IRDateRange.Relative
 */
const RelativeConstructor = function Relative(unit, count) {
    const constructorName = 'IRDateRange.Relative(unit, count)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.timeUnit, 'unit', false, unit)
    R.validateNumber(constructorName, 'count', false, count)

    const result = Object.create(RelativePrototype)
    result.unit = unit
    result.count = count
    return result
}

IRDateRange.Relative = RelativeConstructor

/*
 * Construct a IRDateRange.Range instance
 * @sig Range :: (String, String) -> IRDateRange.Range
 */
const RangeConstructor = function Range(start, end) {
    const constructorName = 'IRDateRange.Range(start, end)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'start', false, start)
    R.validateString(constructorName, 'end', false, end)

    const result = Object.create(RangePrototype)
    result.start = start
    result.end = end
    return result
}

IRDateRange.Range = RangeConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const YearPrototype = Object.create(IRDateRangePrototype, {
    '@@tagName': { value: 'Year', enumerable: false },
    '@@typeName': { value: 'IRDateRange', enumerable: false },
    toString: { value: toString.year, enumerable: false },
    toJSON: { value: toJSON.year, enumerable: false },
    constructor: { value: YearConstructor, enumerable: false, writable: true, configurable: true },
})

const QuarterPrototype = Object.create(IRDateRangePrototype, {
    '@@tagName': { value: 'Quarter', enumerable: false },
    '@@typeName': { value: 'IRDateRange', enumerable: false },
    toString: { value: toString.quarter, enumerable: false },
    toJSON: { value: toJSON.quarter, enumerable: false },
    constructor: { value: QuarterConstructor, enumerable: false, writable: true, configurable: true },
})

const MonthPrototype = Object.create(IRDateRangePrototype, {
    '@@tagName': { value: 'Month', enumerable: false },
    '@@typeName': { value: 'IRDateRange', enumerable: false },
    toString: { value: toString.month, enumerable: false },
    toJSON: { value: toJSON.month, enumerable: false },
    constructor: { value: MonthConstructor, enumerable: false, writable: true, configurable: true },
})

const RelativePrototype = Object.create(IRDateRangePrototype, {
    '@@tagName': { value: 'Relative', enumerable: false },
    '@@typeName': { value: 'IRDateRange', enumerable: false },
    toString: { value: toString.relative, enumerable: false },
    toJSON: { value: toJSON.relative, enumerable: false },
    constructor: { value: RelativeConstructor, enumerable: false, writable: true, configurable: true },
})

const RangePrototype = Object.create(IRDateRangePrototype, {
    '@@tagName': { value: 'Range', enumerable: false },
    '@@typeName': { value: 'IRDateRange', enumerable: false },
    toString: { value: toString.range, enumerable: false },
    toJSON: { value: toJSON.range, enumerable: false },
    constructor: { value: RangeConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
YearConstructor.prototype = YearPrototype
QuarterConstructor.prototype = QuarterPrototype
MonthConstructor.prototype = MonthPrototype
RelativeConstructor.prototype = RelativePrototype
RangeConstructor.prototype = RangePrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
YearConstructor.is = val => val && val.constructor === YearConstructor
QuarterConstructor.is = val => val && val.constructor === QuarterConstructor
MonthConstructor.is = val => val && val.constructor === MonthConstructor
RelativeConstructor.is = val => val && val.constructor === RelativeConstructor
RangeConstructor.is = val => val && val.constructor === RangeConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
YearConstructor.toString = () => 'IRDateRange.Year'
QuarterConstructor.toString = () => 'IRDateRange.Quarter'
MonthConstructor.toString = () => 'IRDateRange.Month'
RelativeConstructor.toString = () => 'IRDateRange.Relative'
RangeConstructor.toString = () => 'IRDateRange.Range'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
YearConstructor._from = _input => IRDateRange.Year(_input.year)
QuarterConstructor._from = _input => IRDateRange.Quarter(_input.quarter, _input.year)
MonthConstructor._from = _input => IRDateRange.Month(_input.month, _input.year)
RelativeConstructor._from = _input => IRDateRange.Relative(_input.unit, _input.count)
RangeConstructor._from = _input => IRDateRange.Range(_input.start, _input.end)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
YearConstructor.from = YearConstructor._from
QuarterConstructor.from = QuarterConstructor._from
MonthConstructor.from = MonthConstructor._from
RelativeConstructor.from = RelativeConstructor._from
RangeConstructor.from = RangeConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRDateRange instance
 * @sig is :: Any -> Boolean
 */
IRDateRange.is = v => {
    const { Year, Quarter, Month, Relative, Range } = IRDateRange
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === Year ||
        constructor === Quarter ||
        constructor === Month ||
        constructor === Relative ||
        constructor === Range
    )
}

IRDateRange.fromJSON = json => {
    if (json == null) return json
    const tag = json['@@tagName']
    if (!tag) throw new TypeError(`IRDateRange.fromJSON: missing @@tagName on ${R._toString(json)}`)
    if (!IRDateRange['@@tagNames'].includes(tag)) throw new TypeError(`IRDateRange.fromJSON: unknown variant "${tag}"`)
    return IRDateRange[tag]._from(json)
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRDateRange }
