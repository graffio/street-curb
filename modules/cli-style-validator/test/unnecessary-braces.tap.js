import t from 'tap'
import { checkUnnecessaryBraces } from '../src/lib/rules/unnecessary-braces.js'
import { parseCode } from '../src/lib/parser.js'

t.test('Given code with unnecessary braces violations', t => {
    t.test('When an if statement has braces around a single statement', t => {
        const code = `if (condition) {
            doSomething()
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.equal(violations[0].type, 'unnecessary-braces', 'Then the violation type should be unnecessary-braces')
        t.equal(violations[0].rule, 'unnecessary-braces', 'Then the rule field should be set correctly')
        t.match(violations[0].message, /unnecessary braces/, 'Then the message should mention unnecessary braces')
        t.end()
    })

    t.test('When both if and else blocks have unnecessary braces', t => {
        const code = `if (condition) {
            doSomething()
        } else {
            doSomethingElse()
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 2, 'Then two violations should be detected')
        t.equal(violations[0].type, 'unnecessary-braces', 'Then the first violation should be unnecessary-braces')
        t.equal(violations[1].type, 'unnecessary-braces', 'Then the second violation should be unnecessary-braces')
        t.end()
    })

    t.test('When a for loop has braces around a single statement', t => {
        const code = `for (let i = 0; i < 10; i++) {
            console.log(i)
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /single statement/, 'Then the message should mention single statement')
        t.end()
    })

    t.test('When an arrow function has braces around a single return', t => {
        const code = `const myFunction = () => {
            return something
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected for the single-return arrow function')
        t.match(violations[0].message, /unnecessary braces/, 'Then the message should mention unnecessary braces')
        t.end()
    })

    t.end()
})

t.test('Given code with proper brace usage', t => {
    t.test('When single statements are written without braces', t => {
        const code = `if (condition) doSomething()
        else doSomethingElse()
        
        for (let i = 0; i < 10; i++) console.log(i)`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.test('When multi-statement blocks use braces', t => {
        const code = `if (condition) {
            doSomething()
            doSomethingElse()
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for multi-statement blocks')
        t.end()
    })

    t.test('When traditional function declarations use braces', t => {
        const code = `function myFunction() {
            return something
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for traditional function declarations')
        t.end()
    })

    t.test('When multi-statement arrow functions use braces', t => {
        const code = `const myFunction = () => {
            doSomething()
            return something
        }`
        const ast = parseCode(code)
        const violations = checkUnnecessaryBraces(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for multi-statement arrow functions')
        t.end()
    })

    t.end()
})
