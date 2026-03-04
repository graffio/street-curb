// ABOUTME: Generated type definition for QueryFilter
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/query-filter.type.js - do not edit manually

/*  QueryFilter generated from: modules/quicken-web-app/type-definitions/query-filter.type.js
 *
 *  Equals
 *      field: "String",
 *      value: "String"
 *  OlderThan
 *      field: "String",
 *      days : "Number"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// QueryFilter constructor
//
// -------------------------------------------------------------------------------------------------------------
const QueryFilter = {
    toString: () => 'QueryFilter',
}

// Add hidden properties
Object.defineProperty(QueryFilter, '@@typeName', { value: 'QueryFilter', enumerable: false })
Object.defineProperty(QueryFilter, '@@tagNames', { value: ['Equals', 'OlderThan'], enumerable: false })

// Type prototype with match method
const QueryFilterPrototype = {}

Object.defineProperty(QueryFilterPrototype, 'match', {
    value: R.match(QueryFilter['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(QueryFilterPrototype, 'constructor', {
    value: QueryFilter,
    enumerable: false,
    writable: true,
    configurable: true,
})

QueryFilter.prototype = QueryFilterPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    equals   : function () { return `QueryFilter.Equals(${R._toString(this.field)}, ${R._toString(this.value)})` },
    olderThan: function () { return `QueryFilter.OlderThan(${R._toString(this.field)}, ${R._toString(this.days)})` },
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
 * Construct a QueryFilter.Equals instance
 * @sig Equals :: (String, String) -> QueryFilter.Equals
 */
const EqualsConstructor = function Equals(field, value) {
    const constructorName = 'QueryFilter.Equals(field, value)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'field', false, field)
    R.validateString(constructorName, 'value', false, value)

    const result = Object.create(EqualsPrototype)
    result.field = field
    result.value = value
    return result
}

QueryFilter.Equals = EqualsConstructor

/*
 * Construct a QueryFilter.OlderThan instance
 * @sig OlderThan :: (String, Number) -> QueryFilter.OlderThan
 */
const OlderThanConstructor = function OlderThan(field, days) {
    const constructorName = 'QueryFilter.OlderThan(field, days)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'field', false, field)
    R.validateNumber(constructorName, 'days', false, days)

    const result = Object.create(OlderThanPrototype)
    result.field = field
    result.days = days
    return result
}

QueryFilter.OlderThan = OlderThanConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const EqualsPrototype = Object.create(QueryFilterPrototype, {
    '@@tagName': { value: 'Equals', enumerable: false },
    '@@typeName': { value: 'QueryFilter', enumerable: false },
    toString: { value: toString.equals, enumerable: false },
    toJSON: { value: toJSON.equals, enumerable: false },
    constructor: { value: EqualsConstructor, enumerable: false, writable: true, configurable: true },
})

const OlderThanPrototype = Object.create(QueryFilterPrototype, {
    '@@tagName': { value: 'OlderThan', enumerable: false },
    '@@typeName': { value: 'QueryFilter', enumerable: false },
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
EqualsConstructor.toString = () => 'QueryFilter.Equals'
OlderThanConstructor.toString = () => 'QueryFilter.OlderThan'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor._from = _input => QueryFilter.Equals(_input.field, _input.value)
OlderThanConstructor._from = _input => QueryFilter.OlderThan(_input.field, _input.days)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
EqualsConstructor.from = EqualsConstructor._from
OlderThanConstructor.from = OlderThanConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

EqualsConstructor.toFirestore = o => ({ ...o })
EqualsConstructor.fromFirestore = EqualsConstructor._from

OlderThanConstructor.toFirestore = o => ({ ...o })
OlderThanConstructor.fromFirestore = OlderThanConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a QueryFilter instance
 * @sig is :: Any -> Boolean
 */
QueryFilter.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === QueryFilter.Equals || constructor === QueryFilter.OlderThan
}

/**
 * Serialize QueryFilter to Firestore format
 * @sig _toFirestore :: (QueryFilter, Function) -> Object
 */
QueryFilter._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = QueryFilter[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize QueryFilter from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> QueryFilter
 */
QueryFilter._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'Equals') return QueryFilter.Equals.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'OlderThan') return QueryFilter.OlderThan.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized QueryFilter variant: ${tagName}`)
}

// Public aliases (can be overridden)
QueryFilter.toFirestore = QueryFilter._toFirestore
QueryFilter.fromFirestore = QueryFilter._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { QueryFilter }
