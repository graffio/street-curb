// ABOUTME: As-of date filter chip with single date picker for holdings view
// ABOUTME: Escape closes popover, KeyboardDateInput has own keymap

import { KeymapModule } from '@graffio/keymap'
import { Box, Flex, Popover, Text } from '@radix-ui/themes'
import { useSelector } from 'react-redux'
import { post } from '../../commands/post.js'
import * as S from '../../store/selectors.js'
import { Action } from '../../types/action.js'
import { KeyboardDateInput } from '../KeyboardDateInput.jsx'
import { ChipStyles } from './chip-styles.js'
import { FilterColumn } from './FilterColumn.jsx'

const { ActionRegistry } = KeymapModule

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Converts Date to YYYY-MM-DD string and dispatches filter update
    // @sig onDate :: Date? -> void
    onDate: date => {
        if (date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            post(Action.SetTransactionFilter(chipState.viewId, { asOfDate: `${year}-${month}-${day}` }))
        }
    },

    // Registers filter:asOfDate focus action on trigger button mount
    // @sig registerTriggerActions :: Element? -> void
    registerTriggerActions: element => {
        triggerCleanup?.()
        triggerCleanup = undefined
        if (element)
            triggerCleanup = ActionRegistry.register(chipState.viewId, [
                {
                    id: 'filter:asOfDate',
                    description: 'As of date',
                    execute: () => post(Action.SetFilterPopoverOpen(chipState.viewId, 'asOfDate')),
                },
            ])
    },

    // Registers dismiss action on popover content mount
    // @sig registerContentActions :: Element? -> void
    registerContentActions: element => {
        contentCleanup?.()
        contentCleanup = undefined
        if (element)
            contentCleanup = ActionRegistry.register(chipState.viewId, [
                {
                    id: 'dismiss',
                    description: 'Dismiss',
                    execute: () => post(Action.SetFilterPopoverOpen(chipState.viewId, undefined)),
                },
            ])
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Date picker content — selects asOfDate and renders KeyboardDateInput
// @sig DateContent :: { viewId: String } -> ReactElement
const DateContent = ({ viewId }) => {
    const asOfDate = useSelector(state => S.UI.asOfDate(state, viewId))
    const dateValue = asOfDate ? new Date(asOfDate + 'T00:00:00') : new Date()
    const inputProps = {
        ref: el => (dateInputEl.current = el),
        value: dateValue,
        onChange: E.onDate,
        actionContext: viewId,
    }
    return (
        <Flex direction="column" gap="2">
            <Text size="1" color="gray" weight="medium">
                Show holdings as of date
            </Text>
            <KeyboardDateInput {...inputProps} />
        </Flex>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

const dateInputEl = { current: undefined }
let chipState = { viewId: undefined }
let triggerCleanup
let contentCleanup

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// As-of date filter chip with single date picker for holdings view
// @sig Chip :: { viewId: String } -> ReactElement
const Chip = ({ viewId }) => {
    const handleOpenChange = open => {
        post(Action.SetFilterPopoverOpen(viewId, open ? 'asOfDate' : undefined))
        if (open) setTimeout(() => dateInputEl.current?.focus('month'), 0)
    }

    const asOfDate = useSelector(state => S.UI.asOfDate(state, viewId))
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const isOpen = popoverId === 'asOfDate'
    const dateValue = asOfDate ? new Date(asOfDate + 'T00:00:00') : new Date()
    const triggerStyle = ChipStyles.makeChipTriggerStyle(180, false)
    const contentStyle = { padding: 'var(--space-3)', width: 200 }
    const displayDate = dateValue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    chipState = { viewId }

    return (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Box ref={E.registerTriggerActions} style={triggerStyle}>
                    <Text size="1" weight="medium">
                        As of: {displayDate}
                    </Text>
                </Box>
            </Popover.Trigger>
            <Popover.Content ref={E.registerContentActions} style={contentStyle}>
                <DateContent viewId={viewId} />
            </Popover.Content>
        </Popover.Root>
    )
}

// As-of date column wrapper — no chipData, renders AsOfDateChip in FilterColumn
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => <FilterColumn chip={<Chip viewId={viewId} />} details={[]} />

const AsOfDateChip = { AsOfDateChip: Chip, AsOfDateColumn: Column }

export { AsOfDateChip }
