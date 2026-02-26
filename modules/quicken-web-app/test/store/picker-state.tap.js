// ABOUTME: Tests for picker state actions round-trip (SetPickerOpen, SetPickerHighlight)
// ABOUTME: Verifies dispatch → reducer → new state for picker open/close and highlight navigation

import t from 'tap'
import { Reducer } from '../../src/store/reducer.js'
import { Action } from '../../src/types/action.js'
const { createEmptyState, rootReducer } = Reducer

t.test('Given initial state with no picker open', t => {
    const state = createEmptyState()

    t.test('When SetPickerOpen("reports") is dispatched', t => {
        const action = Action.SetPickerOpen('reports')
        const result = rootReducer(state, { action })

        t.equal(result.pickerType, 'reports', 'Then pickerType is "reports"')
        t.equal(result.pickerHighlight, 0, 'Then pickerHighlight is reset to 0')
        t.end()
    })
    t.end()
})

t.test('Given state with picker open', t => {
    const initial = createEmptyState()
    const state = rootReducer(initial, { action: Action.SetPickerOpen('reports') })

    t.test('When SetPickerOpen(undefined) is dispatched', t => {
        const action = Action.SetPickerOpen(undefined)
        const result = rootReducer(state, { action })

        t.equal(result.pickerType, undefined, 'Then pickerType is undefined')
        t.end()
    })
    t.end()
})

t.test('Given state with picker open', t => {
    const initial = createEmptyState()
    const state = rootReducer(initial, { action: Action.SetPickerOpen('reports') })

    t.test('When SetPickerHighlight(1) is dispatched', t => {
        const result = rootReducer(state, { action: Action.SetPickerHighlight(1) })

        t.equal(result.pickerHighlight, 1, 'Then pickerHighlight is 1')
        t.end()
    })

    t.test('When highlight is 1 and SetPickerOpen is dispatched again', t => {
        const withHighlight = rootReducer(state, { action: Action.SetPickerHighlight(1) })
        const result = rootReducer(withHighlight, { action: Action.SetPickerOpen('reports') })

        t.equal(result.pickerHighlight, 0, 'Then pickerHighlight resets to 0')
        t.end()
    })
    t.end()
})
