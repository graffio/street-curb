// ABOUTME: ViewUiState action handlers for the Redux reducer
// ABOUTME: Manages per-view ephemeral UI state (popover, row index, columns)

import { mapObject } from '@graffio/functional'
import { ViewUiState as ViewUiStateType } from '../../types/index.js'

// Creates a ViewUiState with default values for a given viewId
// @sig createDefaultViewUiState :: String -> ViewUiState
const createDefaultViewUiState = viewId =>
    ViewUiStateType(
        viewId,
        undefined, // filterPopoverId
        '', // filterPopoverSearch
        -1, // filterPopoverHighlight
        0, // currentRowIndex
        0, // currentSearchIndex
        {}, // treeExpansion
        {}, // columnSizing
        [], // columnOrder
    )

// Merges partial UI state changes into view UI state for a specific view
// Changes may be direct values or updater functions (old => new) for TanStack Table compatibility
// @sig setViewUiState :: (State, Action.SetViewUiState) -> State
const setViewUiState = (state, action) => {
    const { viewId, changes } = action

    const existing = state.viewUiState.get(viewId) || createDefaultViewUiState(viewId)
    const resolved = mapObject((value, key) => (typeof value === 'function' ? value(existing[key]) : value), changes)
    const updated = ViewUiStateType.from({ ...existing, ...resolved })

    return { ...state, viewUiState: state.viewUiState.addItemWithId(updated) }
}

// Opens/closes a filter popover, resetting search and highlight
// @sig setFilterPopoverOpen :: (State, Action.SetFilterPopoverOpen) -> State
const setFilterPopoverOpen = (state, action) => {
    const { viewId, popoverId } = action

    const existing = state.viewUiState.get(viewId) || createDefaultViewUiState(viewId)
    const updated = ViewUiStateType.from({
        ...existing,
        filterPopoverId: popoverId,
        filterPopoverSearch: '',
        filterPopoverHighlight: -1,
    })

    return { ...state, viewUiState: state.viewUiState.addItemWithId(updated) }
}

// Updates filter popover search text, resetting highlight to first item
// @sig setFilterPopoverSearch :: (State, Action.SetFilterPopoverSearch) -> State
const setFilterPopoverSearch = (state, action) => {
    const { viewId, searchText } = action

    const existing = state.viewUiState.get(viewId) || createDefaultViewUiState(viewId)
    const updated = ViewUiStateType.from({ ...existing, filterPopoverSearch: searchText, filterPopoverHighlight: 0 })

    return { ...state, viewUiState: state.viewUiState.addItemWithId(updated) }
}

// Resets view UI state to defaults for a specific view
// @sig resetViewUiState :: (State, Action.ResetTransactionFilters) -> State
const resetViewUiState = (state, action) => {
    const defaultUiState = createDefaultViewUiState(action.viewId)

    return { ...state, viewUiState: state.viewUiState.addItemWithId(defaultUiState) }
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const ViewUiState = {
    createDefaultViewUiState,
    resetViewUiState,
    setFilterPopoverOpen,
    setFilterPopoverSearch,
    setViewUiState,
}

export { ViewUiState }
