// ABOUTME: Date input validation and formatting utilities for UI components
// ABOUTME: Handles constraints, defaults, parsing for date picker inputs
// COMPLEXITY-TODO: functions — Date input validation requires many helpers (expires 2026-04-01)
// COMPLEXITY-TODO: cohesion-structure — Utility exports differ from cohesion groups (expires 2026-04-01)
// COMPLEXITY-TODO: chain-extraction — newParts accessed for validation checks (expires 2026-04-01)
// COMPLEXITY-TODO: single-level-indentation — Validation requires nested checks (expires 2026-04-01)
// COMPLEXITY-TODO: sig-documentation — Internal validation helpers (expires 2026-04-01)
/*
 * date-input-utils.js - Date input validation and formatting utilities
 *
 * This module provides utilities specifically for handling date inputs in UI components.
 * It handles validation, constraints, defaults, and user input parsing.
 *
 * FUNCTIONAL APPROACH:
 * - All functions are pure with no side effects
 * - Immutable data structures throughout
 * - Composable and easily testable
 * - Follows Hindley-Milner type documentation
 */

import { convertSlashToIso, getDaysInMonth, parseIsoDateFormat, parseSlashDateFormat } from '@graffio/functional'

// ==================== DATE VALIDATION AND CONSTRAINTS ====================

/*
 * Create default date parts using today's date
 * @sig createDefaultParts :: () -> DateParts
 *     DateParts = { month: Number, day: Number, year: Number }
 */
const createDefaultParts = () => {
    const today = new Date()
    return { month: today.getMonth() + 1, day: today.getDate(), year: today.getFullYear() }
}

/*
 * Validate and wrap date values with business constraints
 * @sig constrainDatePart :: (String, Number, Number, Number) -> Number
 */
const constrainDatePart = (part, value, month, year) => {
    const constrainMonth = () => {
        if (value < 1) return 12
        if (value > 12) return 1
        return value
    }

    const constrainDay = () => {
        const daysInMonth = getDaysInMonth(month, year)
        if (value < 1) return daysInMonth
        if (value > daysInMonth) return 1
        return value
    }

    const constrainYear = () => {
        if (value < 1900) return 2100
        if (value > 2100) return 1900
        return value
    }

    if (part === 'month') return constrainMonth()
    if (part === 'day') return constrainDay()
    if (part === 'year') return constrainYear()
    return value
}

/*
 * Expand 2-digit year to 4-digit using 1980-2079 window
 * @sig expandTwoDigitYear :: Number -> Number
 */
const expandTwoDigitYear = year => {
    if (year >= 100) return year
    return year >= 80 ? 1900 + year : 2000 + year
}

/*
 * Update date part with validation and day adjustment for month/year changes
 * @sig updateDatePartWithValidation :: (DateParts, String, Number) -> DateParts
 *     DateParts = { month: Number, day: Number, year: Number }
 */
const updateDatePartWithValidation = (dateParts, activePart, newValue) => {
    const validated = constrainDatePart(activePart, newValue, dateParts.month, dateParts.year)
    const newParts = { ...dateParts, [activePart]: validated }

    // If we changed month or year, validate day
    if (activePart === 'month' || activePart === 'year') {
        const maxDay = getDaysInMonth(newParts.month, newParts.year)
        if (newParts.day > maxDay) newParts.day = maxDay
    }

    return newParts
}

// ==================== DATE PARSING AND FORMATTING FOR INPUTS ====================

/*
 * Parse date string into parts (supports both ISO and slash formats)
 * @sig parseDateString :: String -> DateParts
 *     DateParts = { month: Number, day: Number, year: Number }
 */
const parseDateString = dateString => {
    if (!dateString) return createDefaultParts()
    return dateString.includes('-') ? parseIsoDateFormat(dateString) : parseSlashDateFormat(dateString)
}

/*
 * Convert to MM/DD/YYYY display format
 * @sig toDisplayDateString :: DateParts -> String
 *     DateParts = { month: Number, day: Number, year: Number }
 */
const toDisplayDateString = ({ month, day, year }) => {
    const monthStr = String(month).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${monthStr}/${dayStr}/${year}`
}

/*
 * Format Date object for input field (MM/DD/YYYY)
 * @sig formatDateForInput :: Date -> String
 */
const formatDateForInput = date => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}/${day}/${year}`
}

/*
 * Parse date from input field (MM/DD/YYYY or YYYY-MM-DD)
 * @sig parseDateFromInput :: String -> Date?
 */
const parseDateFromInput = dateString => {
    if (!dateString) return undefined

    // Handle both MM/DD/YYYY and YYYY-MM-DD formats
    const isoString = dateString.includes('/') ? convertSlashToIso(dateString) : dateString
    const date = new Date(isoString + 'T00:00:00')
    return isNaN(date.getTime()) ? undefined : date
}

// ==================== FORM DEFAULTS ====================

/*
 * Determine default start date from previous range or fallback
 * @sig getDefaultStartDate :: (String, DateRange?) -> String
 */
const getDefaultStartDate = (defaultStartDate, previousDateRange) =>
    previousDateRange ? formatDateForInput(previousDateRange.start) : defaultStartDate

/*
 * Determine default end date from previous range or fallback
 * @sig getDefaultEndDate :: (String, DateRange?) -> String
 */
const getDefaultEndDate = (defaultEndDate, previousDateRange) =>
    previousDateRange ? formatDateForInput(previousDateRange.end) : defaultEndDate

/*
 * Apply date defaults if current values are empty
 * @sig applyDateDefaults :: ApplyDefaultsContext -> ApplyDefaultsResult
 *     ApplyDefaultsContext = {
 *         currentStartDate: String,
 *         currentEndDate: String,
 *         startDefault: String,
 *         endDefault: String
 *     }
 *     ApplyDefaultsResult = {
 *         startDate: String,
 *         endDate: String,
 *         startUpdated: Boolean,
 *         endUpdated: Boolean
 *     }
 */
const applyDateDefaults = ({ currentStartDate, currentEndDate, startDefault, endDefault }) => {
    const startUpdated = !currentStartDate && startDefault
    const endUpdated = !currentEndDate && endDefault

    return {
        startDate: startUpdated ? startDefault : currentStartDate,
        endDate: endUpdated ? endDefault : currentEndDate,
        startUpdated: Boolean(startUpdated),
        endUpdated: Boolean(endUpdated),
    }
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const DateInputUtils = {
    createDefaultParts,
    constrainDatePart,
    expandTwoDigitYear,
    updateDatePartWithValidation,
    parseDateString,
    toDisplayDateString,
    formatDateForInput,
    convertSlashToIso,
    parseDateFromInput,
    getDefaultStartDate,
    getDefaultEndDate,
    applyDateDefaults,
}

export { DateInputUtils }
