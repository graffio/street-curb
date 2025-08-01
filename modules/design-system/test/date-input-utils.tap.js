/*
 * date-input-utils.tap.js - Tests for date input utility functions
 *
 * Tests the date input validation and formatting functions using tap framework with given/when/then style.
 * These tests cover the UI-specific date input functionality in the design system.
 */

import { test } from 'tap'
import {
    createDefaultParts,
    constrainDatePart,
    updateDatePartWithValidation,
    parseDateString,
    toDisplayDateString,
    formatDateForInput,
    convertSlashToIso,
    parseDateFromInput,
    getDefaultStartDate,
    getDefaultEndDate,
    applyDateDefaults,
} from '../src/utils/date-input-utils.js'

test('createDefaultParts', t => {
    t.test('Given current date', t => {
        t.test('When creating default parts', t => {
            const result = createDefaultParts()

            t.ok(result.month, 'Then it should have a month')
            t.ok(result.day, 'And it should have a day')
            t.ok(result.year, 'And it should have a year')
            t.ok(result.month >= 1 && result.month <= 12, 'And month should be valid')
            t.ok(result.day >= 1 && result.day <= 31, 'And day should be valid')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('constrainDatePart', t => {
    t.test('Given month constraints', t => {
        t.test('When constraining month 0', t => {
            const result = constrainDatePart('month', 0, 7, 2025)
            t.same(result, 12, 'Then it should wrap to 12')
            t.end()
        })

        t.test('When constraining month 13', t => {
            const result = constrainDatePart('month', 13, 7, 2025)
            t.same(result, 1, 'Then it should wrap to 1')
            t.end()
        })

        t.test('When constraining valid month 7', t => {
            const result = constrainDatePart('month', 7, 7, 2025)
            t.same(result, 7, 'Then it should remain 7')
            t.end()
        })
        t.end()
    })

    t.test('Given day constraints', t => {
        t.test('When constraining day 0 in July', t => {
            const result = constrainDatePart('day', 0, 7, 2025)
            t.same(result, 31, 'Then it should wrap to 31 (days in July)')
            t.end()
        })

        t.test('When constraining day 32 in July', t => {
            const result = constrainDatePart('day', 32, 7, 2025)
            t.same(result, 1, 'Then it should wrap to 1')
            t.end()
        })

        t.test('When constraining day 30 in February', t => {
            const result = constrainDatePart('day', 30, 2, 2025)
            t.same(result, 1, 'Then it should wrap to 1')
            t.end()
        })
        t.end()
    })

    t.test('Given year constraints', t => {
        t.test('When constraining year 1899', t => {
            const result = constrainDatePart('year', 1899, 7, 2025)
            t.same(result, 2100, 'Then it should wrap to 2100')
            t.end()
        })

        t.test('When constraining year 2101', t => {
            const result = constrainDatePart('year', 2101, 7, 2025)
            t.same(result, 1900, 'Then it should wrap to 1900')
            t.end()
        })

        t.test('When constraining valid year 2025', t => {
            const result = constrainDatePart('year', 2025, 7, 2025)
            t.same(result, 2025, 'Then it should remain 2025')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('updateDatePartWithValidation', t => {
    t.test('Given month change that affects day validity', t => {
        t.test('When changing month from March to February with day 31', t => {
            const dateParts = { month: 3, day: 31, year: 2025 }
            const result = updateDatePartWithValidation(dateParts, 'month', 2)

            t.same(result.month, 2, 'Then month should be updated to 2')
            t.same(result.day, 28, 'And day should be adjusted to 28 (Feb 2025 max)')
            t.same(result.year, 2025, 'And year should remain unchanged')
            t.end()
        })
        t.end()
    })

    t.test('Given year change that affects day validity', t => {
        t.test('When changing year from 2024 to 2025 with Feb 29', t => {
            const dateParts = { month: 2, day: 29, year: 2024 }
            const result = updateDatePartWithValidation(dateParts, 'year', 2025)

            t.same(result.month, 2, 'Then month should remain 2')
            t.same(result.day, 28, 'And day should be adjusted to 28 (Feb 2025 max)')
            t.same(result.year, 2025, 'And year should be updated to 2025')
            t.end()
        })
        t.end()
    })

    t.test('Given day change that does not affect validity', t => {
        t.test('When changing day from 15 to 20', t => {
            const dateParts = { month: 7, day: 15, year: 2025 }
            const result = updateDatePartWithValidation(dateParts, 'day', 20)

            t.same(result.month, 7, 'Then month should remain unchanged')
            t.same(result.day, 20, 'And day should be updated to 20')
            t.same(result.year, 2025, 'And year should remain unchanged')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('parseDateString', t => {
    t.test('Given a valid slash date string', t => {
        t.test('When parsing 07/08/2025', t => {
            const result = parseDateString('07/08/2025')
            const expected = { month: 7, day: 8, year: 2025 }

            t.same(result, expected, 'Then it should return correct date parts')
            t.end()
        })
        t.end()
    })

    t.test('Given a valid ISO date string', t => {
        t.test('When parsing 2025-07-08', t => {
            const result = parseDateString('2025-07-08')
            const expected = { month: 7, day: 8, year: 2025 }

            t.same(result, expected, 'Then it should return correct date parts')
            t.end()
        })
        t.end()
    })

    t.test('Given empty string', t => {
        t.test('When parsing empty string', t => {
            const result = parseDateString('')

            t.ok(result.month, 'Then it should return default month')
            t.ok(result.day, 'And it should return default day')
            t.ok(result.year, 'And it should return default year')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('toDisplayDateString', t => {
    t.test('Given date parts', t => {
        t.test('When converting July 8, 2025', t => {
            const dateParts = { month: 7, day: 8, year: 2025 }
            const result = toDisplayDateString(dateParts)

            t.same(result, '07/08/2025', 'Then it should format as MM/DD/YYYY')
            t.end()
        })

        t.test('When converting single digit month and day', t => {
            const dateParts = { month: 1, day: 5, year: 2025 }
            const result = toDisplayDateString(dateParts)

            t.same(result, '01/05/2025', 'Then it should zero-pad the values')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('formatDateForInput', t => {
    t.test('Given a valid date object', t => {
        t.test('When formatting July 8, 2025', t => {
            const date = new Date(2025, 6, 8) // July 8, 2025
            const result = formatDateForInput(date)

            t.same(result, '07/08/2025', 'Then it should format as MM/DD/YYYY')
            t.end()
        })

        t.test('When formatting January 1, 2025', t => {
            const date = new Date(2025, 0, 1) // January 1, 2025
            const result = formatDateForInput(date)

            t.same(result, '01/01/2025', 'Then it should format with zero-padded month and day')
            t.end()
        })

        t.end()
    })

    t.test('Given null or undefined date', t => {
        t.test('When formatting null', t => {
            const result = formatDateForInput(null)

            t.same(result, '', 'Then it should return empty string')
            t.end()
        })

        t.test('When formatting undefined', t => {
            const result = formatDateForInput(undefined)

            t.same(result, '', 'Then it should return empty string')
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

        t.test('When converting non-slash format 2025-07-08', t => {
            const result = convertSlashToIso('2025-07-08')

            t.same(result, '2025-07-08', 'Then it should return the original string unchanged')
            t.end()
        })

        t.end()
    })

    t.end()
})

test('parseDateFromInput', t => {
    t.test('Given a valid MM/DD/YYYY string', t => {
        t.test('When parsing 07/08/2025', t => {
            const result = parseDateFromInput('07/08/2025')
            const expected = new Date('2025-07-08T00:00:00')

            t.ok(result instanceof Date, 'Then it should return a Date object')
            t.same(result, expected, 'And it should be July 8, 2025 at start of day')
            t.end()
        })

        t.end()
    })

    t.test('Given a valid YYYY-MM-DD string', t => {
        t.test('When parsing 2025-07-08', t => {
            const result = parseDateFromInput('2025-07-08')
            const expected = new Date('2025-07-08T00:00:00')

            t.ok(result instanceof Date, 'Then it should return a Date object')
            t.same(result, expected, 'And it should be July 8, 2025 at start of day')
            t.end()
        })

        t.end()
    })

    t.test('Given invalid input', t => {
        t.test('When parsing empty string', t => {
            const result = parseDateFromInput('')

            t.same(result, null, 'Then it should return null')
            t.end()
        })

        t.test('When parsing null', t => {
            const result = parseDateFromInput(null)

            t.same(result, null, 'Then it should return null')
            t.end()
        })

        t.test('When parsing invalid date string', t => {
            const result = parseDateFromInput('invalid-date')

            t.same(result, null, 'Then it should return null')
            t.end()
        })

        t.end()
    })

    t.end()
})

test('getDefaultStartDate', t => {
    t.test('Given a previous date range', t => {
        t.test('When getting start default', t => {
            const previousRange = {
                start: new Date(2025, 6, 1), // July 1, 2025
                end: new Date(2025, 6, 31, 23, 59, 59, 999),
            }
            const result = getDefaultStartDate('fallback', previousRange)

            t.same(result, '07/01/2025', 'Then it should format the previous start date')
            t.end()
        })

        t.end()
    })

    t.test('Given no previous date range', t => {
        t.test('When getting start default', t => {
            const result = getDefaultStartDate('fallback-value', null)

            t.same(result, 'fallback-value', 'Then it should return the fallback default')
            t.end()
        })

        t.end()
    })

    t.end()
})

test('getDefaultEndDate', t => {
    t.test('Given a previous date range', t => {
        t.test('When getting end default', t => {
            const previousRange = {
                start: new Date(2025, 6, 1),
                end: new Date(2025, 6, 31, 23, 59, 59, 999), // July 31, 2025
            }
            const result = getDefaultEndDate('fallback', previousRange)

            t.same(result, '07/31/2025', 'Then it should format the previous end date')
            t.end()
        })

        t.end()
    })

    t.test('Given no previous date range', t => {
        t.test('When getting end default', t => {
            const result = getDefaultEndDate('fallback-value', null)

            t.same(result, 'fallback-value', 'Then it should return the fallback default')
            t.end()
        })

        t.end()
    })

    t.end()
})

test('applyDateDefaults', t => {
    t.test('Given empty current dates and valid defaults', t => {
        t.test('When applying defaults', t => {
            const context = {
                currentStartDate: '',
                currentEndDate: '',
                startDefault: '07/01/2025',
                endDefault: '07/31/2025',
            }
            const result = applyDateDefaults(context)

            t.same(result.startDate, '07/01/2025', 'Then it should use start default')
            t.same(result.endDate, '07/31/2025', 'And it should use end default')
            t.same(result.startUpdated, true, 'And it should mark start as updated')
            t.same(result.endUpdated, true, 'And it should mark end as updated')
            t.end()
        })

        t.end()
    })

    t.test('Given current dates already set', t => {
        t.test('When applying defaults', t => {
            const context = {
                currentStartDate: '06/01/2025',
                currentEndDate: '06/30/2025',
                startDefault: '07/01/2025',
                endDefault: '07/31/2025',
            }
            const result = applyDateDefaults(context)

            t.same(result.startDate, '06/01/2025', 'Then it should keep current start date')
            t.same(result.endDate, '06/30/2025', 'And it should keep current end date')
            t.same(result.startUpdated, false, 'And it should mark start as not updated')
            t.same(result.endUpdated, false, 'And it should mark end as not updated')
            t.end()
        })

        t.end()
    })

    t.test('Given mixed scenario - start empty, end set', t => {
        t.test('When applying defaults', t => {
            const context = {
                currentStartDate: '',
                currentEndDate: '06/30/2025',
                startDefault: '07/01/2025',
                endDefault: '07/31/2025',
            }
            const result = applyDateDefaults(context)

            t.same(result.startDate, '07/01/2025', 'Then it should use start default')
            t.same(result.endDate, '06/30/2025', 'And it should keep current end date')
            t.same(result.startUpdated, true, 'And it should mark start as updated')
            t.same(result.endUpdated, false, 'And it should mark end as not updated')
            t.end()
        })

        t.end()
    })

    t.end()
})
