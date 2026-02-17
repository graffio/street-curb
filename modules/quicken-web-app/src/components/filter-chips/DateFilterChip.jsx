// ABOUTME: Date filter chip with keyboard-navigable date range options popover
// ABOUTME: Includes custom date range inputs, helper components for option rendering
// COMPLEXITY-TODO: react-redux-separation — ActionRegistry useEffect awaits non-React mechanism (expires 2026-04-01)

import { Box, Flex, Popover, Text } from '@radix-ui/themes'
import { DateRangeUtils } from '../../utils/date-range-utils.js'
import { KeyboardDateInput } from '../KeyboardDateInput.jsx'
import { endOfDay } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../../commands/post.js'
import * as S from '../../store/selectors.js'
import { currentStore } from '../../store/index.js'
import { Action } from '../../types/action.js'
import { ChipStyles } from './chip-styles.js'
import { FilterColumn } from './FilterColumn.jsx'

const { ActionRegistry } = KeymapModule

const optionStyle = { padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderRadius: 'var(--radius-1)' }
const separatorStyle = { padding: 'var(--space-1) var(--space-3)', userSelect: 'none' }

// Convert DATE_RANGES object to array of {key, label} entries
// @sig dateRangeOptions :: [{ key: String, label: String }]
const dateRangeOptions = Object.entries(DateRangeUtils.DATE_RANGES).map(([key, label]) => ({ key, label }))

// Module-level DOM refs — only one popover open at a time
const startDateEl = { current: null }
const endDateEl = { current: null }

const F = {
    // Creates option style with selected and highlighted states
    // @sig makeOptionStyle :: (Boolean, Boolean?) -> Style
    makeOptionStyle: (isSelected, isHighlighted = false) => ({
        ...optionStyle,
        backgroundColor: isHighlighted ? 'var(--accent-4)' : isSelected ? 'var(--accent-3)' : 'transparent',
    }),
}

const E = {
    // Applies highlighted date range option, focuses custom date input if applicable
    // @sig applyHighlightedDateRange :: String -> void
    applyHighlightedDateRange: viewId => {
        const state = currentStore().getState()
        const { highlightedItemId } = S.UI.filterPopoverData(state, viewId)
        if (!highlightedItemId) return
        const dateRange = DateRangeUtils.calculateDateRange(highlightedItemId) ?? { start: null, end: null }
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: highlightedItemId, dateRange }))
        if (highlightedItemId === 'customDates') setTimeout(() => startDateEl.current?.focus('month'), 0)
    },

    // Registers keyboard navigation actions for DateFilter popover when open
    // @sig registerDateFilterActions :: String -> () -> (() -> void)?
    registerDateFilterActions: viewId => () => {
        const popoverId = S.UI.filterPopoverId(currentStore().getState(), viewId)
        if (popoverId !== 'date') return undefined
        return ActionRegistry.register(viewId, [
            {
                id: 'navigate:down',
                description: 'Move down',
                execute: () => {
                    const { nextHighlightIndex } = S.UI.filterPopoverData(currentStore().getState(), viewId)
                    post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))
                },
            },
            {
                id: 'navigate:up',
                description: 'Move up',
                execute: () => {
                    const { prevHighlightIndex } = S.UI.filterPopoverData(currentStore().getState(), viewId)
                    post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))
                },
            },
            { id: 'select', description: 'Select', execute: () => E.applyHighlightedDateRange(viewId) },
            {
                id: 'navigate:next-apply',
                description: 'Focus dates',
                execute: () => {
                    const dateRangeKey = S.UI.dateRangeKey(currentStore().getState(), viewId)
                    if (dateRangeKey === 'customDates') startDateEl.current?.focus('month')
                },
            },
            { id: 'dismiss', description: 'Dismiss', execute: () => post(Action.SetFilterPopoverOpen(viewId, null)) },
        ])
    },
}

// Separator line for option lists
// @sig OptionSeparator :: { id: String } -> ReactElement
const OptionSeparator = ({ id }) => (
    <Box key={id} style={separatorStyle}>
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

// Date range option that handles both separators and selectable options
// @sig DateRangeOption :: { option: { key, label }, selectedKey, isHighlighted?, onSelect } -> ReactElement
const DateRangeOption = ({ option, selectedKey, isHighlighted = false, onSelect }) => {
    const { key, label } = option
    if (key.startsWith('separator')) return <OptionSeparator key={key} id={key} />
    const closeOnSelect = key !== 'customDates'
    return (
        <SelectableOption
            key={key}
            id={key}
            label={label}
            isSelected={key === selectedKey}
            isHighlighted={isHighlighted}
            onSelect={onSelect}
            closeOnSelect={closeOnSelect}
        />
    )
}

// Date filter chip with keyboard-navigable date range options popover
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const handleSelect = key => {
        const dateRange = DateRangeUtils.calculateDateRange(key) ?? { start: null, end: null }
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: key, dateRange }))
    }

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: 'all', dateRange: { start: null, end: null } }))
    }

    const handleCustomStartChange = date => {
        post(Action.SetTransactionFilter(viewId, { customStartDate: date }))
        if (date && customEndDate)
            post(Action.SetTransactionFilter(viewId, { dateRange: { start: date, end: endOfDay(customEndDate) } }))
    }

    const handleCustomEndChange = date => {
        post(Action.SetTransactionFilter(viewId, { customEndDate: date }))
        if (customStartDate && date)
            post(Action.SetTransactionFilter(viewId, { dateRange: { start: customStartDate, end: endOfDay(date) } }))
    }

    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const customStartDate = useSelector(state => S.UI.customStartDate(state, viewId))
    const customEndDate = useSelector(state => S.UI.customEndDate(state, viewId))
    const popoverData = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const { popoverId, highlightedItemId } = popoverData
    const isOpen = popoverId === 'date'
    const triggerStyle = ChipStyles.makeChipTriggerStyle(180, isActive)
    const currentLabel = DateRangeUtils.DATE_RANGES[dateRangeKey] || 'All dates'

    useEffect(E.registerDateFilterActions(viewId), [isOpen, viewId])

    return (
        <Popover.Root
            open={isOpen}
            onOpenChange={open => post(Action.SetFilterPopoverOpen(viewId, open ? 'date' : null))}
        >
            <Popover.Trigger>
                <Box style={triggerStyle}>
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
            <Popover.Content
                style={{ padding: 'var(--space-1)', width: 220 }}
                onOpenAutoFocus={e => e.preventDefault()}
            >
                {/* prettier-ignore */}
                <Flex direction="column">
                    {dateRangeOptions.map(opt => (
                        <DateRangeOption key={opt.key} option={opt} selectedKey={dateRangeKey}
                            isHighlighted={highlightedItemId === opt.key} onSelect={handleSelect} />
                    ))}
                </Flex>
                {dateRangeKey === 'customDates' && (
                    <Flex direction="column" gap="2" mt="2" p="2" style={{ borderTop: '1px solid var(--gray-5)' }}>
                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray" weight="medium">
                                Start Date
                            </Text>
                            <KeyboardDateInput
                                ref={el => (startDateEl.current = el)}
                                value={customStartDate}
                                onChange={handleCustomStartChange}
                                placeholder="MM/DD/YYYY"
                                onTabOut={() => endDateEl.current?.focus('month')}
                                actionContext={viewId}
                            />
                        </Flex>
                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray" weight="medium">
                                End Date
                            </Text>
                            <KeyboardDateInput
                                ref={el => (endDateEl.current = el)}
                                value={customEndDate}
                                onChange={handleCustomEndChange}
                                placeholder="MM/DD/YYYY"
                                onTabOut={() => startDateEl.current?.focus('month')}
                                actionContext={viewId}
                            />
                        </Flex>
                    </Flex>
                )}
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
