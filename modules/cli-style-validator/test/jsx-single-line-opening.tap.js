import t from 'tap'
import { checkJsxSingleLineOpening } from '../src/lib/rules/check-jsx-single-line-opening.js'
import { Parser } from '../src/lib/parser.js'

const { parseCode } = Parser

t.test('Given a JSX opening element on a single line', t => {
    t.test('When all props fit on one line', t => {
        const code = `const Foo = () => <Flex ref={ref} align="center" gap="2" style={style} onClick={onClick}>\n    <Text>hi</Text>\n</Flex>`
        const ast = parseCode(code)
        const violations = checkJsxSingleLineOpening(ast, code, 'component.jsx')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a JSX opening element spanning multiple lines', t => {
    t.test('When props are spread across lines', t => {
        const code = `const Foo = () => (\n    <Flex\n        ref={ref}\n        align="center"\n        gap="2"\n    >\n        <Text>hi</Text>\n    </Flex>\n)`
        const ast = parseCode(code)
        const violations = checkJsxSingleLineOpening(ast, code, 'component.jsx')

        const multilineViolation = violations.find(v => v.message.includes('single line'))
        t.ok(multilineViolation, 'Then a multiline opening tag violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a self-closing JSX element spanning multiple lines', t => {
    t.test('When the self-closing tag spans lines', t => {
        const code = `const Foo = () => (\n    <Checkbox\n        checked={isSelected}\n        tabIndex={-1}\n    />\n)`
        const ast = parseCode(code)
        const violations = checkJsxSingleLineOpening(ast, code, 'component.jsx')

        const multilineViolation = violations.find(v => v.message.includes('single line'))
        t.ok(multilineViolation, 'Then a multiline self-closing tag violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a non-JSX file', t => {
    t.test('When the file is a .js file', t => {
        const code = 'const x = 1'
        const ast = parseCode(code)
        const violations = checkJsxSingleLineOpening(ast, code, 'module.js')

        t.equal(violations.length, 0, 'Then no violations for non-JSX files')
        t.end()
    })

    t.end()
})

t.test('Given a single-line self-closing element', t => {
    t.test('When the self-closing element fits on one line', t => {
        const code = `const Foo = () => <Checkbox checked={isSelected} tabIndex={-1} />`
        const ast = parseCode(code)
        const violations = checkJsxSingleLineOpening(ast, code, 'component.jsx')

        t.equal(violations.length, 0, 'Then no violations for single-line self-closing')
        t.end()
    })

    t.end()
})
