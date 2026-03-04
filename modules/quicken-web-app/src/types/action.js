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
 *  CycleTab
 *      direction: "String"
 *  MoveTab
 *      direction: "String",
 *      viewId   : "String",
 *      groupId  : "String"
 *  MoveToNewGroup
 *      viewId : "String",
 *      groupId: "String"
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
 *  SetTransferNavPending
 *      pending: "Object?"
 *  SetPickerOpen
 *      pickerType: "String?"
 *  SetPickerHighlight
 *      index: "Number"
 *  SetPickerSearch
 *      searchText: "String"
 *  SetPickerPosition
 *      x: "Number",
 *      y: "Number"
 *  BumpActionRegistry
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

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
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
        'CycleTab',
        'MoveTab',
        'MoveToNewGroup',
        'SetAccountListSortMode',
        'ToggleSectionCollapsed',
        'SetShowReopenBanner',
        'SetShowDrawer',
        'ToggleDrawer',
        'SetLoadingStatus',
        'SetTransferNavPending',
        'SetPickerOpen',
        'SetPickerHighlight',
        'SetPickerSearch',
        'SetPickerPosition',
        'BumpActionRegistry',
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
    cycleTab               : function () { return `Action.CycleTab(${R._toString(this.direction)})` },
    moveTab                : function () { return `Action.MoveTab(${R._toString(this.direction)}, ${R._toString(this.viewId)}, ${R._toString(this.groupId)})` },
    moveToNewGroup         : function () { return `Action.MoveToNewGroup(${R._toString(this.viewId)}, ${R._toString(this.groupId)})` },
    setAccountListSortMode : function () { return `Action.SetAccountListSortMode(${R._toString(this.sortMode)})` },
    toggleSectionCollapsed : function () { return `Action.ToggleSectionCollapsed(${R._toString(this.sectionId)})` },
    setShowReopenBanner    : function () { return `Action.SetShowReopenBanner(${R._toString(this.show)})` },
    setShowDrawer          : function () { return `Action.SetShowDrawer(${R._toString(this.show)})` },
    toggleDrawer           : function () { return `Action.ToggleDrawer()` },
    setLoadingStatus       : function () { return `Action.SetLoadingStatus(${R._toString(this.status)})` },
    setTransferNavPending  : function () { return `Action.SetTransferNavPending(${R._toString(this.pending)})` },
    setPickerOpen          : function () { return `Action.SetPickerOpen(${R._toString(this.pickerType)})` },
    setPickerHighlight     : function () { return `Action.SetPickerHighlight(${R._toString(this.index)})` },
    setPickerSearch        : function () { return `Action.SetPickerSearch(${R._toString(this.searchText)})` },
    setPickerPosition      : function () { return `Action.SetPickerPosition(${R._toString(this.x)}, ${R._toString(this.y)})` },
    bumpActionRegistry     : function () { return `Action.BumpActionRegistry()` },
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
    cycleTab               : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    moveTab                : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    moveToNewGroup         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setAccountListSortMode : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    toggleSectionCollapsed : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setShowReopenBanner    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setShowDrawer          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    toggleDrawer           : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setLoadingStatus       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setTransferNavPending  : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setPickerOpen          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setPickerHighlight     : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setPickerSearch        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    setPickerPosition      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    bumpActionRegistry     : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
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
    if (popoverId !== undefined) result.popoverId = popoverId
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
    if (groupId !== undefined) result.groupId = groupId
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
    if (toIndex !== undefined) result.toIndex = toIndex
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
 * Construct a Action.CycleTab instance
 * @sig CycleTab :: (String) -> Action.CycleTab
 */
const CycleTabConstructor = function CycleTab(direction) {
    const constructorName = 'Action.CycleTab(direction)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'direction', false, direction)

    const result = Object.create(CycleTabPrototype)
    result.direction = direction
    return result
}

Action.CycleTab = CycleTabConstructor

/*
 * Construct a Action.MoveTab instance
 * @sig MoveTab :: (String, String, String) -> Action.MoveTab
 */
const MoveTabConstructor = function MoveTab(direction, viewId, groupId) {
    const constructorName = 'Action.MoveTab(direction, viewId, groupId)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'direction', false, direction)
    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateString(constructorName, 'groupId', false, groupId)

    const result = Object.create(MoveTabPrototype)
    result.direction = direction
    result.viewId = viewId
    result.groupId = groupId
    return result
}

Action.MoveTab = MoveTabConstructor

/*
 * Construct a Action.MoveToNewGroup instance
 * @sig MoveToNewGroup :: (String, String) -> Action.MoveToNewGroup
 */
const MoveToNewGroupConstructor = function MoveToNewGroup(viewId, groupId) {
    const constructorName = 'Action.MoveToNewGroup(viewId, groupId)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'viewId', false, viewId)
    R.validateString(constructorName, 'groupId', false, groupId)

    const result = Object.create(MoveToNewGroupPrototype)
    result.viewId = viewId
    result.groupId = groupId
    return result
}

Action.MoveToNewGroup = MoveToNewGroupConstructor

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
    if (status !== undefined) result.status = status
    return result
}

Action.SetLoadingStatus = SetLoadingStatusConstructor

/*
 * Construct a Action.SetTransferNavPending instance
 * @sig SetTransferNavPending :: (Object?) -> Action.SetTransferNavPending
 */
const SetTransferNavPendingConstructor = function SetTransferNavPending(pending) {
    const constructorName = 'Action.SetTransferNavPending(pending)'

    R.validateObject(constructorName, 'pending', true, pending)

    const result = Object.create(SetTransferNavPendingPrototype)
    if (pending !== undefined) result.pending = pending
    return result
}

Action.SetTransferNavPending = SetTransferNavPendingConstructor

/*
 * Construct a Action.SetPickerOpen instance
 * @sig SetPickerOpen :: (String?) -> Action.SetPickerOpen
 */
const SetPickerOpenConstructor = function SetPickerOpen(pickerType) {
    const constructorName = 'Action.SetPickerOpen(pickerType)'

    R.validateString(constructorName, 'pickerType', true, pickerType)

    const result = Object.create(SetPickerOpenPrototype)
    if (pickerType !== undefined) result.pickerType = pickerType
    return result
}

Action.SetPickerOpen = SetPickerOpenConstructor

/*
 * Construct a Action.SetPickerHighlight instance
 * @sig SetPickerHighlight :: (Number) -> Action.SetPickerHighlight
 */
const SetPickerHighlightConstructor = function SetPickerHighlight(index) {
    const constructorName = 'Action.SetPickerHighlight(index)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateNumber(constructorName, 'index', false, index)

    const result = Object.create(SetPickerHighlightPrototype)
    result.index = index
    return result
}

Action.SetPickerHighlight = SetPickerHighlightConstructor

/*
 * Construct a Action.SetPickerSearch instance
 * @sig SetPickerSearch :: (String) -> Action.SetPickerSearch
 */
const SetPickerSearchConstructor = function SetPickerSearch(searchText) {
    const constructorName = 'Action.SetPickerSearch(searchText)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'searchText', false, searchText)

    const result = Object.create(SetPickerSearchPrototype)
    result.searchText = searchText
    return result
}

Action.SetPickerSearch = SetPickerSearchConstructor

/*
 * Construct a Action.SetPickerPosition instance
 * @sig SetPickerPosition :: (Number, Number) -> Action.SetPickerPosition
 */
const SetPickerPositionConstructor = function SetPickerPosition(x, y) {
    const constructorName = 'Action.SetPickerPosition(x, y)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'x', false, x)
    R.validateNumber(constructorName, 'y', false, y)

    const result = Object.create(SetPickerPositionPrototype)
    result.x = x
    result.y = y
    return result
}

Action.SetPickerPosition = SetPickerPositionConstructor

/*
 * Construct a Action.BumpActionRegistry instance
 * @sig BumpActionRegistry :: () -> Action.BumpActionRegistry
 */
const BumpActionRegistryConstructor = function BumpActionRegistry() {
    const constructorName = 'Action.BumpActionRegistry()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(BumpActionRegistryPrototype)

    return result
}

Action.BumpActionRegistry = BumpActionRegistryConstructor

/*
 * Construct a Action.SetDraggingView instance
 * @sig SetDraggingView :: (String?) -> Action.SetDraggingView
 */
const SetDraggingViewConstructor = function SetDraggingView(viewId) {
    const constructorName = 'Action.SetDraggingView(viewId)'

    R.validateString(constructorName, 'viewId', true, viewId)

    const result = Object.create(SetDraggingViewPrototype)
    if (viewId !== undefined) result.viewId = viewId
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
    if (groupId !== undefined) result.groupId = groupId
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

const CycleTabPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'CycleTab', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.cycleTab, enumerable: false },
    toJSON: { value: toJSON.cycleTab, enumerable: false },
    constructor: { value: CycleTabConstructor, enumerable: false, writable: true, configurable: true },
})

const MoveTabPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'MoveTab', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.moveTab, enumerable: false },
    toJSON: { value: toJSON.moveTab, enumerable: false },
    constructor: { value: MoveTabConstructor, enumerable: false, writable: true, configurable: true },
})

const MoveToNewGroupPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'MoveToNewGroup', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.moveToNewGroup, enumerable: false },
    toJSON: { value: toJSON.moveToNewGroup, enumerable: false },
    constructor: { value: MoveToNewGroupConstructor, enumerable: false, writable: true, configurable: true },
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

const SetTransferNavPendingPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetTransferNavPending', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setTransferNavPending, enumerable: false },
    toJSON: { value: toJSON.setTransferNavPending, enumerable: false },
    constructor: { value: SetTransferNavPendingConstructor, enumerable: false, writable: true, configurable: true },
})

const SetPickerOpenPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetPickerOpen', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setPickerOpen, enumerable: false },
    toJSON: { value: toJSON.setPickerOpen, enumerable: false },
    constructor: { value: SetPickerOpenConstructor, enumerable: false, writable: true, configurable: true },
})

const SetPickerHighlightPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetPickerHighlight', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setPickerHighlight, enumerable: false },
    toJSON: { value: toJSON.setPickerHighlight, enumerable: false },
    constructor: { value: SetPickerHighlightConstructor, enumerable: false, writable: true, configurable: true },
})

const SetPickerSearchPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetPickerSearch', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setPickerSearch, enumerable: false },
    toJSON: { value: toJSON.setPickerSearch, enumerable: false },
    constructor: { value: SetPickerSearchConstructor, enumerable: false, writable: true, configurable: true },
})

const SetPickerPositionPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SetPickerPosition', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.setPickerPosition, enumerable: false },
    toJSON: { value: toJSON.setPickerPosition, enumerable: false },
    constructor: { value: SetPickerPositionConstructor, enumerable: false, writable: true, configurable: true },
})

const BumpActionRegistryPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'BumpActionRegistry', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.bumpActionRegistry, enumerable: false },
    toJSON: { value: toJSON.bumpActionRegistry, enumerable: false },
    constructor: { value: BumpActionRegistryConstructor, enumerable: false, writable: true, configurable: true },
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
CycleTabConstructor.prototype = CycleTabPrototype
MoveTabConstructor.prototype = MoveTabPrototype
MoveToNewGroupConstructor.prototype = MoveToNewGroupPrototype
SetAccountListSortModeConstructor.prototype = SetAccountListSortModePrototype
ToggleSectionCollapsedConstructor.prototype = ToggleSectionCollapsedPrototype
SetShowReopenBannerConstructor.prototype = SetShowReopenBannerPrototype
SetShowDrawerConstructor.prototype = SetShowDrawerPrototype
ToggleDrawerConstructor.prototype = ToggleDrawerPrototype
SetLoadingStatusConstructor.prototype = SetLoadingStatusPrototype
SetTransferNavPendingConstructor.prototype = SetTransferNavPendingPrototype
SetPickerOpenConstructor.prototype = SetPickerOpenPrototype
SetPickerHighlightConstructor.prototype = SetPickerHighlightPrototype
SetPickerSearchConstructor.prototype = SetPickerSearchPrototype
SetPickerPositionConstructor.prototype = SetPickerPositionPrototype
BumpActionRegistryConstructor.prototype = BumpActionRegistryPrototype
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
CycleTabConstructor.is = val => val && val.constructor === CycleTabConstructor
MoveTabConstructor.is = val => val && val.constructor === MoveTabConstructor
MoveToNewGroupConstructor.is = val => val && val.constructor === MoveToNewGroupConstructor
SetAccountListSortModeConstructor.is = val => val && val.constructor === SetAccountListSortModeConstructor
ToggleSectionCollapsedConstructor.is = val => val && val.constructor === ToggleSectionCollapsedConstructor
SetShowReopenBannerConstructor.is = val => val && val.constructor === SetShowReopenBannerConstructor
SetShowDrawerConstructor.is = val => val && val.constructor === SetShowDrawerConstructor
ToggleDrawerConstructor.is = val => val && val.constructor === ToggleDrawerConstructor
SetLoadingStatusConstructor.is = val => val && val.constructor === SetLoadingStatusConstructor
SetTransferNavPendingConstructor.is = val => val && val.constructor === SetTransferNavPendingConstructor
SetPickerOpenConstructor.is = val => val && val.constructor === SetPickerOpenConstructor
SetPickerHighlightConstructor.is = val => val && val.constructor === SetPickerHighlightConstructor
SetPickerSearchConstructor.is = val => val && val.constructor === SetPickerSearchConstructor
SetPickerPositionConstructor.is = val => val && val.constructor === SetPickerPositionConstructor
BumpActionRegistryConstructor.is = val => val && val.constructor === BumpActionRegistryConstructor
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
CycleTabConstructor.toString = () => 'Action.CycleTab'
MoveTabConstructor.toString = () => 'Action.MoveTab'
MoveToNewGroupConstructor.toString = () => 'Action.MoveToNewGroup'
SetAccountListSortModeConstructor.toString = () => 'Action.SetAccountListSortMode'
ToggleSectionCollapsedConstructor.toString = () => 'Action.ToggleSectionCollapsed'
SetShowReopenBannerConstructor.toString = () => 'Action.SetShowReopenBanner'
SetShowDrawerConstructor.toString = () => 'Action.SetShowDrawer'
ToggleDrawerConstructor.toString = () => 'Action.ToggleDrawer'
SetLoadingStatusConstructor.toString = () => 'Action.SetLoadingStatus'
SetTransferNavPendingConstructor.toString = () => 'Action.SetTransferNavPending'
SetPickerOpenConstructor.toString = () => 'Action.SetPickerOpen'
SetPickerHighlightConstructor.toString = () => 'Action.SetPickerHighlight'
SetPickerSearchConstructor.toString = () => 'Action.SetPickerSearch'
SetPickerPositionConstructor.toString = () => 'Action.SetPickerPosition'
BumpActionRegistryConstructor.toString = () => 'Action.BumpActionRegistry'
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
CycleTabConstructor._from = _input => Action.CycleTab(_input.direction)
MoveTabConstructor._from = _input => {
    const { direction, viewId, groupId } = _input
    return Action.MoveTab(direction, viewId, groupId)
}
MoveToNewGroupConstructor._from = _input => Action.MoveToNewGroup(_input.viewId, _input.groupId)
SetAccountListSortModeConstructor._from = _input => Action.SetAccountListSortMode(_input.sortMode)
ToggleSectionCollapsedConstructor._from = _input => Action.ToggleSectionCollapsed(_input.sectionId)
SetShowReopenBannerConstructor._from = _input => Action.SetShowReopenBanner(_input.show)
SetShowDrawerConstructor._from = _input => Action.SetShowDrawer(_input.show)
ToggleDrawerConstructor._from = _input => Action.ToggleDrawer()
SetLoadingStatusConstructor._from = _input => Action.SetLoadingStatus(_input.status)
SetTransferNavPendingConstructor._from = _input => Action.SetTransferNavPending(_input.pending)
SetPickerOpenConstructor._from = _input => Action.SetPickerOpen(_input.pickerType)
SetPickerHighlightConstructor._from = _input => Action.SetPickerHighlight(_input.index)
SetPickerSearchConstructor._from = _input => Action.SetPickerSearch(_input.searchText)
SetPickerPositionConstructor._from = _input => Action.SetPickerPosition(_input.x, _input.y)
BumpActionRegistryConstructor._from = _input => Action.BumpActionRegistry()
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
CycleTabConstructor.from = CycleTabConstructor._from
MoveTabConstructor.from = MoveTabConstructor._from
MoveToNewGroupConstructor.from = MoveToNewGroupConstructor._from
SetAccountListSortModeConstructor.from = SetAccountListSortModeConstructor._from
ToggleSectionCollapsedConstructor.from = ToggleSectionCollapsedConstructor._from
SetShowReopenBannerConstructor.from = SetShowReopenBannerConstructor._from
SetShowDrawerConstructor.from = SetShowDrawerConstructor._from
ToggleDrawerConstructor.from = ToggleDrawerConstructor._from
SetLoadingStatusConstructor.from = SetLoadingStatusConstructor._from
SetTransferNavPendingConstructor.from = SetTransferNavPendingConstructor._from
SetPickerOpenConstructor.from = SetPickerOpenConstructor._from
SetPickerHighlightConstructor.from = SetPickerHighlightConstructor._from
SetPickerSearchConstructor.from = SetPickerSearchConstructor._from
SetPickerPositionConstructor.from = SetPickerPositionConstructor._from
BumpActionRegistryConstructor.from = BumpActionRegistryConstructor._from
SetDraggingViewConstructor.from = SetDraggingViewConstructor._from
SetDropTargetConstructor.from = SetDropTargetConstructor._from
InitializeSystemConstructor.from = InitializeSystemConstructor._from
OpenFileConstructor.from = OpenFileConstructor._from
ReopenFileConstructor.from = ReopenFileConstructor._from

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
        CycleTab,
        MoveTab,
        MoveToNewGroup,
        SetAccountListSortMode,
        ToggleSectionCollapsed,
        SetShowReopenBanner,
        SetShowDrawer,
        ToggleDrawer,
        SetLoadingStatus,
        SetTransferNavPending,
        SetPickerOpen,
        SetPickerHighlight,
        SetPickerSearch,
        SetPickerPosition,
        BumpActionRegistry,
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
        constructor === CycleTab ||
        constructor === MoveTab ||
        constructor === MoveToNewGroup ||
        constructor === SetAccountListSortMode ||
        constructor === ToggleSectionCollapsed ||
        constructor === SetShowReopenBanner ||
        constructor === SetShowDrawer ||
        constructor === ToggleDrawer ||
        constructor === SetLoadingStatus ||
        constructor === SetTransferNavPending ||
        constructor === SetPickerOpen ||
        constructor === SetPickerHighlight ||
        constructor === SetPickerSearch ||
        constructor === SetPickerPosition ||
        constructor === BumpActionRegistry ||
        constructor === SetDraggingView ||
        constructor === SetDropTarget ||
        constructor === InitializeSystem ||
        constructor === OpenFile ||
        constructor === ReopenFile
    )
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Action }
