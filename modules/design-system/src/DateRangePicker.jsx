/*
 * DateRangePicker - A dropdown filter component for selecting predefined date ranges
 *
 * This component provides a dropdown with common date range options (today, this week, etc.)
 * and triggers a callback when the selection changes. It's designed to be part of a larger
 * filter block in the sidebar.
 *
 * BUSINESS LOGIC:
 * - Provides predefined date ranges that users commonly need
 * - Calculates actual start/end dates based on the selected range
 * - Supports "all" option to show all transactions without date filtering
 * - Uses consistent date handling for boundary conditions
 *
 * INTEGRATION:
 * - Designed to work with transaction filtering logic
 * - Calls onChange with { start: Date, end: Date } or null for "all"
 * - Compatible with existing filterByDateRange function patterns
 */

import { endOfDay } from '@graffio/functional'
import { Flex, Select, Text } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { KeyboardDateInput } from './components/KeyboardDateInput/KeyboardDateInput.jsx'
import { calculateDateRange, DATE_RANGES } from './utils/date-range-utils.js'

/*
 * Handle custom dates selection mode
 * @sig handleCustomDatesMode :: Object -> void
 */
const handleCustomDatesMode = ({ activeStartDate, activeEndDate, onChange }) =>
    activeStartDate && activeEndDate
        ? onChange?.({ start: activeStartDate, end: endOfDay(activeEndDate) })
        : onChange?.(null)

/*
 * Handle predefined range selection mode
 * @sig handlePredefinedRangeMode :: (String, Object) -> void
 */
const handlePredefinedRangeMode = (selectedValue, { onChange }) => onChange?.(calculateDateRange(selectedValue))

/*
 * Update current start date
 * @sig updateCurrentStartDate :: (Date?, Object) -> void
 */
const updateCurrentStartDate = (newStartDate, { onCurrentStartDateChange, setInternalCurrentStartDate }) =>
    onCurrentStartDateChange ? onCurrentStartDateChange(newStartDate) : setInternalCurrentStartDate(newStartDate)

/*
 * Update current end date
 * @sig updateCurrentEndDate :: (Date?, Object) -> void
 */
const updateCurrentEndDate = (newEndDate, { onCurrentEndDateChange, setInternalCurrentEndDate }) =>
    onCurrentEndDateChange ? onCurrentEndDateChange(newEndDate) : setInternalCurrentEndDate(newEndDate)

/*
 * Update date range when in custom dates mode
 * @sig updateRangeIfCustomMode :: (String, Date?, Date?, Object) -> void
 */
const updateRangeIfCustomMode = (value, startDate, endDate, { onChange }) => {
    if (value !== 'customDates') return

    startDate && endDate
        ? onChange?.({
              start: startDate,
              end: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999),
          })
        : onChange?.(null)
}

/*
 * CustomDateInputs - Start and end date input fields
 * @sig CustomDateInputs :: Props -> ReactElement
 *     Props = {
 *         startDate: Date?,
 *         endDate: Date?,
 *         onStartDateChange: (Date?) -> void,
 *         onEndDateChange: (Date?) -> void,
 *         disabled: Boolean?
 *     }
 */
const CustomDateInputs = ({ startDate, endDate, onStartDateChange, onEndDateChange, disabled = false }) => {
    const startDateRef = useRef(null)
    const endDateRef = useRef(null)

    return (
        <Flex direction="column" gap="2" mt="2">
            <Flex direction="column" gap="1">
                <Text size="1" color="gray" weight="medium">
                    Start Date
                </Text>
                <KeyboardDateInput
                    ref={startDateRef}
                    value={startDate}
                    onChange={onStartDateChange}
                    disabled={disabled}
                    placeholder="MM/DD/YYYY"
                    onTabOut={() => endDateRef?.current?.focus('month')}
                    onShiftTabOut={() => endDateRef?.current?.focus('year')}
                />
            </Flex>
            <Flex direction="column" gap="1">
                <Text size="1" color="gray" weight="medium">
                    End Date
                </Text>
                <KeyboardDateInput
                    ref={endDateRef}
                    value={endDate}
                    onChange={onEndDateChange}
                    disabled={disabled}
                    placeholder="MM/DD/YYYY"
                    onTabOut={() => startDateRef?.current?.focus('month')}
                    onShiftTabOut={() => startDateRef?.current?.focus('year')}
                />
            </Flex>
        </Flex>
    )
}

/*
 * DateRangeSelect - Dropdown for selecting predefined date ranges
 * @sig DateRangeSelect :: Props -> ReactElement
 *     Props = {
 *         value: String,
 *         onValueChange: (String) -> void,
 *         disabled: Boolean?
 *     }
 */
const DateRangeSelect = ({ value, onValueChange, disabled = false }) => {
    const renderDateRangeOption = ([key, label]) => {
        if (key.startsWith('separator')) return <Select.Separator key={key} />
        return (
            <Select.Item key={key} value={key}>
                {label}
            </Select.Item>
        )
    }

    return (
        <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
            <Select.Trigger placeholder="Select date range..." />
            <Select.Content position="popper">{Object.entries(DATE_RANGES).map(renderDateRangeOption)}</Select.Content>
        </Select.Root>
    )
}

/*
 * DateRangePicker component
 * @sig DateRangePicker :: Props -> ReactElement
 *     Props = {
 *         value: String?,
 *         onChange: (DateRange?) -> void,
 *         onValueChange: (String) -> void?,
 *         currentStartDate: Date?,
 *         currentEndDate: Date?,
 *         onCurrentStartDateChange: (Date?) -> void?,
 *         onCurrentEndDateChange: (Date?) -> void?,
 *         initialStartDate: Date?,
 *         initialEndDate: Date?,
 *         disabled: Boolean?
 *     }
 */
const DateRangePicker = ({
    value = 'all',
    onChange,
    onValueChange,
    currentStartDate = null,
    currentEndDate = null,
    onCurrentStartDateChange,
    onCurrentEndDateChange,
    initialStartDate = null,
    initialEndDate = null,
    disabled = false,
}) => {
    /*
     * Update initial values for current date inputs when switching to custom mode
     */
    const updateCurrentDateInitialValues = () => {
        // Use provided initial values or previous range dates
        const startInitial = previousDateRange ? previousDateRange.start : initialStartDate
        const endInitial = previousDateRange ? previousDateRange.end : initialEndDate

        // Apply initial values if current values are empty
        const shouldUpdateStart = !activeCurrentStartDate && startInitial
        const shouldUpdateEnd = !activeCurrentEndDate && endInitial

        if (shouldUpdateStart)
            updateCurrentStartDate(startInitial, { onCurrentStartDateChange, setInternalCurrentStartDate })
        if (shouldUpdateEnd) updateCurrentEndDate(endInitial, { onCurrentEndDateChange, setInternalCurrentEndDate })

        // Create range if both dates are now available
        const finalStartDate = shouldUpdateStart ? startInitial : activeCurrentStartDate
        const finalEndDate = shouldUpdateEnd ? endInitial : activeCurrentEndDate

        if ((shouldUpdateStart || shouldUpdateEnd) && finalStartDate && finalEndDate) {
            const dateRange = { start: finalStartDate, end: endOfDay(finalEndDate) }
            onChange?.(dateRange)
        }
    }

    const handleSelectionChange = selectedValue => {
        const context = { activeStartDate: activeCurrentStartDate, activeEndDate: activeCurrentEndDate, onChange }

        if (selectedValue === 'customDates') handleCustomDatesMode(context)
        else handlePredefinedRangeMode(selectedValue, context)

        onValueChange?.(selectedValue)
    }

    const handleCurrentStartDateChange = newStartDate => {
        const context = { onCurrentStartDateChange, setInternalCurrentStartDate, onChange }

        updateCurrentStartDate(newStartDate, context)
        updateRangeIfCustomMode(value, newStartDate, activeCurrentEndDate, context)
    }

    const handleCurrentEndDateChange = newEndDate => {
        const context = { onCurrentEndDateChange, setInternalCurrentEndDate, onChange }

        updateCurrentEndDate(newEndDate, context)
        updateRangeIfCustomMode(value, activeCurrentStartDate, newEndDate, context)
    }

    const [internalCurrentStartDate, setInternalCurrentStartDate] = useState(initialStartDate)
    const [internalCurrentEndDate, setInternalCurrentEndDate] = useState(initialEndDate)
    const [previousSelection, setPreviousSelection] = useState(null)
    const [previousDateRange, setPreviousDateRange] = useState(null)

    // Use provided current dates or internal state
    const activeCurrentStartDate = currentStartDate !== null ? currentStartDate : internalCurrentStartDate
    const activeCurrentEndDate = currentEndDate !== null ? currentEndDate : internalCurrentEndDate

    // Track previous selection to use its date range as custom defaults
    useEffect(() => {
        if (value === 'customDates' || value === previousSelection) return

        setPreviousSelection(value)
        // Calculate and store the date range for the current selection
        const dateRange = calculateDateRange(value)
        setPreviousDateRange(dateRange)
    }, [value, previousSelection])

    // When switching to custom dates mode, populate with initial values if fields are empty
    useEffect(() => {
        if (value !== 'customDates') return

        updateCurrentDateInitialValues()
    }, [
        value,
        previousDateRange,
        initialStartDate,
        initialEndDate,
        activeCurrentStartDate,
        activeCurrentEndDate,
        onCurrentStartDateChange,
        onCurrentEndDateChange,
        onChange,
    ])

    return (
        <Flex direction="column" gap="2">
            <DateRangeSelect value={value} onValueChange={handleSelectionChange} disabled={disabled} />

            {value === 'customDates' && (
                <CustomDateInputs
                    startDate={activeCurrentStartDate}
                    endDate={activeCurrentEndDate}
                    onStartDateChange={handleCurrentStartDateChange}
                    onEndDateChange={handleCurrentEndDateChange}
                    disabled={disabled}
                />
            )}
        </Flex>
    )
}

DateRangePicker.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    onValueChange: PropTypes.func,
    currentStartDate: PropTypes.instanceOf(Date),
    currentEndDate: PropTypes.instanceOf(Date),
    onCurrentStartDateChange: PropTypes.func,
    onCurrentEndDateChange: PropTypes.func,
    initialStartDate: PropTypes.instanceOf(Date),
    initialEndDate: PropTypes.instanceOf(Date),
    disabled: PropTypes.bool,
}

export { DateRangePicker }
