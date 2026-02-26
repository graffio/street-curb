// ABOUTME: Tests for picker state actions round-trip (SetPickerOpen, SetPickerHighlight, SetPickerSearch, SetPickerPosition)
// ABOUTME: Verifies dispatch → reducer → new state for picker open/close, highlight, search, and position

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

t.test('Given initial state', t => {
    const state = createEmptyState()

    t.test('When SetPickerSearch("foo") is dispatched', t => {
        const result = rootReducer(state, { action: Action.SetPickerSearch('foo') })

        t.equal(result.pickerSearch, 'foo', 'Then pickerSearch is "foo"')
        t.equal(result.pickerHighlight, 0, 'Then pickerHighlight is reset to 0')
        t.end()
    })
    t.end()
})

t.test('Given state with active search text', t => {
    const initial = createEmptyState()
    const withSearch = rootReducer(initial, { action: Action.SetPickerSearch('hello') })

    t.test('When SetPickerOpen("reports") is dispatched', t => {
        const result = rootReducer(withSearch, { action: Action.SetPickerOpen('reports') })

        t.equal(result.pickerSearch, '', 'Then pickerSearch is reset to empty string')
        t.end()
    })
    t.end()
})

t.test('Given initial state', t => {
    const state = createEmptyState()

    t.test('When SetPickerPosition(100, 200) is dispatched', t => {
        const result = rootReducer(state, { action: Action.SetPickerPosition(100, 200) })

        t.same(result.pickerPosition, { x: 100, y: 200 }, 'Then pickerPosition is {x:100, y:200}')
        t.end()
    })

    t.test('When SetPickerPosition(NaN, 200) is dispatched', t => {
        const result = rootReducer(state, { action: Action.SetPickerPosition(NaN, 200) })

        t.equal(result.pickerPosition, undefined, 'Then pickerPosition is rejected to undefined')
        t.end()
    })

    t.test('When SetPickerPosition(100, Infinity) is dispatched', t => {
        const result = rootReducer(state, { action: Action.SetPickerPosition(100, Infinity) })

        t.equal(result.pickerPosition, undefined, 'Then pickerPosition is rejected to undefined')
        t.end()
    })
    t.end()
})
