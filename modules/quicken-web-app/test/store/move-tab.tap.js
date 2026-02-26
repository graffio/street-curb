// ABOUTME: Tests for MoveTab action in the Redux reducer
// ABOUTME: Verifies flat-list tab movement: within-group reorder, cross-group, edge creation, auto-close

import t from 'tap'
import { LookupTable } from '@graffio/functional'
import { Reducer } from '../../src/store/reducer.js'
import { Action } from '../../src/types/action.js'
import { TabGroup } from '../../src/types/tab-group.js'
import { TabLayout } from '../../src/types/tab-layout.js'
import { View } from '../../src/types/view.js'

const { createEmptyState, rootReducer } = Reducer

const view = (id, title) => View.Report(id, 'spending', title || id)

const buildLayout = groups => {
    const tabGroups = LookupTable(
        groups.map(({ id, views, activeViewId, width }) =>
            TabGroup(id, LookupTable(views, View, 'id'), activeViewId || views[0]?.id, width || 100 / groups.length),
        ),
        TabGroup,
        'id',
    )
    return TabLayout('tl_main', tabGroups, groups[0].id, groups.length + 1)
}

// -----------------------------------------------------------------------------
// MoveTab — within-group reorder
// -----------------------------------------------------------------------------

t.test('Given a group with 3 tabs, active on first tab', t => {
    const v1 = view('rpt_v1')
    const v2 = view('rpt_v2')
    const v3 = view('rpt_v3')
    const tabLayout = buildLayout([{ id: 'tg_1', views: [v1, v2, v3], activeViewId: 'rpt_v1' }])
    const state = { ...createEmptyState(), tabLayout }

    t.test('When MoveTab right is dispatched for the first tab', t => {
        const result = rootReducer(state, { action: Action.MoveTab('right', 'rpt_v1', 'tg_1') })
        const views = result.tabLayout.tabGroups.get('tg_1').views

        t.equal(views[0].id, 'rpt_v2', 'Then v2 is now first')
        t.equal(views[1].id, 'rpt_v1', 'Then v1 moved to second position')
        t.equal(views[2].id, 'rpt_v3', 'Then v3 stays third')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// MoveTab — cross-group
// -----------------------------------------------------------------------------

t.test('Given 2 groups, active on last tab of first group', t => {
    const v1 = view('rpt_v1')
    const v2 = view('rpt_v2')
    const v3 = view('rpt_v3')
    const v4 = view('rpt_v4')
    const tabLayout = buildLayout([
        { id: 'tg_1', views: [v1, v2], activeViewId: 'rpt_v2' },
        { id: 'tg_2', views: [v3, v4], activeViewId: 'rpt_v3' },
    ])
    const state = { ...createEmptyState(), tabLayout }

    t.test('When MoveTab right is dispatched for the last tab in group 1', t => {
        const result = rootReducer(state, { action: Action.MoveTab('right', 'rpt_v2', 'tg_1') })
        const g1 = result.tabLayout.tabGroups.get('tg_1')
        const g2 = result.tabLayout.tabGroups.get('tg_2')

        t.equal(g1.views.length, 1, 'Then source group has 1 tab')
        t.equal(g2.views[0].id, 'rpt_v2', 'Then moved tab is first in destination group')
        t.equal(g2.views.length, 3, 'Then destination group has 3 tabs')
        t.equal(result.tabLayout.activeTabGroupId, 'tg_2', 'Then focus follows to destination group')
        t.equal(g2.activeViewId, 'rpt_v2', 'Then moved tab is active in destination group')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// MoveTab — edge creation
// -----------------------------------------------------------------------------

t.test('Given 2 groups, active on last tab of last group', t => {
    const v1 = view('rpt_v1')
    const v2 = view('rpt_v2')
    const v3 = view('rpt_v3')
    const v4 = view('rpt_v4')
    const tabLayout = buildLayout([
        { id: 'tg_1', views: [v1, v2], activeViewId: 'rpt_v1' },
        { id: 'tg_2', views: [v3, v4], activeViewId: 'rpt_v4' },
    ])
    const state = { ...createEmptyState(), tabLayout }

    t.test('When MoveTab right is dispatched for the last tab in last group', t => {
        const result = rootReducer(state, { action: Action.MoveTab('right', 'rpt_v4', 'tg_2') })
        const groups = result.tabLayout.tabGroups

        t.equal(groups.length, 3, 'Then a new group is created')
        t.equal(groups[2].views[0].id, 'rpt_v4', 'Then moved tab is in the new group')
        t.equal(groups[2].views.length, 1, 'Then new group has exactly 1 tab')
        t.equal(result.tabLayout.activeTabGroupId, groups[2].id, 'Then focus follows to new group')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// MoveTab — MAX_GROUPS no-op
// -----------------------------------------------------------------------------

t.test('Given 4 groups (MAX_GROUPS), active on last tab of last group', t => {
    const v1 = view('rpt_v1')
    const v2 = view('rpt_v2')
    const v3 = view('rpt_v3')
    const v4 = view('rpt_v4')
    const tabLayout = buildLayout([
        { id: 'tg_1', views: [v1] },
        { id: 'tg_2', views: [v2] },
        { id: 'tg_3', views: [v3] },
        { id: 'tg_4', views: [v4], activeViewId: 'rpt_v4' },
    ])
    const state = { ...createEmptyState(), tabLayout }

    t.test('When MoveTab right is dispatched at the rightmost edge', t => {
        const result = rootReducer(state, { action: Action.MoveTab('right', 'rpt_v4', 'tg_4') })

        t.equal(result.tabLayout.tabGroups.length, 4, 'Then group count stays at 4')
        t.equal(result.tabLayout.tabGroups.get('tg_4').views[0].id, 'rpt_v4', 'Then tab stays in place')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// MoveTab — empty group auto-close
// -----------------------------------------------------------------------------

t.test('Given 2 groups where first group has 1 tab', t => {
    const v1 = view('rpt_v1')
    const v2 = view('rpt_v2')
    const v3 = view('rpt_v3')
    const tabLayout = buildLayout([
        { id: 'tg_1', views: [v1], activeViewId: 'rpt_v1' },
        { id: 'tg_2', views: [v2, v3], activeViewId: 'rpt_v2' },
    ])
    const state = { ...createEmptyState(), tabLayout }

    t.test('When MoveTab right moves the only tab out of group 1', t => {
        const result = rootReducer(state, { action: Action.MoveTab('right', 'rpt_v1', 'tg_1') })
        const groups = result.tabLayout.tabGroups

        t.equal(groups.length, 1, 'Then empty source group is removed')
        t.equal(groups[0].views[0].id, 'rpt_v1', 'Then moved tab is first in remaining group')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// MoveTab — single tab single group no-op
// -----------------------------------------------------------------------------

t.test('Given a single tab in a single group', t => {
    const v1 = view('rpt_v1')
    const tabLayout = buildLayout([{ id: 'tg_1', views: [v1] }])
    const state = { ...createEmptyState(), tabLayout }

    t.test('When MoveTab right is dispatched', t => {
        const result = rootReducer(state, { action: Action.MoveTab('right', 'rpt_v1', 'tg_1') })

        t.equal(result.tabLayout.tabGroups.length, 1, 'Then still 1 group')
        t.equal(result.tabLayout.tabGroups[0].views[0].id, 'rpt_v1', 'Then tab is still there')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// MoveTab — non-active tab targeting
// -----------------------------------------------------------------------------

t.test('Given 2 groups with active tab in group 2', t => {
    const v1 = view('rpt_v1')
    const v2 = view('rpt_v2')
    const v3 = view('rpt_v3')
    const tabLayout = buildLayout([
        { id: 'tg_1', views: [v1, v2], activeViewId: 'rpt_v1' },
        { id: 'tg_2', views: [v3], activeViewId: 'rpt_v3' },
    ])
    const state = { ...createEmptyState(), tabLayout: { ...tabLayout, activeTabGroupId: 'tg_2' } }

    t.test('When MoveTab is dispatched targeting a non-active tab in group 1', t => {
        const result = rootReducer(state, { action: Action.MoveTab('right', 'rpt_v2', 'tg_1') })
        const g2 = result.tabLayout.tabGroups.get('tg_2')

        t.equal(g2.views.length, 2, 'Then the targeted tab moved to group 2')
        t.equal(g2.views[0].id, 'rpt_v2', 'Then the non-active tab is in destination')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// MoveTab — invalid viewId guard
// -----------------------------------------------------------------------------

t.test('Given a standard 2-group layout', t => {
    const v1 = view('rpt_v1')
    const v2 = view('rpt_v2')
    const tabLayout = buildLayout([
        { id: 'tg_1', views: [v1] },
        { id: 'tg_2', views: [v2] },
    ])
    const state = { ...createEmptyState(), tabLayout }

    t.test('When MoveTab is dispatched with a stale viewId', t => {
        const result = rootReducer(state, { action: Action.MoveTab('right', 'rpt_nonexistent', 'tg_1') })

        t.equal(result.tabLayout.tabGroups.length, 2, 'Then state is unchanged')
        t.equal(result.tabLayout.tabGroups.get('tg_1').views[0].id, 'rpt_v1', 'Then tabs are untouched')
        t.end()
    })
    t.end()
})
