// ABOUTME: Search filter chip with inline text input
// ABOUTME: Shows search icon, opens text input popover on click

import { Box, Flex, Popover, Text, TextField } from '@graffio/design-system'
import React, { useRef } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'

const triggerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-1) var(--space-2)',
    backgroundColor: 'var(--accent-3)',
    borderRadius: 'var(--radius-4)',
    cursor: 'pointer',
    userSelect: 'none',
    width: 120,
}

const clearButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: 'var(--gray-6)',
    color: 'var(--gray-11)',
    fontSize: 10,
    cursor: 'pointer',
}

/*
 * Search filter chip with inline text input popover
 *
 * @sig SearchFilterChip :: { viewId: String } -> ReactElement
 */
const SearchFilterChip = ({ viewId }) => {
    const handleChange = e => post(Action.SetTransactionFilter(viewId, { filterQuery: e.target.value }))

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { filterQuery: '' }))
    }

    const handleKeyDown = e => {
        if (e.key === 'Escape') handleClear(e)
    }

    const inputRef = useRef(null)

    const filterQuery = useSelector(state => S.filterQuery(state, viewId))

    const hasQuery = filterQuery && filterQuery.length > 0
    const label = hasQuery ? filterQuery : 'Filter'

    return (
        <Popover.Root onOpenChange={open => open && setTimeout(() => inputRef.current?.focus(), 0)}>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {label}
                    </Text>
                    {hasQuery && (
                        <Box style={clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </Box>
            </Popover.Trigger>
            <Popover.Content style={{ padding: 'var(--space-2)', width: 250 }}>
                <Flex direction="column" gap="2">
                    <Text size="1" color="gray" weight="medium">
                        Search transactions
                    </Text>
                    <TextField.Root
                        ref={inputRef}
                        placeholder="Type to filter..."
                        value={filterQuery || ''}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                    />
                </Flex>
            </Popover.Content>
        </Popover.Root>
    )
}

export { SearchFilterChip }
