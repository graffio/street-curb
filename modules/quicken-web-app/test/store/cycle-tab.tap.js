// ABOUTME: Tests for CycleTab action in the Redux reducer
// ABOUTME: Verifies flat-list tab cycling across groups with wrapping

import t from 'tap'
import { LookupTable } from '@graffio/functional'
import { Reducer } from '../../src/store/reducer.js'
import { Action } from '../../src/types/action.js'
import { TabGroup } from '../../src/types/tab-group.js'
import { TabLayout } from '../../src/types/tab-layout.js'
import { View } from '../../src/types/view.js'

const { createEmptyState, rootReducer } = Reducer

// Builds state with the given tab group structure
// @sig buildState :: [[View]] -> State
const buildState = (groupViews, activeGroupIndex = 0, activeViewIndex = 0) => {
    const groups = groupViews.map((views, i) => {
        const groupId = `tg_${i + 1}`
        const viewTable = LookupTable(views, View, 'id')
        const activeViewId = views[i === activeGroupIndex ? activeViewIndex : 0]?.id
        return TabGroup(groupId, viewTable, activeViewId, 100 / groupViews.length)
    })
    const tabGroups = LookupTable(groups, TabGroup, 'id')
    const activeTabGroupId = groups[activeGroupIndex].id
    const tabLayout = TabLayout('tl_main', tabGroups, activeTabGroupId, groupViews.length + 1)
    const base = createEmptyState()
    return { ...base, tabLayout }
}

const view = (id, title) => View.Report(id, 'spending', title || id)

// -----------------------------------------------------------------------------
// CycleTab — within same group
// -----------------------------------------------------------------------------

t.test('Given 2 groups with 2 tabs each, active on first tab of first group', t => {
    const v1 = view('rpt_v1', 'View 1')
    const v2 = view('rpt_v2', 'View 2')
    const v3 = view('rpt_v3', 'View 3')
    const v4 = view('rpt_v4', 'View 4')
    const state = buildState([
        [v1, v2],
        [v3, v4],
    ])

    t.test('When CycleTab right is dispatched', t => {
        const result = rootReducer(state, { action: Action.CycleTab('right') })

        t.equal(
            result.tabLayout.tabGroups.get('tg_1').activeViewId,
            'rpt_v2',
            'Then active view advances to next tab in same group',
        )
        t.equal(result.tabLayout.activeTabGroupId, 'tg_1', 'Then active group stays the same')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// CycleTab — cross-group boundary
// -----------------------------------------------------------------------------

t.test('Given 2 groups with 2 tabs each, active on last tab of first group', t => {
    const v1 = view('rpt_v1', 'View 1')
    const v2 = view('rpt_v2', 'View 2')
    const v3 = view('rpt_v3', 'View 3')
    const v4 = view('rpt_v4', 'View 4')
    const groups = [
        TabGroup('tg_1', LookupTable([v1, v2], View, 'id'), 'rpt_v2', 50),
        TabGroup('tg_2', LookupTable([v3, v4], View, 'id'), 'rpt_v3', 50),
    ]
    const tabGroups = LookupTable(groups, TabGroup, 'id')
    const tabLayout = TabLayout('tl_main', tabGroups, 'tg_1', 3)
    const state = { ...createEmptyState(), tabLayout }

    t.test('When CycleTab right is dispatched', t => {
        const result = rootReducer(state, { action: Action.CycleTab('right') })

        t.equal(
            result.tabLayout.tabGroups.get('tg_2').activeViewId,
            'rpt_v3',
            'Then first tab in next group becomes active',
        )
        t.equal(result.tabLayout.activeTabGroupId, 'tg_2', 'Then active group changes to the next group')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// CycleTab — wrap at end
// -----------------------------------------------------------------------------

t.test('Given 2 groups, active on last tab of last group', t => {
    const v1 = view('rpt_v1', 'View 1')
    const v2 = view('rpt_v2', 'View 2')
    const v3 = view('rpt_v3', 'View 3')
    const v4 = view('rpt_v4', 'View 4')
    const groups = [
        TabGroup('tg_1', LookupTable([v1, v2], View, 'id'), 'rpt_v1', 50),
        TabGroup('tg_2', LookupTable([v3, v4], View, 'id'), 'rpt_v4', 50),
    ]
    const tabGroups = LookupTable(groups, TabGroup, 'id')
    const tabLayout = TabLayout('tl_main', tabGroups, 'tg_2', 3)
    const state = { ...createEmptyState(), tabLayout }

    t.test('When CycleTab right is dispatched', t => {
        const result = rootReducer(state, { action: Action.CycleTab('right') })

        t.equal(result.tabLayout.tabGroups.get('tg_1').activeViewId, 'rpt_v1', 'Then wraps to first tab of first group')
        t.equal(result.tabLayout.activeTabGroupId, 'tg_1', 'Then active group wraps to first group')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// CycleTab — wrap at start (left)
// -----------------------------------------------------------------------------

t.test('Given 2 groups, active on first tab of first group', t => {
    const v1 = view('rpt_v1', 'View 1')
    const v2 = view('rpt_v2', 'View 2')
    const v3 = view('rpt_v3', 'View 3')
    const v4 = view('rpt_v4', 'View 4')
    const state = buildState([
        [v1, v2],
        [v3, v4],
    ])

    t.test('When CycleTab left is dispatched', t => {
        const result = rootReducer(state, { action: Action.CycleTab('left') })

        t.equal(result.tabLayout.tabGroups.get('tg_2').activeViewId, 'rpt_v4', 'Then wraps to last tab of last group')
        t.equal(result.tabLayout.activeTabGroupId, 'tg_2', 'Then active group wraps to last group')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// CycleTab — single tab no-op
// -----------------------------------------------------------------------------

t.test('Given a single tab in a single group', t => {
    const v1 = view('rpt_v1', 'View 1')
    const state = buildState([[v1]])

    t.test('When CycleTab right is dispatched', t => {
        const result = rootReducer(state, { action: Action.CycleTab('right') })

        t.equal(result.tabLayout.tabGroups.get('tg_1').activeViewId, 'rpt_v1', 'Then same tab stays active')
        t.equal(result.tabLayout.activeTabGroupId, 'tg_1', 'Then active group stays the same')
        t.end()
    })

    t.test('When CycleTab left is dispatched', t => {
        const result = rootReducer(state, { action: Action.CycleTab('left') })

        t.equal(result.tabLayout.tabGroups.get('tg_1').activeViewId, 'rpt_v1', 'Then same tab stays active')
        t.end()
    })
    t.end()
})
