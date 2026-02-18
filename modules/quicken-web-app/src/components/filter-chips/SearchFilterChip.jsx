// ABOUTME: Search filter chip with inline text input popover
// ABOUTME: Renders search trigger with clear button and popover text field

import { Box, Flex, Popover, Text, TextField } from '@radix-ui/themes'
import { KeymapModule } from '@graffio/keymap'
import { useSelector } from 'react-redux'
import { post } from '../../commands/post.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { ChipStyles } from './chip-styles.js'
import { FilterColumn } from './FilterColumn.jsx'

const { ActionRegistry } = KeymapModule

// Module-level DOM ref — only one popover open at a time
const searchInputEl = { current: null }

// Module-level state — single instance per view, updated on each render
let chipState = { viewId: null }
let triggerCleanup = null

const E = {
    // Registers filter:search focus action on trigger button mount
    // @sig registerTriggerActions :: Element? -> void
    registerTriggerActions: element => {
        triggerCleanup?.()
        triggerCleanup = null
        if (element)
            triggerCleanup = ActionRegistry.register(chipState.viewId, [
                {
                    id: 'filter:search',
                    description: 'Search',
                    execute: () => post(Action.SetFilterPopoverOpen(chipState.viewId, 'search')),
                },
            ])
    },
}

// Search filter chip with inline text input popover
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const handleOpenChange = open => {
        post(Action.SetFilterPopoverOpen(viewId, open ? 'search' : null))
        if (open) setTimeout(() => searchInputEl.current?.focus(), 0)
    }

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { filterQuery: '' }))
    }

    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const isOpen = popoverId === 'search'
    const triggerStyle = ChipStyles.makeChipTriggerStyle(120, isActive)
    const hasQuery = filterQuery && filterQuery.length > 0
    const label = hasQuery ? filterQuery : 'Filter'

    chipState = { viewId }

    return (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Box ref={E.registerTriggerActions} style={triggerStyle}>
                    <Text size="1" weight="medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {label}
                    </Text>
                    {hasQuery && (
                        <Box style={ChipStyles.clearButtonStyle} onClick={handleClear}>
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
                        ref={el => (searchInputEl.current = el)}
                        placeholder="Type to filter..."
                        value={filterQuery || ''}
                        onChange={e => post(Action.SetTransactionFilter(viewId, { filterQuery: e.target.value }))}
                        onKeyDown={e =>
                            e.key === 'Escape' && (e.preventDefault(), post(Action.SetFilterPopoverOpen(viewId, null)))
                        }
                    />
                </Flex>
            </Popover.Content>
        </Popover.Root>
    )
}

// Self-selecting search filter column — selects active state and renders SearchFilterChip
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => {
    const { isActive } = useSelector(state => S.UI.searchChipData(state, viewId))
    return <FilterColumn chip={<Chip viewId={viewId} isActive={isActive} />} details={[]} />
}

const SearchFilterChip = { SearchFilterChip: Chip, SearchFilterColumn: Column }

export { SearchFilterChip }
