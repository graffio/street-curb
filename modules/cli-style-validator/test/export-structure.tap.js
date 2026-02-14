import t from 'tap'
import { checkExportStructure } from '../src/lib/rules/export-structure.js'
import { Parser } from '../src/lib/parser.js'

const { parseCode } = Parser

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
        const code = `const fn1 = () => {}
const fn2 = () => {}
const wrongName = { fn1, fn2 }
export { wrongName }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /"wrongName"/, 'Then the message should mention the actual name')
        t.match(violations[0].message, /"MyModule"/, 'Then the message should mention the expected name')
        t.end()
    })

    t.test('When the export name matches file name', t => {
        const code = `const fn1 = () => {}
const fn2 = () => {}
const MyModule = { fn1, fn2 }
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
const doWork = () => {}
const MyModule = { isValid: P.isValid, doWork }
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
const doWork = () => {}
const MyModule = { isValid, doWork }
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
const doMore = () => T.toNumber('10')
const MyModule = { doSomething, doMore }
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

t.test('Given a file that exports a single function', t => {
    t.test('When the export is camelCase matching the file name', t => {
        const code = `const fooBar = (items, max) => items.slice(0, max)
export { fooBar }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'foo-bar.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.test('When the export is PascalCase but should be camelCase', t => {
        const code = `const FooBar = (items, max) => items.slice(0, max)
export { FooBar }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'foo-bar.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /"fooBar"/, 'Then the message should suggest camelCase')
        t.match(violations[0].message, /camelCase/, 'Then the message should mention casing rule')
        t.end()
    })

    t.test('When an object export uses camelCase but should be PascalCase', t => {
        const code = `const fn1 = () => {}
const fn2 = () => {}
const fooBar = { fn1, fn2 }
export { fooBar }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'foo-bar.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /"FooBar"/, 'Then the message should suggest PascalCase')
        t.match(violations[0].message, /PascalCase/, 'Then the message should mention casing rule')
        t.end()
    })

    t.end()
})

t.test('Given an object export with a single property', t => {
    t.test('When the object wraps just one function', t => {
        const code = `const doWork = () => {}
const MyModule = { doWork }
export { MyModule }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /single property/, 'Then the message should mention single property')
        t.match(violations[0].message, /myModule/, 'Then the message should suggest camelCase function export')
        t.end()
    })

    t.test('When the object has multiple properties', t => {
        const code = `const doWork = () => {}
const doMore = () => {}
const MyModule = { doWork, doMore }
export { MyModule }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given various file name formats', t => {
    t.test('When file is simple kebab-case', t => {
        const code = `const fn1 = () => {}
const fn2 = () => {}
const FooBar = { fn1, fn2 }
export { FooBar }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'foo-bar.js')

        t.equal(violations.length, 0, 'Then no violations for matching name')
        t.end()
    })

    t.test('When file is single word', t => {
        const code = `const fn1 = () => {}
const fn2 = () => {}
const Api = { fn1, fn2 }
export { Api }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'api.js')

        t.equal(violations.length, 0, 'Then no violations for single word file')
        t.end()
    })

    t.test('When file has multiple dashes', t => {
        const code = `const check = () => {}
const verify = () => {}
const SingleLevelIndentation = { check, verify }
export { SingleLevelIndentation }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'single-level-indentation.js')

        t.equal(violations.length, 0, 'Then no violations for multi-dash file name')
        t.end()
    })

    t.end()
})

t.test('Given a file that exports a renamed cohesion group', t => {
    t.test('When the export renames E to match file name', t => {
        const code = `const E = { handleClick: () => {}, handleSubmit: () => {} }
export { E as FileHandling }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'file-handling.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.match(violations[0].message, /Cohesion group "E"/, 'Then the message should mention the cohesion group')
        t.match(violations[0].message, /FileHandling/, 'Then the message should mention the export name')
        t.end()
    })

    t.test('When the export renames a non-cohesion-group variable', t => {
        const code = `const internal = { doWork: () => {}, doMore: () => {} }
export { internal as MyModule }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a file whose export object contains cohesion group references', t => {
    t.test('When the export wraps P, T, E groups', t => {
        const code = `const P = { isValid: x => x > 0 }
const T = { toNumber: x => parseInt(x) }
const E = { handleClick: () => {} }
const RegisterPage = { P, T, E }
export { RegisterPage }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'register-page.js')

        t.ok(violations.length >= 1, 'Then at least one violation should be detected')
        t.match(violations[0].message, /cohesion group/, 'Then the message should mention cohesion groups')
        t.match(violations[0].message, /P/, 'Then the message should list P')
        t.end()
    })

    t.test('When the export object has normal function properties', t => {
        const code = `const P = { isHelper: x => x > 0 }
const doWork = () => P.isHelper(5)
const doMore = () => {}
const MyModule = { doWork, doMore }
export { MyModule }`
        const ast = parseCode(code)
        const violations = checkExportStructure(ast, code, 'my-module.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})
