// ABOUTME: Tests for @sig documentation validation rule
// ABOUTME: Covers missing @sig, proper @sig placement, and exemptions

import t from 'tap'
import { parseCode } from '../src/lib/parser.js'
import { checkSigDocumentation } from '../src/lib/rules/sig-documentation.js'

t.test('Given functions that require @sig documentation', t => {
    t.test('When a top-level function has no @sig comment', t => {
        const code = `const processData = (data) => {
            return data.filter(item => item.active)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.equal(violations[0].type, 'sig-documentation', 'Then the violation type should be sig-documentation')
        t.equal(violations[0].rule, 'sig-documentation', 'Then the rule field should be set correctly')
        t.match(violations[0].message, /@sig/, 'Then the message should mention @sig')
        t.end()
    })

    t.test('When a top-level function declaration has no @sig comment', t => {
        const code = `function processUsers(users) {
            return users.map(user => user.name)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected for the function declaration')
        t.match(violations[0].message, /@sig/, 'Then the message should mention @sig')
        t.end()
    })

    t.test('When a function is longer than 5 lines and has no @sig comment', t => {
        const code = `const longFunction = (data) => {
            const filtered = data.filter(item => item.active)
            const mapped = filtered.map(item => item.value)
            const reduced = mapped.reduce((sum, val) => sum + val, 0)
            const normalized = reduced / mapped.length
            const rounded = Math.round(normalized)
            return rounded
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected for the long function')
        t.match(violations[0].message, /@sig/, 'Then the message should mention @sig documentation')
        t.end()
    })

    t.test('When an exported function has no @sig comment', t => {
        const code = `const helperFunction = (x) => x * 2

        export { helperFunction }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected for the exported function')
        t.end()
    })

    t.end()
})

t.test('Given functions with proper @sig documentation', t => {
    t.test('When a top-level function has a @sig comment', t => {
        const code = `/**
         * Process array of data items
         * @sig processData :: [Item] -> [Item]
         */
        const processData = (data) => {
            return data.filter(item => item.active)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.test('When a function declaration has a @sig comment', t => {
        const code = `/**
         * Process users array
         * @sig processUsers :: [User] -> [String]
         */
        function processUsers(users) {
            return users.map(user => user.name)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for the documented function')
        t.end()
    })

    t.test('When a long function has a @sig comment', t => {
        const code = `/**
         * Calculate normalized average from data
         * @sig calculateAverage :: [Number] -> Number
         */
        const longFunction = (data) => {
            const filtered = data.filter(item => item.active)
            const mapped = filtered.map(item => item.value)
            const reduced = mapped.reduce((sum, val) => sum + val, 0)
            const normalized = reduced / mapped.length
            const rounded = Math.round(normalized)
            return rounded
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for the documented long function')
        t.end()
    })

    t.end()
})

t.test('Given functions that do not require @sig documentation', t => {
    t.test('When a function is 5 lines or shorter and not top-level', t => {
        const code = `const outerFunction = () => {
            const shortHelper = (x) => {
                return x * 2
            }
            return shortHelper(5)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then only the top-level function should require @sig')
        t.end()
    })

    t.test('When a function is a callback or nested function under 5 lines', t => {
        const code = `/**
         * Process items with callback
         * @sig processItems :: ([Item], (Item -> Boolean)) -> [Item]
         */
        const processItems = (items, callback) => {
            return items.filter(item => {
                return callback(item)
            })
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for short nested functions')
        t.end()
    })

    t.end()
})

t.test('Given @sig comment placement in a block', t => {
    t.test('When @sig is followed by more comment lines', t => {
        const code = `/**
         * @sig processData :: [Item] -> [Item]
         * Process array of data items
         */
        const processData = (data) => {
            return data.filter(item => item.active)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /last/, 'Then the message should mention @sig must be last')
        t.end()
    })

    t.test('When @sig is the last line in the comment block', t => {
        const code = `/**
         * Process array of data items
         * @sig processData :: [Item] -> [Item]
         */
        const processData = (data) => {
            return data.filter(item => item.active)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.test('When @sig is followed by only the closing comment marker', t => {
        const code = `// Process array of data items
// @sig processData :: [Item] -> [Item]
const processData = (data) => {
    return data.filter(item => item.active)
}`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for single-line comments')
        t.end()
    })

    t.test('When @sig in single-line comment is followed by more comments', t => {
        const code = `// @sig processData :: [Item] -> [Item]
// Process array of data items
const processData = (data) => {
    return data.filter(item => item.active)
}`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /last/, 'Then the message should mention @sig must be last')
        t.end()
    })

    t.test('When @sig is followed by prettier-ignore directive', t => {
        const code = `/**
         * Process array of data items
         * @sig processData :: [Item] -> [Item]
         */
        //      prettier-ignore
        const processData = (data) => {
            return data.filter(item => item.active)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations (prettier-ignore is allowed after @sig)')
        t.end()
    })

    t.test('When @sig is followed by eslint-disable directive', t => {
        const code = `/**
         * Process array of data items
         * @sig processData :: [Item] -> [Item]
         */
        // eslint-disable-next-line max-len
        const processData = (data) => {
            return data.filter(item => item.active)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations (eslint directives are allowed after @sig)')
        t.end()
    })

    t.end()
})

t.test('Given paired @sig and description requirements', t => {
    t.test('When @sig is present but description is missing', t => {
        const code = `/**
         * @sig processData :: [Item] -> [Item]
         */
        const processData = (data) => {
            return data.filter(item => item.active)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /description/, 'Then the message should mention missing description')
        t.end()
    })

    t.test('When description is present but @sig is missing for required function', t => {
        const code = `/**
         * Process array of data items
         */
        const processData = (data) => {
            return data.filter(item => item.active)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected for missing @sig')
        t.match(violations[0].message, /@sig/, 'Then the message should mention @sig')
        t.end()
    })

    t.test('When both @sig and description are present', t => {
        const code = `/**
         * Process array of data items
         * @sig processData :: [Item] -> [Item]
         */
        const processData = (data) => {
            return data.filter(item => item.active)
        }`
        const ast = parseCode(code)
        const violations = checkSigDocumentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})
