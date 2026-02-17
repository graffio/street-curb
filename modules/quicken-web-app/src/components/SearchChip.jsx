// ABOUTME: Search input with navigation controls for transaction register search
// ABOUTME: Always-visible text input with debounced dispatch, prev/next buttons, and match counter

import { debounce } from '@graffio/functional'
import { Button, Flex, Text, TextField } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'

const DEBOUNCE_MS = 300

const containerStyle = { marginLeft: 'auto' }
const inputStyle = { width: 180 }
const counterStyle = { whiteSpace: 'nowrap', minWidth: 50, textAlign: 'center' }

// Module-level mutable state — only one SearchChip renders at a time (singleton)
let _lastMatchIdx = 0
let _prevSearchQuery = ''

// Dispatches debounced search query update to Redux
// Single instance — assumes one SearchChip is rendered at a time
// @sig dispatchSearchQuery :: (String, String) -> void
const dispatchSearchQuery = debounce(DEBOUNCE_MS, (viewId, query) =>
    post(Action.SetTransactionFilter(viewId, { searchQuery: query })),
)

/*
 * Search input with prev/next navigation and match counter
 * Self-selects searchQuery and searchMatches via business identifiers (viewId, accountId)
 *
 * @sig SearchChip :: SearchChipProps -> ReactElement
 *     SearchChipProps = { viewId: String, accountId: String, highlightedId: String | null,
 *         inputRef: Ref, onNext: () -> void, onPrev: () -> void, onClear: () -> void }
 */
const SearchChip = ({ viewId, accountId, highlightedId, inputRef, onNext, onPrev, onClear }) => {
    // Enter: flush query immediately, navigate to next match, blur
    // Shift+Enter: navigate to previous match, blur
    // Escape: clear search and blur
    // @sig handleKeyDown :: KeyboardEvent -> void
    const handleKeyDown = e => {
        const { key, shiftKey } = e
        if (key === 'Escape') {
            e.preventDefault()
            e.stopPropagation()
            onClear()
            inputRef.current.blur()
            return
        }
        if (key !== 'Enter') return
        e.preventDefault()
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { searchQuery: inputRef.current.value }))
        if (shiftKey) onPrev()
        else onNext()
        inputRef.current.blur()
    }

    const searchQuery = useSelector(state => S.UI.searchQuery(state, viewId))
    const searchMatches = useSelector(state => S.Transactions.searchMatches(state, viewId, accountId))
    const matchCount = searchMatches.length

    // Reset match position when search query changes (new search = start from 0)
    if (searchQuery !== _prevSearchQuery) {
        _lastMatchIdx = 0
        _prevSearchQuery = searchQuery
    }

    // Track last known match position so j/k to non-match rows doesn't reset counter
    const highlightIdx = searchMatches.indexOf(highlightedId)
    if (highlightIdx >= 0) _lastMatchIdx = highlightIdx
    const displayIndex = matchCount > 0 ? _lastMatchIdx + 1 : 0

    return (
        <Flex align="center" gap="2" style={containerStyle}>
            <TextField.Root
                ref={inputRef}
                placeholder="Search..."
                onChange={e => dispatchSearchQuery(viewId, e.target.value)}
                onKeyDown={handleKeyDown}
                style={inputStyle}
                size="1"
            />
            {searchQuery && (
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
            )}
        </Flex>
    )
}

export { SearchChip }
