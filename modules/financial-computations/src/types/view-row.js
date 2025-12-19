// ABOUTME: Generated type definition for ViewRow
// ABOUTME: Auto-generated from modules/financial-computations/type-definitions/view-row.type.js - do not edit manually

/*  ViewRow generated from: modules/financial-computations/type-definitions/view-row.type.js
 *
 *  Detail
 *      transaction: "Transaction",
 *      computed   : "Object"
 *  Summary
 *      groupKey  : "String",
 *      aggregates: "Object",
 *      depth     : "Number"
 *
 */

import * as R from '@graffio/cli-type-generator'
import { Transaction } from './transaction.js'

// -------------------------------------------------------------------------------------------------------------
//
// ViewRow constructor
//
// -------------------------------------------------------------------------------------------------------------
const ViewRow = {
    toString: () => 'ViewRow',
}

// Add hidden properties
Object.defineProperty(ViewRow, '@@typeName', { value: 'ViewRow', enumerable: false })
Object.defineProperty(ViewRow, '@@tagNames', { value: ['Detail', 'Summary'], enumerable: false })

// Type prototype with match method
const ViewRowPrototype = {}

Object.defineProperty(ViewRowPrototype, 'match', {
    value: R.match(ViewRow['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(ViewRowPrototype, 'constructor', {
    value: ViewRow,
    enumerable: false,
    writable: true,
    configurable: true,
})

ViewRow.prototype = ViewRowPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    detail : function () { return `ViewRow.Detail(${R._toString(this.transaction)}, ${R._toString(this.computed)})` },
    summary: function () { return `ViewRow.Summary(${R._toString(this.groupKey)}, ${R._toString(this.aggregates)}, ${R._toString(this.depth)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    detail : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    summary: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a ViewRow.Detail instance
 * @sig Detail :: (Transaction, Object) -> ViewRow.Detail
 */
const DetailConstructor = function Detail(transaction, computed) {
    const constructorName = 'ViewRow.Detail(transaction, computed)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateTag(constructorName, 'Transaction', 'transaction', false, transaction)
    R.validateObject(constructorName, 'computed', false, computed)

    const result = Object.create(DetailPrototype)
    result.transaction = transaction
    result.computed = computed
    return result
}

ViewRow.Detail = DetailConstructor

/*
 * Construct a ViewRow.Summary instance
 * @sig Summary :: (String, Object, Number) -> ViewRow.Summary
 */
const SummaryConstructor = function Summary(groupKey, aggregates, depth) {
    const constructorName = 'ViewRow.Summary(groupKey, aggregates, depth)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'groupKey', false, groupKey)
    R.validateObject(constructorName, 'aggregates', false, aggregates)
    R.validateNumber(constructorName, 'depth', false, depth)

    const result = Object.create(SummaryPrototype)
    result.groupKey = groupKey
    result.aggregates = aggregates
    result.depth = depth
    return result
}

ViewRow.Summary = SummaryConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const DetailPrototype = Object.create(ViewRowPrototype, {
    '@@tagName': { value: 'Detail', enumerable: false },
    '@@typeName': { value: 'ViewRow', enumerable: false },
    toString: { value: toString.detail, enumerable: false },
    toJSON: { value: toJSON.detail, enumerable: false },
    constructor: { value: DetailConstructor, enumerable: false, writable: true, configurable: true },
})

const SummaryPrototype = Object.create(ViewRowPrototype, {
    '@@tagName': { value: 'Summary', enumerable: false },
    '@@typeName': { value: 'ViewRow', enumerable: false },
    toString: { value: toString.summary, enumerable: false },
    toJSON: { value: toJSON.summary, enumerable: false },
    constructor: { value: SummaryConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
DetailConstructor.prototype = DetailPrototype
SummaryConstructor.prototype = SummaryPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
DetailConstructor.is = val => val && val.constructor === DetailConstructor
SummaryConstructor.is = val => val && val.constructor === SummaryConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
DetailConstructor.toString = () => 'ViewRow.Detail'
SummaryConstructor.toString = () => 'ViewRow.Summary'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
DetailConstructor._from = _input => ViewRow.Detail(_input.transaction, _input.computed)
SummaryConstructor._from = _input => {
    const { groupKey, aggregates, depth } = _input
    return ViewRow.Summary(groupKey, aggregates, depth)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
DetailConstructor.from = DetailConstructor._from
SummaryConstructor.from = SummaryConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (Detail, Function) -> Object
 */
DetailConstructor._toFirestore = (o, encodeTimestamps) => {
    const { transaction, computed } = o
    return {
        transaction: Transaction.toFirestore(transaction, encodeTimestamps),
        computed: computed,
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Detail
 */
DetailConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { transaction, computed } = doc
    return DetailConstructor._from({
        transaction: Transaction.fromFirestore
            ? Transaction.fromFirestore(transaction, decodeTimestamps)
            : Transaction.from(transaction),
        computed: computed,
    })
}

// Public aliases (can be overridden)
DetailConstructor.toFirestore = DetailConstructor._toFirestore
DetailConstructor.fromFirestore = DetailConstructor._fromFirestore

SummaryConstructor.toFirestore = o => ({ ...o })
SummaryConstructor.fromFirestore = SummaryConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a ViewRow instance
 * @sig is :: Any -> Boolean
 */
ViewRow.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === ViewRow.Detail || constructor === ViewRow.Summary
}

/**
 * Serialize ViewRow to Firestore format
 * @sig _toFirestore :: (ViewRow, Function) -> Object
 */
ViewRow._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = ViewRow[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize ViewRow from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ViewRow
 */
ViewRow._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'Detail') return ViewRow.Detail.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Summary') return ViewRow.Summary.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized ViewRow variant: ${tagName}`)
}

// Public aliases (can be overridden)
ViewRow.toFirestore = ViewRow._toFirestore
ViewRow.fromFirestore = ViewRow._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ViewRow }
