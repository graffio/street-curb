import t from 'tap'
import { checkLineLength } from '../../tools/lib/rules/line-length.js'

t.test('Line length violation detection', async t => {
    await t.test('Given a file with lines over 120 characters', async t => {
        await t.test('When checking line length', async t => {
            const code =
                'const veryLongVariableName = "this is an extremely long string that definitely exceeds the 120 character limit for sure and goes on and on and on"'
            const violations = checkLineLength(null, code, 'test.js')

            t.equal(violations.length, 1, 'Then one violation is detected')
            t.equal(violations[0].type, 'line-length', 'Then violation type is line-length')
            t.equal(violations[0].line, 1, 'Then violation is on line 1')
            t.equal(violations[0].rule, 'line-length', 'Then rule field is set correctly')
            t.match(violations[0].message, /120 character limit/, 'Then message mentions character limit')
        })
    })

    await t.test('Given a file with lines under 120 characters', async t => {
        await t.test('When checking line length', async t => {
            const code = 'const shortVar = "short string"'
            const violations = checkLineLength(null, code, 'test.js')

            t.equal(violations.length, 0, 'Then no violations are detected')
        })
    })

    await t.test('Given a multiline file with mixed line lengths', async t => {
        await t.test('When checking line length', async t => {
            const code = `const short = "ok"
const veryLongVariableName = "this is an extremely long string that definitely exceeds the 120 character limit for sure and goes on and on and on"
const alsoShort = "fine"`
            const violations = checkLineLength(null, code, 'test.js')

            t.equal(violations.length, 1, 'Then one violation is detected')
            t.equal(violations[0].line, 2, 'Then violation is on line 2')
        })
    })

    await t.test('Given a file with multiple long lines', async t => {
        await t.test('When checking line length', async t => {
            const code = `const firstLongLine = "this is an extremely long string that definitely exceeds the 120 character limit for sure and goes on and on and on"
const short = "ok"
const secondLongLine = "another extremely long string that also definitely exceeds the 120 character limit and should be detected as well and on and on"`
            const violations = checkLineLength(null, code, 'test.js')

            t.equal(violations.length, 2, 'Then two violations are detected')
            t.equal(violations[0].line, 1, 'Then first violation is on line 1')
            t.equal(violations[1].line, 3, 'Then second violation is on line 3')
        })
    })
})
