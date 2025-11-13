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

import { Card, Flex, Text } from '@radix-ui/themes'
import React, { useState } from 'react'
import { DateRangePicker } from '../src/index.js'

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
