/*  Action generated from: modules/quicken-web-app/type-definitions/action.type.js
 *
 *  LoadFile
 *      accounts    : "{Account:id}",
 *      categories  : "{Category:id}",
 *      securities  : "{Security:id}",
 *      tags        : "{Tag:id}",
 *      splits      : "{Split:id}",
 *      transactions: "{Transaction:id}"
 *  SetTransactionFilter
 *      changes: "Object"
 *  ResetTransactionFilters
 *  SetTableLayout
 *      tableLayout: "TableLayout"
 *  HydrateFromLocalStorage
 *
 */

import * as R from '@graffio/cli-type-generator'
import { Account } from './account.js'
import { Category } from './category.js'
import { Security } from './security.js'
import { Tag } from './tag.js'
import { Split } from './split.js'
import { Transaction } from './transaction.js'
import { TableLayout } from './table-layout.js'

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
            constructor === Action.ResetTransactionFilters ||
            constructor === Action.SetTableLayout ||
            constructor === Action.HydrateFromLocalStorage
        )
    },
}

// Add hidden properties
Object.defineProperty(Action, '@@typeName', { value: 'Action', enumerable: false })
Object.defineProperty(Action, '@@tagNames', {
    value: ['LoadFile', 'SetTransactionFilter', 'ResetTransactionFilters', 'SetTableLayout', 'HydrateFromLocalStorage'],
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
const LoadFileConstructor = function LoadFile(accounts, categories, securities, tags, splits, transactions) {
    const constructorName = 'Action.LoadFile(accounts, categories, securities, tags, splits, transactions)'
    R.validateArgumentLength(constructorName, 6, arguments)
    R.validateLookupTable(constructorName, 'Account', 'accounts', false, accounts)
    R.validateLookupTable(constructorName, 'Category', 'categories', false, categories)
    R.validateLookupTable(constructorName, 'Security', 'securities', false, securities)
    R.validateLookupTable(constructorName, 'Tag', 'tags', false, tags)
    R.validateLookupTable(constructorName, 'Split', 'splits', false, splits)
    R.validateLookupTable(constructorName, 'Transaction', 'transactions', false, transactions)

    const result = Object.create(LoadFilePrototype)
    result.accounts = accounts
    result.categories = categories
    result.securities = securities
    result.tags = tags
    result.splits = splits
    result.transactions = transactions
    return result
}

Action.LoadFile = LoadFileConstructor

const LoadFilePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'LoadFile', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.LoadFile(${R._toString(this.accounts)}, ${R._toString(this.categories)}, ${R._toString(this.securities)}, ${R._toString(this.tags)}, ${R._toString(this.splits)}, ${R._toString(this.transactions)})`
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
LoadFileConstructor._from = o =>
    Action.LoadFile(o.accounts, o.categories, o.securities, o.tags, o.splits, o.transactions)
LoadFileConstructor.from = LoadFileConstructor._from

LoadFileConstructor._toFirestore = (o, encodeTimestamps) => ({
    accounts: R.lookupTableToFirestore(Account, 'id', encodeTimestamps, o.accounts),
    categories: R.lookupTableToFirestore(Category, 'id', encodeTimestamps, o.categories),
    securities: R.lookupTableToFirestore(Security, 'id', encodeTimestamps, o.securities),
    tags: R.lookupTableToFirestore(Tag, 'id', encodeTimestamps, o.tags),
    splits: R.lookupTableToFirestore(Split, 'id', encodeTimestamps, o.splits),
    transactions: R.lookupTableToFirestore(Transaction, 'id', encodeTimestamps, o.transactions),
})

LoadFileConstructor._fromFirestore = (doc, decodeTimestamps) =>
    LoadFileConstructor._from({
        accounts: R.lookupTableFromFirestore(Account, 'id', decodeTimestamps, doc.accounts),
        categories: R.lookupTableFromFirestore(Category, 'id', decodeTimestamps, doc.categories),
        securities: R.lookupTableFromFirestore(Security, 'id', decodeTimestamps, doc.securities),
        tags: R.lookupTableFromFirestore(Tag, 'id', decodeTimestamps, doc.tags),
        splits: R.lookupTableFromFirestore(Split, 'id', decodeTimestamps, doc.splits),
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
const SetTransactionFilterConstructor = function SetTransactionFilter(changes) {
    const constructorName = 'Action.SetTransactionFilter(changes)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'changes', false, changes)

    const result = Object.create(SetTransactionFilterPrototype)
    result.changes = changes
    return result
}

Action.SetTransactionFilter = SetTransactionFilterConstructor

const SetTransactionFilterPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetTransactionFilter', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SetTransactionFilter(${R._toString(this.changes)})`
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
SetTransactionFilterConstructor._from = o => Action.SetTransactionFilter(o.changes)
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

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SetTableLayout
//
// -------------------------------------------------------------------------------------------------------------
const SetTableLayoutConstructor = function SetTableLayout(tableLayout) {
    const constructorName = 'Action.SetTableLayout(tableLayout)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'TableLayout', 'tableLayout', false, tableLayout)

    const result = Object.create(SetTableLayoutPrototype)
    result.tableLayout = tableLayout
    return result
}

Action.SetTableLayout = SetTableLayoutConstructor

const SetTableLayoutPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetTableLayout', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SetTableLayout(${R._toString(this.tableLayout)})`
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
        value: SetTableLayoutConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SetTableLayoutConstructor.prototype = SetTableLayoutPrototype
SetTableLayoutConstructor.is = val => val && val.constructor === SetTableLayoutConstructor
SetTableLayoutConstructor.toString = () => 'Action.SetTableLayout'
SetTableLayoutConstructor._from = o => Action.SetTableLayout(o.tableLayout)
SetTableLayoutConstructor.from = SetTableLayoutConstructor._from

SetTableLayoutConstructor._toFirestore = (o, encodeTimestamps) => ({
    tableLayout: TableLayout.toFirestore(o.tableLayout, encodeTimestamps),
})

SetTableLayoutConstructor._fromFirestore = (doc, decodeTimestamps) =>
    SetTableLayoutConstructor._from({
        tableLayout: TableLayout.fromFirestore
            ? TableLayout.fromFirestore(doc.tableLayout, decodeTimestamps)
            : TableLayout.from(doc.tableLayout),
    })

// Public aliases (can be overridden)
SetTableLayoutConstructor.toFirestore = SetTableLayoutConstructor._toFirestore
SetTableLayoutConstructor.fromFirestore = SetTableLayoutConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.HydrateFromLocalStorage
//
// -------------------------------------------------------------------------------------------------------------
const HydrateFromLocalStorageConstructor = function HydrateFromLocalStorage() {
    const constructorName = 'Action.HydrateFromLocalStorage()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(HydrateFromLocalStoragePrototype)

    return result
}

Action.HydrateFromLocalStorage = HydrateFromLocalStorageConstructor

const HydrateFromLocalStoragePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'HydrateFromLocalStorage', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.HydrateFromLocalStorage()`
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
        value: HydrateFromLocalStorageConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

HydrateFromLocalStorageConstructor.prototype = HydrateFromLocalStoragePrototype
HydrateFromLocalStorageConstructor.is = val => val && val.constructor === HydrateFromLocalStorageConstructor
HydrateFromLocalStorageConstructor.toString = () => 'Action.HydrateFromLocalStorage'
HydrateFromLocalStorageConstructor._from = o => Action.HydrateFromLocalStorage()
HydrateFromLocalStorageConstructor.from = HydrateFromLocalStorageConstructor._from

HydrateFromLocalStorageConstructor.toFirestore = o => ({ ...o })
HydrateFromLocalStorageConstructor.fromFirestore = HydrateFromLocalStorageConstructor._from

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
    if (tagName === 'SetTableLayout') return Action.SetTableLayout.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'HydrateFromLocalStorage')
        return Action.HydrateFromLocalStorage.fromFirestore(doc, decodeTimestamps)
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
