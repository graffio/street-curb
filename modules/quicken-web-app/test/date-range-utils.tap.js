/*
 * date-range-utils.tap.js - Tests for date range utility functions
 *
 * Tests the date range calculations and business logic using tap framework with given/when/then style.
 * These tests cover the business-specific date range functionality in the design system.
 */

import { test } from 'tap'
import { DateRangeUtils } from '../src/utils/date-range-utils.js'

const { calculateDateRange, createDateRangeFromStrings, createDateRangeIfComplete, DATE_RANGES } = DateRangeUtils

test('calculateDateRange', t => {
    // Mock Date.now() to return our fixed date
    const OriginalDate = global.Date
    global.Date = class extends OriginalDate {
        constructor(...args) {
            if (args.length === 0)
                super(2025, 6, 8, 12, 0, 0, 0) // July 8, 2025 at noon
            else super(...args)
        }

        static now() {
            return new OriginalDate(2025, 6, 8, 12, 0, 0, 0).getTime()
        }
    }

    t.teardown(() => (global.Date = OriginalDate))

    t.test('Given I specify separator keys', t => {
        t.test('When calculating the date range for separator1', t => {
            const result = calculateDateRange('separator1')

            t.same(result, null, 'Then it should return null')
            t.end()
        })

        t.test('When calculating the date range for separator5', t => {
            const result = calculateDateRange('separator5')

            t.same(result, null, 'Then it should return null')
            t.end()
        })

        t.end()
    })

    t.test('Given I specify "all"', t => {
        t.test('When calculating the date range', t => {
            const result = calculateDateRange('all')

            t.same(result, null, 'Then it should return null for no filtering')
            t.end()
        })
        t.end()
    })

    t.test('Given I specify "today"', t => {
        t.test('When calculating the date range', t => {
            const result = calculateDateRange('today')
            const expectedStart = new Date(2025, 6, 8, 0, 0, 0, 0) // July 8, 2025 start of day
            const expectedEnd = new Date(2025, 6, 8, 23, 59, 59, 999) // July 8, 2025 end of day

            t.ok(result, 'Then it should return a date range')
            t.same(result.start, expectedStart, 'And the start should be July 8th start of day')
            t.same(result.end, expectedEnd, 'And the end should be July 8th end of day')
            t.end()
        })
        t.end()
    })

    t.test('Given I specify "thisWeek"', t => {
        t.test('When calculating the date range', t => {
            const result = calculateDateRange('thisWeek')
            const expectedStart = new Date(2025, 6, 6, 0, 0, 0, 0) // July 6, 2025 (Sunday)
            const expectedEnd = new Date(2025, 6, 12, 23, 59, 59, 999) // July 12, 2025 (Saturday) end of day

            t.ok(result, 'Then it should return a date range')
            t.same(result.start, expectedStart, 'And the start should be July 6th (Sunday)')
            t.same(result.end, expectedEnd, 'And the end should be July 12th (Saturday) end of day')
            t.end()
        })
        t.end()
    })

    t.test('Given I specify "thisMonth"', t => {
        t.test('When calculating the date range', t => {
            const result = calculateDateRange('thisMonth')
            const expectedStart = new Date(2025, 6, 1, 0, 0, 0, 0) // July 1, 2025
            const expectedEnd = new Date(2025, 6, 31, 23, 59, 59, 999) // July 31, 2025 end of day

            t.ok(result, 'Then it should return a date range')
            t.same(result.start, expectedStart, 'And the start should be July 1st')
            t.same(result.end, expectedEnd, 'And the end should be July 31st end of day')
            t.end()
        })
        t.end()
    })

    t.test('Given I specify "thisQuarter"', t => {
        t.test('When calculating the date range', t => {
            const result = calculateDateRange('thisQuarter')
            const expectedStart = new Date(2025, 6, 1, 0, 0, 0, 0) // July 1, 2025 (Q3 start)
            const expectedEnd = new Date(2025, 8, 30, 23, 59, 59, 999) // September 30, 2025 (Q3 end) end of day

            t.ok(result, 'Then it should return a date range')
            t.same(result.start, expectedStart, 'And the start should be July 1st (Q3 start)')
            t.same(result.end, expectedEnd, 'And the end should be September 30th (Q3 end) end of day')
            t.end()
        })
        t.end()
    })

    t.test('Given I specify "thisYear"', t => {
        t.test('When calculating the date range', t => {
            const result = calculateDateRange('thisYear')
            const expectedStart = new Date(2025, 0, 1, 0, 0, 0, 0) // January 1, 2025
            const expectedEnd = new Date(2025, 11, 31, 23, 59, 59, 999) // December 31, 2025 end of day

            t.ok(result, 'Then it should return a date range')
            t.same(result.start, expectedStart, 'And the start should be January 1st')
            t.same(result.end, expectedEnd, 'And the end should be December 31st end of day')
            t.end()
        })
        t.end()
    })

    t.test('Given I specify "weekToDate"', t => {
        t.test('When calculating the date range', t => {
            const result = calculateDateRange('weekToDate')
            const expectedStart = new Date(2025, 6, 6, 0, 0, 0, 0) // July 6, 2025 (Sunday)
            const expectedEnd = new Date(2025, 6, 8, 23, 59, 59, 999) // July 8, 2025 (today) end of day

            t.ok(result, 'Then it should return a date range')
            t.same(result.start, expectedStart, 'And the start should be July 6th (Sunday)')
            t.same(result.end, expectedEnd, 'And the end should be July 8th (today) end of day')
            t.end()
        })
        t.end()
    })

    t.test('Given I specify "yesterday"', t => {
        t.test('When calculating the date range', t => {
            const result = calculateDateRange('yesterday')
            const expectedStart = new Date(2025, 6, 7, 0, 0, 0, 0) // July 7, 2025
            const expectedEnd = new Date(2025, 6, 7, 23, 59, 59, 999) // July 7, 2025 end of day

            t.ok(result, 'Then it should return a date range')
            t.same(result.start, expectedStart, 'And the start should be July 7th')
            t.same(result.end, expectedEnd, 'And the end should be July 7th end of day')
            t.end()
        })
        t.end()
    })

    t.test('Given I specify "lastSevenDays"', t => {
        t.test('When calculating the date range', t => {
            const result = calculateDateRange('lastSevenDays')
            const expectedStart = new Date(2025, 6, 2, 0, 0, 0, 0) // July 2, 2025 (7 days ago including today)
            const expectedEnd = new Date(2025, 6, 8, 23, 59, 59, 999) // July 8, 2025 (today) end of day

            t.ok(result, 'Then it should return a date range')
            t.same(result.start, expectedStart, 'And the start should be July 2nd (7 days ago)')
            t.same(result.end, expectedEnd, 'And the end should be July 8th (today) end of day')
            t.end()
        })
        t.end()
    })

    t.test('Given I specify "customDates"', t => {
        t.test('When calculating the date range', t => {
            const result = calculateDateRange('customDates')

            t.same(result, null, 'Then it should return null for custom dates')
            t.end()
        })
        t.end()
    })

    t.test('Given I specify an invalid range key', t => {
        t.test('When calculating the date range', t => {
            const result = calculateDateRange('invalidKey')

            t.same(result, null, 'Then it should return null for invalid keys')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('createDateRangeFromStrings', t => {
    t.test('Given valid start and end date strings', t => {
        t.test('When creating range from 07/08/2025 to 07/15/2025', t => {
            const result = createDateRangeFromStrings('07/08/2025', '07/15/2025')

            t.ok(result, 'Then it should return a date range object')
            t.ok(result.start instanceof Date, 'And start should be a Date')
            t.ok(result.end instanceof Date, 'And end should be a Date')
            t.same(result.start, new Date('2025-07-08T00:00:00'), 'And start should be July 8 start of day')
            t.same(result.end, new Date(2025, 6, 15, 23, 59, 59, 999), 'And end should be July 15 end of day')
            t.end()
        })

        t.end()
    })

    t.test('Given invalid date strings', t => {
        t.test('When creating range with empty start date', t => {
            const result = createDateRangeFromStrings('', '07/15/2025')

            t.same(result, null, 'Then it should return null')
            t.end()
        })

        t.test('When creating range with empty end date', t => {
            const result = createDateRangeFromStrings('07/08/2025', '')

            t.same(result, null, 'Then it should return null')
            t.end()
        })

        t.test('When creating range with both dates empty', t => {
            const result = createDateRangeFromStrings('', '')

            t.same(result, null, 'Then it should return null')
            t.end()
        })

        t.end()
    })

    t.end()
})

test('createDateRangeIfComplete', t => {
    t.test('Given both start and end dates', t => {
        t.test('When creating date range', t => {
            const result = createDateRangeIfComplete('07/08/2025', '07/15/2025')

            t.ok(result, 'Then it should return a date range')
            t.same(result.start, new Date('2025-07-08T00:00:00'), 'And start should be correct')
            t.same(result.end, new Date(2025, 6, 15, 23, 59, 59, 999), 'And end should be correct')
            t.end()
        })

        t.end()
    })

    t.test('Given incomplete dates', t => {
        t.test('When start date is missing', t => {
            const result = createDateRangeIfComplete('', '07/15/2025')

            t.same(result, null, 'Then it should return null')
            t.end()
        })

        t.test('When end date is missing', t => {
            const result = createDateRangeIfComplete('07/08/2025', '')

            t.same(result, null, 'Then it should return null')
            t.end()
        })

        t.test('When both dates are missing', t => {
            const result = createDateRangeIfComplete('', '')

            t.same(result, null, 'Then it should return null')
            t.end()
        })

        t.end()
    })

    t.end()
})

test('DATE_RANGES constant', t => {
    t.test('Given the DATE_RANGES constant', t => {
        t.test('When checking required keys', t => {
            t.ok(DATE_RANGES.all, 'Then it should have "all" option')
            t.ok(DATE_RANGES.today, 'And it should have "today" option')
            t.ok(DATE_RANGES.thisWeek, 'And it should have "thisWeek" option')
            t.ok(DATE_RANGES.thisMonth, 'And it should have "thisMonth" option')
            t.ok(DATE_RANGES.customDates, 'And it should have "customDates" option')
            t.end()
        })

        t.test('When checking separator keys', t => {
            t.ok(DATE_RANGES.separator1, 'Then it should have separator1')
            t.ok(DATE_RANGES.separator5, 'And it should have separator5')
            t.end()
        })

        t.test('When checking display values', t => {
            t.same(DATE_RANGES.all, 'Include all dates', 'Then "all" should have correct display text')
            t.same(DATE_RANGES.customDates, 'Custom dates...', 'And "customDates" should have correct display text')
            t.end()
        })

        t.end()
    })

    t.end()
})
