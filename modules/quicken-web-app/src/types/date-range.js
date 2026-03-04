// ABOUTME: Generated type definition for DateRange
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/date-range.type.js - do not edit manually

/*  DateRange generated from: modules/quicken-web-app/type-definitions/date-range.type.js
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
 *      unit : /^(months|days|weeks|years)$/,
 *      count: "Number"
 *  Range
 *      start: "String",
 *      end  : "String"
 *  Named
 *      name: /^(last_quarter|last_month|last_year|this_quarter|this_month|this_year|year_to_date)$/
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// DateRange constructor
//
// -------------------------------------------------------------------------------------------------------------
const DateRange = {
    toString: () => 'DateRange',
}

// Add hidden properties
Object.defineProperty(DateRange, '@@typeName', { value: 'DateRange', enumerable: false })
Object.defineProperty(DateRange, '@@tagNames', {
    value: ['Year', 'Quarter', 'Month', 'Relative', 'Range', 'Named'],
    enumerable: false,
})

// Type prototype with match method
const DateRangePrototype = {}

Object.defineProperty(DateRangePrototype, 'match', {
    value: R.match(DateRange['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(DateRangePrototype, 'constructor', {
    value: DateRange,
    enumerable: false,
    writable: true,
    configurable: true,
})

DateRange.prototype = DateRangePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    year    : function () { return `DateRange.Year(${R._toString(this.year)})` },
    quarter : function () { return `DateRange.Quarter(${R._toString(this.quarter)}, ${R._toString(this.year)})` },
    month   : function () { return `DateRange.Month(${R._toString(this.month)}, ${R._toString(this.year)})` },
    relative: function () { return `DateRange.Relative(${R._toString(this.unit)}, ${R._toString(this.count)})` },
    range   : function () { return `DateRange.Range(${R._toString(this.start)}, ${R._toString(this.end)})` },
    named   : function () { return `DateRange.Named(${R._toString(this.name)})` },
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
    named   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a DateRange.Year instance
 * @sig Year :: (Number) -> DateRange.Year
 */
const YearConstructor = function Year(year) {
    const constructorName = 'DateRange.Year(year)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateNumber(constructorName, 'year', false, year)

    const result = Object.create(YearPrototype)
    result.year = year
    return result
}

DateRange.Year = YearConstructor

/*
 * Construct a DateRange.Quarter instance
 * @sig Quarter :: (Number, Number) -> DateRange.Quarter
 */
const QuarterConstructor = function Quarter(quarter, year) {
    const constructorName = 'DateRange.Quarter(quarter, year)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'quarter', false, quarter)
    R.validateNumber(constructorName, 'year', false, year)

    const result = Object.create(QuarterPrototype)
    result.quarter = quarter
    result.year = year
    return result
}

DateRange.Quarter = QuarterConstructor

/*
 * Construct a DateRange.Month instance
 * @sig Month :: (Number, Number) -> DateRange.Month
 */
const MonthConstructor = function Month(month, year) {
    const constructorName = 'DateRange.Month(month, year)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'month', false, month)
    R.validateNumber(constructorName, 'year', false, year)

    const result = Object.create(MonthPrototype)
    result.month = month
    result.year = year
    return result
}

DateRange.Month = MonthConstructor

/*
 * Construct a DateRange.Relative instance
 * @sig Relative :: (Unit, Number) -> DateRange.Relative
 *     Unit = /^(months|days|weeks|years)$/
 */
const RelativeConstructor = function Relative(unit, count) {
    const constructorName = 'DateRange.Relative(unit, count)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, /^(months|days|weeks|years)$/, 'unit', false, unit)
    R.validateNumber(constructorName, 'count', false, count)

    const result = Object.create(RelativePrototype)
    result.unit = unit
    result.count = count
    return result
}

DateRange.Relative = RelativeConstructor

/*
 * Construct a DateRange.Range instance
 * @sig Range :: (String, String) -> DateRange.Range
 */
const RangeConstructor = function Range(start, end) {
    const constructorName = 'DateRange.Range(start, end)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'start', false, start)
    R.validateString(constructorName, 'end', false, end)

    const result = Object.create(RangePrototype)
    result.start = start
    result.end = end
    return result
}

DateRange.Range = RangeConstructor

/*
 * Construct a DateRange.Named instance
 * @sig Named :: (Name) -> DateRange.Named
 *     Name = /^(last_quarter|last_month|last_year|this_quarter|this_month|this_year|year_to_date)$/
 */
const NamedConstructor = function Named(name) {
    const constructorName = 'DateRange.Named(name)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateRegex(
        constructorName,
        /^(last_quarter|last_month|last_year|this_quarter|this_month|this_year|year_to_date)$/,
        'name',
        false,
        name,
    )

    const result = Object.create(NamedPrototype)
    result.name = name
    return result
}

DateRange.Named = NamedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const YearPrototype = Object.create(DateRangePrototype, {
    '@@tagName': { value: 'Year', enumerable: false },
    '@@typeName': { value: 'DateRange', enumerable: false },
    toString: { value: toString.year, enumerable: false },
    toJSON: { value: toJSON.year, enumerable: false },
    constructor: { value: YearConstructor, enumerable: false, writable: true, configurable: true },
})

const QuarterPrototype = Object.create(DateRangePrototype, {
    '@@tagName': { value: 'Quarter', enumerable: false },
    '@@typeName': { value: 'DateRange', enumerable: false },
    toString: { value: toString.quarter, enumerable: false },
    toJSON: { value: toJSON.quarter, enumerable: false },
    constructor: { value: QuarterConstructor, enumerable: false, writable: true, configurable: true },
})

const MonthPrototype = Object.create(DateRangePrototype, {
    '@@tagName': { value: 'Month', enumerable: false },
    '@@typeName': { value: 'DateRange', enumerable: false },
    toString: { value: toString.month, enumerable: false },
    toJSON: { value: toJSON.month, enumerable: false },
    constructor: { value: MonthConstructor, enumerable: false, writable: true, configurable: true },
})

const RelativePrototype = Object.create(DateRangePrototype, {
    '@@tagName': { value: 'Relative', enumerable: false },
    '@@typeName': { value: 'DateRange', enumerable: false },
    toString: { value: toString.relative, enumerable: false },
    toJSON: { value: toJSON.relative, enumerable: false },
    constructor: { value: RelativeConstructor, enumerable: false, writable: true, configurable: true },
})

const RangePrototype = Object.create(DateRangePrototype, {
    '@@tagName': { value: 'Range', enumerable: false },
    '@@typeName': { value: 'DateRange', enumerable: false },
    toString: { value: toString.range, enumerable: false },
    toJSON: { value: toJSON.range, enumerable: false },
    constructor: { value: RangeConstructor, enumerable: false, writable: true, configurable: true },
})

const NamedPrototype = Object.create(DateRangePrototype, {
    '@@tagName': { value: 'Named', enumerable: false },
    '@@typeName': { value: 'DateRange', enumerable: false },
    toString: { value: toString.named, enumerable: false },
    toJSON: { value: toJSON.named, enumerable: false },
    constructor: { value: NamedConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
YearConstructor.prototype = YearPrototype
QuarterConstructor.prototype = QuarterPrototype
MonthConstructor.prototype = MonthPrototype
RelativeConstructor.prototype = RelativePrototype
RangeConstructor.prototype = RangePrototype
NamedConstructor.prototype = NamedPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
YearConstructor.is = val => val && val.constructor === YearConstructor
QuarterConstructor.is = val => val && val.constructor === QuarterConstructor
MonthConstructor.is = val => val && val.constructor === MonthConstructor
RelativeConstructor.is = val => val && val.constructor === RelativeConstructor
RangeConstructor.is = val => val && val.constructor === RangeConstructor
NamedConstructor.is = val => val && val.constructor === NamedConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
YearConstructor.toString = () => 'DateRange.Year'
QuarterConstructor.toString = () => 'DateRange.Quarter'
MonthConstructor.toString = () => 'DateRange.Month'
RelativeConstructor.toString = () => 'DateRange.Relative'
RangeConstructor.toString = () => 'DateRange.Range'
NamedConstructor.toString = () => 'DateRange.Named'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
YearConstructor._from = _input => DateRange.Year(_input.year)
QuarterConstructor._from = _input => DateRange.Quarter(_input.quarter, _input.year)
MonthConstructor._from = _input => DateRange.Month(_input.month, _input.year)
RelativeConstructor._from = _input => DateRange.Relative(_input.unit, _input.count)
RangeConstructor._from = _input => DateRange.Range(_input.start, _input.end)
NamedConstructor._from = _input => DateRange.Named(_input.name)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
YearConstructor.from = YearConstructor._from
QuarterConstructor.from = QuarterConstructor._from
MonthConstructor.from = MonthConstructor._from
RelativeConstructor.from = RelativeConstructor._from
RangeConstructor.from = RangeConstructor._from
NamedConstructor.from = NamedConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a DateRange instance
 * @sig is :: Any -> Boolean
 */
DateRange.is = v => {
    const { Year, Quarter, Month, Relative, Range, Named } = DateRange
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === Year ||
        constructor === Quarter ||
        constructor === Month ||
        constructor === Relative ||
        constructor === Range ||
        constructor === Named
    )
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { DateRange }
