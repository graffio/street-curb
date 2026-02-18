import t from 'tap'
import { checkSectionSeparators } from '../src/lib/rules/check-section-separators.js'
import { Parser } from '../src/lib/parser.js'

const { parseCode } = Parser

// Helper: build a block-format section separator
const section = name =>
    [
        '// ---------------------------------------------------------------------------------------------------------------------',
        '//',
        `// ${name}`,
        '//',
        '// ---------------------------------------------------------------------------------------------------------------------',
    ].join('\n')

t.test('Given a file with correctly formatted section separators', t => {
    t.test('When block format is used with standard sections in order', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('Constants'),
            'const FOO = 42',
            '',
            section('Exports'),
            'const MyModule = { FOO }',
            'export { MyModule }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a file with inline-format separator', t => {
    t.test('When the section name is on the separator line', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            '// ----------------------------------------------------- Constants ---',
            'const FOO = 42',
            '',
            section('Exports'),
            'const MyModule = { FOO }',
            'export { MyModule }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        const formatViolation = violations.find(v => v.message.includes('block format'))
        t.ok(formatViolation, 'Then a format violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a file without an Exports section', t => {
    t.test('When the file has no section separators at all', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            'const FOO = 42',
            'export { FOO }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        const presenceViolation = violations.find(v => v.message.includes('Exports'))
        t.ok(presenceViolation, 'Then a presence violation should be detected')
        t.end()
    })

    t.test('When the file has sections but none named Exports', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('Constants'),
            'const FOO = 42',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        const presenceViolation = violations.find(v => v.message.includes('Exports'))
        t.ok(presenceViolation, 'Then a presence violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a test file', t => {
    t.test('When the file is a .tap.js file', t => {
        const code = 'const x = 1'
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test/my-test.tap.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for test files')
        t.end()
    })

    t.end()
})

t.test('Given sections in wrong order', t => {
    t.test('When Exports comes before Constants', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('Exports'),
            'const MyModule = {}',
            'export { MyModule }',
            '',
            section('Constants'),
            'const FOO = 42',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        const orderViolation = violations.find(v => v.message.includes('order'))
        t.ok(orderViolation, 'Then an order violation should be detected')
        t.end()
    })

    t.test('When P comes after T', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('T'),
            'const T = { toFoo: x => x }',
            '',
            section('P'),
            'const P = { isFoo: x => !!x }',
            '',
            section('Exports'),
            'const MyModule = { P, T }',
            'export { MyModule }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        const orderViolation = violations.find(v => v.message.includes('order'))
        t.ok(orderViolation, 'Then an order violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a non-standard section name', t => {
    t.test('When a section uses a domain-specific name', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('UI derived selectors'),
            'const foo = () => {}',
            '',
            section('Exports'),
            'export { foo }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        const nonStandardViolation = violations.find(v => v.message.includes('non-standard'))
        t.ok(nonStandardViolation, 'Then a non-standard section name violation should be detected')
        t.end()
    })

    t.test('When COMPLEXITY: section-separators exemption exists', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '// COMPLEXITY: section-separators — Uses domain namespaces',
            '',
            section('UI derived selectors'),
            'const foo = () => {}',
            '',
            section('Exports'),
            'export { foo }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        t.equal(violations.length, 0, 'Then no violations when exempted')
        t.end()
    })

    t.end()
})

t.test('Given a file with all cohesion sections in correct order', t => {
    t.test('When P, T, F, Constants, and Exports are in canonical order', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('P'),
            'const P = { isFoo: x => !!x }',
            '',
            section('T'),
            'const T = { toFoo: x => x }',
            '',
            section('F'),
            'const F = { createFoo: () => ({}) }',
            '',
            section('Constants'),
            'const FOO = 42',
            '',
            section('Exports'),
            'const MyModule = { P, T, F }',
            'export { MyModule }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        t.equal(violations.length, 0, 'Then no violations for correct canonical order')
        t.end()
    })

    t.end()
})
