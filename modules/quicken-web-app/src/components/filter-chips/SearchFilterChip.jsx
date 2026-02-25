// ABOUTME: Search filter chip with inline text input popover
// ABOUTME: Renders search trigger with clear button and popover text field

import { Box, Flex, Popover, Text, TextField } from '@radix-ui/themes'
import { KeymapModule } from '@graffio/keymap'
import { useSelector } from 'react-redux'
import { post } from '../../commands/post.js'
import { KeymapConfig } from '../../keymap-config.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { ChipStyles } from './chip-styles.js'
import { FilterColumn } from './FilterColumn.jsx'

const { ActionRegistry, normalizeKey } = KeymapModule
const { DEFAULT_BINDINGS } = KeymapConfig

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Routes non-character keys from search input via ActionRegistry — lets printable characters through
    // @sig handleSearchKey :: KeyboardEvent -> void
    handleSearchKey: e => {
        e.stopPropagation()
        const { key, ctrlKey, altKey, metaKey } = e
        if (key.length === 1 && !ctrlKey && !altKey && !metaKey) return
        const actionId = DEFAULT_BINDINGS[normalizeKey(e)]
        if (!actionId) return
        const action = ActionRegistry.resolve(actionId, activeViewId)
        if (!action) return
        e.preventDefault()
        action.execute()
    },

    // Registers filter:search focus action on trigger button mount — keyed by viewId for multi-instance safety
    // @sig registerTriggerElement :: (String, Element?) -> void
    registerTriggerElement: (viewId, element) => {
        triggerCleanups.get(viewId)?.()
        triggerCleanups.delete(viewId)
        if (!element) return

        triggerCleanups.set(
            viewId,
            ActionRegistry.register(viewId, [
                {
                    id: 'filter:search',
                    description: 'Search',
                    execute: () => post(Action.SetFilterPopoverOpen(viewId, 'search')),
                },
            ]),
        )
    },

    // Returns a stable ref callback for a trigger — creates on first use, caches thereafter
    // @sig toTriggerRef :: String -> (Element? -> void)
    toTriggerRef: viewId => {
        if (!triggerRefs.has(viewId)) triggerRefs.set(viewId, element => E.registerTriggerElement(viewId, element))
        return triggerRefs.get(viewId)
    },

    // Registers dismiss action when popover content mounts — reads activeViewId lazily at execute time
    // @sig registerContent :: Element? -> void
    registerContent: element => {
        contentCleanup?.()
        contentCleanup = undefined
        if (!element) return

        contentCleanup = ActionRegistry.register(activeViewId, [
            {
                id: 'dismiss',
                description: 'Dismiss',
                execute: () => post(Action.SetFilterPopoverOpen(activeViewId, undefined)),
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
        onKeyDown: E.handleSearchKey,
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
const triggerCleanups = new Map()
const triggerRefs = new Map()
let activeViewId
let contentCleanup

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

    activeViewId = viewId

    return (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Box ref={E.toTriggerRef(viewId)} style={triggerStyle}>
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
            <Popover.Content ref={E.registerContent} style={contentStyle}>
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
