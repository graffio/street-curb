// ABOUTME: Date range filter chip with inline dropdown
// ABOUTME: Shows current date range, opens options list on click with custom date support

import { Box, calculateDateRange, DATE_RANGES, Flex, KeyboardDateInput, Popover, Text } from '@graffio/design-system'
import { endOfDay } from '@graffio/functional'
import React, { useRef } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'

const baseTriggerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-4)',
    cursor: 'pointer',
    userSelect: 'none',
    width: 180,
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

const optionStyle = { padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderRadius: 'var(--radius-1)' }
const separatorStyle = { padding: 'var(--space-1) var(--space-3)', userSelect: 'none' }

// Convert DATE_RANGES object to array of {key, label} entries
// @sig dateRangeOptions :: [{ key: String, label: String }]
const dateRangeOptions = Object.entries(DATE_RANGES).map(([key, label]) => ({ key, label }))

/*
 * Date filter chip with inline date range options popover
 *
 * @sig DateFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
 */
const DateFilterChip = ({ viewId, isActive = false }) => {
    const handleSelect = key => {
        const dateRange = calculateDateRange(key)
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: key, dateRange }))
    }

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: 'all', dateRange: null }))
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

    // Render a separator row
    // @sig renderSeparator :: String -> ReactElement
    const renderSeparator = key => (
        <Box key={key} style={separatorStyle}>
            <Text size="1" color="gray">
                ───────────────
            </Text>
        </Box>
    )

    // Render a selectable option row
    // @sig renderSelectableOption :: (String, String, Boolean) -> ReactElement
    const renderSelectableOption = (key, label, isSelected) => {
        const style = { ...optionStyle, backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent' }
        const content = (
            <Box key={key} style={style} onClick={() => handleSelect(key)}>
                <Text size="2" weight={isSelected ? 'medium' : 'regular'}>
                    {label}
                </Text>
            </Box>
        )

        // Don't close popover for customDates so user can enter dates
        return key === 'customDates' ? content : <Popover.Close key={key}>{content}</Popover.Close>
    }

    // Render a date range option row
    // @sig renderOption :: { key: String, label: String } -> ReactElement
    const renderOption = ({ key, label }) => {
        if (key.startsWith('separator')) return renderSeparator(key)
        return renderSelectableOption(key, label, key === dateRangeKey)
    }

    const startDateRef = useRef(null)
    const endDateRef = useRef(null)

    const dateRangeKey = useSelector(state => S.dateRangeKey(state, viewId))
    const customStartDate = useSelector(state => S.customStartDate(state, viewId))
    const customEndDate = useSelector(state => S.customEndDate(state, viewId))
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)' }

    const currentLabel = DATE_RANGES[dateRangeKey] || 'All dates'

    return (
        <Popover.Root>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        Date: {currentLabel}
                    </Text>
                    {isActive && (
                        <Box style={clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </Box>
            </Popover.Trigger>
            <Popover.Content style={{ padding: 'var(--space-1)', width: 220 }}>
                <Flex direction="column">{dateRangeOptions.map(renderOption)}</Flex>
                {dateRangeKey === 'customDates' && (
                    <Flex direction="column" gap="2" mt="2" p="2" style={{ borderTop: '1px solid var(--gray-5)' }}>
                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray" weight="medium">
                                Start Date
                            </Text>
                            <KeyboardDateInput
                                ref={startDateRef}
                                value={customStartDate}
                                onChange={handleCustomStartChange}
                                placeholder="MM/DD/YYYY"
                                onTabOut={() => endDateRef?.current?.focus('month')}
                            />
                        </Flex>
                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray" weight="medium">
                                End Date
                            </Text>
                            <KeyboardDateInput
                                ref={endDateRef}
                                value={customEndDate}
                                onChange={handleCustomEndChange}
                                placeholder="MM/DD/YYYY"
                                onTabOut={() => startDateRef?.current?.focus('month')}
                            />
                        </Flex>
                    </Flex>
                )}
            </Popover.Content>
        </Popover.Root>
    )
}

export { DateFilterChip }
