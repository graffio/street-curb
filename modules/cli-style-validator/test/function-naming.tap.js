import t from 'tap'
import { checkFunctionNaming } from '../src/lib/rules/function-naming.js'
import { Parser } from '../src/lib/parser.js'

const { parseCode } = Parser

t.test('Given a function with a recognized verb prefix', t => {
    t.test('When the function starts with "is"', t => {
        const code = `const isActive = x => x.active`
        const ast = parseCode(code)
        const violations = checkFunctionNaming(ast, code, 'test-module.js')

        t.equal(violations.length, 0, 'Then no violation is detected')
        t.end()
    })

    t.test('When the function starts with "to"', t => {
        const code = `const toNumber = x => parseInt(x)`
        const ast = parseCode(code)
        const violations = checkFunctionNaming(ast, code, 'test-module.js')

        t.equal(violations.length, 0, 'Then no violation is detected')
        t.end()
    })

    t.test('When the function starts with "register"', t => {
        const code = `const registerHandler = (id, fn) => handlers.set(id, fn)`
        const ast = parseCode(code)
        const violations = checkFunctionNaming(ast, code, 'test-module.js')

        t.equal(violations.length, 0, 'Then no violation is detected')
        t.end()
    })

    t.test('When the function starts with "toggle"', t => {
        const code = `const toggleCollapsed = (state, id) => ({ ...state })`
        const ast = parseCode(code)
        const violations = checkFunctionNaming(ast, code, 'test-module.js')

        t.equal(violations.length, 0, 'Then no violation is detected')
        t.end()
    })

    t.test('When the function is named exactly "post"', t => {
        const code = `const post = action => dispatch(action)`
        const ast = parseCode(code)
        const violations = checkFunctionNaming(ast, code, 'test-module.js')

        t.equal(violations.length, 0, 'Then no violation is detected (exact verb name)')
        t.end()
    })

    t.end()
})

t.test('Given a PascalCase function name', t => {
    t.test('When the function is a React component', t => {
        const code = `const RegisterPage = () => null`
        const ast = parseCode(code)
        const violations = checkFunctionNaming(ast, code, 'register-page.js')

        t.equal(violations.length, 0, 'Then no violation is detected (PascalCase exempt)')
        t.end()
    })

    t.end()
})

t.test('Given a function without a recognized verb prefix', t => {
    t.test('When the function is named "updateSorting"', t => {
        const code = `const updateSorting = (layout, updater) => updater(layout)`
        const ast = parseCode(code)
        const violations = checkFunctionNaming(ast, code, 'sorting.js')

        t.equal(violations.length, 1, 'Then a violation is detected')
        t.match(violations[0].message, /updateSorting/, 'Then the message names the function')
        t.end()
    })

    t.test('When the function is named "loadFile"', t => {
        const code = `const loadFile = async path => fetch(path)`
        const ast = parseCode(code)
        const violations = checkFunctionNaming(ast, code, 'file-loader.js')

        t.equal(violations.length, 1, 'Then a violation is detected')
        t.match(violations[0].message, /loadFile/, 'Then the message names the function')
        t.end()
    })

    t.end()
})

t.test('Given a function inside a cohesion group object', t => {
    t.test('When the function is a property of E', t => {
        const code = `const E = { handleClick: () => {} }`
        const ast = parseCode(code)
        const violations = checkFunctionNaming(ast, code, 'handlers.js')

        const namingViolation = violations.find(v => v.rule === 'function-naming')
        t.notOk(namingViolation, 'Then no function-naming violation is detected')
        t.end()
    })

    t.end()
})

t.test('Given a test file', t => {
    t.test('When the file path includes .tap.js', t => {
        const code = `const updateSorting = () => {}`
        const ast = parseCode(code)
        const violations = checkFunctionNaming(ast, code, 'test/sorting.tap.js')

        t.equal(violations.length, 0, 'Then no violation is detected (test files exempt)')
        t.end()
    })

    t.end()
})

t.test('Given a COMPLEXITY exemption', t => {
    t.test('When the file has a COMPLEXITY: function-naming comment', t => {
        const code = `// COMPLEXITY: function-naming — legacy API compatibility
const updateSorting = () => {}`
        const ast = parseCode(code)
        const violations = checkFunctionNaming(ast, code, 'sorting.js')

        t.equal(violations.length, 0, 'Then no violation is detected (COMPLEXITY exempt)')
        t.end()
    })

    t.end()
})
