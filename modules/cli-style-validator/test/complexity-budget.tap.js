// ABOUTME: Tests for complexity budget validation rule
// ABOUTME: Covers lines, style objects, and functions budgets by context

import t from 'tap'
import { checkComplexityBudget } from '../src/lib/rules/complexity-budget.js'
import { parseCode } from '../src/lib/parser.js'

// Helper to generate many unique const declarations for line count tests
const manyLines = n =>
    Array(n)
        .fill(0)
        .map((_, i) => `const x${i} = ${i}`)
        .join('\n')

t.test('Given a CLI tool file', t => {
    t.test('When the file exceeds the lines budget (150)', t => {
        const code = manyLines(160)
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/cli-foo/src/index.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(
            violations[0].message,
            /Lines.*160.*exceeds.*cli.*budget.*150/,
            'Then the message describes the violation',
        )
        t.end()
    })

    t.test('When the file has too many functions (>10)', t => {
        const funcs = Array(12)
            .fill(0)
            .map((_, i) => `const fn${i} = () => ${i}`)
            .join('\n')
        const ast = parseCode(funcs)
        const violations = checkComplexityBudget(ast, funcs, '/cli-bar/src/tool.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(
            violations[0].message,
            /Functions.*12.*exceeds.*cli.*budget.*10/,
            'Then the message describes the violation',
        )
        t.end()
    })

    t.test('When the file has style objects (budget is 0)', t => {
        const code = `const style = { padding: '8px', margin: '4px', display: 'flex' }`
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/cli-baz/src/main.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(
            violations[0].message,
            /Style objects.*1.*exceeds.*cli.*budget.*0/,
            'Then the message describes the violation',
        )
        t.end()
    })

    t.end()
})

t.test('Given a React component file', t => {
    t.test('When the component exceeds the lines budget (100)', t => {
        // Generate unique variable names inside the component
        // Need 100+ lines total: 1 (declaration) + body + 1 (return) + 1 (closing brace)
        const componentBody = Array(105)
            .fill(0)
            .map((_, i) => `    const x${i} = ${i}`)
            .join('\n')
        const code = `const MyComponent = () => {\n${componentBody}\n    return null\n}`
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/src/components/MyComponent.jsx')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /Lines.*exceeds.*react-component/, 'Then the message describes the violation')
        t.end()
    })

    t.test('When a Page component exceeds the page budget (200)', t => {
        // Need 200+ lines total: 1 (declaration) + body + 1 (return) + 1 (closing brace)
        const pageBody = Array(205)
            .fill(0)
            .map((_, i) => `    const x${i} = ${i}`)
            .join('\n')
        const code = `const FooPage = () => {\n${pageBody}\n    return null\n}`
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/src/pages/FooPage.jsx')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /Lines.*exceeds.*react-page/, 'Then the message uses page budget')
        t.end()
    })

    t.test('When a component has too many style objects (>3)', t => {
        const code = `const MyComponent = () => {
    const style1 = { padding: '8px', margin: '4px' }
    const style2 = { display: 'flex', width: '100%' }
    const style3 = { color: 'red', backgroundColor: 'blue' }
    const style4 = { border: '1px solid', borderRadius: '4px' }
    return null
}`
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/src/components/Styled.jsx')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(
            violations[0].message,
            /Style objects.*4.*exceeds.*react-component.*3/,
            'Then the message describes style object violation',
        )
        t.end()
    })

    t.test('When a component has too many functions (>5)', t => {
        // Component counts as 1 function, so 5 inner = 6 total (exceeds budget of 5)
        const funcs = Array(5)
            .fill(0)
            .map((_, i) => `    const fn${i} = () => ${i}`)
            .join('\n')
        const code = `const MyComponent = () => {\n${funcs}\n    return null\n}`
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/src/components/Complex.jsx')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /Functions.*6.*exceeds.*5/, 'Then the message describes function violation')
        t.end()
    })

    t.end()
})

t.test('Given a selector file', t => {
    t.test('When the file exceeds the lines budget (80)', t => {
        const code = manyLines(90)
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/src/selectors/foo.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(
            violations[0].message,
            /Lines.*90.*exceeds.*selector.*budget.*80/,
            'Then the message uses selector budget',
        )
        t.end()
    })

    t.end()
})

t.test('Given files that should be skipped', t => {
    t.test('When the file is a test file (.tap.js)', t => {
        const code = manyLines(200)
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/src/foo.tap.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.test('When the file is a test file (.test.js)', t => {
        const code = manyLines(200)
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/src/foo.test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.test('When the file is generated', t => {
        const code = '// Auto-generated file\n' + manyLines(200)
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/src/generated.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given files within budget', t => {
    t.test('When a utility file is within all budgets', t => {
        const code = `const fn1 = () => 1
const fn2 = () => 2
const fn3 = () => 3`
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/src/utils/helpers.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.test('When a component is within all budgets', t => {
        const code = `const SmallComponent = () => {
    const handleClick = () => console.log('clicked')
    return <button onClick={handleClick}>Click</button>
}`
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/src/components/Small.jsx')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given style object detection', t => {
    t.test('When an object has CSS-like properties', t => {
        const code = `const style = { padding: '8px', margin: '4px', display: 'flex' }`
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/cli-foo/src/index.js')

        t.equal(violations.length, 1, 'Then it should be detected as a style object')
        t.end()
    })

    t.test('When an object has non-CSS properties', t => {
        const code = `const config = { name: 'foo', value: 42, enabled: true }`
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/cli-foo/src/index.js')

        t.equal(violations.length, 0, 'Then it should not be detected as a style object')
        t.end()
    })

    t.end()
})

t.test('Given an empty AST', t => {
    t.test('When the AST is null', t => {
        const violations = checkComplexityBudget(null, '', 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given COMPLEXITY exemptions', t => {
    t.test('When a file has a permanent COMPLEXITY exemption for lines', t => {
        const code = '// COMPLEXITY: lines — this is a barrel file\n' + manyLines(160)
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/cli-foo/src/index.js')

        t.equal(violations.length, 0, 'Then no lines violation should be detected')
        t.end()
    })

    t.test('When a file has a non-expired COMPLEXITY-TODO for functions', t => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        const dateStr = futureDate.toISOString().split('T')[0]
        const funcs = Array(12)
            .fill(0)
            .map((_, i) => `const fn${i} = () => ${i}`)
            .join('\n')
        const code = `// COMPLEXITY-TODO: functions — refactoring pending (expires ${dateStr})\n${funcs}`
        const ast = parseCode(code)
        const result = checkComplexityBudget(ast, code, '/cli-bar/src/tool.js')

        const violations = result.filter(r => r.type === 'complexity-budget')
        const warnings = result.filter(r => r.type === 'complexity-budget-warning')

        t.equal(violations.length, 0, 'Then no function violation should be detected')
        t.equal(warnings.length, 1, 'Then one warning should be emitted')
        t.match(warnings[0].message, /deferred.*functions/, 'Then the warning mentions the deferred rule')
        t.ok(warnings[0].daysRemaining >= 29, 'Then daysRemaining should be approximately 30')
        t.end()
    })

    t.test('When a file has an expired COMPLEXITY-TODO for style-objects', t => {
        const code = `// COMPLEXITY-TODO: style-objects — moving to CSS (expires 2020-01-01)
const style = { padding: '8px', margin: '4px', display: 'flex' }`
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/cli-baz/src/main.js')

        t.equal(violations.length, 1, 'Then a style-objects violation should be detected')
        t.match(violations[0].message, /expired/i, 'Then the message mentions expiration')
        t.end()
    })

    t.test('When a file has multiple exemptions for different metrics', t => {
        const code =
            `// COMPLEXITY: lines — barrel file
// COMPLEXITY: functions — many small helpers
` +
            manyLines(160) +
            '\n' +
            Array(12)
                .fill(0)
                .map((_, i) => `const fn${i} = () => ${i}`)
                .join('\n')
        const ast = parseCode(code)
        const violations = checkComplexityBudget(ast, code, '/cli-foo/src/index.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for exempted metrics')
        t.end()
    })

    t.end()
})
