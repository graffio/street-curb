// ABOUTME: Date filter chip with keyboard-navigable date range options popover
// ABOUTME: Includes custom date range inputs, helper components for option rendering

import { Box, Flex, Popover, Text } from '@radix-ui/themes'
import { DateRangeUtils } from '../../utils/date-range-utils.js'
import { KeyboardDateInput } from '../KeyboardDateInput.jsx'
import { endOfDay } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import { useSelector } from 'react-redux'
import { post } from '../../commands/post.js'
import * as S from '../../store/selectors.js'
import { Action } from '../../types/action.js'
import { ChipStyles } from './chip-styles.js'
import { FilterColumn } from './FilterColumn.jsx'

const { ActionRegistry } = KeymapModule

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Creates option style with selected and highlighted states
    // @sig makeOptionStyle :: (Boolean, Boolean?) -> Style
    makeOptionStyle: (isSelected, isHighlighted = false) => ({
        padding: 'var(--space-2) var(--space-3)',
        cursor: 'pointer',
        borderRadius: 'var(--radius-1)',
        backgroundColor: isHighlighted ? 'var(--accent-4)' : isSelected ? 'var(--accent-3)' : 'transparent',
    }),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Dispatches open/close for date popover
    // @sig onOpenChange :: (String, Boolean) -> void
    onOpenChange: (viewId, open) => post(Action.SetFilterPopoverOpen(viewId, open ? 'date' : null)),

    // Dispatches custom start date change and recalculates range if both dates present
    // @sig onStartDate :: (String, Date?) -> void
    onStartDate: (viewId, date) => {
        const chip = chipStates.get(viewId) || {}
        post(Action.SetTransactionFilter(viewId, { customStartDate: date }))
        if (date && chip.customEndDate)
            post(Action.SetTransactionFilter(viewId, { dateRange: { start: date, end: endOfDay(chip.customEndDate) } }))
    },

    // Dispatches custom end date change and recalculates range if both dates present
    // @sig onEndDate :: (String, Date?) -> void
    onEndDate: (viewId, date) => {
        const chip = chipStates.get(viewId) || {}
        post(Action.SetTransactionFilter(viewId, { customEndDate: date }))
        if (chip.customStartDate && date)
            post(
                Action.SetTransactionFilter(viewId, {
                    dateRange: { start: chip.customStartDate, end: endOfDay(date) },
                }),
            )
    },

    // Selects a date range option and dispatches filter update
    // @sig onSelect :: (String, String) -> void
    onSelect: (viewId, key) => {
        const dateRange = DateRangeUtils.calculateDateRange(key) ?? { start: null, end: null }
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: key, dateRange }))
    },

    // Applies highlighted date range option, focuses custom date input if applicable
    // @sig applyHighlightedDateRange :: String -> void
    applyHighlightedDateRange: viewId => {
        const { highlightedItemId } = chipStates.get(viewId) || {}
        if (!highlightedItemId) return
        const dateRange = DateRangeUtils.calculateDateRange(highlightedItemId) ?? { start: null, end: null }
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: highlightedItemId, dateRange }))
        if (highlightedItemId === 'customDates') setTimeout(() => startDateEl.current?.focus('month'), 0)
    },

    // Registers filter:date focus action on trigger button mount
    // @sig registerTriggerActions :: (String, Element?) -> void
    registerTriggerActions: (viewId, element) => {
        triggerCleanups.get(viewId)?.()
        triggerCleanups.delete(viewId)
        if (element)
            triggerCleanups.set(
                viewId,
                ActionRegistry.register(viewId, [
                    {
                        id: 'filter:date',
                        description: 'Date',
                        execute: () => post(Action.SetFilterPopoverOpen(viewId, 'date')),
                    },
                ]),
            )
    },

    // Registers popover navigation actions on content mount
    // @sig registerContentActions :: (String, Element?) -> void
    registerContentActions: (viewId, element) => {
        contentCleanups.get(viewId)?.()
        contentCleanups.delete(viewId)
        if (element)
            contentCleanups.set(
                viewId,
                ActionRegistry.register(viewId, [
                    {
                        id: 'navigate:down',
                        description: 'Move down',
                        execute: () =>
                            post(
                                Action.SetViewUiState(viewId, { filterPopoverHighlight: chipStates.get(viewId)?.next }),
                            ),
                    },
                    {
                        id: 'navigate:up',
                        description: 'Move up',
                        execute: () =>
                            post(
                                Action.SetViewUiState(viewId, { filterPopoverHighlight: chipStates.get(viewId)?.prev }),
                            ),
                    },
                    { id: 'select', description: 'Select', execute: () => E.applyHighlightedDateRange(viewId) },
                    {
                        id: 'navigate:next-apply',
                        description: 'Focus dates',
                        execute: () => {
                            if (chipStates.get(viewId)?.dateRangeKey === 'customDates')
                                startDateEl.current?.focus('month')
                        },
                    },
                    {
                        id: 'dismiss',
                        description: 'Dismiss',
                        execute: () => post(Action.SetFilterPopoverOpen(viewId, null)),
                    },
                ]),
            )
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Separator line for option lists
// @sig OptionSeparator :: { id: String } -> ReactElement
const OptionSeparator = ({ id }) => (
    <Box key={id} style={{ padding: 'var(--space-1) var(--space-3)', userSelect: 'none' }}>
        <Text size="1" color="gray">
            ───────────────
        </Text>
    </Box>
)

// Selectable option row for dropdown menus
// @sig SelectableOption :: { id, label, isSelected, isHighlighted?, onSelect, closeOnSelect? } -> ReactElement
const SelectableOption = ({ id, label, isSelected, isHighlighted = false, onSelect, closeOnSelect = true }) => {
    const style = F.makeOptionStyle(isSelected, isHighlighted)
    const content = (
        <Box key={id} style={style} onClick={() => onSelect(id)}>
            <Text size="2" weight={isSelected ? 'medium' : 'regular'}>
                {label}
            </Text>
        </Box>
    )
    return closeOnSelect ? <Popover.Close key={id}>{content}</Popover.Close> : content
}

// Date range option — selects own highlight/selection state, renders separator or selectable row
// @sig DateRangeOption :: { option: { key, label }, viewId: String } -> ReactElement
const DateRangeOption = ({ option, viewId }) => {
    const { key, label } = option
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const { highlightedItemId } = useSelector(state => S.UI.filterPopoverData(state, viewId))
    if (key.startsWith('separator')) return <OptionSeparator key={key} id={key} />
    const props = {
        id: key,
        label,
        isSelected: key === dateRangeKey,
        isHighlighted: key === highlightedItemId,
        onSelect: key => E.onSelect(viewId, key),
        closeOnSelect: key !== 'customDates',
    }
    return <SelectableOption key={key} {...props} />
}

// List of date range options — maps options to self-selecting DateRangeOption components
// @sig DateRangeList :: { viewId: String } -> ReactElement
const DateRangeList = ({ viewId }) => (
    <Flex direction="column">
        {dateRangeOptions.map(opt => (
            <DateRangeOption key={opt.key} option={opt} viewId={viewId} />
        ))}
    </Flex>
)

// Custom date range inputs — selects own dates, renders start/end date pickers
// @sig CustomDateRange :: { viewId: String } -> ReactElement?
const CustomDateRange = ({ viewId }) => {
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const customStartDate = useSelector(state => S.UI.customStartDate(state, viewId))
    const customEndDate = useSelector(state => S.UI.customEndDate(state, viewId))
    if (dateRangeKey !== 'customDates') return null
    const customDateStyle = { borderTop: '1px solid var(--gray-5)' }
    const startProps = {
        ref: el => (startDateEl.current = el),
        value: customStartDate,
        onChange: date => E.onStartDate(viewId, date),
        placeholder: 'MM/DD/YYYY',
        onTabOut: () => endDateEl.current?.focus('month'),
        actionContext: viewId,
    }
    const endProps = {
        ref: el => (endDateEl.current = el),
        value: customEndDate,
        onChange: date => E.onEndDate(viewId, date),
        placeholder: 'MM/DD/YYYY',
        onTabOut: () => startDateEl.current?.focus('month'),
        actionContext: viewId,
    }
    return (
        <Flex direction="column" gap="2" mt="2" p="2" style={customDateStyle}>
            <Flex direction="column" gap="1">
                <Text size="1" color="gray" weight="medium">
                    Start Date
                </Text>
                <KeyboardDateInput {...startProps} />
            </Flex>
            <Flex direction="column" gap="1">
                <Text size="1" color="gray" weight="medium">
                    End Date
                </Text>
                <KeyboardDateInput {...endProps} />
            </Flex>
        </Flex>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// Convert DATE_RANGES object to array of {key, label} entries
// @sig dateRangeOptions :: [{ key: String, label: String }]
const dateRangeOptions = Object.entries(DateRangeUtils.DATE_RANGES).map(([key, label]) => ({ key, label }))

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

const startDateEl = { current: null }
const endDateEl = { current: null }

// Per-viewId state maps — prevents multi-instance interference when multiple tab groups are open
const chipStates = new Map()
const triggerCleanups = new Map()
const contentCleanups = new Map()

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Date filter chip with keyboard-navigable date range options popover
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: 'all', dateRange: { start: null, end: null } }))
    }

    const preventAutoFocus = e => e.preventDefault()
    const contentRef = el => E.registerContentActions(viewId, el)

    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const customStartDate = useSelector(state => S.UI.customStartDate(state, viewId))
    const customEndDate = useSelector(state => S.UI.customEndDate(state, viewId))
    const popoverData = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const { popoverId, nextHighlightIndex, prevHighlightIndex, highlightedItemId } = popoverData
    const isOpen = popoverId === 'date'
    const triggerStyle = ChipStyles.makeChipTriggerStyle(180, isActive)
    const contentStyle = { padding: 'var(--space-1)', width: 220 }
    const currentLabel = DateRangeUtils.DATE_RANGES[dateRangeKey] || 'All dates'

    // prettier-ignore
    chipStates.set(viewId, { next: nextHighlightIndex, prev: prevHighlightIndex, highlightedItemId, dateRangeKey, customStartDate, customEndDate })

    return (
        <Popover.Root open={isOpen} onOpenChange={open => E.onOpenChange(viewId, open)}>
            <Popover.Trigger>
                <Box ref={el => E.registerTriggerActions(viewId, el)} style={triggerStyle}>
                    <Text size="1" weight="medium">
                        Date: {currentLabel}
                    </Text>
                    {isActive && (
                        <Box style={ChipStyles.clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </Box>
            </Popover.Trigger>
            <Popover.Content ref={contentRef} style={contentStyle} onOpenAutoFocus={preventAutoFocus}>
                <DateRangeList viewId={viewId} />
                <CustomDateRange viewId={viewId} />
            </Popover.Content>
        </Popover.Root>
    )
}

// Self-selecting date filter column — selects chipData and renders DateFilterChip
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => {
    const { isActive, details } = useSelector(state => S.UI.dateChipData(state, viewId))
    return <FilterColumn chip={<Chip viewId={viewId} isActive={isActive} />} details={details} />
}

const DateFilterChip = { DateFilterChip: Chip, DateFilterColumn: Column }

export { DateFilterChip }
