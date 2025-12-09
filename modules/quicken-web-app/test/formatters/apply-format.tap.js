/*
 * apply-format.tap.js - Tests for applyFormat interpreter
 *
 * Tests the applyFormat function that pattern matches on Format tagged types
 * and applies the appropriate formatting logic.
 */

import { test } from 'tap'
import { Format } from '@graffio/design-system/src/types/format.js'
import { applyFormat } from '../../src/formatters/apply-format.js'

test('applyFormat with Format.None', t => {
    t.test('Given a Format.None', t => {
        t.test('When formatting a number', t => {
            const result = applyFormat(42, Format.None())
            t.same(result, '42', 'Then it should return string representation')
            t.end()
        })

        t.test('When formatting a string', t => {
            const result = applyFormat('hello', Format.None())
            t.same(result, 'hello', 'Then it should return the string as-is')
            t.end()
        })

        t.test('When formatting null', t => {
            const result = applyFormat(null, Format.None())
            t.same(result, '', 'Then it should return empty string')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('applyFormat with Format.Currency', t => {
    t.test('Given a Format.Currency with USD', t => {
        t.test('When formatting a positive number', t => {
            const result = applyFormat(1234.56, Format.Currency('en-US', 'USD'))
            t.same(result, '$1,234.56', 'Then it should format as USD currency')
            t.end()
        })

        t.test('When formatting a negative number', t => {
            const result = applyFormat(-1234.56, Format.Currency('en-US', 'USD'))
            t.same(result, '-$1,234.56', 'Then it should format as negative USD currency')
            t.end()
        })

        t.test('When formatting zero', t => {
            const result = applyFormat(0, Format.Currency('en-US', 'USD'))
            t.same(result, '$0.00', 'Then it should format as zero USD')
            t.end()
        })
        t.end()
    })

    t.test('Given a Format.Currency with defaults', t => {
        t.test('When formatting a number', t => {
            const result = applyFormat(1234.56, Format.Currency())
            // Should use default en-US/USD
            t.same(result, '$1,234.56', 'Then it should use default locale/currency')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('applyFormat with Format.Date', t => {
    t.test('Given a Format.Date with short style', t => {
        t.test('When formatting a date', t => {
            // Use local date to avoid timezone issues
            const date = new Date(2024, 0, 15) // Jan 15, 2024 in local time
            const result = applyFormat(date, Format.Date('short'))
            // Short format in en-US: 1/15/24
            t.ok(result.includes('1'), 'Then it should include month')
            t.ok(result.includes('24'), 'Then it should include year')
            t.end()
        })
        t.end()
    })

    t.test('Given a Format.Date with medium style', t => {
        t.test('When formatting a date', t => {
            const date = new Date(2024, 6, 8) // July 8, 2024 in local time
            const result = applyFormat(date, Format.Date('medium'))
            t.ok(result.includes('Jul'), 'Then it should include month name')
            t.ok(result.includes('2024'), 'And include full year')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('applyFormat with Format.RelativeDate', t => {
    t.test('Given a Format.RelativeDate', t => {
        t.test('When formatting today', t => {
            const today = new Date()
            const result = applyFormat(today, Format.RelativeDate())
            t.same(result, 'Today', 'Then it should return Today')
            t.end()
        })

        t.test('When formatting yesterday', t => {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const result = applyFormat(yesterday, Format.RelativeDate())
            t.same(result, '1 day ago', 'Then it should return 1 day ago')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('applyFormat with Format.Boolean', t => {
    t.test('Given a Format.Boolean with Yes/No', t => {
        t.test('When formatting true', t => {
            const result = applyFormat(true, Format.Boolean('Yes', 'No'))
            t.same(result, 'Yes', 'Then it should return Yes')
            t.end()
        })

        t.test('When formatting false', t => {
            const result = applyFormat(false, Format.Boolean('Yes', 'No'))
            t.same(result, 'No', 'Then it should return No')
            t.end()
        })
        t.end()
    })

    t.test('Given a Format.Boolean with defaults', t => {
        t.test('When formatting true with undefined trueValue', t => {
            const result = applyFormat(true, Format.Boolean())
            t.same(result, 'true', 'Then it should return default true string')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('applyFormat with Format.Custom', t => {
    t.test('Given a Format.Custom with signedAmount key', t => {
        t.test('When formatting a positive number', t => {
            const result = applyFormat(100, Format.Custom('signedAmount'))
            t.same(result, '+$100.00', 'Then it should format as signed amount')
            t.end()
        })

        t.test('When formatting a negative number', t => {
            const result = applyFormat(-50, Format.Custom('signedAmount'))
            t.same(result, '-$50.00', 'Then it should format as signed negative amount')
            t.end()
        })
        t.end()
    })

    t.test('Given a Format.Custom with unknown key', t => {
        t.test('When formatting a value', t => {
            const result = applyFormat(42, Format.Custom('unknownFormatter'))
            t.same(result, '42', 'Then it should fall back to string conversion')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('applyFormat with undefined format', t => {
    t.test('Given undefined format', t => {
        t.test('When formatting a value', t => {
            const result = applyFormat(42, undefined)
            t.same(result, '42', 'Then it should return string representation')
            t.end()
        })
        t.end()
    })
    t.end()
})
