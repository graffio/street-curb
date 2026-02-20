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

    t.test('When Predicates comes after Transformers', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('Transformers'),
            'const T = { toFoo: x => x }',
            '',
            section('Predicates'),
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

t.test('Given a file with a cohesion group but no section separator for it', t => {
    t.test('When const P = { ... } exists without a P section', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            'const P = { isFoo: x => !!x }',
            '',
            section('Exports'),
            'const MyModule = { P }',
            'export { MyModule }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        const presenceViolation = violations.find(v => v.message.includes('Predicates'))
        t.ok(presenceViolation, 'Then a presence violation mentioning Predicates should be detected')
        t.end()
    })

    t.test('When const F = { ... } exists without a Factories section', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            'const F = { createFoo: () => ({}) }',
            '',
            section('Exports'),
            'const MyModule = { F }',
            'export { MyModule }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        const presenceViolation = violations.find(v => v.message.includes('Factories'))
        t.ok(presenceViolation, 'Then a presence violation mentioning Factories should be detected')
        t.end()
    })

    t.test('When const P = { ... } exists WITH a Predicates section', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('Predicates'),
            'const P = { isFoo: x => !!x }',
            '',
            section('Exports'),
            'const MyModule = { P }',
            'export { MyModule }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        t.equal(violations.length, 0, 'Then no violations when the section exists')
        t.end()
    })

    t.end()
})

t.test('Given a file with UPPER_CASE constants but no Constants section', t => {
    t.test('When UPPER_CASE consts exist without a Constants section', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            'const SORT_MODE_OPTIONS = []',
            'const CHEVRON_STYLE = {}',
            '',
            section('Exports'),
            'const MyModule = { SORT_MODE_OPTIONS }',
            'export { MyModule }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        const presenceViolation = violations.find(v => v.message.includes('Constants'))
        t.ok(presenceViolation, 'Then a presence violation mentioning Constants should be detected')
        t.end()
    })

    t.test('When UPPER_CASE consts exist WITH a Constants section', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('Constants'),
            'const SORT_MODE_OPTIONS = []',
            '',
            section('Exports'),
            'const MyModule = { SORT_MODE_OPTIONS }',
            'export { MyModule }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        t.equal(violations.length, 0, 'Then no violations when Constants section exists')
        t.end()
    })

    t.end()
})

t.test('Given a .jsx file with PascalCase arrow function components', t => {
    t.test('When 2+ PascalCase arrow functions exist without a Components section', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            'const ItemRow = ({ item }) => (',
            '    <div>{item.name}</div>',
            ')',
            '',
            'const MainList = () => (',
            '    <div><ItemRow item={{}} /></div>',
            ')',
            '',
            section('Exports'),
            'export { MainList }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'components/MyList.jsx')

        const presenceViolation = violations.find(v => v.message.includes('Components'))
        t.ok(presenceViolation, 'Then a presence violation mentioning Components should be detected')
        t.end()
    })

    t.test('When only 1 PascalCase arrow function exists (the export)', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            'const MainList = () => (',
            '    <div>hello</div>',
            ')',
            '',
            section('Exports'),
            'export { MainList }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'components/MyList.jsx')

        const presenceViolation = violations.find(v => v.message.includes('Components'))
        t.notOk(presenceViolation, 'Then no Components violation for a single component (it is the export)')
        t.end()
    })

    t.test('When 2+ PascalCase arrow functions are all in the Exports section', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('Constants'),
            'const defaultItems = []',
            '',
            section('Exports'),
            'const Chip = ({ viewId }) => null',
            'const Column = ({ viewId }) => null',
            'const MyFilterChip = { Chip, Column }',
            'export { MyFilterChip }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'components/MyFilterChip.jsx')

        const presenceViolation = violations.find(v => v.message.includes('Components'))
        t.notOk(presenceViolation, 'Then no Components violation (exports are not sub-components)')
        t.end()
    })

    t.test('When 2+ PascalCase arrow functions exist in a .js file (not .jsx)', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            'const ItemRow = ({ item }) => item.name',
            'const MainList = () => null',
            '',
            section('Exports'),
            'const MyModule = { ItemRow, MainList }',
            'export { MyModule }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        const presenceViolation = violations.find(v => v.message.includes('Components'))
        t.notOk(presenceViolation, 'Then no Components violation for .js files (Components is JSX-only)')
        t.end()
    })

    t.end()
})

t.test('Given a file with only an Exports section and no other declaration kinds', t => {
    t.test('When the file has just a function and export', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('Exports'),
            'const myHelper = x => x + 1',
            'export { myHelper }',
        ].join('\n')
        const ast = parseCode(code)
        const violations = checkSectionSeparators(ast, code, 'test-module.js')

        t.equal(violations.length, 0, 'Then no presence violations beyond Exports')
        t.end()
    })

    t.end()
})

t.test('Given a file with all cohesion sections in correct order', t => {
    t.test('When Predicates, Transformers, Factories, Constants, and Exports are in canonical order', t => {
        const code = [
            '// ABOUTME: test file',
            '// ABOUTME: test file line 2',
            '',
            section('Predicates'),
            'const P = { isFoo: x => !!x }',
            '',
            section('Transformers'),
            'const T = { toFoo: x => x }',
            '',
            section('Factories'),
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
