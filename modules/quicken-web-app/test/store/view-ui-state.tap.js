// ABOUTME: Tests for ViewUiState Redux reducer actions
// ABOUTME: Verifies SetViewUiState updates viewUiState without touching transactionFilters

import t from 'tap'
import { Reducer } from '../../src/store/reducer.js'
import { Action } from '../../src/types/action.js'
const { createEmptyState, rootReducer } = Reducer

const VIEW_ID = 'rpt_account_list'

// Extracts transactionFilters reference for reference-equality assertions
// @sig filtersBefore :: State -> LookupTable<TransactionFilter>
const filtersBefore = before => before.transactionFilters

// -----------------------------------------------------------------------------
// SetViewUiState
// -----------------------------------------------------------------------------

t.test('Given initial state with default viewUiState', t => {
    const before = createEmptyState()
    const filters = filtersBefore(before)

    t.test('When SetViewUiState changes filterPopoverHighlight', t => {
        const action = Action.SetViewUiState(VIEW_ID, { filterPopoverHighlight: 3 })
        const result = rootReducer(before, { action })

        t.equal(result.viewUiState.get(VIEW_ID).filterPopoverHighlight, 3, 'Then viewUiState is updated')
        t.equal(result.transactionFilters, filters, 'Then transactionFilters is unchanged by reference')
        t.end()
    })

    t.test('When SetViewUiState changes currentRowIndex', t => {
        const action = Action.SetViewUiState(VIEW_ID, { currentRowIndex: 5 })
        const result = rootReducer(before, { action })

        t.equal(result.viewUiState.get(VIEW_ID).currentRowIndex, 5, 'Then currentRowIndex is updated')
        t.equal(result.transactionFilters, filters, 'Then transactionFilters is unchanged by reference')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// SetFilterPopoverOpen routes to viewUiState
// -----------------------------------------------------------------------------

t.test('Given initial state receiving SetFilterPopoverOpen', t => {
    const before = createEmptyState()
    const filters = filtersBefore(before)

    t.test('When SetFilterPopoverOpen is dispatched', t => {
        const action = Action.SetFilterPopoverOpen(VIEW_ID, 'date')
        const result = rootReducer(before, { action })

        t.equal(result.viewUiState.get(VIEW_ID).filterPopoverId, 'date', 'Then popoverId is set in viewUiState')
        t.equal(result.transactionFilters, filters, 'Then transactionFilters is unchanged by reference')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// SetFilterPopoverSearch resets highlight
// -----------------------------------------------------------------------------

t.test('Given a view with popover highlight at index 5', t => {
    const initial = createEmptyState()
    const before = rootReducer(initial, { action: Action.SetViewUiState(VIEW_ID, { filterPopoverHighlight: 5 }) })

    t.test('When SetFilterPopoverSearch is dispatched', t => {
        const action = Action.SetFilterPopoverSearch(VIEW_ID, 'foo')
        const result = rootReducer(before, { action })

        t.equal(result.viewUiState.get(VIEW_ID).filterPopoverSearch, 'foo', 'Then search text is updated')
        t.equal(result.viewUiState.get(VIEW_ID).filterPopoverHighlight, 0, 'Then highlight resets to 0')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// ResetTransactionFilters resets both slices
// -----------------------------------------------------------------------------

t.test('Given state with modified viewUiState and transactionFilters', t => {
    const initial = createEmptyState()
    const withUi = rootReducer(initial, { action: Action.SetViewUiState(VIEW_ID, { currentRowIndex: 10 }) })
    const before = rootReducer(withUi, { action: Action.SetTransactionFilter(VIEW_ID, { filterQuery: 'test' }) })

    t.test('When ResetTransactionFilters is dispatched', t => {
        const action = Action.ResetTransactionFilters(VIEW_ID)
        const result = rootReducer(before, { action })

        t.equal(result.viewUiState.get(VIEW_ID).currentRowIndex, 0, 'Then viewUiState is reset to defaults')
        t.equal(result.transactionFilters.get(VIEW_ID).filterQuery, '', 'Then transactionFilters is reset to defaults')
        t.end()
    })
    t.end()
})
