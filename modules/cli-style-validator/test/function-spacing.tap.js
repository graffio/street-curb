// ABOUTME: Tests for function spacing validation rule
// ABOUTME: Covers blank line requirements for multiline vs single-line functions

import t from 'tap'
import { checkFunctionSpacing } from '../src/lib/rules/function-spacing.js'
import { parseCode } from '../src/lib/parser.js'

t.test('Given multiline function declarations', t => {
    t.test('When a multiline function has no blank line above', t => {
        const code = `const short = x => x + 1
const long = x => {
    const y = x * 2
    return y
}`
        const ast = parseCode(code)
        const violations = checkFunctionSpacing(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /blank line/, 'Then the message should mention blank line')
        t.end()
    })

    t.test('When a multiline function has a blank line above', t => {
        const code = `const short = x => x + 1

const long = x => {
    const y = x * 2
    return y
}`
        const ast = parseCode(code)
        const violations = checkFunctionSpacing(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.test('When a multiline function is first in the file', t => {
        const code = `const long = x => {
    const y = x * 2
    return y
}`
        const ast = parseCode(code)
        const violations = checkFunctionSpacing(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for first function')
        t.end()
    })

    t.end()
})

t.test('Given single-line function declarations', t => {
    t.test('When single-line functions are grouped together', t => {
        const code = `const add = (a, b) => a + b
const sub = (a, b) => a - b
const mul = (a, b) => a * b
const div = (a, b) => a / b`
        const ast = parseCode(code)
        const violations = checkFunctionSpacing(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for grouped single-line functions')
        t.end()
    })

    t.test('When a single-line function follows a multiline function without blank line', t => {
        const code = `const long = x => {
    const y = x * 2
    return y
}
const short = x => x + 1`
        const ast = parseCode(code)
        const violations = checkFunctionSpacing(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.end()
    })

    t.test('When a single-line function follows a multiline function with blank line', t => {
        const code = `const long = x => {
    const y = x * 2
    return y
}

const short = x => x + 1`
        const ast = parseCode(code)
        const violations = checkFunctionSpacing(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given functions with comment blocks', t => {
    t.test('When a multiline function has a comment block above with blank line before comment', t => {
        const code = `const short = x => x + 1

/**
 * Description
 * @sig long :: Number -> Number
 */
const long = x => {
    const y = x * 2
    return y
}`
        const ast = parseCode(code)
        const violations = checkFunctionSpacing(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.test('When a multiline function has a comment block but no blank line before comment', t => {
        const code = `const short = x => x + 1
/**
 * Description
 * @sig long :: Number -> Number
 */
const long = x => {
    const y = x * 2
    return y
}`
        const ast = parseCode(code)
        const violations = checkFunctionSpacing(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected for missing blank line before comment')
        t.end()
    })

    t.end()
})

t.test('Given an empty AST', t => {
    t.test('When the AST is null', t => {
        const violations = checkFunctionSpacing(null, '', 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})
