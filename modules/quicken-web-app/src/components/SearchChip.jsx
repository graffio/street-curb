// ABOUTME: Search input with navigation controls for transaction register search
// ABOUTME: Always-visible text input with debounced dispatch, prev/next buttons, and match counter

import { Button, Flex, Text, TextField } from '@graffio/design-system'
import { debounce } from '@graffio/functional'
import React, { useEffect, useRef, useState } from 'react'
import { post } from '../commands/post.js'
import { Action } from '../types/action.js'

const DEBOUNCE_MS = 300

const containerStyle = { marginLeft: 'auto' }
const inputStyle = { width: 180 }
const counterStyle = { whiteSpace: 'nowrap', minWidth: 50, textAlign: 'center' }

const E = {
    // Dispatches debounced search query update to Redux
    // Single instance — assumes one SearchChip is rendered at a time
    // @sig dispatchSearchQuery :: (String, String) -> void
    dispatchSearchQuery: debounce(DEBOUNCE_MS, (viewId, query) =>
        post(Action.SetTransactionFilter(viewId, { searchQuery: query })),
    ),

    // Clears search query
    // @sig clearSearch :: (String, (String -> void)) -> void
    clearSearch: (viewId, setLocalQuery) => {
        setLocalQuery('')
        post(Action.SetTransactionFilter(viewId, { searchQuery: '' }))
    },

    // Syncs local state when Redux searchQuery is cleared externally (e.g. Escape in DataTable)
    // @sig syncOnExternalClear :: (String, String, (String -> void)) -> void
    syncOnExternalClear: (searchQuery, localQuery, setLocalQuery) => {
        if (!searchQuery && localQuery) setLocalQuery('')
    },
}

/*
 * Search input with prev/next navigation and match counter
 *
 * @sig SearchChip :: SearchChipProps -> ReactElement
 *     SearchChipProps = { viewId: String, searchQuery: String, searchMatches: [String],
 *         highlightedId: String | null, inputRef: Ref, onNext: () -> void, onPrev: () -> void }
 */
const SearchChip = ({ viewId, searchQuery, searchMatches, highlightedId, inputRef, onNext, onPrev }) => {
    // Handlers (closures capture variable bindings, not values — safe before hooks)
    const handleChange = e => {
        setLocalQuery(e.target.value)
        E.dispatchSearchQuery(viewId, e.target.value)
    }

    const handleClear = () => E.clearSearch(viewId, setLocalQuery)

    // Enter: flush query immediately, navigate to next match, blur
    // Shift+Enter: navigate to previous match, blur
    // Escape: clear search and blur
    // @sig handleKeyDown :: KeyboardEvent -> void
    const handleKeyDown = e => {
        const { key, shiftKey } = e
        if (key === 'Escape') {
            e.preventDefault()
            e.stopPropagation()
            handleClear()
            inputRef.current?.blur()
            return
        }
        if (key !== 'Enter') return
        e.preventDefault()
        e.stopPropagation()

        // Flush pending debounced query immediately so matches are current
        post(Action.SetTransactionFilter(viewId, { searchQuery: localQuery }))
        if (shiftKey) onPrev()
        else onNext()
        inputRef.current?.blur()
    }

    // EXEMPT: focus — local state for instant keystroke feedback while debouncing Redux dispatch
    const [localQuery, setLocalQuery] = useState('')
    const matchCount = searchMatches.length

    // Deps: localQuery intentionally omitted — sync only when Redux clears externally
    useEffect(() => E.syncOnExternalClear(searchQuery, localQuery, setLocalQuery), [searchQuery])

    // Track last known match position so j/k to non-match rows doesn't reset counter
    const lastMatchIdxRef = useRef(0)
    const highlightIdx = searchMatches.indexOf(highlightedId)
    if (highlightIdx >= 0) lastMatchIdxRef.current = highlightIdx
    const displayIndex = matchCount > 0 ? lastMatchIdxRef.current + 1 : 0

    return (
        <Flex align="center" gap="2" style={containerStyle}>
            <TextField.Root
                ref={inputRef}
                placeholder="Search..."
                value={localQuery}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                style={inputStyle}
                size="1"
            />
            {localQuery && (
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
                    <Button size="1" variant="ghost" onClick={handleClear}>
                        ×
                    </Button>
                </Flex>
            )}
        </Flex>
    )
}

export { SearchChip }
