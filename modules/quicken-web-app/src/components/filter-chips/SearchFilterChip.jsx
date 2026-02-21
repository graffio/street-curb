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

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Dismisses popover on Escape key
    // @sig onSearchKey :: KeyboardEvent -> void
    onSearchKey: e => {
        if (e.key === 'Escape') {
            e.preventDefault()
            post(Action.SetFilterPopoverOpen(chipState.viewId, undefined))
        }
    },

    // Registers filter:search focus action on trigger button mount
    // @sig registerTriggerActions :: Element? -> void
    registerTriggerActions: element => {
        triggerCleanup?.()
        triggerCleanup = undefined
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

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Search input content — selects filterQuery and renders labeled text field
// @sig SearchContent :: { viewId: String } -> ReactElement
const SearchContent = ({ viewId }) => {
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const fieldProps = {
        ref: el => (searchInputEl.current = el),
        placeholder: 'Type to filter...',
        value: filterQuery || '',
        onChange: e => post(Action.SetTransactionFilter(viewId, { filterQuery: e.target.value })),
        onKeyDown: E.onSearchKey,
    }
    return (
        <Flex direction="column" gap="2">
            <Text size="1" color="gray" weight="medium">
                Search transactions
            </Text>
            <TextField.Root {...fieldProps} />
        </Flex>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

const searchInputEl = { current: undefined }
let chipState = { viewId: undefined }
let triggerCleanup

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Search filter chip with inline text input popover
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const handleOpenChange = open => {
        post(Action.SetFilterPopoverOpen(viewId, open ? 'search' : undefined))
        if (open) setTimeout(() => searchInputEl.current?.focus(), 0)
    }

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { filterQuery: '' }))
    }

    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const isOpen = popoverId === 'search'
    const contentStyle = { padding: 'var(--space-2)', width: 250 }
    const labelStyle = { overflow: 'hidden', textOverflow: 'ellipsis' }
    const triggerStyle = ChipStyles.makeChipTriggerStyle(120, isActive)
    const hasQuery = filterQuery && filterQuery.length > 0
    const label = hasQuery ? filterQuery : 'Filter'

    chipState = { viewId }

    return (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Box ref={E.registerTriggerActions} style={triggerStyle}>
                    <Text size="1" weight="medium" style={labelStyle}>
                        {label}
                    </Text>
                    {hasQuery && (
                        <Box style={ChipStyles.clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </Box>
            </Popover.Trigger>
            <Popover.Content style={contentStyle}>
                <SearchContent viewId={viewId} />
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
