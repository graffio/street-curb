// ABOUTME: Date range calculations and business logic for filters
// ABOUTME: Provides predefined ranges and range calculation functions

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
} from '@graffio/functional'

import { DateInputUtils } from './date-input-utils.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

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
    weekToDate: 'Week to date',
    monthToDate: 'Month to date',
    quarterToDate: 'Quarter to date',
    yearToDate: 'Year to date',
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
 * @sig createLastNDaysRange :: (Date, Number) -> DateRange
 */
const createLastNDaysRange = (today, daysAgo) => ({ start: subtractDays(today, daysAgo - 1), end: today })

/*
 * Calculate last month's date range
 * @sig createLastMonthRange :: Date -> DateRange
 */
const createLastMonthRange = now => {
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return { start: new Date(lastMonthYear, lastMonth, 1), end: new Date(lastMonthYear, lastMonth + 1, 0) }
}

/*
 * Calculate last quarter's date range
 * @sig createLastQuarterRange :: Date -> DateRange
 */
const createLastQuarterRange = now => {
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
 * @sig createLastYearRange :: Date -> DateRange
 */
const createLastYearRange = now => {
    const previousYear = now.getFullYear() - 1
    return { start: new Date(previousYear, 0, 1), end: new Date(previousYear, 11, 31) }
}

/*
 * Calculate last 12 months range
 * @sig createLastTwelveMonthsRange :: (Date, Date) -> DateRange
 */
const createLastTwelveMonthsRange = (now, today) => ({
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
    // Maps range key to raw start/end dates before day normalization
    // @sig startEndDateTimes :: String -> { start: Date?, end: Date? }
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
        if (key === 'lastMonth')        return createLastMonthRange(now)
        if (key === 'lastQuarter')      return createLastQuarterRange(now)
        if (key === 'lastYear')         return createLastYearRange(now)
        if (key === 'lastSevenDays')    return createLastNDaysRange(now, 7)
        if (key === 'lastThirtyDays')   return createLastNDaysRange(now, 30)
        if (key === 'lastTwelveMonths') return createLastTwelveMonthsRange(now, now)

        return { start: undefined, end: undefined }
    }

    if (key.startsWith('separator')) return undefined
    if (key === 'all') return undefined
    if (key === 'customDates') return undefined

    const { start, end } = startEndDateTimes(key)
    return start ? { start: startOfDay(start), end: endOfDay(end) } : undefined
}

/*
 * Create date range from start and end date strings
 * @sig createDateRangeFromStrings :: (String, String) -> DateRange?
 *     DateRange = { start: Date, end: Date }
 */
const createDateRangeFromStrings = (startDateString, endDateString) => {
    const startDate = DateInputUtils.parseDateFromInput(startDateString)
    const endDate = DateInputUtils.parseDateFromInput(endDateString)

    if (!startDate || !endDate) return undefined

    return { start: startDate, end: endOfDay(endDate) }
}

/*
 * Create date range if both dates are provided and valid
 * @sig createDateRangeIfComplete :: (String, String) -> DateRange?
 *     DateRange = { start: Date, end: Date }
 */
const createDateRangeIfComplete = (startDateString, endDateString) => {
    if (!startDateString || !endDateString) return undefined
    return createDateRangeFromStrings(startDateString, endDateString)
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const DateRangeUtils = {
    DATE_RANGES,
    calculateDateRange,
    createDateRangeFromStrings,
    createDateRangeIfComplete,
    createLastNDaysRange,
    createLastMonthRange,
    createLastQuarterRange,
    createLastYearRange,
    createLastTwelveMonthsRange,
}

export { DateRangeUtils }
