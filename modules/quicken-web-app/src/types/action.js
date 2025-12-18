// ABOUTME: Generated type definition for Action
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/action.type.js - do not edit manually

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
 *      viewId : "String",
 *      changes: "Object"
 *  ResetTransactionFilters
 *      viewId: "String"
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
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    loadFile               : function () { return `Action.LoadFile(${R._toString(this.accounts)}, ${R._toString(this.categories)}, ${R._toString(this.securities)}, ${R._toString(this.tags)}, ${R._toString(this.splits)}, ${R._toString(this.transactions)})` },
    setTransactionFilter   : function () { return `Action.SetTransactionFilter(${R._toString(this.viewId)}, ${R._toString(this.changes)})` },
    resetTransactionFilters: function () { return `Action.ResetTransactionFilters(${R._toString(this.viewId)})` },
    setTableLayout         : function () { return `Action.SetTableLayout(${R._toString(this.tableLayout)})` },
    openView               : function () { return `Action.OpenView(${R._toString(this.view)}, ${R._toString(this.groupId)})` },
    closeView              : function () { return `Action.CloseView(${R._toString(this.viewId)}, ${R._toString(this.groupId)})` },
    moveView               : function () { return `Action.MoveView(${R._toString(this.viewId)}, ${R._toString(this.fromGroupId)}, ${R._toString(this.toGroupId)}, ${R._toString(this.toIndex)})` },
    createTabGroup         : function () { return `Action.CreateTabGroup()` },
    closeTabGroup          : function () { return `Action.CloseTabGroup(${R._toString(this.groupId)})` },
    setActiveView          : function () { return `Action.SetActiveView(${R._toString(this.groupId)}, ${R._toString(this.viewId)})` },
    setActiveTabGroup      : function () { return `Action.SetActiveTabGroup(${R._toString(this.groupId)})` },
    setTabGroupWidth       : function () { return `Action.SetTabGroupWidth(${R._toString(this.groupId)}, ${R._toString(this.width)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    loadFile               : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setTransactionFilter   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    resetTransactionFilters: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setTableLayout         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    openView               : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    closeView              : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    moveView               : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    createTabGroup         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    closeTabGroup          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setActiveView          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setActiveTabGroup      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setTabGroupWidth       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Action.LoadFile instance
 * @sig LoadFile :: ({Account}, {Category}, {Security}, {Tag}, {Split}, {Transaction}) -> Action.LoadFile
 */
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

/*
 * Construct a Action.SetTransactionFilter instance
 * @sig SetTransactionFilter :: (String, Object) -> Action.SetTransactionFilter
 */
const SetTransactionFilterConstructor = function SetTransactionFilter(viewId, changes) {
    const constructorName = 'Action.SetTransactionFilter(viewId, changes)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateObject(constructorName, 'changes', false, changes)

    const result = Object.create(SetTransactionFilterPrototype)
    result.viewId = viewId
    result.changes = changes
    return result
}

Action.SetTransactionFilter = SetTransactionFilterConstructor

/*
 * Construct a Action.ResetTransactionFilters instance
 * @sig ResetTransactionFilters :: (String) -> Action.ResetTransactionFilters
 */
const ResetTransactionFiltersConstructor = function ResetTransactionFilters(viewId) {
    const constructorName = 'Action.ResetTransactionFilters(viewId)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'viewId', false, viewId)

    const result = Object.create(ResetTransactionFiltersPrototype)
    result.viewId = viewId
    return result
}

Action.ResetTransactionFilters = ResetTransactionFiltersConstructor

/*
 * Construct a Action.SetTableLayout instance
 * @sig SetTableLayout :: (TableLayout) -> Action.SetTableLayout
 */
const SetTableLayoutConstructor = function SetTableLayout(tableLayout) {
    const constructorName = 'Action.SetTableLayout(tableLayout)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'TableLayout', 'tableLayout', false, tableLayout)

    const result = Object.create(SetTableLayoutPrototype)
    result.tableLayout = tableLayout
    return result
}

Action.SetTableLayout = SetTableLayoutConstructor

/*
 * Construct a Action.OpenView instance
 * @sig OpenView :: (View, String?) -> Action.OpenView
 */
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

/*
 * Construct a Action.CloseView instance
 * @sig CloseView :: (String, String) -> Action.CloseView
 */
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

/*
 * Construct a Action.MoveView instance
 * @sig MoveView :: (String, String, String, Number?) -> Action.MoveView
 */
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

/*
 * Construct a Action.CreateTabGroup instance
 * @sig CreateTabGroup :: () -> Action.CreateTabGroup
 */
const CreateTabGroupConstructor = function CreateTabGroup() {
    const constructorName = 'Action.CreateTabGroup()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(CreateTabGroupPrototype)

    return result
}

Action.CreateTabGroup = CreateTabGroupConstructor

/*
 * Construct a Action.CloseTabGroup instance
 * @sig CloseTabGroup :: (String) -> Action.CloseTabGroup
 */
const CloseTabGroupConstructor = function CloseTabGroup(groupId) {
    const constructorName = 'Action.CloseTabGroup(groupId)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'groupId', false, groupId)

    const result = Object.create(CloseTabGroupPrototype)
    result.groupId = groupId
    return result
}

Action.CloseTabGroup = CloseTabGroupConstructor

/*
 * Construct a Action.SetActiveView instance
 * @sig SetActiveView :: (String, String) -> Action.SetActiveView
 */
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

/*
 * Construct a Action.SetActiveTabGroup instance
 * @sig SetActiveTabGroup :: (String) -> Action.SetActiveTabGroup
 */
const SetActiveTabGroupConstructor = function SetActiveTabGroup(groupId) {
    const constructorName = 'Action.SetActiveTabGroup(groupId)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'groupId', false, groupId)

    const result = Object.create(SetActiveTabGroupPrototype)
    result.groupId = groupId
    return result
}

Action.SetActiveTabGroup = SetActiveTabGroupConstructor

/*
 * Construct a Action.SetTabGroupWidth instance
 * @sig SetTabGroupWidth :: (String, Number) -> Action.SetTabGroupWidth
 */
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

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const LoadFilePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'LoadFile', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.loadFile, enumerable: false },
    toJSON: { value: toJSON.loadFile, enumerable: false },
    constructor: { value: LoadFileConstructor, enumerable: false, writable: true, configurable: true },
})

const SetTransactionFilterPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetTransactionFilter', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setTransactionFilter, enumerable: false },
    toJSON: { value: toJSON.setTransactionFilter, enumerable: false },
    constructor: { value: SetTransactionFilterConstructor, enumerable: false, writable: true, configurable: true },
})

const ResetTransactionFiltersPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'ResetTransactionFilters', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.resetTransactionFilters, enumerable: false },
    toJSON: { value: toJSON.resetTransactionFilters, enumerable: false },
    constructor: { value: ResetTransactionFiltersConstructor, enumerable: false, writable: true, configurable: true },
})

const SetTableLayoutPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetTableLayout', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setTableLayout, enumerable: false },
    toJSON: { value: toJSON.setTableLayout, enumerable: false },
    constructor: { value: SetTableLayoutConstructor, enumerable: false, writable: true, configurable: true },
})

const OpenViewPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OpenView', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.openView, enumerable: false },
    toJSON: { value: toJSON.openView, enumerable: false },
    constructor: { value: OpenViewConstructor, enumerable: false, writable: true, configurable: true },
})

const CloseViewPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'CloseView', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.closeView, enumerable: false },
    toJSON: { value: toJSON.closeView, enumerable: false },
    constructor: { value: CloseViewConstructor, enumerable: false, writable: true, configurable: true },
})

const MoveViewPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'MoveView', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.moveView, enumerable: false },
    toJSON: { value: toJSON.moveView, enumerable: false },
    constructor: { value: MoveViewConstructor, enumerable: false, writable: true, configurable: true },
})

const CreateTabGroupPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'CreateTabGroup', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.createTabGroup, enumerable: false },
    toJSON: { value: toJSON.createTabGroup, enumerable: false },
    constructor: { value: CreateTabGroupConstructor, enumerable: false, writable: true, configurable: true },
})

const CloseTabGroupPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'CloseTabGroup', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.closeTabGroup, enumerable: false },
    toJSON: { value: toJSON.closeTabGroup, enumerable: false },
    constructor: { value: CloseTabGroupConstructor, enumerable: false, writable: true, configurable: true },
})

const SetActiveViewPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetActiveView', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setActiveView, enumerable: false },
    toJSON: { value: toJSON.setActiveView, enumerable: false },
    constructor: { value: SetActiveViewConstructor, enumerable: false, writable: true, configurable: true },
})

const SetActiveTabGroupPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetActiveTabGroup', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setActiveTabGroup, enumerable: false },
    toJSON: { value: toJSON.setActiveTabGroup, enumerable: false },
    constructor: { value: SetActiveTabGroupConstructor, enumerable: false, writable: true, configurable: true },
})

const SetTabGroupWidthPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetTabGroupWidth', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setTabGroupWidth, enumerable: false },
    toJSON: { value: toJSON.setTabGroupWidth, enumerable: false },
    constructor: { value: SetTabGroupWidthConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
LoadFileConstructor.prototype = LoadFilePrototype
SetTransactionFilterConstructor.prototype = SetTransactionFilterPrototype
ResetTransactionFiltersConstructor.prototype = ResetTransactionFiltersPrototype
SetTableLayoutConstructor.prototype = SetTableLayoutPrototype
OpenViewConstructor.prototype = OpenViewPrototype
CloseViewConstructor.prototype = CloseViewPrototype
MoveViewConstructor.prototype = MoveViewPrototype
CreateTabGroupConstructor.prototype = CreateTabGroupPrototype
CloseTabGroupConstructor.prototype = CloseTabGroupPrototype
SetActiveViewConstructor.prototype = SetActiveViewPrototype
SetActiveTabGroupConstructor.prototype = SetActiveTabGroupPrototype
SetTabGroupWidthConstructor.prototype = SetTabGroupWidthPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
LoadFileConstructor.is = val => val && val.constructor === LoadFileConstructor
SetTransactionFilterConstructor.is = val => val && val.constructor === SetTransactionFilterConstructor
ResetTransactionFiltersConstructor.is = val => val && val.constructor === ResetTransactionFiltersConstructor
SetTableLayoutConstructor.is = val => val && val.constructor === SetTableLayoutConstructor
OpenViewConstructor.is = val => val && val.constructor === OpenViewConstructor
CloseViewConstructor.is = val => val && val.constructor === CloseViewConstructor
MoveViewConstructor.is = val => val && val.constructor === MoveViewConstructor
CreateTabGroupConstructor.is = val => val && val.constructor === CreateTabGroupConstructor
CloseTabGroupConstructor.is = val => val && val.constructor === CloseTabGroupConstructor
SetActiveViewConstructor.is = val => val && val.constructor === SetActiveViewConstructor
SetActiveTabGroupConstructor.is = val => val && val.constructor === SetActiveTabGroupConstructor
SetTabGroupWidthConstructor.is = val => val && val.constructor === SetTabGroupWidthConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
LoadFileConstructor.toString = () => 'Action.LoadFile'
SetTransactionFilterConstructor.toString = () => 'Action.SetTransactionFilter'
ResetTransactionFiltersConstructor.toString = () => 'Action.ResetTransactionFilters'
SetTableLayoutConstructor.toString = () => 'Action.SetTableLayout'
OpenViewConstructor.toString = () => 'Action.OpenView'
CloseViewConstructor.toString = () => 'Action.CloseView'
MoveViewConstructor.toString = () => 'Action.MoveView'
CreateTabGroupConstructor.toString = () => 'Action.CreateTabGroup'
CloseTabGroupConstructor.toString = () => 'Action.CloseTabGroup'
SetActiveViewConstructor.toString = () => 'Action.SetActiveView'
SetActiveTabGroupConstructor.toString = () => 'Action.SetActiveTabGroup'
SetTabGroupWidthConstructor.toString = () => 'Action.SetTabGroupWidth'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
LoadFileConstructor._from = _input => {
    const { accounts, categories, securities, tags, splits, transactions } = _input
    return Action.LoadFile(accounts, categories, securities, tags, splits, transactions)
}
SetTransactionFilterConstructor._from = _input => Action.SetTransactionFilter(_input.viewId, _input.changes)
ResetTransactionFiltersConstructor._from = _input => Action.ResetTransactionFilters(_input.viewId)
SetTableLayoutConstructor._from = _input => Action.SetTableLayout(_input.tableLayout)
OpenViewConstructor._from = _input => Action.OpenView(_input.view, _input.groupId)
CloseViewConstructor._from = _input => Action.CloseView(_input.viewId, _input.groupId)
MoveViewConstructor._from = _input => {
    const { viewId, fromGroupId, toGroupId, toIndex } = _input
    return Action.MoveView(viewId, fromGroupId, toGroupId, toIndex)
}
CreateTabGroupConstructor._from = _input => Action.CreateTabGroup()
CloseTabGroupConstructor._from = _input => Action.CloseTabGroup(_input.groupId)
SetActiveViewConstructor._from = _input => Action.SetActiveView(_input.groupId, _input.viewId)
SetActiveTabGroupConstructor._from = _input => Action.SetActiveTabGroup(_input.groupId)
SetTabGroupWidthConstructor._from = _input => Action.SetTabGroupWidth(_input.groupId, _input.width)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
LoadFileConstructor.from = LoadFileConstructor._from
SetTransactionFilterConstructor.from = SetTransactionFilterConstructor._from
ResetTransactionFiltersConstructor.from = ResetTransactionFiltersConstructor._from
SetTableLayoutConstructor.from = SetTableLayoutConstructor._from
OpenViewConstructor.from = OpenViewConstructor._from
CloseViewConstructor.from = CloseViewConstructor._from
MoveViewConstructor.from = MoveViewConstructor._from
CreateTabGroupConstructor.from = CreateTabGroupConstructor._from
CloseTabGroupConstructor.from = CloseTabGroupConstructor._from
SetActiveViewConstructor.from = SetActiveViewConstructor._from
SetActiveTabGroupConstructor.from = SetActiveTabGroupConstructor._from
SetTabGroupWidthConstructor.from = SetTabGroupWidthConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (LoadFile, Function) -> Object
 */
LoadFileConstructor._toFirestore = (o, encodeTimestamps) => {
    const { accounts, categories, securities, tags, splits, transactions } = o
    return {
        accounts: R.lookupTableToFirestore(Account, 'id', encodeTimestamps, accounts),
        categories: R.lookupTableToFirestore(Category, 'id', encodeTimestamps, categories),
        securities: R.lookupTableToFirestore(Security, 'id', encodeTimestamps, securities),
        tags: R.lookupTableToFirestore(Tag, 'id', encodeTimestamps, tags),
        splits: R.lookupTableToFirestore(Split, 'id', encodeTimestamps, splits),
        transactions: R.lookupTableToFirestore(Transaction, 'id', encodeTimestamps, transactions),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> LoadFile
 */
LoadFileConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { accounts, categories, securities, tags, splits, transactions } = doc
    return LoadFileConstructor._from({
        accounts: R.lookupTableFromFirestore(Account, 'id', decodeTimestamps, accounts),
        categories: R.lookupTableFromFirestore(Category, 'id', decodeTimestamps, categories),
        securities: R.lookupTableFromFirestore(Security, 'id', decodeTimestamps, securities),
        tags: R.lookupTableFromFirestore(Tag, 'id', decodeTimestamps, tags),
        splits: R.lookupTableFromFirestore(Split, 'id', decodeTimestamps, splits),
        transactions: R.lookupTableFromFirestore(Transaction, 'id', decodeTimestamps, transactions),
    })
}

// Public aliases (can be overridden)
LoadFileConstructor.toFirestore = LoadFileConstructor._toFirestore
LoadFileConstructor.fromFirestore = LoadFileConstructor._fromFirestore

SetTransactionFilterConstructor.toFirestore = o => ({ ...o })
SetTransactionFilterConstructor.fromFirestore = SetTransactionFilterConstructor._from

ResetTransactionFiltersConstructor.toFirestore = o => ({ ...o })
ResetTransactionFiltersConstructor.fromFirestore = ResetTransactionFiltersConstructor._from

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

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (OpenView, Function) -> Object
 */
OpenViewConstructor._toFirestore = (o, encodeTimestamps) => {
    const { view, groupId } = o
    return {
        view: View.toFirestore(view, encodeTimestamps),
        groupId: groupId,
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> OpenView
 */
OpenViewConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { view, groupId } = doc
    return OpenViewConstructor._from({
        view: View.fromFirestore ? View.fromFirestore(view, decodeTimestamps) : View.from(view),
        groupId: groupId,
    })
}

// Public aliases (can be overridden)
OpenViewConstructor.toFirestore = OpenViewConstructor._toFirestore
OpenViewConstructor.fromFirestore = OpenViewConstructor._fromFirestore

CloseViewConstructor.toFirestore = o => ({ ...o })
CloseViewConstructor.fromFirestore = CloseViewConstructor._from

MoveViewConstructor.toFirestore = o => ({ ...o })
MoveViewConstructor.fromFirestore = MoveViewConstructor._from

CreateTabGroupConstructor.toFirestore = o => ({ ...o })
CreateTabGroupConstructor.fromFirestore = CreateTabGroupConstructor._from

CloseTabGroupConstructor.toFirestore = o => ({ ...o })
CloseTabGroupConstructor.fromFirestore = CloseTabGroupConstructor._from

SetActiveViewConstructor.toFirestore = o => ({ ...o })
SetActiveViewConstructor.fromFirestore = SetActiveViewConstructor._from

SetActiveTabGroupConstructor.toFirestore = o => ({ ...o })
SetActiveTabGroupConstructor.fromFirestore = SetActiveTabGroupConstructor._from

SetTabGroupWidthConstructor.toFirestore = o => ({ ...o })
SetTabGroupWidthConstructor.fromFirestore = SetTabGroupWidthConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a Action instance
 * @sig is :: Any -> Boolean
 */
Action.is = v => {
    const {
        LoadFile,
        SetTransactionFilter,
        ResetTransactionFilters,
        SetTableLayout,
        OpenView,
        CloseView,
        MoveView,
        CreateTabGroup,
        CloseTabGroup,
        SetActiveView,
        SetActiveTabGroup,
        SetTabGroupWidth,
    } = Action
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === LoadFile ||
        constructor === SetTransactionFilter ||
        constructor === ResetTransactionFilters ||
        constructor === SetTableLayout ||
        constructor === OpenView ||
        constructor === CloseView ||
        constructor === MoveView ||
        constructor === CreateTabGroup ||
        constructor === CloseTabGroup ||
        constructor === SetActiveView ||
        constructor === SetActiveTabGroup ||
        constructor === SetTabGroupWidth
    )
}

/**
 * Serialize Action to Firestore format
 * @sig _toFirestore :: (Action, Function) -> Object
 */
Action._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = Action[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize Action from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Action
 */
Action._fromFirestore = (doc, decodeTimestamps) => {
    const {
        LoadFile,
        SetTransactionFilter,
        ResetTransactionFilters,
        SetTableLayout,
        OpenView,
        CloseView,
        MoveView,
        CreateTabGroup,
        CloseTabGroup,
        SetActiveView,
        SetActiveTabGroup,
        SetTabGroupWidth,
    } = Action
    const tagName = doc['@@tagName']
    if (tagName === 'LoadFile') return LoadFile.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetTransactionFilter') return SetTransactionFilter.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ResetTransactionFilters') return ResetTransactionFilters.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetTableLayout') return SetTableLayout.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'OpenView') return OpenView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CloseView') return CloseView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'MoveView') return MoveView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CreateTabGroup') return CreateTabGroup.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CloseTabGroup') return CloseTabGroup.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetActiveView') return SetActiveView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetActiveTabGroup') return SetActiveTabGroup.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetTabGroupWidth') return SetTabGroupWidth.fromFirestore(doc, decodeTimestamps)
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
