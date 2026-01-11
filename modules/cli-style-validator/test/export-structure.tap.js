import t from 'tap'
import { ExportStructure } from '../src/lib/rules/export-structure.js'
import { parseCode } from '../src/lib/parser.js'

const { checkExportStructure } = ExportStructure

t.test('Given a file with default export', t => {
    t.test('When the file uses export default', t => {
        const code = `const myFunction = () => {}
export default myFunction`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /Default export/, 'Then the message should mention default export')
        t.end()
    })

    t.end()
})

t.test('Given a file with multiple named exports', t => {
    t.test('When the file exports multiple functions', t => {
        const code = `const fn1 = () => {}
const fn2 = () => {}
export { fn1, fn2 }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /2 named exports/, 'Then the message should mention the count')
        t.match(violations[0].message, /MyModule/, 'Then the message should suggest the correct name')
        t.end()
    })

    t.end()
})

t.test('Given a file with export name not matching file name', t => {
    t.test('When the export name differs from expected PascalCase', t => {
        const code = `const wrongName = { fn: () => {} }
export { wrongName }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /"wrongName"/, 'Then the message should mention the actual name')
        t.match(violations[0].message, /"MyModule"/, 'Then the message should mention the expected name')
        t.end()
    })

    t.test('When the export name matches file name', t => {
        const code = `const MyModule = { fn: () => {} }
export { MyModule }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given exported functions defined inside cohesion groups', t => {
    t.test('When a function in the export object is defined in P group', t => {
        const code = `const P = { isValid: x => x > 0 }
const MyModule = { isValid: P.isValid }
export { MyModule }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /"isValid"/, 'Then the message should mention the function')
        t.match(violations[0].message, /cohesion group/, 'Then the message should mention cohesion group')
        t.end()
    })

    t.test('When a function in the export object is defined at module level', t => {
        const code = `const P = { isHelper: x => x > 0 }
const isValid = x => P.isHelper(x)
const MyModule = { isValid }
export { MyModule }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a valid export structure', t => {
    t.test('When the file follows all conventions', t => {
        const code = `const P = { isHelper: x => x > 0 }
const T = { toNumber: x => parseInt(x) }

const doSomething = () => P.isHelper(T.toNumber('5'))
const MyModule = { doSomething }
export { MyModule }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given exempt files', t => {
    t.test('When the file is a test file', t => {
        const code = `const fn1 = () => {}
const fn2 = () => {}
export { fn1, fn2 }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.tap.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for test files')
        t.end()
    })

    t.test('When the file is an index file', t => {
        const code = `export { Foo } from './foo.js'
export { Bar } from './bar.js'`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'src/index.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for index files')
        t.end()
    })

    t.end()
})

t.test('Given a file with no exports', t => {
    t.test('When the file has no export statements', t => {
        const code = `const helper = () => {}
const another = () => {}`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'helper.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given various file name formats', t => {
    t.test('When file is simple kebab-case', t => {
        const code = `const FooBar = { fn: () => {} }
export { FooBar }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'foo-bar.js')

        t.equal(violations.length, 0, 'Then no violations for matching name')
        t.end()
    })

    t.test('When file is single word', t => {
        const code = `const Api = { fn: () => {} }
export { Api }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'api.js')

        t.equal(violations.length, 0, 'Then no violations for single word file')
        t.end()
    })

    t.test('When file has multiple dashes', t => {
        const code = `const SingleLevelIndentation = { check: () => {} }
export { SingleLevelIndentation }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'single-level-indentation.js')

        t.equal(violations.length, 0, 'Then no violations for multi-dash file name')
        t.end()
    })

    t.end()
})
