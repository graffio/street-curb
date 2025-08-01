/*
 * date-utils.js - Core date manipulation utilities
 *
 * This module provides pure, generic date functions that can be used across
 * any application. These functions have no dependencies on UI frameworks
 * or business logic.
 *
 * FUNCTIONAL APPROACH:
 * - All functions are pure with no side effects
 * - Immutable data structures throughout
 * - Composable and easily testable
 * - Follows Hindley-Milner type documentation
 */

// ==================== CORE DATE UTILITIES ====================

/*
 * Get the number of days in a given month/year
 * @sig getDaysInMonth :: (Number, Number) -> Number
 */
const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate()

/*
 * Set date to start of day (00:00:00.000)
 * @sig startOfDay :: Date -> Date
 */
const startOfDay = date => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

/*
 * Set date to end of day (23:59:59.999)
 * @sig endOfDay :: Date -> Date
 */
const endOfDay = date => {
    const d = new Date(date)
    d.setHours(23, 59, 59, 999)
    return d
}

/*
 * Add days to a date
 * @sig addDays :: (Date, Number) -> Date
 */
const addDays = (d, days) => {
    const result = new Date(d)
    result.setDate(d.getDate() + days)
    return result
}

/*
 * Subtract days from a date
 * @sig subtractDays :: (Date, Number) -> Date
 */
const subtractDays = (d, days) => addDays(d, -days)

// ==================== PERIOD CALCULATIONS ====================

/*
 * Get the start of the week (Sunday) for a given date
 * @sig startOfWeek :: Date -> Date
 */
const startOfWeek = d => {
    const start = new Date(d)
    start.setDate(d.getDate() - d.getDay())
    return start
}

/*
 * Get the end of the week (Saturday) for a given date
 * @sig endOfWeek :: Date -> Date
 */
const endOfWeek = d => addDays(startOfWeek(d), 6)

/*
 * Get the start of the month for a given date
 * @sig startOfMonth :: Date -> Date
 */
const startOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1)

/*
 * Get the end of the month for a given date
 * @sig endOfMonth :: Date -> Date
 */
const endOfMonth = d => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)

/*
 * Get the start of the quarter for a given date
 * @sig startOfQuarter :: Date -> Date
 */
const startOfQuarter = d => new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1)

/*
 * Get the end of the quarter for a given date
 * @sig endOfQuarter :: Date -> Date
 */
const endOfQuarter = d => new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3 + 3, 0, 23, 59, 59, 999)

/*
 * Get the start of the year for a given date
 * @sig startOfYear :: Date -> Date
 */
const startOfYear = d => new Date(d.getFullYear(), 0, 1)

/*
 * Get the end of the year for a given date
 * @sig endOfYear :: Date -> Date
 */
const endOfYear = d => new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999)

// ==================== DATE PARSING AND FORMATTING ====================

/*
 * Parse YYYY-MM-DD format date string
 * @sig parseIsoDateFormat :: String -> DateParts
 *     DateParts = { month: Number, day: Number, year: Number }
 */
const parseIsoDateFormat = dateString => {
    const parts = dateString.split('-')
    return {
        month: parseInt(parts[1], 10) || 1,
        day: parseInt(parts[2], 10) || 1,
        year: parseInt(parts[0], 10) || new Date().getFullYear(),
    }
}

/*
 * Parse MM/DD/YYYY format date string
 * @sig parseSlashDateFormat :: String -> DateParts
 *     DateParts = { month: Number, day: Number, year: Number }
 */
const parseSlashDateFormat = dateString => {
    const parts = dateString.split('/')
    return {
        month: parseInt(parts[0], 10) || 1,
        day: parseInt(parts[1], 10) || 1,
        year: parseInt(parts[2], 10) || new Date().getFullYear(),
    }
}

/*
 * Format date parts to MM/DD/YYYY string
 * @sig formatDateString :: DateParts -> String
 *     DateParts = { month: Number, day: Number, year: Number }
 */
const formatDateString = ({ month, day, year }) => {
    const monthStr = String(month).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${monthStr}/${dayStr}/${year}`
}

/*
 * Convert Date object to date parts
 * @sig dateToDateParts :: Date? -> DateParts
 *     DateParts = { month: Number, day: Number, year: Number }
 */
const dateToDateParts = date => {
    if (!date) return { month: 1, day: 1, year: new Date().getFullYear() }
    return { month: date.getMonth() + 1, day: date.getDate(), year: date.getFullYear() }
}

/*
 * Convert date parts to Date object
 * @sig datePartsToDate :: DateParts -> Date
 *     DateParts = { month: Number, day: Number, year: Number }
 */
const datePartsToDate = ({ month, day, year }) => new Date(year, month - 1, day)

/*
 * Convert MM/DD/YYYY to YYYY-MM-DD format for Date constructor
 * @sig convertSlashToIso :: String -> String
 */
const convertSlashToIso = dateString => {
    const parts = dateString.split('/')
    if (parts.length !== 3) return dateString

    const month = parts[0].padStart(2, '0')
    const day = parts[1].padStart(2, '0')
    const year = parts[2]
    return `${year}-${month}-${day}`
}

// Export all generic date utilities
export {
    // Core utilities
    getDaysInMonth,
    startOfDay,
    endOfDay,
    addDays,
    subtractDays,

    // Period calculations
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfQuarter,
    endOfQuarter,
    startOfYear,
    endOfYear,

    // Parsing and formatting
    parseIsoDateFormat,
    parseSlashDateFormat,
    formatDateString,
    dateToDateParts,
    datePartsToDate,
    convertSlashToIso,
}
