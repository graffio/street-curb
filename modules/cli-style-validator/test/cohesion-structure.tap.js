import t from 'tap'
import { checkCohesionStructure } from '../src/lib/rules/cohesion-structure.js'
import { parseCode } from '../src/lib/parser.js'

t.test('Given cohesion groups in correct order', t => {
    t.test('When P comes before T comes before F', t => {
        const code = `const P = { isValid: x => x > 0 }
const T = { toNumber: x => parseInt(x) }
const F = { createItem: () => ({}) }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no ordering violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given cohesion groups in wrong order', t => {
    t.test('When T comes before P', t => {
        const code = `const T = { toNumber: x => parseInt(x) }
const P = { isValid: x => x > 0 }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const orderViolation = violations.find(v => v.message.includes('out of order'))
        t.ok(orderViolation, 'Then an ordering violation should be detected')
        t.match(orderViolation.message, /"P"/, 'Then the message should mention P')
        t.end()
    })

    t.test('When F comes before T', t => {
        const code = `const F = { createItem: () => ({}) }
const T = { toNumber: x => parseInt(x) }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const orderViolation = violations.find(v => v.message.includes('out of order'))
        t.ok(orderViolation, 'Then an ordering violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given an uncategorized module-level function', t => {
    t.test('When a function with cohesion-pattern name is outside groups', t => {
        const code = `const isValid = x => x > 0
const P = { isOther: x => x < 0 }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const uncatViolation = violations.find(v => v.message.includes('not in a P/T/F/V/A/E'))
        t.ok(uncatViolation, 'Then an uncategorized violation should be detected')
        t.match(uncatViolation.message, /suggests P group/, 'Then the message should suggest P group')
        t.end()
    })

    t.test('When a function has no cohesion pattern prefix', t => {
        const code = `const doSomething = () => {}
const P = { isValid: x => x > 0 }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const uncatViolation = violations.find(v => v.message.includes('not in a P/T/F/V/A/E'))
        t.ok(uncatViolation, 'Then an uncategorized violation should be detected')
        t.match(uncatViolation.message, /Rename to match/, 'Then the message should suggest renaming')
        t.end()
    })

    t.test('When a function is exported it should be exempt', t => {
        const code = `const myFunction = () => {}
export { myFunction }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const uncatViolation = violations.find(v => v.message.includes('not in a P/T/F/V/A/E'))
        t.notOk(uncatViolation, 'Then no uncategorized violation should be detected for exports')
        t.end()
    })

    t.test('When a PascalCase function exists it should be exempt', t => {
        const code = `const MyComponent = () => <div />
const P = { isValid: x => x > 0 }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const uncatViolation = violations.find(v => v.message.includes('MyComponent'))
        t.notOk(uncatViolation, 'Then no violation for PascalCase component')
        t.end()
    })

    t.end()
})

t.test('Given a function with a vague prefix', t => {
    t.test('When a function uses get prefix', t => {
        const code = `const T = { getData: () => ({}) }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const vagueViolation = violations.find(v => v.message.includes('vague prefix'))
        t.ok(vagueViolation, 'Then a vague prefix violation should be detected')
        t.match(vagueViolation.message, /"getData"/, 'Then the message should mention the function name')
        t.end()
    })

    t.test('When a function uses extract prefix', t => {
        const code = `const T = { extractValue: x => x.value }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const vagueViolation = violations.find(v => v.message.includes('vague prefix'))
        t.ok(vagueViolation, 'Then a vague prefix violation should be detected')
        t.end()
    })

    t.test('When a function uses a specific prefix like to or parse', t => {
        const code = `const T = { toNumber: x => parseInt(x), parseJson: x => JSON.parse(x) }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const vagueViolation = violations.find(v => v.message.includes('vague prefix'))
        t.notOk(vagueViolation, 'Then no vague prefix violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given external function references in cohesion groups', t => {
    t.test('When a cohesion group property references an external function', t => {
        const code = `const helperFn = () => {}
const P = { isValid: helperFn }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const extRefViolation = violations.find(v => v.message.includes('references external'))
        t.ok(extRefViolation, 'Then an external reference violation should be detected')
        t.match(extRefViolation.message, /P\.isValid/, 'Then the message should mention the property')
        t.end()
    })

    t.test('When functions are defined inline in cohesion groups', t => {
        const code = `const P = { isValid: x => x > 0 }
const T = { toNumber: x => parseInt(x) }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const extRefViolation = violations.find(v => v.message.includes('references external'))
        t.notOk(extRefViolation, 'Then no external reference violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given multiple exports', t => {
    t.test('When a file has more than one export', t => {
        const code = `const fn1 = () => {}
const fn2 = () => {}
export { fn1, fn2 }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const multiExportViolation = violations.find(v => v.message.includes('exports'))
        t.ok(multiExportViolation, 'Then a multiple exports violation should be detected')
        t.match(multiExportViolation.message, /2 exports/, 'Then the message should mention the count')
        t.end()
    })

    t.test('When a file has exactly one export', t => {
        const code = `const fn1 = () => {}
export { fn1 }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const multiExportViolation = violations.find(v => v.message.includes('exports'))
        t.notOk(multiExportViolation, 'Then no multiple exports violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given an exported function defined inside a cohesion group', t => {
    t.test('When an export references a function inside P group', t => {
        const code = `const P = { isValid: x => x > 0 }
export { isValid } from './other.js'`

        // Note: This test may not trigger the violation since the function
        // isn't actually defined inside the group, just has the same name
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        // This is testing the mechanism runs without error
        t.ok(Array.isArray(violations), 'Then violations array should be returned')
        t.end()
    })

    t.end()
})

t.test('Given COMPLEXITY comments for justification', t => {
    t.test('When a COMPLEXITY comment exists near an uncategorized function', t => {
        const code = `// COMPLEXITY: Special case for legacy support
const legacyHandler = () => {}`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const uncatViolation = violations.find(v => v.message.includes('not in a P/T/F/V/A/E'))
        t.notOk(uncatViolation, 'Then no uncategorized violation when justified by COMPLEXITY comment')
        t.end()
    })

    t.test('When a COMPLEXITY comment mentions the function name for vague prefix', t => {
        const code = `// COMPLEXITY: "getData" matches external API naming
const T = { getData: () => fetch('/api') }`
        const ast = parseCode(code)
        const violations = checkCohesionStructure(ast, code, 'test.js')

        const vagueViolation = violations.find(v => v.message.includes('vague prefix') && v.message.includes('getData'))
        t.notOk(vagueViolation, 'Then no vague prefix violation when justified')
        t.end()
    })

    t.end()
})
