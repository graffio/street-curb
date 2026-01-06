// ABOUTME: Tests for Redux reducer account list actions
// ABOUTME: Verifies SetAccountListSortMode and ToggleSectionCollapsed handling

import t from 'tap'
import { createEmptyState, rootReducer } from '../../src/store/reducer.js'
import { Action } from '../../src/types/action.js'
import { SortMode } from '../../src/types/sort-mode.js'

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
