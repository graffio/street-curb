import t from 'tap'
import { checkExportPlacement } from '../../tools/lib/rules/export-placement.js'

t.test('Export placement validation should enforce A001 export standards', async t => {
    await t.test('Files using export default should be flagged as violations', async t => {
        const code = `const myFunction = () => {}
            export default myFunction`
        const violations = checkExportPlacement(null, code, 'test.js')

        t.equal(violations.length, 1, 'One violation should be detected')
        t.equal(violations[0].type, 'export-default', 'Violation type should be export-default')
        t.equal(violations[0].rule, 'export-placement', 'Rule field should be set correctly')
        t.match(violations[0].message, /export default/, 'Message should mention export default')
    })

    await t.test('Files with scattered export statements should be flagged', async t => {
        const code = `export const firstFunction = () => {}
            const secondFunction = () => {}
            export const thirdFunction = () => {}
            const fourthFunction = () => {}`
        const violations = checkExportPlacement(null, code, 'test.js')

        t.equal(violations.length, 1, 'One violation should be detected')
        t.equal(violations[0].type, 'scattered-exports', 'Violation type should be scattered-exports')
        t.match(violations[0].message, /scattered export/, 'Message should mention scattered exports')
    })

    await t.test('Files with proper single export at bottom should pass validation', async t => {
        const code = `const myFunction = () => {}
            const anotherFunction = () => {}

            export { myFunction, anotherFunction }`
        const violations = checkExportPlacement(null, code, 'test.js')

        t.equal(violations.length, 0, 'No violations should be detected')
    })

    await t.test('Files with export statements not at bottom should be flagged', async t => {
        const code = `const myFunction = () => {}
            export { myFunction }
            const anotherFunction = () => {}`
        const violations = checkExportPlacement(null, code, 'test.js')

        t.equal(violations.length, 1, 'One violation should be detected')
        t.equal(violations[0].type, 'export-not-at-bottom', 'Violation type should be export-not-at-bottom')
        t.match(violations[0].message, /bottom/, 'Message should mention bottom placement')
    })
})
