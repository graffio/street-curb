// ABOUTME: Tests for function-nesting rule
// ABOUTME: Verifies detection of module-level functions that should be nested inside their sole caller

import t from 'tap'
import { checkFunctionNesting } from '../src/lib/rules/function-nesting.js'
import { parseCode } from '../src/lib/parser.js'

t.test('Given a module-level function used by only one other function', t => {
    t.test('When the helper is called from exactly one function', t => {
        const code = `
const helper = x => x + 1

const main = () => {
    return helper(5)
}

export { main }
`
        const ast = parseCode(code)
        const violations = checkFunctionNesting(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.ok(violations[0].message.includes('helper'), 'Then message mentions the helper function')
        t.ok(violations[0].message.includes('main'), 'Then message mentions the caller')
        t.end()
    })

    t.end()
})

t.test('Given a module-level function used by multiple functions', t => {
    t.test('When the helper is called from two different functions', t => {
        const code = `
const helper = x => x + 1

const funcA = () => helper(1)
const funcB = () => helper(2)

export { funcA, funcB }
`
        const ast = parseCode(code)
        const violations = checkFunctionNesting(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given an exported function', t => {
    t.test('When the function is exported even if only used once internally', t => {
        const code = `
const helper = x => x + 1

const main = () => helper(5)

export { helper, main }
`
        const ast = parseCode(code)
        const violations = checkFunctionNesting(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations for exported functions')
        t.end()
    })

    t.end()
})

t.test('Given a recursive function', t => {
    t.test('When the function calls itself', t => {
        const code = `
const factorial = n => n <= 1 ? 1 : n * factorial(n - 1)

const main = () => factorial(5)

export { main }
`
        const ast = parseCode(code)
        const violations = checkFunctionNesting(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then recursive function with one external caller is flagged')
        t.end()
    })

    t.end()
})

t.test('Given a function used by no one', t => {
    t.test('When the function is never called', t => {
        const code = `
const unused = x => x + 1

const main = () => 42

export { main }
`
        const ast = parseCode(code)
        const violations = checkFunctionNesting(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then unused functions are not flagged (different issue)')
        t.end()
    })

    t.end()
})

t.test('Given a test file', t => {
    t.test('When checking a .tap.js file', t => {
        const code = `
const helper = x => x + 1
const main = () => helper(5)
export { main }
`
        const ast = parseCode(code)
        const violations = checkFunctionNesting(ast, code, 'test/something.tap.js')

        t.equal(violations.length, 0, 'Then test files are skipped')
        t.end()
    })

    t.end()
})

t.test('Given function declarations (not arrow functions)', t => {
    t.test('When using function keyword', t => {
        const code = `
function helper(x) {
    return x + 1
}

function main() {
    return helper(5)
}

export { main }
`
        const ast = parseCode(code)
        const violations = checkFunctionNesting(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then function declarations are also checked')
        t.ok(violations[0].message.includes('helper'), 'Then message mentions the helper')
        t.end()
    })

    t.end()
})
