// ABOUTME: ViewUiState action handlers for the Redux reducer
// ABOUTME: Manages per-view ephemeral UI state (popover, row index, columns)

import { ViewUiState as ViewUiStateType } from '../../types/index.js'

// Creates a ViewUiState with default values for a given viewId
// @sig createDefaultViewUiState :: String -> ViewUiState
const createDefaultViewUiState = viewId =>
    ViewUiStateType(
        viewId,
        null, // filterPopoverId
        '', // filterPopoverSearch
        -1, // filterPopoverHighlight
        0, // currentRowIndex
        0, // currentSearchIndex
        {}, // treeExpansion
        {}, // columnSizing
        [], // columnOrder
    )

// Merges partial UI state changes into view UI state for a specific view
// @sig setViewUiState :: (State, Action.SetViewUiState) -> State
const setViewUiState = (state, action) => {
    const { viewId, changes } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.viewUiState.get(viewId) || createDefaultViewUiState(viewId)
    const updated = ViewUiStateType.from({ ...existing, ...changes })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, viewUiState: state.viewUiState.addItemWithId(updated) }
}

// Opens/closes a filter popover, resetting search and highlight
// @sig setFilterPopoverOpen :: (State, Action.SetFilterPopoverOpen) -> State
const setFilterPopoverOpen = (state, action) => {
    const { viewId, popoverId } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.viewUiState.get(viewId) || createDefaultViewUiState(viewId)
    const updated = ViewUiStateType.from({
        ...existing,
        filterPopoverId: popoverId,
        filterPopoverSearch: '',
        filterPopoverHighlight: -1,
    })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, viewUiState: state.viewUiState.addItemWithId(updated) }
}

// Updates filter popover search text, resetting highlight to first item
// @sig setFilterPopoverSearch :: (State, Action.SetFilterPopoverSearch) -> State
const setFilterPopoverSearch = (state, action) => {
    const { viewId, searchText } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.viewUiState.get(viewId) || createDefaultViewUiState(viewId)
    const updated = ViewUiStateType.from({ ...existing, filterPopoverSearch: searchText, filterPopoverHighlight: 0 })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, viewUiState: state.viewUiState.addItemWithId(updated) }
}

// Resets view UI state to defaults for a specific view
// @sig resetViewUiState :: (State, Action.ResetTransactionFilters) -> State
const resetViewUiState = (state, action) => {
    const defaultUiState = createDefaultViewUiState(action.viewId)
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, viewUiState: state.viewUiState.addItemWithId(defaultUiState) }
}

const ViewUiState = {
    createDefaultViewUiState,
    resetViewUiState,
    setFilterPopoverOpen,
    setFilterPopoverSearch,
    setViewUiState,
}

export { ViewUiState }
