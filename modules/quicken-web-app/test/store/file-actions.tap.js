// ABOUTME: Tests for file-related effect-only Action variants
// ABOUTME: Verifies reducer handles InitializeSystem, OpenFile, ReopenFile without error

import t from 'tap'
import { Reducer } from '../../src/store/reducer.js'
import { Action } from '../../src/types/action.js'
const { createEmptyState, rootReducer } = Reducer

t.test('Given initial state', t => {
    const state = createEmptyState()

    t.test('When InitializeSystem is dispatched', t => {
        const action = Action.InitializeSystem()
        const result = rootReducer(state, { action })

        t.equal(result, state, 'Then state is returned unchanged (effect-only Action)')
        t.end()
    })

    t.test('When OpenFile is dispatched', t => {
        const action = Action.OpenFile()
        const result = rootReducer(state, { action })

        t.equal(result, state, 'Then state is returned unchanged (effect-only Action)')
        t.end()
    })

    t.test('When ReopenFile is dispatched', t => {
        const action = Action.ReopenFile()
        const result = rootReducer(state, { action })

        t.equal(result, state, 'Then state is returned unchanged (effect-only Action)')
        t.end()
    })

    t.end()
})
