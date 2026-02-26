// ABOUTME: Tests for pickerData memoized selector
// ABOUTME: Verifies filtering, highlight wrapping, position passthrough, and CLOSED_PICKER sentinel

import t from 'tap'
import { Reducer } from '../../src/store/reducer.js'
import { Action } from '../../src/types/action.js'
import { CLOSED_PICKER, pickerData } from '../../src/store/selectors.js'
const { createEmptyState, rootReducer } = Reducer

const ITEMS = [
    { id: 'alpha', label: 'Alpha Report' },
    { id: 'beta', label: 'Beta Summary' },
    { id: 'gamma', label: 'Gamma Report' },
]

t.test('Given pickerType is undefined', t => {
    const state = createEmptyState()

    t.test('When pickerData is called', t => {
        const result = pickerData(state, ITEMS)

        t.equal(result, CLOSED_PICKER, 'Then it returns CLOSED_PICKER sentinel')
        t.end()
    })
    t.end()
})

t.test('Given picker is open with empty search', t => {
    const initial = createEmptyState()
    const state = rootReducer(initial, { action: Action.SetPickerOpen('reports') })

    t.test('When pickerData is called', t => {
        const result = pickerData(state, ITEMS)

        t.equal(result.filteredItems.length, 3, 'Then all items are returned')
        t.equal(result.searchText, '', 'Then searchText is empty')
        t.end()
    })
    t.end()
})

t.test('Given picker is open with search text "report"', t => {
    const initial = createEmptyState()
    const opened = rootReducer(initial, { action: Action.SetPickerOpen('reports') })
    const state = rootReducer(opened, { action: Action.SetPickerSearch('report') })

    t.test('When pickerData is called', t => {
        const result = pickerData(state, ITEMS)

        t.equal(result.filteredItems.length, 2, 'Then only matching items are returned')
        t.equal(result.filteredItems[0].id, 'alpha', 'Then first match is Alpha Report')
        t.equal(result.filteredItems[1].id, 'gamma', 'Then second match is Gamma Report')
        t.end()
    })

    t.test('When search is case-insensitive', t => {
        const upper = rootReducer(opened, { action: Action.SetPickerSearch('REPORT') })
        const result = pickerData(upper, ITEMS)

        t.equal(result.filteredItems.length, 2, 'Then case-insensitive matching works')
        t.end()
    })
    t.end()
})

t.test('Given picker is open with highlight at boundary', t => {
    const initial = createEmptyState()
    const opened = rootReducer(initial, { action: Action.SetPickerOpen('reports') })

    t.test('When highlight is at 0 with 3 items', t => {
        const result = pickerData(opened, ITEMS)

        t.equal(result.highlightedIndex, 0, 'Then highlightedIndex is 0')
        t.equal(result.nextHighlightIndex, 1, 'Then next wraps to 1')
        t.equal(result.prevHighlightIndex, 2, 'Then prev wraps to last item')
        t.end()
    })

    t.test('When highlight is at last item', t => {
        const atEnd = rootReducer(opened, { action: Action.SetPickerHighlight(2) })
        const result = pickerData(atEnd, ITEMS)

        t.equal(result.highlightedIndex, 2, 'Then highlightedIndex is 2')
        t.equal(result.nextHighlightIndex, 0, 'Then next wraps to 0')
        t.equal(result.prevHighlightIndex, 1, 'Then prev is 1')
        t.end()
    })
    t.end()
})

t.test('Given state with pickerPosition set', t => {
    const initial = createEmptyState()
    const opened = rootReducer(initial, { action: Action.SetPickerOpen('reports') })
    const state = rootReducer(opened, { action: Action.SetPickerPosition(150, 250) })

    t.test('When pickerData is called', t => {
        const result = pickerData(state, ITEMS)

        t.same(result.position, { x: 150, y: 250 }, 'Then position passes through from state')
        t.end()
    })
    t.end()
})
