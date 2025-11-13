/*
 * date-utils.tap.js - Tests for generic date utility functions
 *
 * Tests the core date manipulation functions using tap framework with given/when/then style.
 * These tests cover the pure, generic date functions in the functional module.
 */

import { test } from 'tap'
import {
    addDays,
    convertSlashToIso,
    datePartsToDate,
    dateToDateParts,
    endOfDay,
    endOfMonth,
    endOfWeek,
    formatDateString,
    getDaysInMonth,
    parseIsoDateFormat,
    parseSlashDateFormat,
    startOfDay,
    startOfMonth,
    startOfQuarter,
    startOfWeek,
    subtractDays,
} from '../src/date-utils.js'

test('getDaysInMonth', t => {
    t.test('Given a regular month', t => {
        t.test('When getting days in July 2025', t => {
            const result = getDaysInMonth(7, 2025)
            t.same(result, 31, 'Then it should return 31 days')
            t.end()
        })
        t.end()
    })

    t.test('Given February in a non-leap year', t => {
        t.test('When getting days in February 2025', t => {
            const result = getDaysInMonth(2, 2025)
            t.same(result, 28, 'Then it should return 28 days')
            t.end()
        })
        t.end()
    })

    t.test('Given February in a leap year', t => {
        t.test('When getting days in February 2024', t => {
            const result = getDaysInMonth(2, 2024)
            t.same(result, 29, 'Then it should return 29 days')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('startOfDay', t => {
    t.test('Given a date at mid-day', t => {
        t.test('When getting start of day', t => {
            const midDay = new Date(2025, 6, 8, 12, 30, 45, 123)
            const result = startOfDay(midDay)
            const expected = new Date(2025, 6, 8, 0, 0, 0, 0)

            t.same(result, expected, 'Then it should return start of day')
            t.not(result, midDay, 'And it should not modify the original date')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('endOfDay', t => {
    t.test('Given a date at start of day', t => {
        t.test('When getting end of day', t => {
            const startOfDay = new Date(2025, 6, 8, 0, 0, 0, 0)
            const result = endOfDay(startOfDay)
            const expected = new Date(2025, 6, 8, 23, 59, 59, 999)

            t.same(result, expected, 'Then it should return end of day')
            t.not(result, startOfDay, 'And it should not modify the original date')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('addDays', t => {
    t.test('Given a date and positive number of days', t => {
        t.test('When adding 5 days to July 8, 2025', t => {
            const date = new Date(2025, 6, 8)
            const result = addDays(date, 5)
            const expected = new Date(2025, 6, 13)

            t.same(result, expected, 'Then it should return July 13, 2025')
            t.not(result, date, 'And it should not modify the original date')
            t.end()
        })
        t.end()
    })

    t.test('Given a date and negative number of days', t => {
        t.test('When adding -3 days to July 8, 2025', t => {
            const date = new Date(2025, 6, 8)
            const result = addDays(date, -3)
            const expected = new Date(2025, 6, 5)

            t.same(result, expected, 'Then it should return July 5, 2025')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('subtractDays', t => {
    t.test('Given a date and number of days', t => {
        t.test('When subtracting 5 days from July 8, 2025', t => {
            const date = new Date(2025, 6, 8)
            const result = subtractDays(date, 5)
            const expected = new Date(2025, 6, 3)

            t.same(result, expected, 'Then it should return July 3, 2025')
            t.not(result, date, 'And it should not modify the original date')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('startOfWeek', t => {
    t.test('Given a Tuesday date', t => {
        t.test('When getting start of week for July 8, 2025 (Tuesday)', t => {
            const tuesday = new Date(2025, 6, 8) // July 8, 2025 is a Tuesday
            const result = startOfWeek(tuesday)
            const expected = new Date(2025, 6, 6) // July 6, 2025 (Sunday)

            t.same(result, expected, 'Then it should return July 6, 2025 (Sunday)')
            t.end()
        })
        t.end()
    })

    t.test('Given a Sunday date', t => {
        t.test('When getting start of week for July 6, 2025 (Sunday)', t => {
            const sunday = new Date(2025, 6, 6) // July 6, 2025 is a Sunday
            const result = startOfWeek(sunday)
            const expected = new Date(2025, 6, 6) // Same day

            t.same(result, expected, 'Then it should return the same date')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('endOfWeek', t => {
    t.test('Given a Tuesday date', t => {
        t.test('When getting end of week for July 8, 2025 (Tuesday)', t => {
            const tuesday = new Date(2025, 6, 8) // July 8, 2025 is a Tuesday
            const result = endOfWeek(tuesday)
            const expected = new Date(2025, 6, 12) // July 12, 2025 (Saturday)

            t.same(result, expected, 'Then it should return July 12, 2025 (Saturday)')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('startOfMonth', t => {
    t.test('Given a date in the middle of a month', t => {
        t.test('When getting start of month for July 8, 2025', t => {
            const date = new Date(2025, 6, 8)
            const result = startOfMonth(date)
            const expected = new Date(2025, 6, 1)

            t.same(result, expected, 'Then it should return July 1, 2025')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('endOfMonth', t => {
    t.test('Given a date in the middle of a month', t => {
        t.test('When getting end of month for July 8, 2025', t => {
            const date = new Date(2025, 6, 8)
            const result = endOfMonth(date)
            const expected = new Date(2025, 6, 31, 23, 59, 59, 999)

            t.same(result, expected, 'Then it should return July 31, 2025 end of day')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('startOfQuarter', t => {
    t.test('Given a date in Q3', t => {
        t.test('When getting start of quarter for July 8, 2025', t => {
            const date = new Date(2025, 6, 8) // July is month 6, Q3
            const result = startOfQuarter(date)
            const expected = new Date(2025, 6, 1) // July 1, 2025

            t.same(result, expected, 'Then it should return July 1, 2025 (Q3 start)')
            t.end()
        })
        t.end()
    })

    t.test('Given a date in Q1', t => {
        t.test('When getting start of quarter for February 15, 2025', t => {
            const date = new Date(2025, 1, 15) // February is month 1, Q1
            const result = startOfQuarter(date)
            const expected = new Date(2025, 0, 1) // January 1, 2025

            t.same(result, expected, 'Then it should return January 1, 2025 (Q1 start)')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('parseIsoDateFormat', t => {
    t.test('Given a valid ISO date string', t => {
        t.test('When parsing 2025-07-08', t => {
            const result = parseIsoDateFormat('2025-07-08')
            const expected = { month: 7, day: 8, year: 2025 }

            t.same(result, expected, 'Then it should return correct date parts')
            t.end()
        })
        t.end()
    })

    t.test('Given an invalid ISO date string', t => {
        t.test('When parsing incomplete date', t => {
            const result = parseIsoDateFormat('2025-07')

            t.same(result.month, 7, 'Then it should parse available month')
            t.same(result.day, 1, 'And it should default day to 1')
            t.same(result.year, 2025, 'And it should parse available year')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('parseSlashDateFormat', t => {
    t.test('Given a valid slash date string', t => {
        t.test('When parsing 07/08/2025', t => {
            const result = parseSlashDateFormat('07/08/2025')
            const expected = { month: 7, day: 8, year: 2025 }

            t.same(result, expected, 'Then it should return correct date parts')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('formatDateString', t => {
    t.test('Given date parts', t => {
        t.test('When formatting July 8, 2025', t => {
            const dateParts = { month: 7, day: 8, year: 2025 }
            const result = formatDateString(dateParts)

            t.same(result, '07/08/2025', 'Then it should format as MM/DD/YYYY')
            t.end()
        })

        t.test('When formatting single digit month and day', t => {
            const dateParts = { month: 1, day: 5, year: 2025 }
            const result = formatDateString(dateParts)

            t.same(result, '01/05/2025', 'Then it should zero-pad the values')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('dateToDateParts', t => {
    t.test('Given a valid date', t => {
        t.test('When converting July 8, 2025', t => {
            const date = new Date(2025, 6, 8) // July 8, 2025
            const result = dateToDateParts(date)
            const expected = { month: 7, day: 8, year: 2025 }

            t.same(result, expected, 'Then it should return correct date parts')
            t.end()
        })
        t.end()
    })

    t.test('Given null date', t => {
        t.test('When converting null', t => {
            const result = dateToDateParts(null)

            t.same(result.month, 1, 'Then it should default month to 1')
            t.same(result.day, 1, 'And it should default day to 1')
            t.ok(result.year, 'And it should set a default year')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('datePartsToDate', t => {
    t.test('Given date parts', t => {
        t.test('When converting to date', t => {
            const dateParts = { month: 7, day: 8, year: 2025 }
            const result = datePartsToDate(dateParts)
            const expected = new Date(2025, 6, 8) // July 8, 2025

            t.same(result, expected, 'Then it should return correct date')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('convertSlashToIso', t => {
    t.test('Given a valid MM/DD/YYYY string', t => {
        t.test('When converting 07/08/2025', t => {
            const result = convertSlashToIso('07/08/2025')

            t.same(result, '2025-07-08', 'Then it should convert to YYYY-MM-DD format')
            t.end()
        })

        t.test('When converting 1/5/2025', t => {
            const result = convertSlashToIso('1/5/2025')

            t.same(result, '2025-01-05', 'Then it should zero-pad single digit month and day')
            t.end()
        })
        t.end()
    })

    t.test('Given an invalid date string', t => {
        t.test('When converting incomplete date 07/08', t => {
            const result = convertSlashToIso('07/08')

            t.same(result, '07/08', 'Then it should return the original string unchanged')
            t.end()
        })
        t.end()
    })

    t.end()
})
