// ABOUTME: Tests for function-nesting rule (RETIRED)
// ABOUTME: This rule is disabled in favor of cohesion-structure.js (P/T/F/V/A groups)

import t from 'tap'
import { checkFunctionNesting } from '../src/lib/rules/function-nesting.js'
import { parseCode } from '../src/lib/parser.js'

t.test('Given the retired function-nesting rule', t => {
    t.test('When checking any code', t => {
        const code = `
const helper = x => x + 1
const main = () => helper(5)
export { main }
`
        const ast = parseCode(code)
        const violations = checkFunctionNesting(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations (rule is disabled)')
        t.end()
    })

    t.test('When the function was importable', t => {
        const code = `
const helper = x => x + 1
const main = () => helper(5)
export { main }
`
        const ast = parseCode(code)
        const fn = checkFunctionNesting

        t.ok(typeof fn === 'function', 'Then the exported function exists')
        t.ok(Array.isArray(fn(ast, code, 'test.js')), 'Then it returns an array')
        t.end()
    })

    t.end()
})
