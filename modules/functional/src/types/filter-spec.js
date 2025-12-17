// ABOUTME: Generated type definition for FilterSpec
// ABOUTME: Auto-generated from modules/functional/type-definitions/filter-spec.type.js - do not edit manually

/*  FilterSpec generated from: modules/functional/type-definitions/filter-spec.type.js
 *
 *  TextMatch
 *      fields: "[String]",
 *      query : "String"
 *  DateRange
 *      field: "String",
 *      start: "Date",
 *      end  : "Date"
 *  CategoryMatch
 *      field     : "String",
 *      categories: "[String]"
 *  Compound
 *      filters: "[FilterSpec]",
 *      mode   : /^(all|any)$/
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// FilterSpec constructor
//
// -------------------------------------------------------------------------------------------------------------
const FilterSpec = {
    toString: () => 'FilterSpec',
}

// Add hidden properties
Object.defineProperty(FilterSpec, '@@typeName', { value: 'FilterSpec', enumerable: false })
Object.defineProperty(FilterSpec, '@@tagNames', {
    value: ['TextMatch', 'DateRange', 'CategoryMatch', 'Compound'],
    enumerable: false,
})

// Type prototype with match method
const FilterSpecPrototype = {}

Object.defineProperty(FilterSpecPrototype, 'match', {
    value: R.match(FilterSpec['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(FilterSpecPrototype, 'constructor', {
    value: FilterSpec,
    enumerable: false,
    writable: true,
    configurable: true,
})

FilterSpec.prototype = FilterSpecPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant FilterSpec.TextMatch
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig textMatchToString :: () -> String
 */
const textMatchToString = function () {
    return `FilterSpec.TextMatch(${R._toString(this.fields)}, ${R._toString(this.query)})`
}

/*
 * Convert to JSON representation with tag
 * @sig textMatchToJSON :: () -> Object
 */
const textMatchToJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

/*
 * Construct a FilterSpec.TextMatch instance
 * @sig TextMatch :: ([String], String) -> FilterSpec.TextMatch
 */
const TextMatchConstructor = function TextMatch(fields, query) {
    const constructorName = 'FilterSpec.TextMatch(fields, query)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateArray(constructorName, 1, 'String', undefined, 'fields', false, fields)
    R.validateString(constructorName, 'query', false, query)

    const result = Object.create(TextMatchPrototype)
    result.fields = fields
    result.query = query
    return result
}

FilterSpec.TextMatch = TextMatchConstructor

const TextMatchPrototype = Object.create(FilterSpecPrototype, {
    '@@tagName': { value: 'TextMatch', enumerable: false },
    '@@typeName': { value: 'FilterSpec', enumerable: false },
    toString: { value: textMatchToString, enumerable: false },
    toJSON: { value: textMatchToJSON, enumerable: false },
    constructor: { value: TextMatchConstructor, enumerable: false, writable: true, configurable: true },
})

TextMatchConstructor.prototype = TextMatchPrototype
TextMatchConstructor.is = val => val && val.constructor === TextMatchConstructor
TextMatchConstructor.toString = () => 'FilterSpec.TextMatch'
TextMatchConstructor._from = _input => FilterSpec.TextMatch(_input.fields, _input.query)
TextMatchConstructor.from = TextMatchConstructor._from

TextMatchConstructor.toFirestore = o => ({ ...o })
TextMatchConstructor.fromFirestore = TextMatchConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant FilterSpec.DateRange
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig dateRangeToString :: () -> String
 */
const dateRangeToString = function () {
    return `FilterSpec.DateRange(${R._toString(this.field)}, ${R._toString(this.start)}, ${R._toString(this.end)})`
}

/*
 * Convert to JSON representation with tag
 * @sig dateRangeToJSON :: () -> Object
 */
const dateRangeToJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

/*
 * Construct a FilterSpec.DateRange instance
 * @sig DateRange :: (String, Date, Date) -> FilterSpec.DateRange
 */
const DateRangeConstructor = function DateRange(field, start, end) {
    const constructorName = 'FilterSpec.DateRange(field, start, end)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'field', false, field)
    R.validateDate(constructorName, 'start', false, start)
    R.validateDate(constructorName, 'end', false, end)

    const result = Object.create(DateRangePrototype)
    result.field = field
    result.start = start
    result.end = end
    return result
}

FilterSpec.DateRange = DateRangeConstructor

const DateRangePrototype = Object.create(FilterSpecPrototype, {
    '@@tagName': { value: 'DateRange', enumerable: false },
    '@@typeName': { value: 'FilterSpec', enumerable: false },
    toString: { value: dateRangeToString, enumerable: false },
    toJSON: { value: dateRangeToJSON, enumerable: false },
    constructor: { value: DateRangeConstructor, enumerable: false, writable: true, configurable: true },
})

DateRangeConstructor.prototype = DateRangePrototype
DateRangeConstructor.is = val => val && val.constructor === DateRangeConstructor
DateRangeConstructor.toString = () => 'FilterSpec.DateRange'
DateRangeConstructor._from = _input => {
    const { field, start, end } = _input
    return FilterSpec.DateRange(field, start, end)
}
DateRangeConstructor.from = DateRangeConstructor._from

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (DateRange, Function) -> Object
 */
DateRangeConstructor._toFirestore = (o, encodeTimestamps) => {
    const { field, start, end } = o
    return {
        field: field,
        start: encodeTimestamps(start),
        end: encodeTimestamps(end),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> DateRange
 */
DateRangeConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { field, start, end } = doc
    return DateRangeConstructor._from({
        field: field,
        start: decodeTimestamps(start),
        end: decodeTimestamps(end),
    })
}

// Public aliases (can be overridden)
DateRangeConstructor.toFirestore = DateRangeConstructor._toFirestore
DateRangeConstructor.fromFirestore = DateRangeConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant FilterSpec.CategoryMatch
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig categoryMatchToString :: () -> String
 */
const categoryMatchToString = function () {
    return `FilterSpec.CategoryMatch(${R._toString(this.field)}, ${R._toString(this.categories)})`
}

/*
 * Convert to JSON representation with tag
 * @sig categoryMatchToJSON :: () -> Object
 */
const categoryMatchToJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

/*
 * Construct a FilterSpec.CategoryMatch instance
 * @sig CategoryMatch :: (String, [String]) -> FilterSpec.CategoryMatch
 */
const CategoryMatchConstructor = function CategoryMatch(field, categories) {
    const constructorName = 'FilterSpec.CategoryMatch(field, categories)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'field', false, field)
    R.validateArray(constructorName, 1, 'String', undefined, 'categories', false, categories)

    const result = Object.create(CategoryMatchPrototype)
    result.field = field
    result.categories = categories
    return result
}

FilterSpec.CategoryMatch = CategoryMatchConstructor

const CategoryMatchPrototype = Object.create(FilterSpecPrototype, {
    '@@tagName': { value: 'CategoryMatch', enumerable: false },
    '@@typeName': { value: 'FilterSpec', enumerable: false },
    toString: { value: categoryMatchToString, enumerable: false },
    toJSON: { value: categoryMatchToJSON, enumerable: false },
    constructor: { value: CategoryMatchConstructor, enumerable: false, writable: true, configurable: true },
})

CategoryMatchConstructor.prototype = CategoryMatchPrototype
CategoryMatchConstructor.is = val => val && val.constructor === CategoryMatchConstructor
CategoryMatchConstructor.toString = () => 'FilterSpec.CategoryMatch'
CategoryMatchConstructor._from = _input => FilterSpec.CategoryMatch(_input.field, _input.categories)
CategoryMatchConstructor.from = CategoryMatchConstructor._from

CategoryMatchConstructor.toFirestore = o => ({ ...o })
CategoryMatchConstructor.fromFirestore = CategoryMatchConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant FilterSpec.Compound
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig compoundToString :: () -> String
 */
const compoundToString = function () {
    return `FilterSpec.Compound(${R._toString(this.filters)}, ${R._toString(this.mode)})`
}

/*
 * Convert to JSON representation with tag
 * @sig compoundToJSON :: () -> Object
 */
const compoundToJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

/*
 * Construct a FilterSpec.Compound instance
 * @sig Compound :: ([FilterSpec], Mode) -> FilterSpec.Compound
 *     Mode = /^(all|any)$/
 */
const CompoundConstructor = function Compound(filters, mode) {
    const constructorName = 'FilterSpec.Compound(filters, mode)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'FilterSpec', 'filters', false, filters)
    R.validateRegex(constructorName, /^(all|any)$/, 'mode', false, mode)

    const result = Object.create(CompoundPrototype)
    result.filters = filters
    result.mode = mode
    return result
}

FilterSpec.Compound = CompoundConstructor

const CompoundPrototype = Object.create(FilterSpecPrototype, {
    '@@tagName': { value: 'Compound', enumerable: false },
    '@@typeName': { value: 'FilterSpec', enumerable: false },
    toString: { value: compoundToString, enumerable: false },
    toJSON: { value: compoundToJSON, enumerable: false },
    constructor: { value: CompoundConstructor, enumerable: false, writable: true, configurable: true },
})

CompoundConstructor.prototype = CompoundPrototype
CompoundConstructor.is = val => val && val.constructor === CompoundConstructor
CompoundConstructor.toString = () => 'FilterSpec.Compound'
CompoundConstructor._from = _input => FilterSpec.Compound(_input.filters, _input.mode)
CompoundConstructor.from = CompoundConstructor._from

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (Compound, Function) -> Object
 */
CompoundConstructor._toFirestore = (o, encodeTimestamps) => {
    const { filters, mode } = o
    return {
        filters: filters.map(item1 => FilterSpec.toFirestore(item1, encodeTimestamps)),
        mode: mode,
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Compound
 */
CompoundConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { filters, mode } = doc
    return CompoundConstructor._from({
        filters: filters.map(item1 =>
            FilterSpec.fromFirestore ? FilterSpec.fromFirestore(item1, decodeTimestamps) : FilterSpec.from(item1),
        ),
        mode: mode,
    })
}

// Public aliases (can be overridden)
CompoundConstructor.toFirestore = CompoundConstructor._toFirestore
CompoundConstructor.fromFirestore = CompoundConstructor._fromFirestore

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a FilterSpec instance
 * @sig is :: Any -> Boolean
 */
FilterSpec.is = v => {
    const { TextMatch, DateRange, CategoryMatch, Compound } = FilterSpec
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === TextMatch ||
        constructor === DateRange ||
        constructor === CategoryMatch ||
        constructor === Compound
    )
}

/**
 * Serialize FilterSpec to Firestore format
 * @sig _toFirestore :: (FilterSpec, Function) -> Object
 */
FilterSpec._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = FilterSpec[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize FilterSpec from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> FilterSpec
 */
FilterSpec._fromFirestore = (doc, decodeTimestamps) => {
    const { TextMatch, DateRange, CategoryMatch, Compound } = FilterSpec
    const tagName = doc['@@tagName']
    if (tagName === 'TextMatch') return TextMatch.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'DateRange') return DateRange.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CategoryMatch') return CategoryMatch.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Compound') return Compound.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized FilterSpec variant: ${tagName}`)
}

// Public aliases (can be overridden)
FilterSpec.toFirestore = FilterSpec._toFirestore
FilterSpec.fromFirestore = FilterSpec._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { FilterSpec }
