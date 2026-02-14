// ABOUTME: Tests for chain extraction style rule
// ABOUTME: Suggests extracting repeated property chains into destructured variables

import t from 'tap'
import { checkChainExtraction } from '../src/lib/rules/chain-extraction.js'
import { Parser } from '../src/lib/parser.js'

const { parseCode } = Parser

t.test('Given property chains in a function', t => {
    t.test('When same base is accessed 3+ times across different properties', t => {
        const code = `const fn = obj => {
    if (obj.type === 'A') return obj.id
    if (obj.type === 'B') return obj.name
    return obj.value
}`
        const ast = parseCode(code)
        const violations = checkChainExtraction(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one suggestion should be produced')
        t.match(violations[0].message, /obj/, 'Then the message should mention the base')
        t.match(violations[0].message, /type/, 'Then the message should include accessed properties')
        t.end()
    })

    t.test('When same base is accessed only twice', t => {
        const code = `const fn = obj => {
    return obj.id + obj.name
}`
        const ast = parseCode(code)
        const violations = checkChainExtraction(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no suggestions (threshold is 3)')
        t.end()
    })

    t.test('When multiple properties are accessed many times', t => {
        const code = `const fn = obj => {
    if (obj.tag === 'A') return View.A(obj.id, obj.accountId, obj.title)
    if (obj.tag === 'B') return View.B(obj.id, obj.reportType, obj.title)
    if (obj.tag === 'C') return View.C(obj.id, obj.accountId, obj.title)
}`
        const ast = parseCode(code)
        const violations = checkChainExtraction(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one suggestion for the base')
        t.match(violations[0].message, /id/, 'Then message includes id')
        t.match(violations[0].message, /title/, 'Then message includes title')
        t.end()
    })

    t.test('When accessing nested chain multiple times', t => {
        const code = `const fn = state => {
    const x = state.tabLayout.groups
    const y = state.tabLayout.activeGroupId
    const z = state.tabLayout.width
    return x
}`
        const ast = parseCode(code)
        const violations = checkChainExtraction(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one suggestion for state.tabLayout')
        t.match(violations[0].message, /tabLayout/, 'Then message mentions tabLayout')
        t.end()
    })

    t.end()
})

t.test('Given method call chains', t => {
    t.test('When a method chain is repeated', t => {
        const code = `const fn = arr => {
    const x = arr.map(a => a + 1)
    const y = arr.map(b => b * 2)
    return x
}`
        const ast = parseCode(code)
        const violations = checkChainExtraction(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no suggestions for method chains')
        t.end()
    })

    t.test('When property access before method call is repeated 3+ times', t => {
        const code = `const fn = obj => {
    const x = obj.items.map(a => a + 1)
    const y = obj.items.filter(b => b > 0)
    const z = obj.items.reduce((a, b) => a + b, 0)
    return x
}`
        const ast = parseCode(code)
        const violations = checkChainExtraction(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one suggestion for the property prefix')
        t.match(violations[0].message, /items/, 'Then the message should mention items')
        t.end()
    })

    t.end()
})

t.test('Given nested functions', t => {
    t.test('When chains are repeated within an inner function', t => {
        const code = `const outer = state => {
    const inner = () => {
        const x = state.data.value
        const y = state.data.other
        const z = state.data.count
        return x
    }
    return inner
}`
        const ast = parseCode(code)
        const violations = checkChainExtraction(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one suggestion for the inner function')
        t.end()
    })

    t.end()
})

t.test('Given assignment targets', t => {
    t.test('When same base is assigned to 3+ times', t => {
        const code = `const fn = () => {
    const result = {}
    result.a = 1
    result.b = 2
    result.c = 3
    return result
}`
        const ast = parseCode(code)
        const violations = checkChainExtraction(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no suggestions (cannot destructure assignment targets)')
        t.end()
    })

    t.test('When mixing reads and writes to same base', t => {
        const code = `const fn = obj => {
    const result = {}
    result.a = obj.x
    result.b = obj.y
    result.c = obj.z
    return result
}`
        const ast = parseCode(code)
        const violations = checkChainExtraction(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then only reads should be flagged')
        t.match(violations[0].message, /obj/, 'Then the message mentions the read base')
        t.notMatch(violations[0].message, /result/, 'Then the message does not mention the write base')
        t.end()
    })

    t.end()
})

t.test('Given edge cases', t => {
    t.test('When the AST is null', t => {
        const violations = checkChainExtraction(null, '', 'test.js')

        t.equal(violations.length, 0, 'Then no suggestions')
        t.end()
    })

    t.test('When there are no member expressions', t => {
        const code = `const fn = x => x + 1`
        const ast = parseCode(code)
        const violations = checkChainExtraction(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no suggestions')
        t.end()
    })

    t.end()
})
