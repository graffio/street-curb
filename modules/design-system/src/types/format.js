/*  Format generated from: modules/design-system/type-definitions/format.type.js
 *
 *  Boolean
 *      trueValue : "String?",
 *      falseValue: "String?"
 *  Currency
 *      locale  : "String?",
 *      currency: "String?"
 *  Custom
 *      key: "String"
 *  Date
 *      style: "/short|medium|long|full/?"
 *  None
 *  RelativeDate
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// Format constructor
//
// -------------------------------------------------------------------------------------------------------------
const Format = {
    toString: () => 'Format',
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return (
            constructor === Format.Boolean ||
            constructor === Format.Currency ||
            constructor === Format.Custom ||
            constructor === Format.Date ||
            constructor === Format.None ||
            constructor === Format.RelativeDate
        )
    },
}

// Add hidden properties
Object.defineProperty(Format, '@@typeName', { value: 'Format', enumerable: false })
Object.defineProperty(Format, '@@tagNames', {
    value: ['Boolean', 'Currency', 'Custom', 'Date', 'None', 'RelativeDate'],
    enumerable: false,
})

// Type prototype with match method
const FormatPrototype = {}

Object.defineProperty(FormatPrototype, 'match', {
    value: R.match(Format['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(FormatPrototype, 'constructor', {
    value: Format,
    enumerable: false,
    writable: true,
    configurable: true,
})

Format.prototype = FormatPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Format.Boolean
//
// -------------------------------------------------------------------------------------------------------------
const BooleanConstructor = function Boolean(trueValue, falseValue) {
    const constructorName = 'Format.Boolean(trueValue, falseValue)'

    R.validateString(constructorName, 'trueValue', true, trueValue)
    R.validateString(constructorName, 'falseValue', true, falseValue)

    const result = Object.create(BooleanPrototype)
    if (trueValue != null) result.trueValue = trueValue
    if (falseValue != null) result.falseValue = falseValue
    return result
}

Format.Boolean = BooleanConstructor

const BooleanPrototype = Object.create(FormatPrototype, {
    '@@tagName': { value: 'Boolean', enumerable: false },
    '@@typeName': { value: 'Format', enumerable: false },

    toString: {
        value: function () {
            return `Format.Boolean(${R._toString(this.trueValue)}, ${R._toString(this.falseValue)})`
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
        value: BooleanConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

BooleanConstructor.prototype = BooleanPrototype
BooleanConstructor.is = val => val && val.constructor === BooleanConstructor
BooleanConstructor.toString = () => 'Format.Boolean'
BooleanConstructor._from = o => Format.Boolean(o.trueValue, o.falseValue)
BooleanConstructor.from = BooleanConstructor._from

BooleanConstructor.toFirestore = o => ({ ...o })
BooleanConstructor.fromFirestore = BooleanConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Format.Currency
//
// -------------------------------------------------------------------------------------------------------------
const CurrencyConstructor = function Currency(locale, currency) {
    const constructorName = 'Format.Currency(locale, currency)'

    R.validateString(constructorName, 'locale', true, locale)
    R.validateString(constructorName, 'currency', true, currency)

    const result = Object.create(CurrencyPrototype)
    if (locale != null) result.locale = locale
    if (currency != null) result.currency = currency
    return result
}

Format.Currency = CurrencyConstructor

const CurrencyPrototype = Object.create(FormatPrototype, {
    '@@tagName': { value: 'Currency', enumerable: false },
    '@@typeName': { value: 'Format', enumerable: false },

    toString: {
        value: function () {
            return `Format.Currency(${R._toString(this.locale)}, ${R._toString(this.currency)})`
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
        value: CurrencyConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

CurrencyConstructor.prototype = CurrencyPrototype
CurrencyConstructor.is = val => val && val.constructor === CurrencyConstructor
CurrencyConstructor.toString = () => 'Format.Currency'
CurrencyConstructor._from = o => Format.Currency(o.locale, o.currency)
CurrencyConstructor.from = CurrencyConstructor._from

CurrencyConstructor.toFirestore = o => ({ ...o })
CurrencyConstructor.fromFirestore = CurrencyConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Format.Custom
//
// -------------------------------------------------------------------------------------------------------------
const CustomConstructor = function Custom(key) {
    const constructorName = 'Format.Custom(key)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'key', false, key)

    const result = Object.create(CustomPrototype)
    result.key = key
    return result
}

Format.Custom = CustomConstructor

const CustomPrototype = Object.create(FormatPrototype, {
    '@@tagName': { value: 'Custom', enumerable: false },
    '@@typeName': { value: 'Format', enumerable: false },

    toString: {
        value: function () {
            return `Format.Custom(${R._toString(this.key)})`
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
        value: CustomConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

CustomConstructor.prototype = CustomPrototype
CustomConstructor.is = val => val && val.constructor === CustomConstructor
CustomConstructor.toString = () => 'Format.Custom'
CustomConstructor._from = o => Format.Custom(o.key)
CustomConstructor.from = CustomConstructor._from

CustomConstructor.toFirestore = o => ({ ...o })
CustomConstructor.fromFirestore = CustomConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Format.Date
//
// -------------------------------------------------------------------------------------------------------------
const DateConstructor = function Date(style) {
    const constructorName = 'Format.Date(style)'

    R.validateRegex(constructorName, /short|medium|long|full/, 'style', true, style)

    const result = Object.create(DatePrototype)
    if (style != null) result.style = style
    return result
}

Format.Date = DateConstructor

const DatePrototype = Object.create(FormatPrototype, {
    '@@tagName': { value: 'Date', enumerable: false },
    '@@typeName': { value: 'Format', enumerable: false },

    toString: {
        value: function () {
            return `Format.Date(${R._toString(this.style)})`
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
        value: DateConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

DateConstructor.prototype = DatePrototype
DateConstructor.is = val => val && val.constructor === DateConstructor
DateConstructor.toString = () => 'Format.Date'
DateConstructor._from = o => Format.Date(o.style)
DateConstructor.from = DateConstructor._from

DateConstructor.toFirestore = o => ({ ...o })
DateConstructor.fromFirestore = DateConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Format.None
//
// -------------------------------------------------------------------------------------------------------------
const NoneConstructor = function None() {
    const constructorName = 'Format.None()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(NonePrototype)

    return result
}

Format.None = NoneConstructor

const NonePrototype = Object.create(FormatPrototype, {
    '@@tagName': { value: 'None', enumerable: false },
    '@@typeName': { value: 'Format', enumerable: false },

    toString: {
        value: function () {
            return `Format.None()`
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
        value: NoneConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

NoneConstructor.prototype = NonePrototype
NoneConstructor.is = val => val && val.constructor === NoneConstructor
NoneConstructor.toString = () => 'Format.None'
NoneConstructor._from = o => Format.None()
NoneConstructor.from = NoneConstructor._from

NoneConstructor.toFirestore = o => ({ ...o })
NoneConstructor.fromFirestore = NoneConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Format.RelativeDate
//
// -------------------------------------------------------------------------------------------------------------
const RelativeDateConstructor = function RelativeDate() {
    const constructorName = 'Format.RelativeDate()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(RelativeDatePrototype)

    return result
}

Format.RelativeDate = RelativeDateConstructor

const RelativeDatePrototype = Object.create(FormatPrototype, {
    '@@tagName': { value: 'RelativeDate', enumerable: false },
    '@@typeName': { value: 'Format', enumerable: false },

    toString: {
        value: function () {
            return `Format.RelativeDate()`
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
        value: RelativeDateConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

RelativeDateConstructor.prototype = RelativeDatePrototype
RelativeDateConstructor.is = val => val && val.constructor === RelativeDateConstructor
RelativeDateConstructor.toString = () => 'Format.RelativeDate'
RelativeDateConstructor._from = o => Format.RelativeDate()
RelativeDateConstructor.from = RelativeDateConstructor._from

RelativeDateConstructor.toFirestore = o => ({ ...o })
RelativeDateConstructor.fromFirestore = RelativeDateConstructor._from

Format._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = Format[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

Format._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'Boolean') return Format.Boolean.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Currency') return Format.Currency.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Custom') return Format.Custom.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Date') return Format.Date.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'None') return Format.None.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'RelativeDate') return Format.RelativeDate.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized Format variant: ${tagName}`)
}

// Public aliases (can be overridden)
Format.toFirestore = Format._toFirestore
Format.fromFirestore = Format._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Format }
