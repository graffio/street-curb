// ABOUTME: Generated type definition for Action
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/action.type.js - do not edit manually

/*  Action generated from: modules/quicken-web-app/type-definitions/action.type.js
 *
 *  LoadFile
 *      accounts      : "{Account:id}",
 *      categories    : "{Category:id}",
 *      securities    : "{Security:id}",
 *      tags          : "{Tag:id}",
 *      splits        : "{Split:id}",
 *      transactions  : "{Transaction:id}",
 *      lots          : "{Lot:id}",
 *      lotAllocations: "{LotAllocation:id}",
 *      prices        : "{Price:id}"
 *  SetTransactionFilter
 *      viewId : "String",
 *      changes: "Object"
 *  SetViewUiState
 *      viewId : "String",
 *      changes: "Object"
 *  ResetTransactionFilters
 *      viewId: "String"
 *  ToggleAccountFilter
 *      viewId   : "String",
 *      accountId: FieldTypes.accountId
 *  ToggleSecurityFilter
 *      viewId    : "String",
 *      securityId: FieldTypes.securityId
 *  ToggleActionFilter
 *      viewId  : "String",
 *      actionId: "String"
 *  ToggleCategoryFilter
 *      viewId  : "String",
 *      category: "String"
 *  SetFilterPopoverOpen
 *      viewId   : "String",
 *      popoverId: "String?"
 *  SetFilterPopoverSearch
 *      viewId    : "String",
 *      searchText: "String"
 *  SetTableLayout
 *      tableLayout: "TableLayout"
 *  EnsureTableLayout
 *      tableLayoutId: "String",
 *      columns      : "[Object]"
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
 *  SetAccountListSortMode
 *      sortMode: "SortMode"
 *  ToggleSectionCollapsed
 *      sectionId: "String"
 *  SetShowReopenBanner
 *      show: "Boolean"
 *  SetShowDrawer
 *      show: "Boolean"
 *  ToggleDrawer
 *  SetLoadingStatus
 *      status: "String?"
 *  SetDraggingView
 *      viewId: "String?"
 *  SetDropTarget
 *      groupId: "String?"
 *  InitializeSystem
 *  OpenFile
 *  ReopenFile
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'
import { Account } from './account.js'
import { Category } from './category.js'
import { Security } from './security.js'
import { Tag } from './tag.js'
import { Split } from './split.js'
import { Transaction } from './transaction.js'
import { Lot } from './lot.js'
import { LotAllocation } from './lot-allocation.js'
import { Price } from './price.js'
import { TableLayout } from './table-layout.js'
import { View } from './view.js'
import { SortMode } from './sort-mode.js'

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
        'SetViewUiState',
        'ResetTransactionFilters',
        'ToggleAccountFilter',
        'ToggleSecurityFilter',
        'ToggleActionFilter',
        'ToggleCategoryFilter',
        'SetFilterPopoverOpen',
        'SetFilterPopoverSearch',
        'SetTableLayout',
        'EnsureTableLayout',
        'OpenView',
        'CloseView',
        'MoveView',
        'CreateTabGroup',
        'CloseTabGroup',
        'SetActiveView',
        'SetActiveTabGroup',
        'SetTabGroupWidth',
        'SetAccountListSortMode',
        'ToggleSectionCollapsed',
        'SetShowReopenBanner',
        'SetShowDrawer',
        'ToggleDrawer',
        'SetLoadingStatus',
        'SetDraggingView',
        'SetDropTarget',
        'InitializeSystem',
        'OpenFile',
        'ReopenFile',
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
    loadFile               : function () { return `Action.LoadFile(${R._toString(this.accounts)}, ${R._toString(this.categories)}, ${R._toString(this.securities)}, ${R._toString(this.tags)}, ${R._toString(this.splits)}, ${R._toString(this.transactions)}, ${R._toString(this.lots)}, ${R._toString(this.lotAllocations)}, ${R._toString(this.prices)})` },
    setTransactionFilter   : function () { return `Action.SetTransactionFilter(${R._toString(this.viewId)}, ${R._toString(this.changes)})` },
    setViewUiState         : function () { return `Action.SetViewUiState(${R._toString(this.viewId)}, ${R._toString(this.changes)})` },
    resetTransactionFilters: function () { return `Action.ResetTransactionFilters(${R._toString(this.viewId)})` },
    toggleAccountFilter    : function () { return `Action.ToggleAccountFilter(${R._toString(this.viewId)}, ${R._toString(this.accountId)})` },
    toggleSecurityFilter   : function () { return `Action.ToggleSecurityFilter(${R._toString(this.viewId)}, ${R._toString(this.securityId)})` },
    toggleActionFilter     : function () { return `Action.ToggleActionFilter(${R._toString(this.viewId)}, ${R._toString(this.actionId)})` },
    toggleCategoryFilter   : function () { return `Action.ToggleCategoryFilter(${R._toString(this.viewId)}, ${R._toString(this.category)})` },
    setFilterPopoverOpen   : function () { return `Action.SetFilterPopoverOpen(${R._toString(this.viewId)}, ${R._toString(this.popoverId)})` },
    setFilterPopoverSearch : function () { return `Action.SetFilterPopoverSearch(${R._toString(this.viewId)}, ${R._toString(this.searchText)})` },
    setTableLayout         : function () { return `Action.SetTableLayout(${R._toString(this.tableLayout)})` },
    ensureTableLayout      : function () { return `Action.EnsureTableLayout(${R._toString(this.tableLayoutId)}, ${R._toString(this.columns)})` },
    openView               : function () { return `Action.OpenView(${R._toString(this.view)}, ${R._toString(this.groupId)})` },
    closeView              : function () { return `Action.CloseView(${R._toString(this.viewId)}, ${R._toString(this.groupId)})` },
    moveView               : function () { return `Action.MoveView(${R._toString(this.viewId)}, ${R._toString(this.fromGroupId)}, ${R._toString(this.toGroupId)}, ${R._toString(this.toIndex)})` },
    createTabGroup         : function () { return `Action.CreateTabGroup()` },
    closeTabGroup          : function () { return `Action.CloseTabGroup(${R._toString(this.groupId)})` },
    setActiveView          : function () { return `Action.SetActiveView(${R._toString(this.groupId)}, ${R._toString(this.viewId)})` },
    setActiveTabGroup      : function () { return `Action.SetActiveTabGroup(${R._toString(this.groupId)})` },
    setTabGroupWidth       : function () { return `Action.SetTabGroupWidth(${R._toString(this.groupId)}, ${R._toString(this.width)})` },
    setAccountListSortMode : function () { return `Action.SetAccountListSortMode(${R._toString(this.sortMode)})` },
    toggleSectionCollapsed : function () { return `Action.ToggleSectionCollapsed(${R._toString(this.sectionId)})` },
    setShowReopenBanner    : function () { return `Action.SetShowReopenBanner(${R._toString(this.show)})` },
    setShowDrawer          : function () { return `Action.SetShowDrawer(${R._toString(this.show)})` },
    toggleDrawer           : function () { return `Action.ToggleDrawer()` },
    setLoadingStatus       : function () { return `Action.SetLoadingStatus(${R._toString(this.status)})` },
    setDraggingView        : function () { return `Action.SetDraggingView(${R._toString(this.viewId)})` },
    setDropTarget          : function () { return `Action.SetDropTarget(${R._toString(this.groupId)})` },
    initializeSystem       : function () { return `Action.InitializeSystem()` },
    openFile               : function () { return `Action.OpenFile()` },
    reopenFile             : function () { return `Action.ReopenFile()` },
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
    setViewUiState         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    resetTransactionFilters: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    toggleAccountFilter    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    toggleSecurityFilter   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    toggleActionFilter     : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    toggleCategoryFilter   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setFilterPopoverOpen   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setFilterPopoverSearch : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setTableLayout         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    ensureTableLayout      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    openView               : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    closeView              : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    moveView               : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    createTabGroup         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    closeTabGroup          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setActiveView          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setActiveTabGroup      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setTabGroupWidth       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setAccountListSortMode : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    toggleSectionCollapsed : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setShowReopenBanner    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setShowDrawer          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    toggleDrawer           : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setLoadingStatus       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setDraggingView        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setDropTarget          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    initializeSystem       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    openFile               : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    reopenFile             : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Action.LoadFile instance
 * @sig LoadFile :: ({Account}, {Category}, {Security}, {Tag}, {Split}, {Transaction}, {Lot}, {LotAllocation}, {Price}) -> Action.LoadFile
 */
const LoadFileConstructor = function LoadFile(
    accounts,
    categories,
    securities,
    tags,
    splits,
    transactions,
    lots,
    lotAllocations,
    prices,
) {
    const constructorName =
        'Action.LoadFile(accounts, categories, securities, tags, splits, transactions, lots, lotAllocations, prices)'
    R.validateArgumentLength(constructorName, 9, arguments)
    R.validateLookupTable(constructorName, 'Account', 'accounts', false, accounts)
    R.validateLookupTable(constructorName, 'Category', 'categories', false, categories)
    R.validateLookupTable(constructorName, 'Security', 'securities', false, securities)
    R.validateLookupTable(constructorName, 'Tag', 'tags', false, tags)
    R.validateLookupTable(constructorName, 'Split', 'splits', false, splits)
    R.validateLookupTable(constructorName, 'Transaction', 'transactions', false, transactions)
    R.validateLookupTable(constructorName, 'Lot', 'lots', false, lots)
    R.validateLookupTable(constructorName, 'LotAllocation', 'lotAllocations', false, lotAllocations)
    R.validateLookupTable(constructorName, 'Price', 'prices', false, prices)

    const result = Object.create(LoadFilePrototype)
    result.accounts = accounts
    result.categories = categories
    result.securities = securities
    result.tags = tags
    result.splits = splits
    result.transactions = transactions
    result.lots = lots
    result.lotAllocations = lotAllocations
    result.prices = prices
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
 * Construct a Action.SetViewUiState instance
 * @sig SetViewUiState :: (String, Object) -> Action.SetViewUiState
 */
const SetViewUiStateConstructor = function SetViewUiState(viewId, changes) {
    const constructorName = 'Action.SetViewUiState(viewId, changes)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateObject(constructorName, 'changes', false, changes)

    const result = Object.create(SetViewUiStatePrototype)
    result.viewId = viewId
    result.changes = changes
    return result
}

Action.SetViewUiState = SetViewUiStateConstructor

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
 * Construct a Action.ToggleAccountFilter instance
 * @sig ToggleAccountFilter :: (String, String) -> Action.ToggleAccountFilter
 */
const ToggleAccountFilterConstructor = function ToggleAccountFilter(viewId, accountId) {
    const constructorName = 'Action.ToggleAccountFilter(viewId, accountId)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateRegex(constructorName, FieldTypes.accountId, 'accountId', false, accountId)

    const result = Object.create(ToggleAccountFilterPrototype)
    result.viewId = viewId
    result.accountId = accountId
    return result
}

Action.ToggleAccountFilter = ToggleAccountFilterConstructor

/*
 * Construct a Action.ToggleSecurityFilter instance
 * @sig ToggleSecurityFilter :: (String, String) -> Action.ToggleSecurityFilter
 */
const ToggleSecurityFilterConstructor = function ToggleSecurityFilter(viewId, securityId) {
    const constructorName = 'Action.ToggleSecurityFilter(viewId, securityId)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateRegex(constructorName, FieldTypes.securityId, 'securityId', false, securityId)

    const result = Object.create(ToggleSecurityFilterPrototype)
    result.viewId = viewId
    result.securityId = securityId
    return result
}

Action.ToggleSecurityFilter = ToggleSecurityFilterConstructor

/*
 * Construct a Action.ToggleActionFilter instance
 * @sig ToggleActionFilter :: (String, String) -> Action.ToggleActionFilter
 */
const ToggleActionFilterConstructor = function ToggleActionFilter(viewId, actionId) {
    const constructorName = 'Action.ToggleActionFilter(viewId, actionId)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateString(constructorName, 'actionId', false, actionId)

    const result = Object.create(ToggleActionFilterPrototype)
    result.viewId = viewId
    result.actionId = actionId
    return result
}

Action.ToggleActionFilter = ToggleActionFilterConstructor

/*
 * Construct a Action.ToggleCategoryFilter instance
 * @sig ToggleCategoryFilter :: (String, String) -> Action.ToggleCategoryFilter
 */
const ToggleCategoryFilterConstructor = function ToggleCategoryFilter(viewId, category) {
    const constructorName = 'Action.ToggleCategoryFilter(viewId, category)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateString(constructorName, 'category', false, category)

    const result = Object.create(ToggleCategoryFilterPrototype)
    result.viewId = viewId
    result.category = category
    return result
}

Action.ToggleCategoryFilter = ToggleCategoryFilterConstructor

/*
 * Construct a Action.SetFilterPopoverOpen instance
 * @sig SetFilterPopoverOpen :: (String, String?) -> Action.SetFilterPopoverOpen
 */
const SetFilterPopoverOpenConstructor = function SetFilterPopoverOpen(viewId, popoverId) {
    const constructorName = 'Action.SetFilterPopoverOpen(viewId, popoverId)'

    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateString(constructorName, 'popoverId', true, popoverId)

    const result = Object.create(SetFilterPopoverOpenPrototype)
    result.viewId = viewId
    if (popoverId != null) result.popoverId = popoverId
    return result
}

Action.SetFilterPopoverOpen = SetFilterPopoverOpenConstructor

/*
 * Construct a Action.SetFilterPopoverSearch instance
 * @sig SetFilterPopoverSearch :: (String, String) -> Action.SetFilterPopoverSearch
 */
const SetFilterPopoverSearchConstructor = function SetFilterPopoverSearch(viewId, searchText) {
    const constructorName = 'Action.SetFilterPopoverSearch(viewId, searchText)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateString(constructorName, 'searchText', false, searchText)

    const result = Object.create(SetFilterPopoverSearchPrototype)
    result.viewId = viewId
    result.searchText = searchText
    return result
}

Action.SetFilterPopoverSearch = SetFilterPopoverSearchConstructor

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
 * Construct a Action.EnsureTableLayout instance
 * @sig EnsureTableLayout :: (String, [Object]) -> Action.EnsureTableLayout
 */
const EnsureTableLayoutConstructor = function EnsureTableLayout(tableLayoutId, columns) {
    const constructorName = 'Action.EnsureTableLayout(tableLayoutId, columns)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'tableLayoutId', false, tableLayoutId)
    R.validateArray(constructorName, 1, 'Object', undefined, 'columns', false, columns)

    const result = Object.create(EnsureTableLayoutPrototype)
    result.tableLayoutId = tableLayoutId
    result.columns = columns
    return result
}

Action.EnsureTableLayout = EnsureTableLayoutConstructor

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

/*
 * Construct a Action.SetAccountListSortMode instance
 * @sig SetAccountListSortMode :: (SortMode) -> Action.SetAccountListSortMode
 */
const SetAccountListSortModeConstructor = function SetAccountListSortMode(sortMode) {
    const constructorName = 'Action.SetAccountListSortMode(sortMode)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'SortMode', 'sortMode', false, sortMode)

    const result = Object.create(SetAccountListSortModePrototype)
    result.sortMode = sortMode
    return result
}

Action.SetAccountListSortMode = SetAccountListSortModeConstructor

/*
 * Construct a Action.ToggleSectionCollapsed instance
 * @sig ToggleSectionCollapsed :: (String) -> Action.ToggleSectionCollapsed
 */
const ToggleSectionCollapsedConstructor = function ToggleSectionCollapsed(sectionId) {
    const constructorName = 'Action.ToggleSectionCollapsed(sectionId)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'sectionId', false, sectionId)

    const result = Object.create(ToggleSectionCollapsedPrototype)
    result.sectionId = sectionId
    return result
}

Action.ToggleSectionCollapsed = ToggleSectionCollapsedConstructor

/*
 * Construct a Action.SetShowReopenBanner instance
 * @sig SetShowReopenBanner :: (Boolean) -> Action.SetShowReopenBanner
 */
const SetShowReopenBannerConstructor = function SetShowReopenBanner(show) {
    const constructorName = 'Action.SetShowReopenBanner(show)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateBoolean(constructorName, 'show', false, show)

    const result = Object.create(SetShowReopenBannerPrototype)
    result.show = show
    return result
}

Action.SetShowReopenBanner = SetShowReopenBannerConstructor

/*
 * Construct a Action.SetShowDrawer instance
 * @sig SetShowDrawer :: (Boolean) -> Action.SetShowDrawer
 */
const SetShowDrawerConstructor = function SetShowDrawer(show) {
    const constructorName = 'Action.SetShowDrawer(show)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateBoolean(constructorName, 'show', false, show)

    const result = Object.create(SetShowDrawerPrototype)
    result.show = show
    return result
}

Action.SetShowDrawer = SetShowDrawerConstructor

/*
 * Construct a Action.ToggleDrawer instance
 * @sig ToggleDrawer :: () -> Action.ToggleDrawer
 */
const ToggleDrawerConstructor = function ToggleDrawer() {
    const constructorName = 'Action.ToggleDrawer()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(ToggleDrawerPrototype)

    return result
}

Action.ToggleDrawer = ToggleDrawerConstructor

/*
 * Construct a Action.SetLoadingStatus instance
 * @sig SetLoadingStatus :: (String?) -> Action.SetLoadingStatus
 */
const SetLoadingStatusConstructor = function SetLoadingStatus(status) {
    const constructorName = 'Action.SetLoadingStatus(status)'

    R.validateString(constructorName, 'status', true, status)

    const result = Object.create(SetLoadingStatusPrototype)
    if (status != null) result.status = status
    return result
}

Action.SetLoadingStatus = SetLoadingStatusConstructor

/*
 * Construct a Action.SetDraggingView instance
 * @sig SetDraggingView :: (String?) -> Action.SetDraggingView
 */
const SetDraggingViewConstructor = function SetDraggingView(viewId) {
    const constructorName = 'Action.SetDraggingView(viewId)'

    R.validateString(constructorName, 'viewId', true, viewId)

    const result = Object.create(SetDraggingViewPrototype)
    if (viewId != null) result.viewId = viewId
    return result
}

Action.SetDraggingView = SetDraggingViewConstructor

/*
 * Construct a Action.SetDropTarget instance
 * @sig SetDropTarget :: (String?) -> Action.SetDropTarget
 */
const SetDropTargetConstructor = function SetDropTarget(groupId) {
    const constructorName = 'Action.SetDropTarget(groupId)'

    R.validateString(constructorName, 'groupId', true, groupId)

    const result = Object.create(SetDropTargetPrototype)
    if (groupId != null) result.groupId = groupId
    return result
}

Action.SetDropTarget = SetDropTargetConstructor

/*
 * Construct a Action.InitializeSystem instance
 * @sig InitializeSystem :: () -> Action.InitializeSystem
 */
const InitializeSystemConstructor = function InitializeSystem() {
    const constructorName = 'Action.InitializeSystem()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(InitializeSystemPrototype)

    return result
}

Action.InitializeSystem = InitializeSystemConstructor

/*
 * Construct a Action.OpenFile instance
 * @sig OpenFile :: () -> Action.OpenFile
 */
const OpenFileConstructor = function OpenFile() {
    const constructorName = 'Action.OpenFile()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(OpenFilePrototype)

    return result
}

Action.OpenFile = OpenFileConstructor

/*
 * Construct a Action.ReopenFile instance
 * @sig ReopenFile :: () -> Action.ReopenFile
 */
const ReopenFileConstructor = function ReopenFile() {
    const constructorName = 'Action.ReopenFile()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(ReopenFilePrototype)

    return result
}

Action.ReopenFile = ReopenFileConstructor

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

const SetViewUiStatePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetViewUiState', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setViewUiState, enumerable: false },
    toJSON: { value: toJSON.setViewUiState, enumerable: false },
    constructor: { value: SetViewUiStateConstructor, enumerable: false, writable: true, configurable: true },
})

const ResetTransactionFiltersPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'ResetTransactionFilters', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.resetTransactionFilters, enumerable: false },
    toJSON: { value: toJSON.resetTransactionFilters, enumerable: false },
    constructor: { value: ResetTransactionFiltersConstructor, enumerable: false, writable: true, configurable: true },
})

const ToggleAccountFilterPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'ToggleAccountFilter', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.toggleAccountFilter, enumerable: false },
    toJSON: { value: toJSON.toggleAccountFilter, enumerable: false },
    constructor: { value: ToggleAccountFilterConstructor, enumerable: false, writable: true, configurable: true },
})

const ToggleSecurityFilterPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'ToggleSecurityFilter', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.toggleSecurityFilter, enumerable: false },
    toJSON: { value: toJSON.toggleSecurityFilter, enumerable: false },
    constructor: { value: ToggleSecurityFilterConstructor, enumerable: false, writable: true, configurable: true },
})

const ToggleActionFilterPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'ToggleActionFilter', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.toggleActionFilter, enumerable: false },
    toJSON: { value: toJSON.toggleActionFilter, enumerable: false },
    constructor: { value: ToggleActionFilterConstructor, enumerable: false, writable: true, configurable: true },
})

const ToggleCategoryFilterPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'ToggleCategoryFilter', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.toggleCategoryFilter, enumerable: false },
    toJSON: { value: toJSON.toggleCategoryFilter, enumerable: false },
    constructor: { value: ToggleCategoryFilterConstructor, enumerable: false, writable: true, configurable: true },
})

const SetFilterPopoverOpenPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetFilterPopoverOpen', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setFilterPopoverOpen, enumerable: false },
    toJSON: { value: toJSON.setFilterPopoverOpen, enumerable: false },
    constructor: { value: SetFilterPopoverOpenConstructor, enumerable: false, writable: true, configurable: true },
})

const SetFilterPopoverSearchPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetFilterPopoverSearch', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setFilterPopoverSearch, enumerable: false },
    toJSON: { value: toJSON.setFilterPopoverSearch, enumerable: false },
    constructor: { value: SetFilterPopoverSearchConstructor, enumerable: false, writable: true, configurable: true },
})

const SetTableLayoutPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetTableLayout', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setTableLayout, enumerable: false },
    toJSON: { value: toJSON.setTableLayout, enumerable: false },
    constructor: { value: SetTableLayoutConstructor, enumerable: false, writable: true, configurable: true },
})

const EnsureTableLayoutPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'EnsureTableLayout', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.ensureTableLayout, enumerable: false },
    toJSON: { value: toJSON.ensureTableLayout, enumerable: false },
    constructor: { value: EnsureTableLayoutConstructor, enumerable: false, writable: true, configurable: true },
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

const SetAccountListSortModePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetAccountListSortMode', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setAccountListSortMode, enumerable: false },
    toJSON: { value: toJSON.setAccountListSortMode, enumerable: false },
    constructor: { value: SetAccountListSortModeConstructor, enumerable: false, writable: true, configurable: true },
})

const ToggleSectionCollapsedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'ToggleSectionCollapsed', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.toggleSectionCollapsed, enumerable: false },
    toJSON: { value: toJSON.toggleSectionCollapsed, enumerable: false },
    constructor: { value: ToggleSectionCollapsedConstructor, enumerable: false, writable: true, configurable: true },
})

const SetShowReopenBannerPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetShowReopenBanner', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setShowReopenBanner, enumerable: false },
    toJSON: { value: toJSON.setShowReopenBanner, enumerable: false },
    constructor: { value: SetShowReopenBannerConstructor, enumerable: false, writable: true, configurable: true },
})

const SetShowDrawerPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetShowDrawer', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setShowDrawer, enumerable: false },
    toJSON: { value: toJSON.setShowDrawer, enumerable: false },
    constructor: { value: SetShowDrawerConstructor, enumerable: false, writable: true, configurable: true },
})

const ToggleDrawerPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'ToggleDrawer', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.toggleDrawer, enumerable: false },
    toJSON: { value: toJSON.toggleDrawer, enumerable: false },
    constructor: { value: ToggleDrawerConstructor, enumerable: false, writable: true, configurable: true },
})

const SetLoadingStatusPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetLoadingStatus', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setLoadingStatus, enumerable: false },
    toJSON: { value: toJSON.setLoadingStatus, enumerable: false },
    constructor: { value: SetLoadingStatusConstructor, enumerable: false, writable: true, configurable: true },
})

const SetDraggingViewPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetDraggingView', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setDraggingView, enumerable: false },
    toJSON: { value: toJSON.setDraggingView, enumerable: false },
    constructor: { value: SetDraggingViewConstructor, enumerable: false, writable: true, configurable: true },
})

const SetDropTargetPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetDropTarget', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setDropTarget, enumerable: false },
    toJSON: { value: toJSON.setDropTarget, enumerable: false },
    constructor: { value: SetDropTargetConstructor, enumerable: false, writable: true, configurable: true },
})

const InitializeSystemPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'InitializeSystem', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.initializeSystem, enumerable: false },
    toJSON: { value: toJSON.initializeSystem, enumerable: false },
    constructor: { value: InitializeSystemConstructor, enumerable: false, writable: true, configurable: true },
})

const OpenFilePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OpenFile', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.openFile, enumerable: false },
    toJSON: { value: toJSON.openFile, enumerable: false },
    constructor: { value: OpenFileConstructor, enumerable: false, writable: true, configurable: true },
})

const ReopenFilePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'ReopenFile', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.reopenFile, enumerable: false },
    toJSON: { value: toJSON.reopenFile, enumerable: false },
    constructor: { value: ReopenFileConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
LoadFileConstructor.prototype = LoadFilePrototype
SetTransactionFilterConstructor.prototype = SetTransactionFilterPrototype
SetViewUiStateConstructor.prototype = SetViewUiStatePrototype
ResetTransactionFiltersConstructor.prototype = ResetTransactionFiltersPrototype
ToggleAccountFilterConstructor.prototype = ToggleAccountFilterPrototype
ToggleSecurityFilterConstructor.prototype = ToggleSecurityFilterPrototype
ToggleActionFilterConstructor.prototype = ToggleActionFilterPrototype
ToggleCategoryFilterConstructor.prototype = ToggleCategoryFilterPrototype
SetFilterPopoverOpenConstructor.prototype = SetFilterPopoverOpenPrototype
SetFilterPopoverSearchConstructor.prototype = SetFilterPopoverSearchPrototype
SetTableLayoutConstructor.prototype = SetTableLayoutPrototype
EnsureTableLayoutConstructor.prototype = EnsureTableLayoutPrototype
OpenViewConstructor.prototype = OpenViewPrototype
CloseViewConstructor.prototype = CloseViewPrototype
MoveViewConstructor.prototype = MoveViewPrototype
CreateTabGroupConstructor.prototype = CreateTabGroupPrototype
CloseTabGroupConstructor.prototype = CloseTabGroupPrototype
SetActiveViewConstructor.prototype = SetActiveViewPrototype
SetActiveTabGroupConstructor.prototype = SetActiveTabGroupPrototype
SetTabGroupWidthConstructor.prototype = SetTabGroupWidthPrototype
SetAccountListSortModeConstructor.prototype = SetAccountListSortModePrototype
ToggleSectionCollapsedConstructor.prototype = ToggleSectionCollapsedPrototype
SetShowReopenBannerConstructor.prototype = SetShowReopenBannerPrototype
SetShowDrawerConstructor.prototype = SetShowDrawerPrototype
ToggleDrawerConstructor.prototype = ToggleDrawerPrototype
SetLoadingStatusConstructor.prototype = SetLoadingStatusPrototype
SetDraggingViewConstructor.prototype = SetDraggingViewPrototype
SetDropTargetConstructor.prototype = SetDropTargetPrototype
InitializeSystemConstructor.prototype = InitializeSystemPrototype
OpenFileConstructor.prototype = OpenFilePrototype
ReopenFileConstructor.prototype = ReopenFilePrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
LoadFileConstructor.is = val => val && val.constructor === LoadFileConstructor
SetTransactionFilterConstructor.is = val => val && val.constructor === SetTransactionFilterConstructor
SetViewUiStateConstructor.is = val => val && val.constructor === SetViewUiStateConstructor
ResetTransactionFiltersConstructor.is = val => val && val.constructor === ResetTransactionFiltersConstructor
ToggleAccountFilterConstructor.is = val => val && val.constructor === ToggleAccountFilterConstructor
ToggleSecurityFilterConstructor.is = val => val && val.constructor === ToggleSecurityFilterConstructor
ToggleActionFilterConstructor.is = val => val && val.constructor === ToggleActionFilterConstructor
ToggleCategoryFilterConstructor.is = val => val && val.constructor === ToggleCategoryFilterConstructor
SetFilterPopoverOpenConstructor.is = val => val && val.constructor === SetFilterPopoverOpenConstructor
SetFilterPopoverSearchConstructor.is = val => val && val.constructor === SetFilterPopoverSearchConstructor
SetTableLayoutConstructor.is = val => val && val.constructor === SetTableLayoutConstructor
EnsureTableLayoutConstructor.is = val => val && val.constructor === EnsureTableLayoutConstructor
OpenViewConstructor.is = val => val && val.constructor === OpenViewConstructor
CloseViewConstructor.is = val => val && val.constructor === CloseViewConstructor
MoveViewConstructor.is = val => val && val.constructor === MoveViewConstructor
CreateTabGroupConstructor.is = val => val && val.constructor === CreateTabGroupConstructor
CloseTabGroupConstructor.is = val => val && val.constructor === CloseTabGroupConstructor
SetActiveViewConstructor.is = val => val && val.constructor === SetActiveViewConstructor
SetActiveTabGroupConstructor.is = val => val && val.constructor === SetActiveTabGroupConstructor
SetTabGroupWidthConstructor.is = val => val && val.constructor === SetTabGroupWidthConstructor
SetAccountListSortModeConstructor.is = val => val && val.constructor === SetAccountListSortModeConstructor
ToggleSectionCollapsedConstructor.is = val => val && val.constructor === ToggleSectionCollapsedConstructor
SetShowReopenBannerConstructor.is = val => val && val.constructor === SetShowReopenBannerConstructor
SetShowDrawerConstructor.is = val => val && val.constructor === SetShowDrawerConstructor
ToggleDrawerConstructor.is = val => val && val.constructor === ToggleDrawerConstructor
SetLoadingStatusConstructor.is = val => val && val.constructor === SetLoadingStatusConstructor
SetDraggingViewConstructor.is = val => val && val.constructor === SetDraggingViewConstructor
SetDropTargetConstructor.is = val => val && val.constructor === SetDropTargetConstructor
InitializeSystemConstructor.is = val => val && val.constructor === InitializeSystemConstructor
OpenFileConstructor.is = val => val && val.constructor === OpenFileConstructor
ReopenFileConstructor.is = val => val && val.constructor === ReopenFileConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
LoadFileConstructor.toString = () => 'Action.LoadFile'
SetTransactionFilterConstructor.toString = () => 'Action.SetTransactionFilter'
SetViewUiStateConstructor.toString = () => 'Action.SetViewUiState'
ResetTransactionFiltersConstructor.toString = () => 'Action.ResetTransactionFilters'
ToggleAccountFilterConstructor.toString = () => 'Action.ToggleAccountFilter'
ToggleSecurityFilterConstructor.toString = () => 'Action.ToggleSecurityFilter'
ToggleActionFilterConstructor.toString = () => 'Action.ToggleActionFilter'
ToggleCategoryFilterConstructor.toString = () => 'Action.ToggleCategoryFilter'
SetFilterPopoverOpenConstructor.toString = () => 'Action.SetFilterPopoverOpen'
SetFilterPopoverSearchConstructor.toString = () => 'Action.SetFilterPopoverSearch'
SetTableLayoutConstructor.toString = () => 'Action.SetTableLayout'
EnsureTableLayoutConstructor.toString = () => 'Action.EnsureTableLayout'
OpenViewConstructor.toString = () => 'Action.OpenView'
CloseViewConstructor.toString = () => 'Action.CloseView'
MoveViewConstructor.toString = () => 'Action.MoveView'
CreateTabGroupConstructor.toString = () => 'Action.CreateTabGroup'
CloseTabGroupConstructor.toString = () => 'Action.CloseTabGroup'
SetActiveViewConstructor.toString = () => 'Action.SetActiveView'
SetActiveTabGroupConstructor.toString = () => 'Action.SetActiveTabGroup'
SetTabGroupWidthConstructor.toString = () => 'Action.SetTabGroupWidth'
SetAccountListSortModeConstructor.toString = () => 'Action.SetAccountListSortMode'
ToggleSectionCollapsedConstructor.toString = () => 'Action.ToggleSectionCollapsed'
SetShowReopenBannerConstructor.toString = () => 'Action.SetShowReopenBanner'
SetShowDrawerConstructor.toString = () => 'Action.SetShowDrawer'
ToggleDrawerConstructor.toString = () => 'Action.ToggleDrawer'
SetLoadingStatusConstructor.toString = () => 'Action.SetLoadingStatus'
SetDraggingViewConstructor.toString = () => 'Action.SetDraggingView'
SetDropTargetConstructor.toString = () => 'Action.SetDropTarget'
InitializeSystemConstructor.toString = () => 'Action.InitializeSystem'
OpenFileConstructor.toString = () => 'Action.OpenFile'
ReopenFileConstructor.toString = () => 'Action.ReopenFile'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
LoadFileConstructor._from = _input => {
    const { accounts, categories, securities, tags, splits, transactions, lots, lotAllocations, prices } = _input
    return Action.LoadFile(accounts, categories, securities, tags, splits, transactions, lots, lotAllocations, prices)
}
SetTransactionFilterConstructor._from = _input => Action.SetTransactionFilter(_input.viewId, _input.changes)
SetViewUiStateConstructor._from = _input => Action.SetViewUiState(_input.viewId, _input.changes)
ResetTransactionFiltersConstructor._from = _input => Action.ResetTransactionFilters(_input.viewId)
ToggleAccountFilterConstructor._from = _input => Action.ToggleAccountFilter(_input.viewId, _input.accountId)
ToggleSecurityFilterConstructor._from = _input => Action.ToggleSecurityFilter(_input.viewId, _input.securityId)
ToggleActionFilterConstructor._from = _input => Action.ToggleActionFilter(_input.viewId, _input.actionId)
ToggleCategoryFilterConstructor._from = _input => Action.ToggleCategoryFilter(_input.viewId, _input.category)
SetFilterPopoverOpenConstructor._from = _input => Action.SetFilterPopoverOpen(_input.viewId, _input.popoverId)
SetFilterPopoverSearchConstructor._from = _input => Action.SetFilterPopoverSearch(_input.viewId, _input.searchText)
SetTableLayoutConstructor._from = _input => Action.SetTableLayout(_input.tableLayout)
EnsureTableLayoutConstructor._from = _input => Action.EnsureTableLayout(_input.tableLayoutId, _input.columns)
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
SetAccountListSortModeConstructor._from = _input => Action.SetAccountListSortMode(_input.sortMode)
ToggleSectionCollapsedConstructor._from = _input => Action.ToggleSectionCollapsed(_input.sectionId)
SetShowReopenBannerConstructor._from = _input => Action.SetShowReopenBanner(_input.show)
SetShowDrawerConstructor._from = _input => Action.SetShowDrawer(_input.show)
ToggleDrawerConstructor._from = _input => Action.ToggleDrawer()
SetLoadingStatusConstructor._from = _input => Action.SetLoadingStatus(_input.status)
SetDraggingViewConstructor._from = _input => Action.SetDraggingView(_input.viewId)
SetDropTargetConstructor._from = _input => Action.SetDropTarget(_input.groupId)
InitializeSystemConstructor._from = _input => Action.InitializeSystem()
OpenFileConstructor._from = _input => Action.OpenFile()
ReopenFileConstructor._from = _input => Action.ReopenFile()
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
LoadFileConstructor.from = LoadFileConstructor._from
SetTransactionFilterConstructor.from = SetTransactionFilterConstructor._from
SetViewUiStateConstructor.from = SetViewUiStateConstructor._from
ResetTransactionFiltersConstructor.from = ResetTransactionFiltersConstructor._from
ToggleAccountFilterConstructor.from = ToggleAccountFilterConstructor._from
ToggleSecurityFilterConstructor.from = ToggleSecurityFilterConstructor._from
ToggleActionFilterConstructor.from = ToggleActionFilterConstructor._from
ToggleCategoryFilterConstructor.from = ToggleCategoryFilterConstructor._from
SetFilterPopoverOpenConstructor.from = SetFilterPopoverOpenConstructor._from
SetFilterPopoverSearchConstructor.from = SetFilterPopoverSearchConstructor._from
SetTableLayoutConstructor.from = SetTableLayoutConstructor._from
EnsureTableLayoutConstructor.from = EnsureTableLayoutConstructor._from
OpenViewConstructor.from = OpenViewConstructor._from
CloseViewConstructor.from = CloseViewConstructor._from
MoveViewConstructor.from = MoveViewConstructor._from
CreateTabGroupConstructor.from = CreateTabGroupConstructor._from
CloseTabGroupConstructor.from = CloseTabGroupConstructor._from
SetActiveViewConstructor.from = SetActiveViewConstructor._from
SetActiveTabGroupConstructor.from = SetActiveTabGroupConstructor._from
SetTabGroupWidthConstructor.from = SetTabGroupWidthConstructor._from
SetAccountListSortModeConstructor.from = SetAccountListSortModeConstructor._from
ToggleSectionCollapsedConstructor.from = ToggleSectionCollapsedConstructor._from
SetShowReopenBannerConstructor.from = SetShowReopenBannerConstructor._from
SetShowDrawerConstructor.from = SetShowDrawerConstructor._from
ToggleDrawerConstructor.from = ToggleDrawerConstructor._from
SetLoadingStatusConstructor.from = SetLoadingStatusConstructor._from
SetDraggingViewConstructor.from = SetDraggingViewConstructor._from
SetDropTargetConstructor.from = SetDropTargetConstructor._from
InitializeSystemConstructor.from = InitializeSystemConstructor._from
OpenFileConstructor.from = OpenFileConstructor._from
ReopenFileConstructor.from = ReopenFileConstructor._from

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
    const { accounts, categories, securities, tags, splits, transactions, lots, lotAllocations, prices } = o
    return {
        accounts: R.lookupTableToFirestore(Account, 'id', encodeTimestamps, accounts),
        categories: R.lookupTableToFirestore(Category, 'id', encodeTimestamps, categories),
        securities: R.lookupTableToFirestore(Security, 'id', encodeTimestamps, securities),
        tags: R.lookupTableToFirestore(Tag, 'id', encodeTimestamps, tags),
        splits: R.lookupTableToFirestore(Split, 'id', encodeTimestamps, splits),
        transactions: R.lookupTableToFirestore(Transaction, 'id', encodeTimestamps, transactions),
        lots: R.lookupTableToFirestore(Lot, 'id', encodeTimestamps, lots),
        lotAllocations: R.lookupTableToFirestore(LotAllocation, 'id', encodeTimestamps, lotAllocations),
        prices: R.lookupTableToFirestore(Price, 'id', encodeTimestamps, prices),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> LoadFile
 */
LoadFileConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { accounts, categories, securities, tags, splits, transactions, lots, lotAllocations, prices } = doc
    return LoadFileConstructor._from({
        accounts: R.lookupTableFromFirestore(Account, 'id', decodeTimestamps, accounts),
        categories: R.lookupTableFromFirestore(Category, 'id', decodeTimestamps, categories),
        securities: R.lookupTableFromFirestore(Security, 'id', decodeTimestamps, securities),
        tags: R.lookupTableFromFirestore(Tag, 'id', decodeTimestamps, tags),
        splits: R.lookupTableFromFirestore(Split, 'id', decodeTimestamps, splits),
        transactions: R.lookupTableFromFirestore(Transaction, 'id', decodeTimestamps, transactions),
        lots: R.lookupTableFromFirestore(Lot, 'id', decodeTimestamps, lots),
        lotAllocations: R.lookupTableFromFirestore(LotAllocation, 'id', decodeTimestamps, lotAllocations),
        prices: R.lookupTableFromFirestore(Price, 'id', decodeTimestamps, prices),
    })
}

// Public aliases (can be overridden)
LoadFileConstructor.toFirestore = LoadFileConstructor._toFirestore
LoadFileConstructor.fromFirestore = LoadFileConstructor._fromFirestore

SetTransactionFilterConstructor.toFirestore = o => ({ ...o })
SetTransactionFilterConstructor.fromFirestore = SetTransactionFilterConstructor._from

SetViewUiStateConstructor.toFirestore = o => ({ ...o })
SetViewUiStateConstructor.fromFirestore = SetViewUiStateConstructor._from

ResetTransactionFiltersConstructor.toFirestore = o => ({ ...o })
ResetTransactionFiltersConstructor.fromFirestore = ResetTransactionFiltersConstructor._from

ToggleAccountFilterConstructor.toFirestore = o => ({ ...o })
ToggleAccountFilterConstructor.fromFirestore = ToggleAccountFilterConstructor._from

ToggleSecurityFilterConstructor.toFirestore = o => ({ ...o })
ToggleSecurityFilterConstructor.fromFirestore = ToggleSecurityFilterConstructor._from

ToggleActionFilterConstructor.toFirestore = o => ({ ...o })
ToggleActionFilterConstructor.fromFirestore = ToggleActionFilterConstructor._from

ToggleCategoryFilterConstructor.toFirestore = o => ({ ...o })
ToggleCategoryFilterConstructor.fromFirestore = ToggleCategoryFilterConstructor._from

SetFilterPopoverOpenConstructor.toFirestore = o => ({ ...o })
SetFilterPopoverOpenConstructor.fromFirestore = SetFilterPopoverOpenConstructor._from

SetFilterPopoverSearchConstructor.toFirestore = o => ({ ...o })
SetFilterPopoverSearchConstructor.fromFirestore = SetFilterPopoverSearchConstructor._from

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

EnsureTableLayoutConstructor.toFirestore = o => ({ ...o })
EnsureTableLayoutConstructor.fromFirestore = EnsureTableLayoutConstructor._from

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

SetAccountListSortModeConstructor._toFirestore = (o, encodeTimestamps) => ({
    sortMode: SortMode.toFirestore(o.sortMode, encodeTimestamps),
})

SetAccountListSortModeConstructor._fromFirestore = (doc, decodeTimestamps) =>
    SetAccountListSortModeConstructor._from({
        sortMode: SortMode.fromFirestore
            ? SortMode.fromFirestore(doc.sortMode, decodeTimestamps)
            : SortMode.from(doc.sortMode),
    })

// Public aliases (can be overridden)
SetAccountListSortModeConstructor.toFirestore = SetAccountListSortModeConstructor._toFirestore
SetAccountListSortModeConstructor.fromFirestore = SetAccountListSortModeConstructor._fromFirestore

ToggleSectionCollapsedConstructor.toFirestore = o => ({ ...o })
ToggleSectionCollapsedConstructor.fromFirestore = ToggleSectionCollapsedConstructor._from

SetShowReopenBannerConstructor.toFirestore = o => ({ ...o })
SetShowReopenBannerConstructor.fromFirestore = SetShowReopenBannerConstructor._from

SetShowDrawerConstructor.toFirestore = o => ({ ...o })
SetShowDrawerConstructor.fromFirestore = SetShowDrawerConstructor._from

ToggleDrawerConstructor.toFirestore = o => ({ ...o })
ToggleDrawerConstructor.fromFirestore = ToggleDrawerConstructor._from

SetLoadingStatusConstructor.toFirestore = o => ({ ...o })
SetLoadingStatusConstructor.fromFirestore = SetLoadingStatusConstructor._from

SetDraggingViewConstructor.toFirestore = o => ({ ...o })
SetDraggingViewConstructor.fromFirestore = SetDraggingViewConstructor._from

SetDropTargetConstructor.toFirestore = o => ({ ...o })
SetDropTargetConstructor.fromFirestore = SetDropTargetConstructor._from

InitializeSystemConstructor.toFirestore = o => ({ ...o })
InitializeSystemConstructor.fromFirestore = InitializeSystemConstructor._from

OpenFileConstructor.toFirestore = o => ({ ...o })
OpenFileConstructor.fromFirestore = OpenFileConstructor._from

ReopenFileConstructor.toFirestore = o => ({ ...o })
ReopenFileConstructor.fromFirestore = ReopenFileConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a Action instance
 * @sig is :: Any -> Boolean
 */
Action.is = v => {
    const {
        LoadFile,
        SetTransactionFilter,
        SetViewUiState,
        ResetTransactionFilters,
        ToggleAccountFilter,
        ToggleSecurityFilter,
        ToggleActionFilter,
        ToggleCategoryFilter,
        SetFilterPopoverOpen,
        SetFilterPopoverSearch,
        SetTableLayout,
        EnsureTableLayout,
        OpenView,
        CloseView,
        MoveView,
        CreateTabGroup,
        CloseTabGroup,
        SetActiveView,
        SetActiveTabGroup,
        SetTabGroupWidth,
        SetAccountListSortMode,
        ToggleSectionCollapsed,
        SetShowReopenBanner,
        SetShowDrawer,
        ToggleDrawer,
        SetLoadingStatus,
        SetDraggingView,
        SetDropTarget,
        InitializeSystem,
        OpenFile,
        ReopenFile,
    } = Action
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === LoadFile ||
        constructor === SetTransactionFilter ||
        constructor === SetViewUiState ||
        constructor === ResetTransactionFilters ||
        constructor === ToggleAccountFilter ||
        constructor === ToggleSecurityFilter ||
        constructor === ToggleActionFilter ||
        constructor === ToggleCategoryFilter ||
        constructor === SetFilterPopoverOpen ||
        constructor === SetFilterPopoverSearch ||
        constructor === SetTableLayout ||
        constructor === EnsureTableLayout ||
        constructor === OpenView ||
        constructor === CloseView ||
        constructor === MoveView ||
        constructor === CreateTabGroup ||
        constructor === CloseTabGroup ||
        constructor === SetActiveView ||
        constructor === SetActiveTabGroup ||
        constructor === SetTabGroupWidth ||
        constructor === SetAccountListSortMode ||
        constructor === ToggleSectionCollapsed ||
        constructor === SetShowReopenBanner ||
        constructor === SetShowDrawer ||
        constructor === ToggleDrawer ||
        constructor === SetLoadingStatus ||
        constructor === SetDraggingView ||
        constructor === SetDropTarget ||
        constructor === InitializeSystem ||
        constructor === OpenFile ||
        constructor === ReopenFile
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
        SetViewUiState,
        ResetTransactionFilters,
        ToggleAccountFilter,
        ToggleSecurityFilter,
        ToggleActionFilter,
        ToggleCategoryFilter,
        SetFilterPopoverOpen,
        SetFilterPopoverSearch,
        SetTableLayout,
        EnsureTableLayout,
        OpenView,
        CloseView,
        MoveView,
        CreateTabGroup,
        CloseTabGroup,
        SetActiveView,
        SetActiveTabGroup,
        SetTabGroupWidth,
        SetAccountListSortMode,
        ToggleSectionCollapsed,
        SetShowReopenBanner,
        SetShowDrawer,
        ToggleDrawer,
        SetLoadingStatus,
        SetDraggingView,
        SetDropTarget,
        InitializeSystem,
        OpenFile,
        ReopenFile,
    } = Action
    const tagName = doc['@@tagName']
    if (tagName === 'LoadFile') return LoadFile.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetTransactionFilter') return SetTransactionFilter.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetViewUiState') return SetViewUiState.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ResetTransactionFilters') return ResetTransactionFilters.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ToggleAccountFilter') return ToggleAccountFilter.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ToggleSecurityFilter') return ToggleSecurityFilter.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ToggleActionFilter') return ToggleActionFilter.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ToggleCategoryFilter') return ToggleCategoryFilter.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetFilterPopoverOpen') return SetFilterPopoverOpen.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetFilterPopoverSearch') return SetFilterPopoverSearch.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetTableLayout') return SetTableLayout.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'EnsureTableLayout') return EnsureTableLayout.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'OpenView') return OpenView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CloseView') return CloseView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'MoveView') return MoveView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CreateTabGroup') return CreateTabGroup.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CloseTabGroup') return CloseTabGroup.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetActiveView') return SetActiveView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetActiveTabGroup') return SetActiveTabGroup.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetTabGroupWidth') return SetTabGroupWidth.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetAccountListSortMode') return SetAccountListSortMode.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ToggleSectionCollapsed') return ToggleSectionCollapsed.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetShowReopenBanner') return SetShowReopenBanner.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetShowDrawer') return SetShowDrawer.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ToggleDrawer') return ToggleDrawer.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetLoadingStatus') return SetLoadingStatus.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetDraggingView') return SetDraggingView.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SetDropTarget') return SetDropTarget.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'InitializeSystem') return InitializeSystem.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'OpenFile') return OpenFile.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ReopenFile') return ReopenFile.fromFirestore(doc, decodeTimestamps)
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
