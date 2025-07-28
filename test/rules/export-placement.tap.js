import t from 'tap'
import { checkExportPlacement } from '../../tools/lib/rules/export-placement.js'

t.test('Given a file with export violations', t => {
    t.test('When the file uses export default', t => {
        const code = `const myFunction = () => {}
            export default myFunction`
        const violations = checkExportPlacement(null, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.equal(violations[0].type, 'export-default', 'Then the violation type should be export-default')
        t.equal(violations[0].rule, 'export-placement', 'Then the rule field should be set correctly')
        t.match(violations[0].message, /export default/, 'Then the message should mention export default')
        t.end()
    })

    t.test('When the file has scattered export statements', t => {
        const code = `export const firstFunction = () => {}
            const secondFunction = () => {}
            export const thirdFunction = () => {}
            const fourthFunction = () => {}`
        const violations = checkExportPlacement(null, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.equal(violations[0].type, 'scattered-exports', 'Then the violation type should be scattered-exports')
        t.match(violations[0].message, /scattered export/, 'Then the message should mention scattered exports')
        t.end()
    })

    t.test('When the export statement is not at the bottom', t => {
        const code = `const myFunction = () => {}
            export { myFunction }
            const anotherFunction = () => {}`
        const violations = checkExportPlacement(null, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.equal(violations[0].type, 'export-not-at-bottom', 'Then the violation type should be export-not-at-bottom')
        t.match(violations[0].message, /bottom/, 'Then the message should mention bottom placement')
        t.end()
    })

    t.end()
})

t.test('Given a file with proper export placement', t => {
    t.test('When the file has a single export at the bottom', t => {
        const code = `const myFunction = () => {}
            const anotherFunction = () => {}

            export { myFunction, anotherFunction }`
        const violations = checkExportPlacement(null, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})
