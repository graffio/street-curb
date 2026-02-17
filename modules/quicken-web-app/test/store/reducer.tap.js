// ABOUTME: Tests for Redux reducer actions (account list, drawer toggle, view UI state)
// ABOUTME: Verifies round-trip dispatch → reducer → new state for each action variant

import t from 'tap'
import { Reducer } from '../../src/store/reducer.js'
import { Action } from '../../src/types/action.js'
import { SortMode } from '../../src/types/sort-mode.js'
const { createEmptyState, rootReducer } = Reducer

// -----------------------------------------------------------------------------
// SetAccountListSortMode
// -----------------------------------------------------------------------------

t.test('Given initial state with Default sort mode', t => {
    const state = createEmptyState()

    t.test('When SetAccountListSortMode(Alphabetical) is dispatched', t => {
        const action = Action.SetAccountListSortMode(SortMode.Alphabetical())
        const result = rootReducer(state, { action })

        t.ok(SortMode.Alphabetical.is(result.accountListSortMode), 'Then sort mode is Alphabetical')
        t.end()
    })

    t.test('When SetAccountListSortMode(ByType) is dispatched', t => {
        const action = Action.SetAccountListSortMode(SortMode.ByType())
        const result = rootReducer(state, { action })

        t.ok(SortMode.ByType.is(result.accountListSortMode), 'Then sort mode is ByType')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// ToggleSectionCollapsed
// -----------------------------------------------------------------------------

t.test('Given initial state with no collapsed sections', t => {
    const state = createEmptyState()

    t.test('When ToggleSectionCollapsed is dispatched for a section', t => {
        const action = Action.ToggleSectionCollapsed('banking')
        const result = rootReducer(state, { action })

        t.ok(result.collapsedSections.has('banking'), 'Then section is collapsed')
        t.end()
    })
    t.end()
})

t.test('Given state with a collapsed section', t => {
    const initial = createEmptyState()
    const action1 = Action.ToggleSectionCollapsed('banking')
    const state = rootReducer(initial, { action: action1 })

    t.test('When ToggleSectionCollapsed is dispatched again for same section', t => {
        const action = Action.ToggleSectionCollapsed('banking')
        const result = rootReducer(state, { action })

        t.notOk(result.collapsedSections.has('banking'), 'Then section is expanded')
        t.end()
    })

    t.test('When ToggleSectionCollapsed is dispatched for different section', t => {
        const action = Action.ToggleSectionCollapsed('investments')
        const result = rootReducer(state, { action })

        t.ok(result.collapsedSections.has('banking'), 'Then first section stays collapsed')
        t.ok(result.collapsedSections.has('investments'), 'Then second section is collapsed')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// ToggleDrawer
// -----------------------------------------------------------------------------

t.test('Given initial state with drawer closed', t => {
    const state = createEmptyState()

    t.test('When ToggleDrawer is dispatched', t => {
        const action = Action.ToggleDrawer()
        const result = rootReducer(state, { action })

        t.equal(result.showDrawer, true, 'Then drawer is open')
        t.end()
    })

    t.test('When ToggleDrawer is dispatched twice', t => {
        const after1 = rootReducer(state, { action: Action.ToggleDrawer() })
        const after2 = rootReducer(after1, { action: Action.ToggleDrawer() })

        t.equal(after2.showDrawer, false, 'Then drawer is closed again')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// SetViewUiState — function-valued changes
// -----------------------------------------------------------------------------

t.test('Given state with existing view UI state', t => {
    const initial = createEmptyState()
    const viewId = 'rpt_test'
    const seed = Action.SetViewUiState(viewId, { treeExpansion: { node1: true } })
    const state = rootReducer(initial, { action: seed })

    t.test('When SetViewUiState is dispatched with a function-valued change', t => {
        const action = Action.SetViewUiState(viewId, { treeExpansion: old => ({ ...old, node2: true }) })
        const result = rootReducer(state, { action })
        const expansion = result.viewUiState.get(viewId).treeExpansion

        t.equal(expansion.node1, true, 'Then existing expansion is preserved')
        t.equal(expansion.node2, true, 'Then new expansion is added')
        t.end()
    })

    t.test('When SetViewUiState is dispatched with a direct value', t => {
        const action = Action.SetViewUiState(viewId, { treeExpansion: { replaced: true } })
        const result = rootReducer(state, { action })
        const expansion = result.viewUiState.get(viewId).treeExpansion

        t.equal(expansion.replaced, true, 'Then direct value replaces old state')
        t.equal(expansion.node1, undefined, 'Then old expansion is gone')
        t.end()
    })

    t.test('When SetViewUiState is dispatched with mixed function and direct values', t => {
        const action = Action.SetViewUiState(viewId, {
            treeExpansion: old => ({ ...old, node3: true }),
            columnSizing: { col1: 200 },
        })
        const result = rootReducer(state, { action })
        const uiState = result.viewUiState.get(viewId)

        t.equal(uiState.treeExpansion.node1, true, 'Then function-resolved value preserves existing')
        t.equal(uiState.treeExpansion.node3, true, 'Then function-resolved value adds new')
        t.same(uiState.columnSizing, { col1: 200 }, 'Then direct value is applied')
        t.end()
    })
    t.end()
})
