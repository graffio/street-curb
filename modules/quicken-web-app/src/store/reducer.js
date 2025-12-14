// ABOUTME: Root reducer for application state
// ABOUTME: Manages all entities (LookupTables) and transaction filter state

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Account } from '../types/account.js'
import { Action } from '../types/action.js'
import { Category } from '../types/category.js'
import { TabGroup, TabLayout, Transaction, View } from '../types/index.js'
import { Security } from '../types/security.js'
import { Split } from '../types/split.js'
import { Tag } from '../types/tag.js'
import { hydrateTabLayout, hydrateTableLayouts } from './hydration.js'

const MAX_GROUPS = 4

const defaultTransactionFilters = {
    dateRange: null,
    dateRangeKey: 'lastTwelveMonths',
    filterQuery: '',
    searchQuery: '',
    selectedCategories: [],
    currentSearchIndex: 0,
    currentRowIndex: 0,
    customStartDate: null,
    customEndDate: null,
}

// Creates the initial Redux state with empty LookupTables and default filters
// @sig getInitialState :: () -> State
const getInitialState = () => ({
    initialized: true,
    accounts: LookupTable([], Account, 'id'),
    categories: LookupTable([], Category, 'id'),
    securities: LookupTable([], Security, 'id'),
    tableLayouts: hydrateTableLayouts(),
    tags: LookupTable([], Tag, 'id'),
    splits: LookupTable([], Split, 'id'),
    transactions: LookupTable([], Transaction, 'id'),
    tabLayout: hydrateTabLayout(),
    transactionFilters: defaultTransactionFilters,
})

// ---------------------------------------------------------------------------------------------------------------------
// Generic nested update helper
// ---------------------------------------------------------------------------------------------------------------------

// Recursively updates a nested value, rebuilding LookupTables and Tagged types along the way.
// Throws if any intermediate path segment doesn't exist. Final segment may be undefined (allows setting new keys).
// @sig updatePath :: (obj, [String], valueOrFn) -> obj
const updatePath = (obj, path, valueOrFn) => {
    if (path.length === 0) return typeof valueOrFn === 'function' ? valueOrFn(obj) : valueOrFn

    const [key, ...rest] = path
    const child = obj[key]

    // Intermediate segments must exist; final segment may be undefined (we're setting it)
    if (child === undefined && rest.length > 0)
        throw new Error(`updatePath: missing key '${key}' in ${obj['@@typeName'] || 'object'}`)

    const updatedChild = updatePath(child, rest, valueOrFn)

    // Rebuild based on container type
    if (LookupTable.is(obj)) return obj.addItemWithId(updatedChild)
    if (obj['@@typeName']) return obj.constructor.from({ ...obj, [key]: updatedChild })
    return { ...obj, [key]: updatedChild }
}

// ---------------------------------------------------------------------------------------------------------------------
// Basic action handlers
// ---------------------------------------------------------------------------------------------------------------------

// Merges partial filter changes into transaction filter state
// @sig setTransactionFilter :: (State, Action.SetTransactionFilterAction) -> State
const setTransactionFilter = (state, setTransactionFilterAction) => ({
    ...state,
    transactionFilters: { ...state.transactionFilters, ...setTransactionFilterAction.changes },
})

// Resets all transaction filters to their default values
// @sig resetTransactionFilters :: State -> State
const resetTransactionFilters = state => ({ ...state, transactionFilters: { ...defaultTransactionFilters } })

// Persists a table layout (column widths, order, sorting) by view ID
// @sig setTableLayout :: (State, Action.SetTableLayoutAction) -> State
const setTableLayout = (state, setTableLayoutAction) => ({
    ...state,
    tableLayouts: state.tableLayouts.addItemWithId(setTableLayoutAction.tableLayout),
})

// Replaces state with loaded file data (accounts, transactions, etc.)
// @sig loadFile :: (State, Action.LoadFile) -> State
const loadFile = (state, loadFileAction) => ({ ...state, ...loadFileAction })

// ---------------------------------------------------------------------------------------------------------------------
// Tab layout helpers
// ---------------------------------------------------------------------------------------------------------------------

// Finds the tab group containing a specific view, if any
// @sig findGroupContainingView :: (TabLayout, String) -> TabGroup|undefined
const findGroupContainingView = (tabLayout, viewId) => tabLayout.tabGroups.find(g => g.views[viewId])

// Creates a copy of a tab group with a new width
// @sig resizeGroupToWidth :: (TabGroup, Number) -> TabGroup
const resizeGroupToWidth = (group, width) => TabGroup(group.id, group.views, group.activeViewId, width)

// Removes the specified group and resizes remaining groups evenly
// @sig removeGroupAndResize :: (TabLayout, String) -> TabLayout
const removeGroupAndResize = (tabLayout, groupIdToRemove) => {
    const { id, tabGroups, activeTabGroupId, nextTabGroupId } = tabLayout
    const remainingGroups = tabGroups.filter(g => g.id !== groupIdToRemove)
    const evenWidth = 100 / remainingGroups.length
    const resizedGroups = LookupTable(
        remainingGroups.map(g => resizeGroupToWidth(g, evenWidth)),
        TabGroup,
        'id',
    )
    const newActiveId = activeTabGroupId === groupIdToRemove ? resizedGroups[0].id : activeTabGroupId
    return TabLayout(id, resizedGroups, newActiveId, nextTabGroupId)
}

// Returns the next active view after removing a view; falls back to first remaining view
// @sig nextActiveViewId :: (TabGroup, String, LookupTable<View>) -> String|null
const nextActiveViewId = (group, removedViewId, remainingViews) =>
    group.activeViewId === removedViewId ? (remainingViews[0]?.id ?? null) : group.activeViewId

// Activates a view in a group and makes that group active
// @sig activateView :: (TabLayout, String, String) -> TabLayout
const activateView = (tabLayout, groupId, viewId) => {
    const layout = updatePath(tabLayout, ['tabGroups', groupId, 'activeViewId'], viewId)
    return updatePath(layout, ['activeTabGroupId'], groupId)
}

// ---------------------------------------------------------------------------------------------------------------------
// Tab layout action handlers
// ---------------------------------------------------------------------------------------------------------------------

// Opens a view in a tab group; activates existing view if already open
// @sig openView :: (State, Action.OpenView) -> State
const openView = (state, action) => {
    const activateExisting = group => ({ ...state, tabLayout: activateView(tabLayout, group.id, view.id) })

    const addToGroup = targetId => {
        const layout = updatePath(tabLayout, ['tabGroups', targetId, 'views'], vs => vs.addItemWithId(view))
        return { ...state, tabLayout: activateView(layout, targetId, view.id) }
    }

    const { tabLayout } = state
    const { view, groupId } = action
    const existingGroup = findGroupContainingView(tabLayout, view.id)
    return existingGroup ? activateExisting(existingGroup) : addToGroup(groupId || tabLayout.activeTabGroupId)
}

// Closes a view; removes empty group if not the last one
// @sig closeView :: (State, Action.CloseView) -> State
const closeView = (state, action) => {
    const removeEmptyGroup = () => ({ ...state, tabLayout: removeGroupAndResize(tabLayout, groupId) })

    // Updates group with view removed and selects next active view
    // @sig updateGroupWithoutView :: () -> State
    const updateGroupWithoutView = () => {
        let layout = updatePath(tabLayout, ['tabGroups', groupId, 'views'], () => remainingViews)
        layout = updatePath(
            layout,
            ['tabGroups', groupId, 'activeViewId'],
            nextActiveViewId(group, viewId, remainingViews),
        )
        return { ...state, tabLayout: layout }
    }

    const { tabLayout } = state
    const { viewId, groupId } = action
    const group = tabLayout.tabGroups[groupId]
    const remainingViews = group.views.removeItemWithId(viewId)
    const isEmptyAndRemovable = remainingViews.length === 0 && tabLayout.tabGroups.length > 1

    return isEmptyAndRemovable ? removeEmptyGroup() : updateGroupWithoutView()
}

// Reorders a view within a LookupTable to a specific index
// @sig moveViewToIndex :: (LookupTable<View>, String, Number) -> LookupTable<View>
const moveViewToIndex = (views, viewId, toIndex) => {
    const currentIndex = views.findIndex(v => v.id === viewId)
    if (currentIndex === toIndex) return views
    return views.moveElement(currentIndex, toIndex)
}

// Moves a view from one group to another; removes empty source group
// @sig moveView :: (State, Action.MoveView) -> State
const moveView = (state, action) => {
    const removeFromSource = () => {
        const remainingViews = fromGroup.views.removeItemWithId(viewId)
        const activeId = nextActiveViewId(fromGroup, viewId, remainingViews)
        return TabGroup(fromGroup.id, remainingViews, activeId, fromGroup.width)
    }

    const addToTarget = () => {
        let views = toGroup.views.addItemWithId(view)
        if (toIndex != null) views = moveViewToIndex(views, viewId, toIndex)
        return TabGroup(toGroup.id, views, view.id, toGroup.width)
    }

    const buildLayout = (from, to) => {
        const groups = tabGroups.addItemWithId(from).addItemWithId(to)
        return TabLayout(id, groups, activeTabGroupId, nextTabGroupId)
    }

    const { id, tabGroups, activeTabGroupId, nextTabGroupId } = state.tabLayout
    const { viewId, fromGroupId, toGroupId, toIndex } = action
    const fromGroup = tabGroups[fromGroupId]
    const toGroup = tabGroups[toGroupId]
    const view = fromGroup.views[viewId]

    const updatedFrom = removeFromSource()
    const updatedTo = addToTarget()
    let newLayout = buildLayout(updatedFrom, updatedTo)

    const sourceIsEmpty = updatedFrom.views.length === 0 && newLayout.tabGroups.length > 1
    if (sourceIsEmpty) newLayout = removeGroupAndResize(newLayout, fromGroupId)

    return { ...state, tabLayout: newLayout }
}

// Creates a new empty tab group; resizes all groups evenly
// @sig createTabGroup :: State -> State
const createTabGroup = state => {
    const { tabLayout } = state
    const { id, tabGroups, nextTabGroupId } = tabLayout
    if (tabGroups.length >= MAX_GROUPS) return state

    const newGroupId = `tg_${nextTabGroupId}`
    const evenWidth = 100 / (tabGroups.length + 1)
    const resizedGroups = tabGroups.map(g => resizeGroupToWidth(g, evenWidth))
    const newGroup = TabGroup(newGroupId, LookupTable([], View, 'id'), null, evenWidth)
    const updatedTabGroups = LookupTable([...resizedGroups, newGroup], TabGroup, 'id')
    const updatedLayout = TabLayout(id, updatedTabGroups, newGroupId, nextTabGroupId + 1)

    return { ...state, tabLayout: updatedLayout }
}

// Closes a tab group; moves its views to the first remaining group
// @sig closeTabGroup :: (State, Action.CloseTabGroup) -> State
const closeTabGroup = (state, action) => {
    // Transfers all views from closing group into target group
    // @sig mergeViewsInto :: TabGroup -> TabGroup
    const mergeViewsInto = target =>
        TabGroup(
            target.id,
            closingGroup.views.reduce((vs, v) => vs.addItemWithId(v), target.views),
            target.activeViewId,
            target.width,
        )

    // Resizes groups evenly, substituting mergedTarget for its original
    // @sig resizeGroups :: ([TabGroup], TabGroup) -> LookupTable<TabGroup>
    const resizeGroups = (groups, mergedTarget) => {
        const evenWidth = 100 / groups.length
        const resized = groups.map(g =>
            g.id === mergedTarget.id ? resizeGroupToWidth(mergedTarget, evenWidth) : resizeGroupToWidth(g, evenWidth),
        )
        return LookupTable(resized, TabGroup, 'id')
    }

    const buildLayout = resizedGroups => {
        const activeId = activeTabGroupId === groupId ? resizedGroups[0].id : activeTabGroupId
        return TabLayout(id, resizedGroups, activeId, nextTabGroupId)
    }

    const { id, tabGroups, activeTabGroupId, nextTabGroupId } = state.tabLayout
    if (tabGroups.length <= 1) return state

    const { groupId } = action
    const closingGroup = tabGroups[groupId]
    const remainingGroups = tabGroups.filter(g => g.id !== groupId)
    const mergedTarget = mergeViewsInto(remainingGroups[0])

    return { ...state, tabLayout: buildLayout(resizeGroups(remainingGroups, mergedTarget)) }
}

// Sets the active view within a specific tab group
// @sig setActiveView :: (State, Action.SetActiveView) -> State
const setActiveView = (state, action) => ({
    ...state,
    tabLayout: updatePath(state.tabLayout, ['tabGroups', action.groupId, 'activeViewId'], action.viewId),
})

// Sets which tab group is currently focused
// @sig setActiveTabGroup :: (State, Action.SetActiveTabGroup) -> State
const setActiveTabGroup = (state, action) => ({
    ...state,
    tabLayout: updatePath(state.tabLayout, ['activeTabGroupId'], action.groupId),
})

// Sets the width percentage of a tab group (for resizing)
// @sig setTabGroupWidth :: (State, Action.SetTabGroupWidth) -> State
const setTabGroupWidth = (state, action) => ({
    ...state,
    tabLayout: updatePath(state.tabLayout, ['tabGroups', action.groupId, 'width'], action.width),
})

// Main reducer that dispatches actions to specific handlers
// @sig rootReducer :: (State, ReduxAction) -> State
const rootReducer = (state = getInitialState(), reduxAction) => {
    // Handle raw Redux action from post handler (localStorage hydration)
    const { action } = reduxAction
    if (!Action.is(action)) return state

    // prettier-ignore
    return action.match({
        LoadFile               : () => loadFile(state, action),
        ResetTransactionFilters: () => resetTransactionFilters(state),
        SetTableLayout         : () => setTableLayout(state, action),
        SetTransactionFilter   : () => setTransactionFilter(state, action),

        // Tab layout actions
        OpenView          : () => openView(state, action),
        CloseView         : () => closeView(state, action),
        MoveView          : () => moveView(state, action),
        CreateTabGroup    : () => createTabGroup(state),
        CloseTabGroup     : () => closeTabGroup(state, action),
        SetActiveView     : () => setActiveView(state, action),
        SetActiveTabGroup : () => setActiveTabGroup(state, action),
        SetTabGroupWidth  : () => setTabGroupWidth(state, action),
    })
}

export { rootReducer }
