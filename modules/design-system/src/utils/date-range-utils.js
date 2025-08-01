/*
 * date-range-utils.js - Date range calculations and business logic
 *
 * This module provides utilities for calculating date ranges based on business
 * requirements. It includes predefined ranges and range calculation functions.
 *
 * FUNCTIONAL APPROACH:
 * - All functions are pure with no side effects
 * - Immutable data structures throughout
 * - Composable and easily testable
 * - Follows Hindley-Milner type documentation
 */

import {
    endOfDay,
    endOfMonth,
    endOfQuarter,
    endOfWeek,
    endOfYear,
    startOfDay,
    startOfMonth,
    startOfQuarter,
    startOfWeek,
    startOfYear,
    subtractDays,
} from 'functional'

import { parseDateFromInput } from './date-input-utils.js'

// ==================== DATE RANGE CONSTANTS ====================

/*
 * Predefined date range options in display order with separators
 * @sig DATE_RANGES :: { [String]: String }
 */
const DATE_RANGES = {
    all: 'Include all dates',
    separator1: '───────────────',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisQuarter: 'This Quarter',
    thisYear: 'This Year',
    separator2: '───────────────',
    weekToDate: 'This Week to date',
    monthToDate: 'This Month to date',
    quarterToDate: 'This Quarter to date',
    yearToDate: 'This Year to date',
    separator3: '───────────────',
    yesterday: 'Yesterday',
    lastWeek: 'Last week',
    lastMonth: 'Last month',
    lastQuarter: 'Last quarter',
    lastYear: 'Last year',
    separator4: '───────────────',
    lastSevenDays: 'Last 7 days',
    lastThirtyDays: 'Last 30 days',
    lastTwelveMonths: 'Last 12 months',
    separator5: '───────────────',
    customDates: 'Custom dates...',
}

// ==================== DATE RANGE CALCULATION HELPERS ====================

/*
 * Calculate last N days range (N days ago to today)
 * @sig lastNDaysRange :: (Date, Number) -> DateRange
 */
const lastNDaysRange = (today, daysAgo) => ({ start: subtractDays(today, daysAgo - 1), end: today })

/*
 * Calculate last month's date range
 * @sig lastMonthRange :: Date -> DateRange
 */
const lastMonthRange = now => {
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return { start: new Date(lastMonthYear, lastMonth, 1), end: new Date(lastMonthYear, lastMonth + 1, 0) }
}

/*
 * Calculate last quarter's date range
 * @sig lastQuarterRange :: Date -> DateRange
 */
const lastQuarterRange = now => {
    const currentQuarter = Math.floor(now.getMonth() / 3)
    const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1
    const lastQuarterYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return {
        start: new Date(lastQuarterYear, lastQuarter * 3, 1),
        end: new Date(lastQuarterYear, lastQuarter * 3 + 3, 0),
    }
}

/*
 * Calculate last year's date range
 * @sig lastYearRange :: Date -> DateRange
 */
const lastYearRange = now => {
    const previousYear = now.getFullYear() - 1
    return { start: new Date(previousYear, 0, 1), end: new Date(previousYear, 11, 31) }
}

/*
 * Calculate last 12 months range
 * @sig lastTwelveMonthsRange :: (Date, Date) -> DateRange
 */
const lastTwelveMonthsRange = (now, today) => ({
    start: new Date(now.getFullYear(), now.getMonth() - 11, 1),
    end: today,
})

/*
 * Calculate date range based on selection
 * @sig calculateDateRange :: String -> DateRange?
 *     DateRange = { start: Date, end: Date }
 */
// prettier-ignore
const calculateDateRange = key => {
    const startEndDateTimes = key => {
        const now = new Date()

        if (key === 'today')            return { start: now,                               end: now                             }
        if (key === 'thisWeek')         return { start: startOfWeek(now),                  end: endOfWeek(now)                  }
        if (key === 'thisMonth')        return { start: startOfMonth(now),                 end: endOfMonth(now)                 }
        if (key === 'thisQuarter')      return { start: startOfQuarter(now),               end: endOfQuarter(now)               }
        if (key === 'thisYear')         return { start: startOfYear(now),                  end: endOfYear(now)                  }
        if (key === 'weekToDate')       return { start: startOfWeek(now),                  end: now                             }
        if (key === 'monthToDate')      return { start: startOfMonth(now),                 end: now                             }
        if (key === 'quarterToDate')    return { start: startOfQuarter(now),               end: now                             }
        if (key === 'yearToDate')       return { start: startOfYear(now),                  end: now                             }
        if (key === 'yesterday')        return { start: subtractDays(now, 1),              end: subtractDays(now, 1)            }
        if (key === 'lastWeek')         return { start: startOfWeek(subtractDays(now, 7)), end: endOfWeek(subtractDays(now, 7)) }
        if (key === 'lastMonth')        return lastMonthRange(now)
        if (key === 'lastQuarter')      return lastQuarterRange(now)
        if (key === 'lastYear')         return lastYearRange(now)
        if (key === 'lastSevenDays')    return lastNDaysRange(now, 7)
        if (key === 'lastThirtyDays')   return lastNDaysRange(now, 30)
        if (key === 'lastTwelveMonths') return lastTwelveMonthsRange(now, now)

        return { start: null, end: null }
    }

    if (key.startsWith('separator')) return null
    if (key === 'all') return null
    if (key === 'customDates') return null

    const { start, end } = startEndDateTimes(key)
    return start ? { start: startOfDay(start), end: endOfDay(end) } : null
}

/*
 * Create date range from start and end date strings
 * @sig createDateRangeFromStrings :: (String, String) -> DateRange?
 *     DateRange = { start: Date, end: Date }
 */
const createDateRangeFromStrings = (startDateString, endDateString) => {
    const startDate = parseDateFromInput(startDateString)
    const endDate = parseDateFromInput(endDateString)

    if (!startDate || !endDate) return null

    return { start: startDate, end: endOfDay(endDate) }
}

/*
 * Create date range if both dates are provided and valid
 * @sig createDateRangeIfComplete :: (String, String) -> DateRange?
 *     DateRange = { start: Date, end: Date }
 */
const createDateRangeIfComplete = (startDateString, endDateString) => {
    if (!startDateString || !endDateString) return null
    return createDateRangeFromStrings(startDateString, endDateString)
}

// Export all date range utilities
export {
    // Constants
    DATE_RANGES,

    // Range calculations
    calculateDateRange,
    createDateRangeFromStrings,
    createDateRangeIfComplete,

    // Helper functions (exported for testing)
    lastNDaysRange,
    lastMonthRange,
    lastQuarterRange,
    lastYearRange,
    lastTwelveMonthsRange,
}
