// ABOUTME: Search filter chip with inline text input popover
// ABOUTME: Renders search trigger with clear button and popover text field

import { Box, Flex, Popover, Text, TextField } from '@radix-ui/themes'
import { useSelector } from 'react-redux'
import { post } from '../../commands/post.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { ChipStyles } from './chip-styles.js'
import { FilterColumn } from './FilterColumn.jsx'

// Module-level DOM ref — only one popover open at a time
const searchInputEl = { current: null }

// Search filter chip with inline text input popover
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const handleOpenChange = open => {
        post(Action.SetFilterPopoverOpen(viewId, open ? POPOVER_ID : null))
        if (open) setTimeout(() => searchInputEl.current?.focus(), 0)
    }

    const handleChange = e => post(Action.SetTransactionFilter(viewId, { filterQuery: e.target.value }))

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { filterQuery: '' }))
    }

    const handleDismiss = () => post(Action.SetFilterPopoverOpen(viewId, null))

    const handleKeyDown = e => e.key === 'Escape' && (e.preventDefault(), handleDismiss())

    const POPOVER_ID = 'search'
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const isOpen = popoverId === POPOVER_ID
    const triggerStyle = ChipStyles.makeChipTriggerStyle(120, isActive)
    const hasQuery = filterQuery && filterQuery.length > 0
    const label = hasQuery ? filterQuery : 'Filter'

    return (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Box style={triggerStyle}>
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
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
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
