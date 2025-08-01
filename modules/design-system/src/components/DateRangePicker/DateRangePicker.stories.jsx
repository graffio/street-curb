/*
 * DateRangePicker.stories.jsx - Storybook stories for DateRangePicker component
 *
 * This file provides interactive examples and documentation for the DateRangePicker component.
 * It demonstrates various usage patterns and configurations for the date range selection interface.
 *
 * STORY STRUCTURE:
 * - Uses Storybook 6+ CSF (Component Story Format)
 * - Provides examples of different states and configurations
 * - Demonstrates integration with callback functions
 * - Shows how date ranges are calculated and applied
 *
 * INTEGRATION WITH OTHER FILES:
 * - DateRangePicker.jsx: The main component being demonstrated
 * - Uses design-system components (Select, Text, Flex)
 * - Demonstrates the filtering logic that would be used in parent components
 *
 * STORY EXAMPLES:
 * - Default: Standard date range filter
 * - WithCallback: Shows how parent components would handle changes
 * - Disabled: Shows disabled state
 * - InSidebar: Shows how it would look in a sidebar context
 */

import { Box, Card, Flex, Separator, Text } from '@radix-ui/themes'
import React, { useState } from 'react'
import { DateRangePicker } from './DateRangePicker.jsx'

export default {
    title: 'DateRangePicker',
    component: DateRangePicker,
    parameters: {
        docs: {
            description: {
                component:
                    'A dropdown filter component for selecting predefined date ranges. Provides common date range options like "Today", "This Week", "This Month", etc.',
            },
        },
    },
    argTypes: {
        value: {
            control: 'select',
            options: [
                'today',
                'thisWeek',
                'thisMonth',
                'yearToDate',
                'lastSevenDays',
                'lastThirtyDays',
                'lastTwelveMonths',
                'lastYear',
                'customDates',
                'all',
            ],
            description: 'Currently selected date range key',
        },
        disabled: { control: 'boolean', description: 'Whether the filter is disabled' },
        currentStartDate: { control: false, description: 'Current start date as Date object' },
        currentEndDate: { control: false, description: 'Current end date as Date object' },
        initialStartDate: { control: false, description: 'Initial start date as Date object' },
        initialEndDate: { control: false, description: 'Initial end date as Date object' },
        onChange: {
            action: 'dateRangeChanged',
            description: 'Callback when date range changes, receives DateRange object or null',
        },
        onValueChange: {
            action: 'valueChanged',
            description: 'Callback when selection key changes, receives string key',
        },
    },
}

export const Disabled = {
    args: {
        value: 'thisMonth',
        disabled: true,
        currentStartDate: null,
        currentEndDate: null,
        initialStartDate: null,
        initialEndDate: null,
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows the filter in disabled state, useful when data is loading or filter is not applicable',
            },
        },
    },
}

export const WithCallback = () => {
    /*
     * Render date range information when available
     */
    const renderDateRangeInfo = dateRange => (
        <>
            <Text size="2">
                Start: <strong>{dateRange.start.toLocaleDateString()}</strong>
            </Text>
            <Text size="2">
                End: <strong>{dateRange.end.toLocaleDateString()}</strong>
            </Text>
        </>
    )

    /*
     * Render no date range message
     */
    const renderNoDateRange = () => (
        <Text size="2">
            Date Range: <strong>All (no filtering)</strong>
        </Text>
    )

    /*
     * Render last changed timestamp
     */
    const renderLastChanged = lastChanged => {
        if (!lastChanged) return null

        return (
            <Text size="1" color="gray">
                Last changed: {lastChanged}
            </Text>
        )
    }

    /*
     * Handle date range changes
     */
    const handleDateRangeChange = (newDateRange, setDateRange, setLastChanged) => {
        setDateRange(newDateRange)
        setLastChanged(new Date().toLocaleTimeString())
    }

    /*
     * Handle value changes
     */
    const handleValueChange = (newValue, setSelectedRange) => {
        setSelectedRange(newValue)
    }

    const [selectedRange, setSelectedRange] = useState('thisMonth')
    const [dateRange, setDateRange] = useState(null)
    const [lastChanged, setLastChanged] = useState(null)

    return (
        <Flex direction="column" gap="4" style={{ maxWidth: '400px' }}>
            <DateRangePicker
                value={selectedRange}
                onChange={newDateRange => handleDateRangeChange(newDateRange, setDateRange, setLastChanged)}
                onValueChange={newValue => handleValueChange(newValue, setSelectedRange)}
            />

            <Card style={{ padding: '16px' }}>
                <Flex direction="column" gap="2">
                    <Text size="3" weight="medium">
                        Current State:
                    </Text>
                    <Text size="2">
                        Selected: <strong>{selectedRange}</strong>
                    </Text>
                    {dateRange ? renderDateRangeInfo(dateRange) : renderNoDateRange()}
                    {renderLastChanged(lastChanged)}
                </Flex>
            </Card>
        </Flex>
    )
}

WithCallback.parameters = {
    docs: {
        description: {
            story: 'Interactive example showing how the component handles callbacks and state changes. Select different date ranges to see the calculated start and end dates.',
        },
    },
}

// Mock initial values (first transaction date and today)
const getInitialEndDate = () => new Date()
const getInitialStartDate = () => new Date(2023, 0, 15) // January 15, 2023

export const CustomDates = () => {
    /*
     * Render current date state information
     */
    const renderCurrentDateState = (currentStartDate, currentEndDate) => (
        <>
            <Text size="2">
                Current Start: <strong>{currentStartDate ? currentStartDate.toLocaleDateString() : 'Not set'}</strong>
            </Text>
            <Text size="2">
                Current End: <strong>{currentEndDate ? currentEndDate.toLocaleDateString() : 'Not set'}</strong>
            </Text>
        </>
    )

    /*
     * Render calculated date range when available
     */
    const renderCalculatedRange = dateRange => (
        <>
            <Text size="2">
                Calculated Start: <strong>{dateRange.start.toLocaleDateString()}</strong>
            </Text>
            <Text size="2">
                Calculated End: <strong>{dateRange.end.toLocaleDateString()}</strong>
            </Text>
        </>
    )

    /*
     * Render no valid range message
     */
    const renderNoValidRange = () => (
        <Text size="2">
            Date Range: <strong>No valid range</strong>
        </Text>
    )

    /*
     * Render last changed timestamp if available
     */
    const renderLastChanged = lastChanged => {
        if (!lastChanged) return null

        return (
            <Text size="1" color="gray">
                Last changed: {lastChanged}
            </Text>
        )
    }

    const [selectedRange, setSelectedRange] = useState('customDates')
    const [dateRange, setDateRange] = useState(null)
    const [currentStartDate, setCurrentStartDate] = useState(null)
    const [currentEndDate, setCurrentEndDate] = useState(null)
    const [lastChanged, setLastChanged] = useState(null)

    const initialStartDate = getInitialStartDate() // Example: earliest transaction date
    const initialEndDate = getInitialEndDate() // Today

    const handleDateRangeChange = newDateRange => {
        setDateRange(newDateRange)
        setLastChanged(new Date().toLocaleTimeString())
    }

    const handleValueChange = newValue => setSelectedRange(newValue)
    const handleCurrentStartDateChange = newStartDate => setCurrentStartDate(newStartDate)
    const handleCurrentEndDateChange = newEndDate => setCurrentEndDate(newEndDate)

    return (
        <Flex direction="column" gap="4" style={{ maxWidth: '400px' }}>
            <DateRangePicker
                value={selectedRange}
                onChange={handleDateRangeChange}
                onValueChange={handleValueChange}
                currentStartDate={currentStartDate}
                currentEndDate={currentEndDate}
                onCurrentStartDateChange={handleCurrentStartDateChange}
                onCurrentEndDateChange={handleCurrentEndDateChange}
                initialStartDate={initialStartDate}
                initialEndDate={initialEndDate}
            />

            <Card style={{ padding: '16px' }}>
                <Flex direction="column" gap="2">
                    <Text size="3" weight="medium">
                        Current State:
                    </Text>
                    <Text size="2">
                        Selected: <strong>{selectedRange}</strong>
                    </Text>
                    {renderCurrentDateState(currentStartDate, currentEndDate)}
                    {dateRange ? renderCalculatedRange(dateRange) : renderNoValidRange()}
                    {renderLastChanged(lastChanged)}
                </Flex>
            </Card>
        </Flex>
    )
}

CustomDates.parameters = {
    docs: {
        description: {
            story: 'Demonstrates the custom date input functionality. When "Custom Dates" is selected, date input fields appear allowing users to specify exact start and end dates. Change the dates to see the calculated range update in real-time.',
        },
    },
}

export const InSidebar = () => {
    /*
     * Render additional KeyboardDateInput placeholder
     */
    const renderAdditionalFilters = () => (
        <Flex direction="column" gap="2">
            <Text size="2" weight="medium" color="gray">
                Additional Filters
            </Text>
            <Text size="2" color="gray">
                (Search, Category, Amount, etc. would go here)
            </Text>
        </Flex>
    )

    /*
     * Render clear KeyboardDateInput button
     */
    const renderClearFiltersButton = handleClearFilters => (
        <button
            onClick={handleClearFilters}
            style={{
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
            }}
        >
            Clear Filters
        </button>
    )

    /*
     * Get filter status text
     */
    const getFilterStatusText = selectedRange =>
        selectedRange === 'all' ? 'No date filter' : `Filtered by ${selectedRange}`

    /*
     * Render date range display when available
     */
    const renderDateRangeDisplay = dateRange => {
        if (!dateRange) return null

        return (
            <Text size="1" color="gray">
                {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
            </Text>
        )
    }

    /*
     * Render filter status box
     */
    const renderFilterStatus = (selectedRange, dateRange) => (
        <Box>
            <Text size="1" color="gray">
                Filter Status: {getFilterStatusText(selectedRange)}
            </Text>
            {renderDateRangeDisplay(dateRange)}
        </Box>
    )

    /*
     * Clear all KeyboardDateInput
     */
    const clearAllFilters = (
        setSelectedRange,
        setDateRange,
        setSearchQuery,
        setCurrentStartDate,
        setCurrentEndDate,
    ) => {
        setSelectedRange('all')
        setDateRange(null)
        setSearchQuery('')
        setCurrentStartDate(null)
        setCurrentEndDate(null)
    }

    const [selectedRange, setSelectedRange] = useState('thisMonth')
    const [dateRange, setDateRange] = useState(null)
    const [, setSearchQuery] = useState('')
    const [currentStartDate, setCurrentStartDate] = useState(null)
    const [currentEndDate, setCurrentEndDate] = useState(null)

    const initialStartDate = getInitialStartDate() // Example: earliest transaction date
    const initialEndDate = getInitialEndDate() // Today

    const handleDateRangeChange = newDateRange => setDateRange(newDateRange)
    const handleValueChange = newValue => setSelectedRange(newValue)
    const handleCurrentStartDateChange = newStartDate => setCurrentStartDate(newStartDate)
    const handleCurrentEndDateChange = newEndDate => setCurrentEndDate(newEndDate)
    const handleClearFilters = () =>
        clearAllFilters(setSelectedRange, setDateRange, setSearchQuery, setCurrentStartDate, setCurrentEndDate)

    return (
        <Card style={{ width: '280px', padding: '16px' }}>
            <Flex direction="column" gap="4">
                <Text size="3" weight="medium">
                    Filters
                </Text>

                <DateRangePicker
                    value={selectedRange}
                    onChange={handleDateRangeChange}
                    onValueChange={handleValueChange}
                    currentStartDate={currentStartDate}
                    currentEndDate={currentEndDate}
                    onCurrentStartDateChange={handleCurrentStartDateChange}
                    onCurrentEndDateChange={handleCurrentEndDateChange}
                    initialStartDate={initialStartDate}
                    initialEndDate={initialEndDate}
                />

                <Separator />
                {renderAdditionalFilters()}
                <Separator />

                <Flex direction="column" gap="2">
                    {renderClearFiltersButton(handleClearFilters)}
                    {renderFilterStatus(selectedRange, dateRange)}
                </Flex>
            </Flex>
        </Card>
    )
}

InSidebar.parameters = {
    docs: {
        description: {
            story: 'Shows how the DateRangePicker would appear in a sidebar context alongside other KeyboardDateInput. This demonstrates the intended usage pattern within the TransactionRegister page.',
        },
    },
}
