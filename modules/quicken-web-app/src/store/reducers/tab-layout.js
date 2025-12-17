// ABOUTME: Tab layout action handlers for the Redux reducer
// ABOUTME: Manages tab groups, views, and layout state

import { LookupTable, updateLookupTablePath } from '@graffio/functional'
import { TabGroup, TabLayout, View } from '../../types/index.js'

// Creates a copy of a tab group with a new width
// @sig resizeGroupToWidth :: (TabGroup, Number) -> TabGroup
const resizeGroupToWidth = (group, width) => {
    const { activeViewId, id, views } = group
    return TabGroup(id, views, activeViewId, width)
}

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

const MAX_GROUPS = 4

// Opens a view in a tab group; activates existing view if already open
// @sig openView :: (State, Action.OpenView) -> State
const openView = (state, action) => {
    // @sig findGroupContainingView :: (TabLayout, String) -> TabGroup|undefined
    const findGroupContainingView = (layout, viewId) => layout.tabGroups.find(g => g.views[viewId])

    // @sig activateView :: (TabLayout, String, String) -> TabLayout
    const activateView = (layout, groupId, viewId) => {
        const updated = updateLookupTablePath(layout, ['tabGroups', groupId, 'activeViewId'], viewId)
        return updateLookupTablePath(updated, ['activeTabGroupId'], groupId)
    }

    const activateExisting = group => ({ ...state, tabLayout: activateView(tabLayout, group.id, view.id) })

    const addToGroup = targetId => {
        const layout = updateLookupTablePath(tabLayout, ['tabGroups', targetId, 'views'], vs => vs.addItemWithId(view))
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
    const { tabLayout } = state
    const { viewId, groupId } = action
    const group = tabLayout.tabGroups[groupId]
    const remainingViews = group.views.removeItemWithId(viewId)
    const isEmptyAndRemovable = remainingViews.length === 0 && tabLayout.tabGroups.length > 1

    if (isEmptyAndRemovable) return { ...state, tabLayout: removeGroupAndResize(tabLayout, groupId) }

    let layout = updateLookupTablePath(tabLayout, ['tabGroups', groupId, 'views'], () => remainingViews)
    layout = updateLookupTablePath(
        layout,
        ['tabGroups', groupId, 'activeViewId'],
        nextActiveViewId(group, viewId, remainingViews),
    )
    return { ...state, tabLayout: layout }
}

// Moves a view from one group to another; removes empty source group
// @sig moveView :: (State, Action.MoveView) -> State
const moveView = (state, action) => {
    // @sig moveViewToIndex :: (LookupTable<View>, String, Number) -> LookupTable<View>
    const moveViewToIndex = (viewList, targetViewId, targetIndex) => {
        const currentIndex = viewList.findIndex(v => v.id === targetViewId)
        if (currentIndex === targetIndex) return viewList
        return viewList.moveElement(currentIndex, targetIndex)
    }

    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const { id, tabGroups, activeTabGroupId, nextTabGroupId } = state.tabLayout
    const { viewId, fromGroupId, toGroupId, toIndex } = action
    const fromGroup = tabGroups[fromGroupId]
    const toGroup = tabGroups[toGroupId]
    const { id: fromId, views: fromViews, width: fromWidth } = fromGroup
    const { id: toId, views: toViews, width: toWidth } = toGroup
    const view = fromViews[viewId]

    const remainingViews = fromViews.removeItemWithId(viewId)
    const activeId = nextActiveViewId(fromGroup, viewId, remainingViews)
    const updatedFrom = TabGroup(fromId, remainingViews, activeId, fromWidth)

    let views = toViews.addItemWithId(view)
    if (toIndex != null) views = moveViewToIndex(views, viewId, toIndex)
    const updatedTo = TabGroup(toId, views, view.id, toWidth)

    const groups = tabGroups.addItemWithId(updatedFrom).addItemWithId(updatedTo)
    let newLayout = TabLayout(id, groups, activeTabGroupId, nextTabGroupId)

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
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const { id, tabGroups, activeTabGroupId, nextTabGroupId } = state.tabLayout
    if (tabGroups.length <= 1) return state

    const { groupId } = action
    const closingGroup = tabGroups[groupId]
    const remainingGroups = tabGroups.filter(g => g.id !== groupId)

    // Transfer views from closing group to first remaining group
    const {
        id: targetId,
        views: targetViews,
        activeViewId: targetActiveViewId,
        width: targetWidth,
    } = remainingGroups[0]
    const mergedViews = closingGroup.views.reduce((vs, v) => vs.addItemWithId(v), targetViews)
    const mergedTarget = TabGroup(targetId, mergedViews, targetActiveViewId, targetWidth)

    const evenWidth = 100 / remainingGroups.length
    const resized = remainingGroups.map(g =>
        g.id === mergedTarget.id ? resizeGroupToWidth(mergedTarget, evenWidth) : resizeGroupToWidth(g, evenWidth),
    )
    const resizedGroups = LookupTable(resized, TabGroup, 'id')

    const newActiveId = activeTabGroupId === groupId ? resizedGroups[0].id : activeTabGroupId
    return { ...state, tabLayout: TabLayout(id, resizedGroups, newActiveId, nextTabGroupId) }
}

// Sets the active view within a specific tab group
// @sig setActiveView :: (State, Action.SetActiveView) -> State
const setActiveView = (state, action) => ({
    ...state,
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    tabLayout: updateLookupTablePath(state.tabLayout, ['tabGroups', action.groupId, 'activeViewId'], action.viewId),
})

// Sets which tab group is currently focused
// @sig setActiveTabGroup :: (State, Action.SetActiveTabGroup) -> State
const setActiveTabGroup = (state, action) => ({
    ...state,
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    tabLayout: updateLookupTablePath(state.tabLayout, ['activeTabGroupId'], action.groupId),
})

// Sets the width percentage of a tab group (for resizing)
// @sig setTabGroupWidth :: (State, Action.SetTabGroupWidth) -> State
const setTabGroupWidth = (state, action) => ({
    ...state,
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    tabLayout: updateLookupTablePath(state.tabLayout, ['tabGroups', action.groupId, 'width'], action.width),
})

export {
    closeTabGroup,
    closeView,
    createTabGroup,
    moveView,
    openView,
    setActiveTabGroup,
    setActiveView,
    setTabGroupWidth,
}
