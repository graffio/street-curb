import t from 'tap'
import { checkUnnecessaryBraces } from '../../tools/lib/rules/unnecessary-braces.js'
import { parseCode } from '../../tools/lib/parser.js'

t.test('Unnecessary braces validation should detect single-statement blocks with braces', async t => {
    await t.test('Single-statement if blocks should be flagged when they have braces', async t => {
        const code = `if (condition) {
            doSomething()
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 1, 'One violation should be detected')
        t.equal(violations[0].type, 'unnecessary-braces', 'Violation type should be unnecessary-braces')
        t.equal(violations[0].rule, 'unnecessary-braces', 'Rule field should be set correctly')
        t.match(violations[0].message, /unnecessary braces/, 'Message should mention unnecessary braces')
    })

    await t.test('Single-statement else blocks should be flagged when they have braces', async t => {
        const code = `if (condition) {
            doSomething()
        } else {
            doSomethingElse()
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 2, 'Two violations should be detected')
        t.equal(violations[0].type, 'unnecessary-braces', 'First violation should be unnecessary-braces')
        t.equal(violations[1].type, 'unnecessary-braces', 'Second violation should be unnecessary-braces')
    })

    await t.test('Single-statement for loops should be flagged when they have braces', async t => {
        const code = `for (let i = 0; i < 10; i++) {
            console.log(i)
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 1, 'One violation should be detected')
        t.match(violations[0].message, /single statement/, 'Message should mention single statement')
    })

    await t.test('Properly formatted single-statement blocks should pass validation', async t => {
        const code = `if (condition) doSomething()
        else doSomethingElse()
        
        for (let i = 0; i < 10; i++) console.log(i)`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 0, 'No violations should be detected')
    })

    await t.test('Multi-statement blocks should pass validation even with braces', async t => {
        const code = `if (condition) {
            doSomething()
            doSomethingElse()
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 0, 'No violations should be detected for multi-statement blocks')
    })

    await t.test('Arrow functions with single return statements should be flagged when they have braces', async t => {
        const code = `const myFunction = () => {
            return something
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 1, 'One violation should be detected for single-return arrow function')
        t.match(violations[0].message, /unnecessary braces/, 'Message should mention unnecessary braces')
    })

    await t.test('Traditional function declarations should pass validation with braces', async t => {
        const code = `function myFunction() {
            return something
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 0, 'No violations should be detected for traditional function declarations')
    })

    await t.test('Multi-statement arrow functions should pass validation with braces', async t => {
        const code = `const myFunction = () => {
            doSomething()
            return something
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 0, 'No violations should be detected for multi-statement arrow functions')
    })
})
