// ABOUTME: Tests for shared factory functions in style validator
// ABOUTME: Covers withExemptions wrapper for rule exemption handling

import t from 'tap'
import { FS } from '../src/lib/shared/factories.js'

t.test('Given withExemptions wrapper', t => {
    const mockViolation = { type: 'test-rule', line: 1, message: 'Test violation' }
    const mockCheckFn = (ast, sourceCode, filePath) => [mockViolation]

    t.test('When the source has no COMPLEXITY comment', t => {
        const wrappedFn = FS.withExemptions('test-rule', mockCheckFn)
        const result = wrappedFn(null, 'const x = 1', '/test.js')

        t.equal(result.length, 1, 'Then violations should be returned')
        t.same(result[0], mockViolation, 'Then the original violation should be passed through')
        t.end()
    })

    t.test('When the source has a permanent COMPLEXITY exemption', t => {
        const code = '// COMPLEXITY: test-rule — this is justified\nconst x = 1'
        const wrappedFn = FS.withExemptions('test-rule', mockCheckFn)
        const result = wrappedFn(null, code, '/test.js')

        t.equal(result.length, 0, 'Then no violations should be returned')
        t.end()
    })

    t.test('When the source has a non-expired COMPLEXITY-TODO', t => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        const dateStr = futureDate.toISOString().split('T')[0]
        const code = `// COMPLEXITY-TODO: test-rule — cleanup pending (expires ${dateStr})\nconst x = 1`
        const wrappedFn = FS.withExemptions('test-rule', mockCheckFn)
        const result = wrappedFn(null, code, '/test.js')

        t.equal(result.length, 1, 'Then one warning should be returned')
        t.equal(result[0].type, 'test-rule-warning', 'Then the type should be a warning')
        t.match(result[0].message, /deferred/, 'Then the message should mention deferral')
        t.ok(result[0].daysRemaining >= 29, 'Then daysRemaining should be approximately 30')
        t.end()
    })

    t.test('When the source has an expired COMPLEXITY-TODO', t => {
        const code = '// COMPLEXITY-TODO: test-rule — cleanup pending (expires 2020-01-01)\nconst x = 1'
        const wrappedFn = FS.withExemptions('test-rule', mockCheckFn)
        const result = wrappedFn(null, code, '/test.js')

        t.equal(result.length, 1, 'Then violations should be returned')
        t.match(result[0].message, /expired/i, 'Then the message should mention expiration')
        t.end()
    })

    t.test('When the COMPLEXITY comment has a different rule name', t => {
        const code = '// COMPLEXITY: other-rule — this is justified\nconst x = 1'
        const wrappedFn = FS.withExemptions('test-rule', mockCheckFn)
        const result = wrappedFn(null, code, '/test.js')

        t.equal(result.length, 1, 'Then violations should still be returned')
        t.same(result[0], mockViolation, 'Then the original violation should be passed through')
        t.end()
    })

    t.test('When the check function returns no violations', t => {
        const noViolationFn = () => []
        const wrappedFn = FS.withExemptions('test-rule', noViolationFn)
        const result = wrappedFn(null, 'const x = 1', '/test.js')

        t.equal(result.length, 0, 'Then no violations should be returned')
        t.end()
    })

    t.end()
})
