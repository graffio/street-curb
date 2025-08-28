import tap from 'tap'
import { nonNilValues } from '../../index.js'

const o = { a: 'hello', b: undefined, c: null }
const expected = ['hello']

const s = JSON.stringify

tap.test('nonNilValues', t => {
    t.test(`Given array o = { a: 'hello', b: undefined, c: null, }`, t => {
        t.test('When I call nonNilValues(o)', t => {
            t.same(nonNilValues(o), expected, `Then I should get ${s(expected)}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
