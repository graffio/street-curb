import t from 'tap'
import { checkMultilineDestructuring } from '../src/lib/rules/multiline-destructuring.js'
import { Parser } from '../src/lib/parser.js'

const { parseCode } = Parser

t.test('Given destructuring that could fit on one line', t => {
    t.test('When object destructuring spans multiple lines unnecessarily', t => {
        const code = `const {
    a,
    b,
    c,
} = x`
        const ast = parseCode(code)
        const violations = checkMultilineDestructuring(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /could fit on 1/, 'Then the message should suggest single line')
        t.match(violations[0].message, /{ a, b, c }/, 'Then the message should show compact form')
        t.end()
    })

    t.test('When array destructuring spans multiple lines unnecessarily', t => {
        const code = `const [
    first,
    second,
    third,
] = arr`
        const ast = parseCode(code)
        const violations = checkMultilineDestructuring(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /could fit on 1/, 'Then the message should suggest single line')
        t.end()
    })

    t.test('When destructuring with rest element spans multiple lines', t => {
        const code = `const {
    a,
    ...rest
} = obj`
        const ast = parseCode(code)
        const violations = checkMultilineDestructuring(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /{ a, \.\.\.rest }/, 'Then the message should include rest element')
        t.end()
    })

    t.end()
})

t.test('Given destructuring that is already compact', t => {
    t.test('When object destructuring is on one line', t => {
        const code = `const { a, b, c } = x`
        const ast = parseCode(code)
        const violations = checkMultilineDestructuring(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.test('When array destructuring is on one line', t => {
        const code = `const [first, second] = arr`
        const ast = parseCode(code)
        const violations = checkMultilineDestructuring(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given destructuring that could be compacted to fewer lines', t => {
    t.test('When many properties span more lines than necessary', t => {
        const code = `const {
    veryLongPropertyNameOne,
    veryLongPropertyNameTwo,
    veryLongPropertyNameThree,
    veryLongPropertyNameFour,
    veryLongPropertyNameFive,
} = someObjectWithALongName`
        const ast = parseCode(code)
        const violations = checkMultilineDestructuring(ast, code, 'test.js')

        // Should flag because 7 lines can fit on 2 lines
        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /could fit on 2/, 'Then the message should suggest 2 lines')
        t.end()
    })

    t.end()
})

t.test('Given destructuring inside a function', t => {
    t.test('When function contains wasteful multiline destructuring', t => {
        const code = `const fn = (obj) => {
    const {
        x,
        y,
    } = obj
    return x + y
}`
        const ast = parseCode(code)
        const violations = checkMultilineDestructuring(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected inside the function')
        t.end()
    })

    t.end()
})
