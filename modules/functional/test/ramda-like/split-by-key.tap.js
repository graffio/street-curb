import tap from 'tap'
import { splitByKey } from '../../index.js'

const o = { a: 'a', b: 'b', c: 'c' }

const keys1 = ['a', 'b']
const keys2 = ['g']
const keys3 = ['a', 'b', 'c', 'g']

tap.test('splitByKey', t => {
    t.test(`Given o = ${JSON.stringify(o)}`, t => {
        t.test(`When I call splitByKey(${JSON.stringify(keys1)}, o)`, t => {
            t.same(splitByKey(keys1, o), [{ a: 'a', b: 'b' }, { c: 'c' }], `Then I should get [{ a, b }, { c }]`)
            t.end()
        })

        t.test(`When I call splitByKey(${JSON.stringify(keys2)}, o)`, t => {
            t.same(splitByKey(keys2, o), [{}, { a: 'a', b: 'b', c: 'c' }], `Then I should get [{}, {  a, b, c }]`)
            t.end()
        })

        t.test(`When I call splitByKey(${JSON.stringify(keys3)}, o)`, t => {
            t.same(splitByKey(keys3, o), [{ a: 'a', b: 'b', c: 'c' }, {}], `Then I should get [{  a, b, c }, {}]`)
            t.end()
        })

        t.end()
    })

    t.end()
})
