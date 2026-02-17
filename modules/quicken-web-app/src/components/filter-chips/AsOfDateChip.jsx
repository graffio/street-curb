// ABOUTME: As-of date filter chip with single date picker for holdings view
// ABOUTME: Escape closes popover, KeyboardDateInput has own keymap
// COMPLEXITY-TODO: react-redux-separation — ActionRegistry useEffect awaits non-React mechanism (expires 2026-04-01)

import { Box, Flex, Popover, Text } from '@radix-ui/themes'
import { KeymapModule } from '@graffio/keymap'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { KeyboardDateInput } from '../KeyboardDateInput.jsx'
import { post } from '../../commands/post.js'
import * as S from '../../store/selectors.js'
import { currentStore } from '../../store/index.js'
import { Action } from '../../types/action.js'
import { ChipStyles } from './chip-styles.js'
import { FilterColumn } from './FilterColumn.jsx'

const { ActionRegistry } = KeymapModule

// Module-level DOM ref — only one popover open at a time
const dateInputEl = { current: null }

const E = {
    // Registers dismiss action for AsOfDate popover when open
    // @sig registerAsOfDateActions :: String -> () -> (() -> void)?
    registerAsOfDateActions: viewId => () => {
        const popoverId = S.UI.filterPopoverId(currentStore().getState(), viewId)
        if (popoverId !== 'asOfDate') return undefined
        return ActionRegistry.register(viewId, [
            { id: 'dismiss', description: 'Dismiss', execute: () => post(Action.SetFilterPopoverOpen(viewId, null)) },
        ])
    },
}

// As-of date filter chip with single date picker for holdings view
// @sig Chip :: { viewId: String } -> ReactElement
const Chip = ({ viewId }) => {
    const handleOpenChange = open => {
        post(Action.SetFilterPopoverOpen(viewId, open ? POPOVER_ID : null))
        if (open) setTimeout(() => dateInputEl.current?.focus('month'), 0)
    }

    // Converts Date to YYYY-MM-DD string and dispatches filter update
    // @sig handleDateChange :: Date? -> void
    const handleDateChange = date => {
        if (date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            post(Action.SetTransactionFilter(viewId, { asOfDate: `${year}-${month}-${day}` }))
        }
    }

    const POPOVER_ID = 'asOfDate'
    const asOfDate = useSelector(state => S.UI.asOfDate(state, viewId))
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const isOpen = popoverId === POPOVER_ID
    const dateValue = asOfDate ? new Date(asOfDate + 'T00:00:00') : new Date()
    const triggerStyle = ChipStyles.makeChipTriggerStyle(180, false)
    const displayDate = dateValue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    useEffect(E.registerAsOfDateActions(viewId), [isOpen, viewId])

    return (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        As of: {displayDate}
                    </Text>
                </Box>
            </Popover.Trigger>
            <Popover.Content style={{ padding: 'var(--space-3)', width: 200 }}>
                <Flex direction="column" gap="2">
                    <Text size="1" color="gray" weight="medium">
                        Show holdings as of date
                    </Text>
                    <KeyboardDateInput
                        ref={el => (dateInputEl.current = el)}
                        value={dateValue}
                        onChange={handleDateChange}
                        actionContext={viewId}
                    />
                </Flex>
            </Popover.Content>
        </Popover.Root>
    )
}

// As-of date column wrapper — no chipData, renders AsOfDateChip in FilterColumn
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => <FilterColumn chip={<Chip viewId={viewId} />} details={[]} />

const AsOfDateChip = { AsOfDateChip: Chip, AsOfDateColumn: Column }

export { AsOfDateChip }
