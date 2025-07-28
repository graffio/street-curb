import t from 'tap'
import { checkLineLength } from '../../tools/lib/rules/line-length.js'

t.test('Line length validation should detect violations when lines exceed 120 characters', async t => {
    await t.test('A file with a line over 120 characters should be flagged', async t => {
        const code =
            'const veryLongVariableName = "this is an extremely long string that definitely exceeds the 120 character limit for sure and goes on and on and on"'
        const violations = checkLineLength(null, code, 'test.js')

        t.equal(violations.length, 1, 'One violation should be detected')
        t.equal(violations[0].type, 'line-length', 'Violation type should be line-length')
        t.equal(violations[0].line, 1, 'Violation should be on line 1')
        t.equal(violations[0].rule, 'line-length', 'Rule field should be set correctly')
        t.match(violations[0].message, /120 character limit/, 'Message should mention character limit')
    })

    await t.test('A file with lines under 120 characters should pass validation', async t => {
        const code = 'const shortVar = "short string"'
        const violations = checkLineLength(null, code, 'test.js')

        t.equal(violations.length, 0, 'No violations should be detected')
    })

    await t.test('A multiline file with mixed line lengths should detect only long lines', async t => {
        const code = `const short = "ok"
            const veryLongVariableName = "this is an extremely long string that definitely exceeds the 120 character limit for sure and goes on and on and on"
            const alsoShort = "fine"`
        const violations = checkLineLength(null, code, 'test.js')

        t.equal(violations.length, 1, 'One violation should be detected')
        t.equal(violations[0].line, 2, 'Violation should be on line 2')
    })

    await t.test('A file with multiple long lines should detect all violations', async t => {
        const code = `const firstLongLine = "this is an extremely long string that definitely exceeds the 120 character limit for sure and goes on and on and on"
            const short = "ok"
            const secondLongLine = "another extremely long string that also definitely exceeds the 120 character limit and should be detected as well and on and on"`
        const violations = checkLineLength(null, code, 'test.js')

        t.equal(violations.length, 2, 'Two violations should be detected')
        t.equal(violations[0].line, 1, 'First violation should be on line 1')
        t.equal(violations[1].line, 3, 'Second violation should be on line 3')
    })
})
