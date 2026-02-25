// ABOUTME: Search input with navigation controls for transaction register search
// ABOUTME: Always-visible text input with debounced dispatch, prev/next buttons, and match counter
// Singleton — only one SearchChip renders at a time. Breaks if rendered twice.
// See docs/solutions/architecture/filter-chip-module-level-singleton-bug.md

import { debounce } from '@graffio/functional'
import { Button, Flex, Text, TextField } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { KeymapModule } from '@graffio/keymap'
import { FocusRegistry } from '../commands/data-sources/focus-registry.js'
import { post } from '../commands/post.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'

const { ActionRegistry } = KeymapModule

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

// COMPLEXITY: require-action-registry — Escape/Enter are standard text input keys in input-focused context
// (P.isInputElement skips ActionRegistry dispatch). These are not remappable keybindings.
const E = {
    // Registers/unregisters search actions with ActionRegistry for keyboard discoverability
    // @sig registerSearchActions :: Element? -> void
    registerSearchActions: element => {
        _searchActionsCleanup?.()
        _searchActionsCleanup = undefined
        if (!element) return
        _searchActionsCleanup = ActionRegistry.register(_viewId, [
            { id: 'search:next', description: 'Next match', execute: () => _searchCallbacks.onNext() },
            { id: 'search:prev', description: 'Previous match', execute: () => _searchCallbacks.onPrev() },
            { id: 'search:clear', description: 'Clear search', execute: () => _searchCallbacks.onClear() },
        ])
    },

    // Registers/unregisters search input in FocusRegistry for keyboard access
    // @sig registerSearchInput :: Element? -> void
    registerSearchInput: element =>
        element ? FocusRegistry.register('search_' + _viewId, element) : FocusRegistry.unregister('search_' + _viewId),

    // Input-focused key handler — standard text input cancel/submit
    // @sig handleKeyDown :: KeyboardEvent -> void
    handleKeyDown: e => {
        const { key, shiftKey } = e
        if (key === 'Escape') {
            e.preventDefault()
            e.stopPropagation()
            _searchCallbacks.onClear()
            FocusRegistry.get('search_' + _viewId)?.blur()
            return
        }
        if (key !== 'Enter') return
        e.preventDefault()
        e.stopPropagation()
        const el = FocusRegistry.get('search_' + _viewId)
        if (!el) return
        post(Action.SetTransactionFilter(_viewId, { searchQuery: el.value }))
        el.blur()
        if (shiftKey) _searchCallbacks.onPrev()
        else _searchCallbacks.onNext()
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Match counter and prev/next/clear navigation buttons
// Self-selects searchQuery for visibility and searchMatches for counter
// @sig SearchNavControls :: { viewId: String, accountId: String, highlightedId: String? } -> ReactElement?
const SearchNavControls = ({ viewId, accountId, highlightedId }) => {
    const searchQuery = useSelector(state => S.UI.searchQuery(state, viewId))
    const searchMatches = useSelector(state => S.Transactions.searchMatches(state, viewId, accountId))

    if (!searchQuery) return false

    // Reset match position when search query changes (new search = start from 0)
    if (searchQuery !== _prevSearchQuery) {
        _lastMatchIdx = 0
        _prevSearchQuery = searchQuery
    }

    const matchCount = searchMatches.length

    // Track last known match position so j/k to non-match rows doesn't reset counter
    const highlightIdx = searchMatches.indexOf(highlightedId)
    if (highlightIdx >= 0) _lastMatchIdx = highlightIdx
    const displayIndex = matchCount > 0 ? _lastMatchIdx + 1 : 0
    const { onPrev, onNext, onClear } = _searchCallbacks

    return (
        <Flex align="center" gap="1">
            <Text size="1" color="gray" style={counterStyle}>
                {displayIndex} of {matchCount}
            </Text>
            <Button size="1" variant="ghost" onClick={onPrev}>
                ▲
            </Button>
            <Button size="1" variant="ghost" onClick={onNext}>
                ▼
            </Button>
            <Button size="1" variant="ghost" onClick={onClear}>
                ×
            </Button>
        </Flex>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const DEBOUNCE_MS = 300
const containerStyle = { marginLeft: 'auto' }
const inputStyle = { width: 180 }
const counterStyle = { whiteSpace: 'nowrap', minWidth: 50, textAlign: 'center' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

// Singleton state — see ABOUTME comment at top of file
let _viewId
let _searchCallbacks = { onNext: undefined, onPrev: undefined, onClear: undefined }
let _searchActionsCleanup
let _lastMatchIdx = 0
let _prevSearchQuery = ''

// Dispatches debounced search query update to Redux
// @sig dispatchSearchQuery :: (String, String) -> void
const dispatchSearchQuery = debounce(DEBOUNCE_MS, (viewId, query) =>
    post(Action.SetTransactionFilter(viewId, { searchQuery: query })),
)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Search input with prev/next navigation and match counter
 * Syncs _searchCallbacks each render for stable ActionRegistry execute identity
 *
 * @sig SearchChip :: SearchChipProps -> ReactElement
 *     SearchChipProps = { viewId: String, accountId: String, highlightedId: String?,
 *         onNext: () -> void, onPrev: () -> void, onClear: () -> void }
 */
const SearchChip = ({ viewId, accountId, highlightedId, onNext, onPrev, onClear }) => {
    _viewId = viewId
    _searchCallbacks = { onNext, onPrev, onClear }
    const { handleKeyDown, registerSearchActions, registerSearchInput } = E

    const searchFieldProps = {
        placeholder: 'Search...',
        onChange: e => dispatchSearchQuery(viewId, e.target.value),
        onKeyDown: handleKeyDown,
        style: inputStyle,
        size: '1',
    }

    return (
        <Flex align="center" gap="2" style={containerStyle} ref={registerSearchActions}>
            <TextField.Root ref={registerSearchInput} {...searchFieldProps} />
            <SearchNavControls viewId={viewId} accountId={accountId} highlightedId={highlightedId} />
        </Flex>
    )
}

export { SearchChip }
