import { test } from 'tap'
import { checkFunctionalPatterns } from '../src/lib/rules/check-functional-patterns.js'
import { Parser } from '../src/lib/parser.js'

const { parseCode } = Parser

test('Functional patterns rule tests', t => {
    t.test('Given code with no loops', t => {
        t.test('When the code uses only functional patterns', t => {
            const code = `const numbers = [1, 2, 3, 4, 5]
            const doubled = numbers.map(x => x * 2)
            const evens = numbers.filter(x => x % 2 === 0)
            const sum = numbers.reduce((acc, x) => acc + x, 0)`

            const ast = parseCode(code)
            const violations = checkFunctionalPatterns(ast, code, 'test.js')

            t.equal(violations.length, 0, 'Then no violations should be detected')
            t.end()
        })
        t.end()
    })

    t.test('Given code with a for loop', t => {
        t.test('When the for loop iterates over an array', t => {
            const code = `const numbers = [1, 2, 3, 4, 5]
            const results = []
            for (let i = 0; i < numbers.length; i++) {
                results.push(numbers[i] * 2)
            }`

            const ast = parseCode(code)
            const violations = checkFunctionalPatterns(ast, code, 'test.js')

            t.equal(violations.length, 1, 'Then one violation should be detected')
            t.equal(violations[0].type, 'functional-patterns', 'Then the violation type should be functional-patterns')
            t.equal(violations[0].line, 3, 'Then the violation should be on line 3')
            t.match(
                violations[0].message,
                /Replace for loop with map\/filter\/reduce/,
                'Then the message should suggest functional patterns',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given code with a while loop', t => {
        t.test('When the while loop processes data', t => {
            const code = `let i = 0
            const results = []
            while (i < items.length) {
                results.push(process(items[i]))
                i++
            }`

            const ast = parseCode(code)
            const violations = checkFunctionalPatterns(ast, code, 'test.js')

            t.equal(violations.length, 1, 'Then one violation should be detected')
            t.match(
                violations[0].message,
                /Replace while loop with map\/filter\/reduce or early returns/,
                'Then the message should suggest functional patterns or early returns',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given code with a do-while loop', t => {
        t.test('When the do-while loop processes data', t => {
            const code = `let result = []
            let i = 0
            do {
                result.push(data[i])
                i++
            } while (i < data.length)`

            const ast = parseCode(code)
            const violations = checkFunctionalPatterns(ast, code, 'test.js')

            t.equal(violations.length, 1, 'Then one violation should be detected')
            t.match(
                violations[0].message,
                /Replace do-while loop with map\/filter\/reduce or early returns/,
                'Then the message should suggest functional patterns or early returns',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given code with a for-in loop', t => {
        t.test('When the for-in loop iterates over object properties', t => {
            const code = `const obj = { a: 1, b: 2, c: 3 }
            const results = []
            for (const key in obj) {
                results.push(key + ': ' + obj[key])
            }`

            const ast = parseCode(code)
            const violations = checkFunctionalPatterns(ast, code, 'test.js')

            t.equal(violations.length, 1, 'Then one violation should be detected')
            t.match(
                violations[0].message,
                /Replace for-in loop with Object\.entries/,
                'Then the message should suggest Object.entries',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given code with a for-of loop', t => {
        t.test('When the for-of loop iterates over an array', t => {
            const code = `const numbers = [1, 2, 3, 4, 5]
            const results = []
            for (const num of numbers) {
                results.push(num * 2)
            }`

            const ast = parseCode(code)
            const violations = checkFunctionalPatterns(ast, code, 'test.js')

            t.equal(violations.length, 1, 'Then one violation should be detected')
            t.match(
                violations[0].message,
                /Replace for-of loop with map\/filter\/reduce/,
                'Then the message should suggest functional patterns',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given code with multiple types of loops', t => {
        t.test('When the code contains both for and while loops', t => {
            const code = `const data = [1, 2, 3]
            for (let i = 0; i < data.length; i++) {
                console.log(data[i])
            }

            let j = 0
            while (j < 5) {
                console.log(j)
                j++
            }`

            const ast = parseCode(code)
            const violations = checkFunctionalPatterns(ast, code, 'test.js')

            t.equal(violations.length, 2, 'Then two violations should be detected')
            t.equal(violations[0].line, 2, 'Then the first violation should be on line 2')
            t.equal(violations[1].line, 7, 'Then the second violation should be on line 7')
            t.end()
        })
        t.end()
    })

    t.test('Given code with nested loops', t => {
        t.test('When loops are nested inside each other', t => {
            const code = `for (let i = 0; i < rows.length; i++) {
                for (let j = 0; j < cols.length; j++) {
                    matrix[i][j] = i * j
                }
            }`

            const ast = parseCode(code)
            const violations = checkFunctionalPatterns(ast, code, 'test.js')

            t.equal(violations.length, 2, 'Then two violations should be detected for nested loops')
            t.equal(violations[0].line, 1, 'Then the first violation should be on line 1')
            t.equal(violations[1].line, 2, 'Then the second violation should be on line 2')
            t.end()
        })
        t.end()
    })

    t.test('Given an empty AST', t => {
        t.test('When the AST is null', t => {
            const violations = checkFunctionalPatterns(null, '', 'test.js')

            t.equal(violations.length, 0, 'Then no violations should be detected')
            t.end()
        })
        t.end()
    })

    t.end()
})
