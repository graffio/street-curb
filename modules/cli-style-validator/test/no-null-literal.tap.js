import t from 'tap'
import { checkNoNullLiteral } from '../src/lib/rules/check-no-null-literal.js'
import { Parser } from '../src/lib/parser.js'

const { parseCode } = Parser

t.test('Given code containing a null literal', t => {
    t.test('When a variable is initialized to null', t => {
        const code = `let x = null`
        const ast = parseCode(code)
        const violations = checkNoNullLiteral(ast, code, 'module.js')

        t.equal(violations.length, 1, 'Then a violation is detected')
        t.match(violations[0].message, /null/, 'Then the message mentions null')
        t.end()
    })

    t.test('When a function returns null', t => {
        const code = `const f = () => null`
        const ast = parseCode(code)
        const violations = checkNoNullLiteral(ast, code, 'module.js')

        t.equal(violations.length, 1, 'Then a violation is detected')
        t.end()
    })

    t.test('When a comparison uses null', t => {
        const code = `const f = x => x === null`
        const ast = parseCode(code)
        const violations = checkNoNullLiteral(ast, code, 'module.js')

        t.equal(violations.length, 1, 'Then a violation is detected')
        t.end()
    })

    t.test('When loose equality compares against null', t => {
        const code = `const f = x => x == null`
        const ast = parseCode(code)
        const violations = checkNoNullLiteral(ast, code, 'module.js')

        t.equal(violations.length, 1, 'Then a violation is detected')
        t.end()
    })

    t.test('When multiple null literals appear', t => {
        const code = `const a = null\nconst b = null`
        const ast = parseCode(code)
        const violations = checkNoNullLiteral(ast, code, 'module.js')

        t.equal(violations.length, 2, 'Then each null is reported separately')
        t.end()
    })

    t.end()
})

t.test('Given code without null literals', t => {
    t.test('When a variable is declared without initialization', t => {
        const code = `let x`
        const ast = parseCode(code)
        const violations = checkNoNullLiteral(ast, code, 'module.js')

        t.equal(violations.length, 0, 'Then no violation is detected')
        t.end()
    })

    t.test('When undefined is used explicitly', t => {
        const code = `const x = undefined`
        const ast = parseCode(code)
        const violations = checkNoNullLiteral(ast, code, 'module.js')

        t.equal(violations.length, 0, 'Then no violation is detected')
        t.end()
    })

    t.test('When the string "null" appears in code', t => {
        const code = `const s = "null"`
        const ast = parseCode(code)
        const violations = checkNoNullLiteral(ast, code, 'module.js')

        t.equal(violations.length, 0, 'Then string literals containing null are not flagged')
        t.end()
    })

    t.end()
})

t.test('Given a test file', t => {
    t.test('When the file path includes .tap.js', t => {
        const code = `let x = null`
        const ast = parseCode(code)
        const violations = checkNoNullLiteral(ast, code, 'test/module.tap.js')

        t.equal(violations.length, 0, 'Then no violation is detected (test files exempt)')
        t.end()
    })

    t.end()
})

t.test('Given a generated file', t => {
    t.test('When the source contains the generated file marker', t => {
        const code = `// Auto-${'generated'} by cli-type-generator\nlet x = null`
        const ast = parseCode(code)
        const violations = checkNoNullLiteral(ast, code, 'types/account.js')

        t.equal(violations.length, 0, 'Then no violation is detected (generated files exempt)')
        t.end()
    })

    t.end()
})
