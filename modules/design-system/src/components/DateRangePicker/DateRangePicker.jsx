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
import { Select, Text } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { calculateDateRange, DATE_RANGES } from '../../utils/date-range-utils.js'
import { KeyboardDateInput } from '../KeyboardDateInput/KeyboardDateInput.jsx'
import * as styles from './DateRangePicker.css.js'

/*
 * Handle custom dates selection mode
 * @sig handleCustomDatesMode :: Object -> void
 */
const handleCustomDatesMode = ({ activeStartDate, activeEndDate, onChange }) => {
    if (!activeStartDate || !activeEndDate) {
        onChange?.(null)
        return
    }

    const dateRange = { start: activeStartDate, end: endOfDay(activeEndDate) }
    onChange?.(dateRange)
}

/*
 * Handle predefined range selection mode
 * @sig handlePredefinedRangeMode :: (String, Object) -> void
 */
const handlePredefinedRangeMode = (selectedValue, { onChange }) => {
    const dateRange = calculateDateRange(selectedValue)
    onChange?.(dateRange)
}

/*
 * Update current start date
 * @sig updateCurrentStartDate :: (Date?, Object) -> void
 */
const updateCurrentStartDate = (newStartDate, { onCurrentStartDateChange, setInternalCurrentStartDate }) => {
    if (onCurrentStartDateChange) return onCurrentStartDateChange(newStartDate)
    return setInternalCurrentStartDate(newStartDate)
}

/*
 * Update current end date
 * @sig updateCurrentEndDate :: (Date?, Object) -> void
 */
const updateCurrentEndDate = (newEndDate, { onCurrentEndDateChange, setInternalCurrentEndDate }) => {
    if (onCurrentEndDateChange) return onCurrentEndDateChange(newEndDate)
    return setInternalCurrentEndDate(newEndDate)
}

/*
 * Update date range when in custom dates mode
 * @sig updateRangeIfCustomMode :: (String, Date?, Date?, Object) -> void
 */
const updateRangeIfCustomMode = (value, startDate, endDate, { onChange }) => {
    if (value !== 'customDates') return

    if (!startDate || !endDate) {
        onChange?.(null)
        return
    }

    const dateRange = {
        start: startDate,
        end: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999),
    }
    onChange?.(dateRange)
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

    /*
     * Handle selection change for both predefined ranges and custom dates
     */
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

    const renderCustomDateInputs = () => (
        <div className={styles.customDateContainer}>
            <div className={styles.dateFieldContainer}>
                <Text size="1" color="gray" className={styles.dateFieldLabel}>
                    Start Date
                </Text>
                <KeyboardDateInput
                    ref={startDateRef}
                    value={activeCurrentStartDate}
                    onChange={handleCurrentStartDateChange}
                    disabled={disabled}
                    placeholder="MM/DD/YYYY"
                    onTabOut={() => endDateRef?.current?.focus('month')} // tab tab tab date year goes to end date month
                    onShiftTabOut={() => endDateRef?.current?.focus('year')} // Shift-tab from start date month goes to end date year (complete reverse cycle)
                />
            </div>
            <div className={styles.dateFieldContainer}>
                <Text size="1" color="gray" className={styles.dateFieldLabel}>
                    End Date
                </Text>
                <KeyboardDateInput
                    ref={endDateRef}
                    value={activeCurrentEndDate}
                    onChange={handleCurrentEndDateChange}
                    disabled={disabled}
                    placeholder="MM/DD/YYYY"
                    onTabOut={() => startDateRef?.current?.focus('month')} // Tab (right) from end date year wraps to start date month
                    onShiftTabOut={() => startDateRef?.current?.focus('year')} // Shift-tab (left) from end date month goes to start date year
                />
            </div>
        </div>
    )

    const renderDateRangeOption = ([key, label]) => {
        if (key.startsWith('separator')) return <Select.Separator key={key} />
        return (
            <Select.Item key={key} value={key}>
                {label}
            </Select.Item>
        )
    }

    const [internalCurrentStartDate, setInternalCurrentStartDate] = useState(initialStartDate)
    const [internalCurrentEndDate, setInternalCurrentEndDate] = useState(initialEndDate)
    const [previousSelection, setPreviousSelection] = useState(null)
    const [previousDateRange, setPreviousDateRange] = useState(null)

    const startDateRef = useRef(null)
    const endDateRef = useRef(null)

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
        <div className={styles.filterContainer}>
            <Text size="2" weight="medium" color="gray" className={styles.filterLabel}>
                Date Range
            </Text>
            <Select.Root value={value} onValueChange={handleSelectionChange} disabled={disabled}>
                <Select.Trigger placeholder="Select date range..." />
                <Select.Content position="popper">
                    {Object.entries(DATE_RANGES).map(renderDateRangeOption)}
                </Select.Content>
            </Select.Root>

            {value === 'customDates' && renderCustomDateInputs()}
        </div>
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
