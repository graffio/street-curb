/*  Action generated from: modules/quicken-web-app/type-definitions/action.type.js
 *
 *  LoadFile
 *      transactions: "{Transaction:id}"
 *  SetTransactionFilter
 *      payload: "Object"
 *  ResetTransactionFilters
 *
 */

import * as R from '@graffio/cli-type-generator'
import { Transaction } from './transaction.js'

// -------------------------------------------------------------------------------------------------------------
//
// Action constructor
//
// -------------------------------------------------------------------------------------------------------------
const Action = {
    toString: () => 'Action',
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return (
            constructor === Action.LoadFile ||
            constructor === Action.SetTransactionFilter ||
            constructor === Action.ResetTransactionFilters
        )
    },
}

// Add hidden properties
Object.defineProperty(Action, '@@typeName', { value: 'Action', enumerable: false })
Object.defineProperty(Action, '@@tagNames', {
    value: ['LoadFile', 'SetTransactionFilter', 'ResetTransactionFilters'],
    enumerable: false,
})

// Type prototype with match method
const ActionPrototype = {}

Object.defineProperty(ActionPrototype, 'match', {
    value: R.match(Action['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(ActionPrototype, 'constructor', {
    value: Action,
    enumerable: false,
    writable: true,
    configurable: true,
})

Action.prototype = ActionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.LoadFile
//
// -------------------------------------------------------------------------------------------------------------
const LoadFileConstructor = function LoadFile(transactions) {
    const constructorName = 'Action.LoadFile(transactions)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateLookupTable(constructorName, 'Transaction', 'transactions', false, transactions)

    const result = Object.create(LoadFilePrototype)
    result.transactions = transactions
    return result
}

Action.LoadFile = LoadFileConstructor

const LoadFilePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'LoadFile', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.LoadFile(${R._toString(this.transactions)})`
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
        value: LoadFileConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

LoadFileConstructor.prototype = LoadFilePrototype
LoadFileConstructor.is = val => val && val.constructor === LoadFileConstructor
LoadFileConstructor.toString = () => 'Action.LoadFile'
LoadFileConstructor._from = o => Action.LoadFile(o.transactions)
LoadFileConstructor.from = LoadFileConstructor._from

LoadFileConstructor._toFirestore = (o, encodeTimestamps) => ({
    transactions: R.lookupTableToFirestore(Transaction, 'id', encodeTimestamps, o.transactions),
})

LoadFileConstructor._fromFirestore = (doc, decodeTimestamps) =>
    LoadFileConstructor._from({
        transactions: R.lookupTableFromFirestore(Transaction, 'id', decodeTimestamps, doc.transactions),
    })

// Public aliases (can be overridden)
LoadFileConstructor.toFirestore = LoadFileConstructor._toFirestore
LoadFileConstructor.fromFirestore = LoadFileConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SetTransactionFilter
//
// -------------------------------------------------------------------------------------------------------------
const SetTransactionFilterConstructor = function SetTransactionFilter(payload) {
    const constructorName = 'Action.SetTransactionFilter(payload)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'payload', false, payload)

    const result = Object.create(SetTransactionFilterPrototype)
    result.payload = payload
    return result
}

Action.SetTransactionFilter = SetTransactionFilterConstructor

const SetTransactionFilterPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetTransactionFilter', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SetTransactionFilter(${R._toString(this.payload)})`
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
        value: SetTransactionFilterConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SetTransactionFilterConstructor.prototype = SetTransactionFilterPrototype
SetTransactionFilterConstructor.is = val => val && val.constructor === SetTransactionFilterConstructor
SetTransactionFilterConstructor.toString = () => 'Action.SetTransactionFilter'
SetTransactionFilterConstructor._from = o => Action.SetTransactionFilter(o.payload)
SetTransactionFilterConstructor.from = SetTransactionFilterConstructor._from

SetTransactionFilterConstructor.toFirestore = o => ({ ...o })
SetTransactionFilterConstructor.fromFirestore = SetTransactionFilterConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.ResetTransactionFilters
//
// -------------------------------------------------------------------------------------------------------------
const ResetTransactionFiltersConstructor = function ResetTransactionFilters() {
    const constructorName = 'Action.ResetTransactionFilters()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(ResetTransactionFiltersPrototype)

    return result
}

Action.ResetTransactionFilters = ResetTransactionFiltersConstructor

const ResetTransactionFiltersPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'ResetTransactionFilters', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.ResetTransactionFilters()`
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
        value: ResetTransactionFiltersConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

ResetTransactionFiltersConstructor.prototype = ResetTransactionFiltersPrototype
ResetTransactionFiltersConstructor.is = val => val && val.constructor === ResetTransactionFiltersConstructor
ResetTransactionFiltersConstructor.toString = () => 'Action.ResetTransactionFilters'
ResetTransactionFiltersConstructor._from = o => Action.ResetTransactionFilters()
ResetTransactionFiltersConstructor.from = ResetTransactionFiltersConstructor._from

ResetTransactionFiltersConstructor.toFirestore = o => ({ ...o })
ResetTransactionFiltersConstructor.fromFirestore = ResetTransactionFiltersConstructor._from

Action._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = Action[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

Action._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'LoadFile') return Action.LoadFile.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetTransactionFilter') return Action.SetTransactionFilter.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ResetTransactionFilters')
        return Action.ResetTransactionFilters.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized Action variant: ${tagName}`)
}

// Public aliases (can be overridden)
Action.toFirestore = Action._toFirestore
Action.fromFirestore = Action._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Action }
