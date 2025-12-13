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
 *  OpenView
 *      view   : "View",
 *      groupId: "String?"
 *  CloseView
 *      viewId : "String",
 *      groupId: "String"
 *  MoveView
 *      viewId     : "String",
 *      fromGroupId: "String",
 *      toGroupId  : "String",
 *      toIndex    : "Number?"
 *  CreateTabGroup
 *  CloseTabGroup
 *      groupId: "String"
 *  SetActiveView
 *      groupId: "String",
 *      viewId : "String"
 *  SetActiveTabGroup
 *      groupId: "String"
 *  SetTabGroupWidth
 *      groupId: "String",
 *      width  : "Number"
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
import { View } from './view.js'

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
            constructor === Action.OpenView ||
            constructor === Action.CloseView ||
            constructor === Action.MoveView ||
            constructor === Action.CreateTabGroup ||
            constructor === Action.CloseTabGroup ||
            constructor === Action.SetActiveView ||
            constructor === Action.SetActiveTabGroup ||
            constructor === Action.SetTabGroupWidth
        )
    },
}

// Add hidden properties
Object.defineProperty(Action, '@@typeName', { value: 'Action', enumerable: false })
Object.defineProperty(Action, '@@tagNames', {
    value: [
        'LoadFile',
        'SetTransactionFilter',
        'ResetTransactionFilters',
        'SetTableLayout',
        'OpenView',
        'CloseView',
        'MoveView',
        'CreateTabGroup',
        'CloseTabGroup',
        'SetActiveView',
        'SetActiveTabGroup',
        'SetTabGroupWidth',
    ],
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
// Variant Action.OpenView
//
// -------------------------------------------------------------------------------------------------------------
const OpenViewConstructor = function OpenView(view, groupId) {
    const constructorName = 'Action.OpenView(view, groupId)'

    R.validateTag(constructorName, 'View', 'view', false, view)
    R.validateString(constructorName, 'groupId', true, groupId)

    const result = Object.create(OpenViewPrototype)
    result.view = view
    if (groupId != null) result.groupId = groupId
    return result
}

Action.OpenView = OpenViewConstructor

const OpenViewPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OpenView', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.OpenView(${R._toString(this.view)}, ${R._toString(this.groupId)})`
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
        value: OpenViewConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

OpenViewConstructor.prototype = OpenViewPrototype
OpenViewConstructor.is = val => val && val.constructor === OpenViewConstructor
OpenViewConstructor.toString = () => 'Action.OpenView'
OpenViewConstructor._from = o => Action.OpenView(o.view, o.groupId)
OpenViewConstructor.from = OpenViewConstructor._from

OpenViewConstructor._toFirestore = (o, encodeTimestamps) => ({
    view: View.toFirestore(o.view, encodeTimestamps),
    groupId: o.groupId,
})

OpenViewConstructor._fromFirestore = (doc, decodeTimestamps) =>
    OpenViewConstructor._from({
        view: View.fromFirestore ? View.fromFirestore(doc.view, decodeTimestamps) : View.from(doc.view),
        groupId: doc.groupId,
    })

// Public aliases (can be overridden)
OpenViewConstructor.toFirestore = OpenViewConstructor._toFirestore
OpenViewConstructor.fromFirestore = OpenViewConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.CloseView
//
// -------------------------------------------------------------------------------------------------------------
const CloseViewConstructor = function CloseView(viewId, groupId) {
    const constructorName = 'Action.CloseView(viewId, groupId)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateString(constructorName, 'groupId', false, groupId)

    const result = Object.create(CloseViewPrototype)
    result.viewId = viewId
    result.groupId = groupId
    return result
}

Action.CloseView = CloseViewConstructor

const CloseViewPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'CloseView', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.CloseView(${R._toString(this.viewId)}, ${R._toString(this.groupId)})`
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
        value: CloseViewConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

CloseViewConstructor.prototype = CloseViewPrototype
CloseViewConstructor.is = val => val && val.constructor === CloseViewConstructor
CloseViewConstructor.toString = () => 'Action.CloseView'
CloseViewConstructor._from = o => Action.CloseView(o.viewId, o.groupId)
CloseViewConstructor.from = CloseViewConstructor._from

CloseViewConstructor.toFirestore = o => ({ ...o })
CloseViewConstructor.fromFirestore = CloseViewConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.MoveView
//
// -------------------------------------------------------------------------------------------------------------
const MoveViewConstructor = function MoveView(viewId, fromGroupId, toGroupId, toIndex) {
    const constructorName = 'Action.MoveView(viewId, fromGroupId, toGroupId, toIndex)'

    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateString(constructorName, 'fromGroupId', false, fromGroupId)
    R.validateString(constructorName, 'toGroupId', false, toGroupId)
    R.validateNumber(constructorName, 'toIndex', true, toIndex)

    const result = Object.create(MoveViewPrototype)
    result.viewId = viewId
    result.fromGroupId = fromGroupId
    result.toGroupId = toGroupId
    if (toIndex != null) result.toIndex = toIndex
    return result
}

Action.MoveView = MoveViewConstructor

const MoveViewPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'MoveView', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.MoveView(${R._toString(this.viewId)}, ${R._toString(this.fromGroupId)}, ${R._toString(this.toGroupId)}, ${R._toString(this.toIndex)})`
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
        value: MoveViewConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

MoveViewConstructor.prototype = MoveViewPrototype
MoveViewConstructor.is = val => val && val.constructor === MoveViewConstructor
MoveViewConstructor.toString = () => 'Action.MoveView'
MoveViewConstructor._from = o => Action.MoveView(o.viewId, o.fromGroupId, o.toGroupId, o.toIndex)
MoveViewConstructor.from = MoveViewConstructor._from

MoveViewConstructor.toFirestore = o => ({ ...o })
MoveViewConstructor.fromFirestore = MoveViewConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.CreateTabGroup
//
// -------------------------------------------------------------------------------------------------------------
const CreateTabGroupConstructor = function CreateTabGroup() {
    const constructorName = 'Action.CreateTabGroup()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(CreateTabGroupPrototype)

    return result
}

Action.CreateTabGroup = CreateTabGroupConstructor

const CreateTabGroupPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'CreateTabGroup', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.CreateTabGroup()`
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
        value: CreateTabGroupConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

CreateTabGroupConstructor.prototype = CreateTabGroupPrototype
CreateTabGroupConstructor.is = val => val && val.constructor === CreateTabGroupConstructor
CreateTabGroupConstructor.toString = () => 'Action.CreateTabGroup'
CreateTabGroupConstructor._from = o => Action.CreateTabGroup()
CreateTabGroupConstructor.from = CreateTabGroupConstructor._from

CreateTabGroupConstructor.toFirestore = o => ({ ...o })
CreateTabGroupConstructor.fromFirestore = CreateTabGroupConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.CloseTabGroup
//
// -------------------------------------------------------------------------------------------------------------
const CloseTabGroupConstructor = function CloseTabGroup(groupId) {
    const constructorName = 'Action.CloseTabGroup(groupId)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'groupId', false, groupId)

    const result = Object.create(CloseTabGroupPrototype)
    result.groupId = groupId
    return result
}

Action.CloseTabGroup = CloseTabGroupConstructor

const CloseTabGroupPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'CloseTabGroup', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.CloseTabGroup(${R._toString(this.groupId)})`
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
        value: CloseTabGroupConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

CloseTabGroupConstructor.prototype = CloseTabGroupPrototype
CloseTabGroupConstructor.is = val => val && val.constructor === CloseTabGroupConstructor
CloseTabGroupConstructor.toString = () => 'Action.CloseTabGroup'
CloseTabGroupConstructor._from = o => Action.CloseTabGroup(o.groupId)
CloseTabGroupConstructor.from = CloseTabGroupConstructor._from

CloseTabGroupConstructor.toFirestore = o => ({ ...o })
CloseTabGroupConstructor.fromFirestore = CloseTabGroupConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SetActiveView
//
// -------------------------------------------------------------------------------------------------------------
const SetActiveViewConstructor = function SetActiveView(groupId, viewId) {
    const constructorName = 'Action.SetActiveView(groupId, viewId)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'groupId', false, groupId)
    R.validateString(constructorName, 'viewId', false, viewId)

    const result = Object.create(SetActiveViewPrototype)
    result.groupId = groupId
    result.viewId = viewId
    return result
}

Action.SetActiveView = SetActiveViewConstructor

const SetActiveViewPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetActiveView', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SetActiveView(${R._toString(this.groupId)}, ${R._toString(this.viewId)})`
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
        value: SetActiveViewConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SetActiveViewConstructor.prototype = SetActiveViewPrototype
SetActiveViewConstructor.is = val => val && val.constructor === SetActiveViewConstructor
SetActiveViewConstructor.toString = () => 'Action.SetActiveView'
SetActiveViewConstructor._from = o => Action.SetActiveView(o.groupId, o.viewId)
SetActiveViewConstructor.from = SetActiveViewConstructor._from

SetActiveViewConstructor.toFirestore = o => ({ ...o })
SetActiveViewConstructor.fromFirestore = SetActiveViewConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SetActiveTabGroup
//
// -------------------------------------------------------------------------------------------------------------
const SetActiveTabGroupConstructor = function SetActiveTabGroup(groupId) {
    const constructorName = 'Action.SetActiveTabGroup(groupId)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'groupId', false, groupId)

    const result = Object.create(SetActiveTabGroupPrototype)
    result.groupId = groupId
    return result
}

Action.SetActiveTabGroup = SetActiveTabGroupConstructor

const SetActiveTabGroupPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetActiveTabGroup', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SetActiveTabGroup(${R._toString(this.groupId)})`
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
        value: SetActiveTabGroupConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SetActiveTabGroupConstructor.prototype = SetActiveTabGroupPrototype
SetActiveTabGroupConstructor.is = val => val && val.constructor === SetActiveTabGroupConstructor
SetActiveTabGroupConstructor.toString = () => 'Action.SetActiveTabGroup'
SetActiveTabGroupConstructor._from = o => Action.SetActiveTabGroup(o.groupId)
SetActiveTabGroupConstructor.from = SetActiveTabGroupConstructor._from

SetActiveTabGroupConstructor.toFirestore = o => ({ ...o })
SetActiveTabGroupConstructor.fromFirestore = SetActiveTabGroupConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SetTabGroupWidth
//
// -------------------------------------------------------------------------------------------------------------
const SetTabGroupWidthConstructor = function SetTabGroupWidth(groupId, width) {
    const constructorName = 'Action.SetTabGroupWidth(groupId, width)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'groupId', false, groupId)
    R.validateNumber(constructorName, 'width', false, width)

    const result = Object.create(SetTabGroupWidthPrototype)
    result.groupId = groupId
    result.width = width
    return result
}

Action.SetTabGroupWidth = SetTabGroupWidthConstructor

const SetTabGroupWidthPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetTabGroupWidth', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SetTabGroupWidth(${R._toString(this.groupId)}, ${R._toString(this.width)})`
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
        value: SetTabGroupWidthConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SetTabGroupWidthConstructor.prototype = SetTabGroupWidthPrototype
SetTabGroupWidthConstructor.is = val => val && val.constructor === SetTabGroupWidthConstructor
SetTabGroupWidthConstructor.toString = () => 'Action.SetTabGroupWidth'
SetTabGroupWidthConstructor._from = o => Action.SetTabGroupWidth(o.groupId, o.width)
SetTabGroupWidthConstructor.from = SetTabGroupWidthConstructor._from

SetTabGroupWidthConstructor.toFirestore = o => ({ ...o })
SetTabGroupWidthConstructor.fromFirestore = SetTabGroupWidthConstructor._from

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
    if (tagName === 'OpenView') return Action.OpenView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CloseView') return Action.CloseView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'MoveView') return Action.MoveView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CreateTabGroup') return Action.CreateTabGroup.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CloseTabGroup') return Action.CloseTabGroup.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetActiveView') return Action.SetActiveView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetActiveTabGroup') return Action.SetActiveTabGroup.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetTabGroupWidth') return Action.SetTabGroupWidth.fromFirestore(doc, decodeTimestamps)
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
