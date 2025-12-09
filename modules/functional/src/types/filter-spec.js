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
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return (
            constructor === FilterSpec.TextMatch ||
            constructor === FilterSpec.DateRange ||
            constructor === FilterSpec.CategoryMatch ||
            constructor === FilterSpec.Compound
        )
    },
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

    toString: {
        value: function () {
            return `FilterSpec.TextMatch(${R._toString(this.fields)}, ${R._toString(this.query)})`
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
        value: TextMatchConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

TextMatchConstructor.prototype = TextMatchPrototype
TextMatchConstructor.is = val => val && val.constructor === TextMatchConstructor
TextMatchConstructor.toString = () => 'FilterSpec.TextMatch'
TextMatchConstructor._from = o => FilterSpec.TextMatch(o.fields, o.query)
TextMatchConstructor.from = TextMatchConstructor._from

TextMatchConstructor.toFirestore = o => ({ ...o })
TextMatchConstructor.fromFirestore = TextMatchConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant FilterSpec.DateRange
//
// -------------------------------------------------------------------------------------------------------------
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

    toString: {
        value: function () {
            return `FilterSpec.DateRange(${R._toString(this.field)}, ${R._toString(this.start)}, ${R._toString(this.end)})`
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
        value: DateRangeConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

DateRangeConstructor.prototype = DateRangePrototype
DateRangeConstructor.is = val => val && val.constructor === DateRangeConstructor
DateRangeConstructor.toString = () => 'FilterSpec.DateRange'
DateRangeConstructor._from = o => FilterSpec.DateRange(o.field, o.start, o.end)
DateRangeConstructor.from = DateRangeConstructor._from

DateRangeConstructor._toFirestore = (o, encodeTimestamps) => ({
    field: o.field,
    start: encodeTimestamps(o.start),
    end: encodeTimestamps(o.end),
})

DateRangeConstructor._fromFirestore = (doc, decodeTimestamps) =>
    DateRangeConstructor._from({
        field: doc.field,
        start: decodeTimestamps(doc.start),
        end: decodeTimestamps(doc.end),
    })

// Public aliases (can be overridden)
DateRangeConstructor.toFirestore = DateRangeConstructor._toFirestore
DateRangeConstructor.fromFirestore = DateRangeConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant FilterSpec.CategoryMatch
//
// -------------------------------------------------------------------------------------------------------------
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

    toString: {
        value: function () {
            return `FilterSpec.CategoryMatch(${R._toString(this.field)}, ${R._toString(this.categories)})`
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
        value: CategoryMatchConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

CategoryMatchConstructor.prototype = CategoryMatchPrototype
CategoryMatchConstructor.is = val => val && val.constructor === CategoryMatchConstructor
CategoryMatchConstructor.toString = () => 'FilterSpec.CategoryMatch'
CategoryMatchConstructor._from = o => FilterSpec.CategoryMatch(o.field, o.categories)
CategoryMatchConstructor.from = CategoryMatchConstructor._from

CategoryMatchConstructor.toFirestore = o => ({ ...o })
CategoryMatchConstructor.fromFirestore = CategoryMatchConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant FilterSpec.Compound
//
// -------------------------------------------------------------------------------------------------------------
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

    toString: {
        value: function () {
            return `FilterSpec.Compound(${R._toString(this.filters)}, ${R._toString(this.mode)})`
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
        value: CompoundConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

CompoundConstructor.prototype = CompoundPrototype
CompoundConstructor.is = val => val && val.constructor === CompoundConstructor
CompoundConstructor.toString = () => 'FilterSpec.Compound'
CompoundConstructor._from = o => FilterSpec.Compound(o.filters, o.mode)
CompoundConstructor.from = CompoundConstructor._from

CompoundConstructor._toFirestore = (o, encodeTimestamps) => ({
    filters: o.filters.map(item1 => FilterSpec.toFirestore(item1, encodeTimestamps)),
    mode: o.mode,
})

CompoundConstructor._fromFirestore = (doc, decodeTimestamps) =>
    CompoundConstructor._from({
        filters: doc.filters.map(item1 =>
            FilterSpec.fromFirestore ? FilterSpec.fromFirestore(item1, decodeTimestamps) : FilterSpec.from(item1),
        ),
        mode: doc.mode,
    })

// Public aliases (can be overridden)
CompoundConstructor.toFirestore = CompoundConstructor._toFirestore
CompoundConstructor.fromFirestore = CompoundConstructor._fromFirestore

FilterSpec._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = FilterSpec[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

FilterSpec._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'TextMatch') return FilterSpec.TextMatch.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'DateRange') return FilterSpec.DateRange.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CategoryMatch') return FilterSpec.CategoryMatch.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Compound') return FilterSpec.Compound.fromFirestore(doc, decodeTimestamps)
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
