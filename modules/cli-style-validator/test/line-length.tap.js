import t from 'tap'
import { checkLineLength } from '../src/lib/rules/line-length.js'

t.test('Given a file with line length violations', t => {
    t.test('When a line exceeds 120 characters', t => {
        const code =
            'const veryLongVariableName = "this is an extremely long string that definitely exceeds the 120 character limit for sure and goes on and on and on"'
        const violations = checkLineLength(null, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.equal(violations[0].type, 'line-length', 'Then the violation type should be line-length')
        t.equal(violations[0].line, 1, 'Then the violation should be on line 1')
        t.equal(violations[0].rule, 'line-length', 'Then the rule field should be set correctly')
        t.match(violations[0].message, /120 characters/, 'Then the message should mention the character limit')
        t.end()
    })

    t.test('When the file has mixed line lengths', t => {
        const code = `const short = "ok"
            const veryLongVariableName = "this is an extremely long string that definitely exceeds the 120 character limit for sure and goes on and on and on"
            const alsoShort = "fine"`
        const violations = checkLineLength(null, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.equal(violations[0].line, 2, 'Then the violation should be on line 2')
        t.end()
    })

    t.test('When the file has multiple long lines', t => {
        const code = `const firstLongLine = "this is an extremely long string that definitely exceeds the 120 character limit for sure and goes on and on and on"
            const short = "ok"
            const secondLongLine = "another extremely long string that also definitely exceeds the 120 character limit and should be detected as well and on and on"`
        const violations = checkLineLength(null, code, 'test.js')

        t.equal(violations.length, 2, 'Then two violations should be detected')
        t.equal(violations[0].line, 1, 'Then the first violation should be on line 1')
        t.equal(violations[1].line, 3, 'Then the second violation should be on line 3')
        t.end()
    })

    t.end()
})

t.test('Given a file with proper line lengths', t => {
    t.test('When all lines are under 120 characters', t => {
        const code = 'const shortVar = "short string"'
        const violations = checkLineLength(null, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})
