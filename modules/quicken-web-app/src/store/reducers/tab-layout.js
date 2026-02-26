// ABOUTME: Tab layout action handlers for the Redux reducer
// ABOUTME: Manages tab groups, views, and layout state

import { LookupTable, updateLookupTablePath } from '@graffio/functional'
import { TabGroup, TabLayout as TabLayoutType, View } from '../../types/index.js'
import { TransactionFilters } from './transaction-filters.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Finds the next active view ID after removing a view
    // @sig toNextActiveViewId :: (TabGroup, String, LookupTable<View>) -> String?
    toNextActiveViewId: (group, removedViewId, remainingViews) =>
        group.activeViewId === removedViewId ? remainingViews[0]?.id : group.activeViewId,

    // Removes a group and evenly resizes remaining groups
    // @sig toLayoutWithoutGroup :: (TabLayout, String) -> TabLayout
    toLayoutWithoutGroup: (tabLayout, groupIdToRemove) => {
        const { id, tabGroups, activeTabGroupId, nextTabGroupId } = tabLayout
        const remainingGroups = tabGroups.filter(g => g.id !== groupIdToRemove)
        const evenWidth = 100 / remainingGroups.length
        const resizedGroups = LookupTable(
            remainingGroups.map(g => F.createResizedGroup(g, evenWidth)),
            TabGroup,
            'id',
        )
        const newActiveId = activeTabGroupId === groupIdToRemove ? resizedGroups[0].id : activeTabGroupId
        return TabLayoutType(id, resizedGroups, newActiveId, nextTabGroupId)
    },

    // Flattens tab groups into a single ordered list of { view, groupId } entries
    // @sig toFlatTabList :: LookupTable<TabGroup> -> [{ view: View, groupId: String }]
    toFlatTabList: tabGroups =>
        tabGroups.reduce(
            (acc, group) => [...acc, ...Array.from(group.views, v => ({ view: v, groupId: group.id }))],
            [],
        ),

    // Creates a new group at the edge and moves a tab into it; auto-closes empty source
    // @sig toLayoutWithEdgeGroup :: (TabLayout, String, String, String) -> TabLayout
    toLayoutWithEdgeGroup: (tabLayout, viewId, sourceGroupId, direction) => {
        const { id, tabGroups, nextTabGroupId } = tabLayout
        const { views, width } = tabGroups[sourceGroupId]
        const view = views[viewId]
        const newGroupId = `tg_${nextTabGroupId}`
        const newGroup = TabGroup(newGroupId, LookupTable([view], View, 'id'), viewId, 0)

        const remainingViews = views.removeItemWithId(viewId)
        const newActiveViewId = T.toNextActiveViewId(tabGroups[sourceGroupId], viewId, remainingViews)
        const updatedSource = TabGroup(sourceGroupId, remainingViews, newActiveViewId, width)

        const sourceIndex = tabGroups.findIndex(g => g.id === sourceGroupId)
        const insertIndex = direction === 'right' ? sourceIndex + 1 : sourceIndex
        const groupArray = [...tabGroups.addItemWithId(updatedSource)]
        const withNewGroup = [...groupArray.slice(0, insertIndex), newGroup, ...groupArray.slice(insertIndex)]

        const evenWidth = 100 / withNewGroup.length
        const resized = withNewGroup.map(g => F.createResizedGroup(g, evenWidth))
        const newTabGroups = LookupTable(resized, TabGroup, 'id')
        let layout = TabLayoutType(id, newTabGroups, newGroupId, nextTabGroupId + 1)

        if (updatedSource.views.length === 0 && layout.tabGroups.length > 1)
            layout = T.toLayoutWithoutGroup(layout, sourceGroupId)

        return layout
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Creates a copy of a tab group with a new width
    // @sig createResizedGroup :: (TabGroup, Number) -> TabGroup
    createResizedGroup: (group, width) => {
        const { activeViewId, id, views } = group
        return TabGroup(id, views, activeViewId, width)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const MAX_GROUPS = 4

// Opens a view in a tab group; activates existing view if already open
// @sig openView :: (State, Action.OpenView) -> State
const openView = (state, action) => {
    // Looks up which tab group contains a view by ID
    // @sig findGroupContainingView :: (TabLayout, String) -> TabGroup|undefined
    const findGroupContainingView = (layout, viewId) => layout.tabGroups.find(g => g.views[viewId])

    // Updates layout to mark a view as active in its group
    // @sig activateView :: (TabLayout, String, String) -> TabLayout
    const activateView = (layout, groupId, viewId) => {
        const updated = updateLookupTablePath(layout, ['tabGroups', groupId, 'activeViewId'], viewId)
        return updateLookupTablePath(updated, ['activeTabGroupId'], groupId)
    }

    // Creates a transaction filter for the view if not already present
    // @sig maybeAddFilter :: (State, View) -> State
    const maybeAddFilter = (newState, v) => {
        if (state.transactionFilters.get(v.id)) return newState
        const filter = TransactionFilters.createDefaultFilter(v.id)
        return { ...newState, transactionFilters: newState.transactionFilters.addItemWithId(filter) }
    }

    const activateExisting = group => ({ ...state, tabLayout: activateView(tabLayout, group.id, view.id) })

    const addToGroup = targetId => {
        const layout = updateLookupTablePath(tabLayout, ['tabGroups', targetId, 'views'], vs => vs.addItemWithId(view))
        const withLayout = { ...state, tabLayout: activateView(layout, targetId, view.id) }
        return maybeAddFilter(withLayout, view)
    }

    const { tabLayout } = state
    const { view, groupId } = action
    const existingGroup = findGroupContainingView(tabLayout, view.id)
    return existingGroup ? activateExisting(existingGroup) : addToGroup(groupId || tabLayout.activeTabGroupId)
}

// Closes a view; removes empty group if not the last one
// @sig closeView :: (State, Action.CloseView) -> State
const closeView = (state, action) => {
    const { tabLayout } = state
    const { viewId, groupId } = action
    const group = tabLayout.tabGroups[groupId]
    const remainingViews = group.views.removeItemWithId(viewId)
    const isEmptyAndRemovable = remainingViews.length === 0 && tabLayout.tabGroups.length > 1

    if (isEmptyAndRemovable) return { ...state, tabLayout: T.toLayoutWithoutGroup(tabLayout, groupId) }

    let layout = updateLookupTablePath(tabLayout, ['tabGroups', groupId, 'views'], () => remainingViews)
    layout = updateLookupTablePath(
        layout,
        ['tabGroups', groupId, 'activeViewId'],
        T.toNextActiveViewId(group, viewId, remainingViews),
    )
    return { ...state, tabLayout: layout }
}

// Moves a view from one group to another; removes empty source group
// @sig moveView :: (State, Action.MoveView) -> State
const moveView = (state, action) => {
    // Reorders views to place a view at a specific index
    // @sig moveViewToIndex :: (LookupTable<View>, String, Number) -> LookupTable<View>
    const moveViewToIndex = (viewList, targetViewId, targetIndex) => {
        const currentIndex = viewList.findIndex(v => v.id === targetViewId)
        if (currentIndex === targetIndex) return viewList
        return viewList.moveElement(currentIndex, targetIndex)
    }

    const { id, tabGroups, activeTabGroupId, nextTabGroupId } = state.tabLayout
    const { viewId, fromGroupId, toGroupId, toIndex } = action
    const fromGroup = tabGroups[fromGroupId]
    const toGroup = tabGroups[toGroupId]
    const { id: fromId, views: fromViews, width: fromWidth } = fromGroup
    const { id: toId, views: toViews, width: toWidth } = toGroup
    const view = fromViews[viewId]

    const remainingViews = fromViews.removeItemWithId(viewId)
    const activeId = T.toNextActiveViewId(fromGroup, viewId, remainingViews)
    const updatedFrom = TabGroup(fromId, remainingViews, activeId, fromWidth)

    let views = toViews.addItemWithId(view)
    if (toIndex !== undefined) views = moveViewToIndex(views, viewId, toIndex)
    const updatedTo = TabGroup(toId, views, view.id, toWidth)

    const groups = tabGroups.addItemWithId(updatedFrom).addItemWithId(updatedTo)
    let newLayout = TabLayoutType(id, groups, activeTabGroupId, nextTabGroupId)

    const sourceIsEmpty = updatedFrom.views.length === 0 && newLayout.tabGroups.length > 1
    if (sourceIsEmpty) newLayout = T.toLayoutWithoutGroup(newLayout, fromGroupId)

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
    const resizedGroups = tabGroups.map(g => F.createResizedGroup(g, evenWidth))
    const newGroup = TabGroup(newGroupId, LookupTable([], View, 'id'), undefined, evenWidth)
    const updatedTabGroups = LookupTable([...resizedGroups, newGroup], TabGroup, 'id')
    const updatedLayout = TabLayoutType(id, updatedTabGroups, newGroupId, nextTabGroupId + 1)

    return { ...state, tabLayout: updatedLayout }
}

// Closes a tab group; moves its views to the first remaining group
// @sig closeTabGroup :: (State, Action.CloseTabGroup) -> State
const closeTabGroup = (state, action) => {
    const { id, tabGroups, activeTabGroupId, nextTabGroupId } = state.tabLayout
    if (tabGroups.length <= 1) return state

    const { groupId } = action
    const closingGroup = tabGroups[groupId]
    const remainingGroups = tabGroups.filter(g => g.id !== groupId)
    const targetGroup = remainingGroups[0]

    // prettier-ignore
    const { id: targetId, views: targetViews, activeViewId: targetActiveViewId, width: targetWidth } = targetGroup
    const mergedViews = closingGroup.views.reduce((vs, v) => vs.addItemWithId(v), targetViews)
    const mergedTarget = TabGroup(targetId, mergedViews, targetActiveViewId, targetWidth)

    const evenWidth = 100 / remainingGroups.length
    const resized = remainingGroups.map(g =>
        g.id === mergedTarget.id ? F.createResizedGroup(mergedTarget, evenWidth) : F.createResizedGroup(g, evenWidth),
    )
    const resizedGroups = LookupTable(resized, TabGroup, 'id')

    const newActiveId = activeTabGroupId === groupId ? resizedGroups[0].id : activeTabGroupId
    return { ...state, tabLayout: TabLayoutType(id, resizedGroups, newActiveId, nextTabGroupId) }
}

// Sets the active view within a specific tab group
// @sig setActiveView :: (State, Action.SetActiveView) -> State
const setActiveView = (state, action) => ({
    ...state,
    tabLayout: updateLookupTablePath(state.tabLayout, ['tabGroups', action.groupId, 'activeViewId'], action.viewId),
})

// Sets which tab group is currently focused
// @sig setActiveTabGroup :: (State, Action.SetActiveTabGroup) -> State
const setActiveTabGroup = (state, action) => ({
    ...state,
    tabLayout: updateLookupTablePath(state.tabLayout, ['activeTabGroupId'], action.groupId),
})

// Sets the width percentage of a tab group (for resizing)
// @sig setTabGroupWidth :: (State, Action.SetTabGroupWidth) -> State
const setTabGroupWidth = (state, action) => ({
    ...state,
    tabLayout: updateLookupTablePath(state.tabLayout, ['tabGroups', action.groupId, 'width'], action.width),
})

// Cycles active tab one position in the flat cross-group list (wraps at edges)
// @sig handleCycleTab :: (State, Action.CycleTab) -> State
const handleCycleTab = (state, action) => {
    const { direction } = action
    if (direction !== 'left' && direction !== 'right') throw new Error(`CycleTab: invalid direction '${direction}'`)

    const { tabLayout } = state
    const { tabGroups, activeTabGroupId } = tabLayout
    const activeGroup = tabGroups[activeTabGroupId]
    const flatList = T.toFlatTabList(tabGroups)
    const { length } = flatList
    if (length <= 1) return state

    const currentIndex = flatList.findIndex(entry => entry.view.id === activeGroup.activeViewId)
    const offset = direction === 'right' ? 1 : -1
    const { view, groupId: targetGroupId } = flatList[(currentIndex + offset + length) % length]

    let layout = updateLookupTablePath(tabLayout, ['tabGroups', targetGroupId, 'activeViewId'], view.id)
    layout = updateLookupTablePath(layout, ['activeTabGroupId'], targetGroupId)
    return { ...state, tabLayout: layout }
}

// Moves a specific tab one position in the flat list (reorder, cross-group, or create group)
// @sig moveTab :: (State, Action.MoveTab) -> State
const moveTab = (state, action) => {
    const { direction, viewId, groupId } = action
    if (direction !== 'left' && direction !== 'right') throw new Error(`MoveTab: invalid direction '${direction}'`)

    const { tabLayout } = state
    const { id, tabGroups, nextTabGroupId } = tabLayout
    const group = tabGroups[groupId]

    // Context menu captures viewId/groupId at render time; a rapid close or move can make them stale
    if (!group || !group.views[viewId]) return state

    const { views, width } = group
    const flatList = T.toFlatTabList(tabGroups)
    const { length } = flatList
    const currentFlatIndex = flatList.findIndex(entry => entry.view.id === viewId && entry.groupId === groupId)
    const offset = direction === 'right' ? 1 : -1
    const targetFlatIndex = currentFlatIndex + offset
    const isAtEdge = targetFlatIndex < 0 || targetFlatIndex >= length

    // At outermost edge with MAX_GROUPS — no-op
    if (isAtEdge && tabGroups.length >= MAX_GROUPS) return state

    // At outermost edge — create new group and move tab there
    if (isAtEdge) return { ...state, tabLayout: T.toLayoutWithEdgeGroup(tabLayout, viewId, groupId, direction) }

    const { groupId: targetGroupId } = flatList[targetFlatIndex]

    // Within-group reorder
    if (targetGroupId === groupId) {
        const viewIndex = views.findIndex(v => v.id === viewId)
        const reorderedViews = views.moveElement(viewIndex, viewIndex + offset)
        const updatedGroup = TabGroup(groupId, reorderedViews, viewId, width)
        const groups = tabGroups.addItemWithId(updatedGroup)
        return { ...state, tabLayout: TabLayoutType(id, groups, groupId, nextTabGroupId) }
    }

    // Cross-group move
    const view = views[viewId]
    const targetGroup = tabGroups[targetGroupId]

    const remainingViews = views.removeItemWithId(viewId)
    const newActiveViewId = T.toNextActiveViewId(group, viewId, remainingViews)
    const updatedSource = TabGroup(groupId, remainingViews, newActiveViewId, width)

    const toIndex = direction === 'right' ? 0 : targetGroup.views.length
    let destViews = targetGroup.views.addItemWithId(view)
    const currentIdx = destViews.findIndex(v => v.id === viewId)
    if (currentIdx !== toIndex) destViews = destViews.moveElement(currentIdx, toIndex)
    const updatedDest = TabGroup(targetGroupId, destViews, viewId, targetGroup.width)

    const groups = tabGroups.addItemWithId(updatedSource).addItemWithId(updatedDest)
    let newLayout = TabLayoutType(id, groups, targetGroupId, nextTabGroupId)

    if (updatedSource.views.length === 0 && newLayout.tabGroups.length > 1)
        newLayout = T.toLayoutWithoutGroup(newLayout, groupId)

    return { ...state, tabLayout: newLayout }
}

// Moves a tab into a new group to the right; no-op at MAX_GROUPS
// @sig moveToNewGroup :: (State, Action.MoveToNewGroup) -> State
const moveToNewGroup = (state, action) => {
    const { viewId, groupId } = action
    const { tabLayout } = state
    const { tabGroups } = tabLayout
    if (tabGroups.length >= MAX_GROUPS) return state
    const group = tabGroups[groupId]
    if (!group || !group.views[viewId]) return state
    return { ...state, tabLayout: T.toLayoutWithEdgeGroup(tabLayout, viewId, groupId, 'right') }
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const TabLayout = {
    MAX_GROUPS,
    closeTabGroup,
    closeView,
    createTabGroup,
    cycleTab: handleCycleTab,
    moveTab,
    moveToNewGroup,
    moveView,
    openView,
    setActiveTabGroup,
    setActiveView,
    setTabGroupWidth,
}

export { TabLayout }
