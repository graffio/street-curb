import { tap } from '@qt/test-helpers'
import { splitByKey } from '../../index.js'

const o = { a: 'a', b: 'b', c: 'c' }

const keys1 = ['a', 'b']
const keys2 = ['g']
const keys3 = ['a', 'b', 'c', 'g']

const tests = {
    [`Given o = ${tap.stringify(o)}`]: {
        [`When I call splitByKey(${tap.stringify(keys1)}, o)`]: t => {
            t.sameR(`Then I should get [{ a, b }, { c }]`, splitByKey(keys1, o), [{ a: 'a', b: 'b' }, { c: 'c' }])
        },
        [`When I call splitByKey(${tap.stringify(keys2)}, o)`]: t => {
            t.sameR(`Then I should get [{}, {  a, b, c }]`, splitByKey(keys2, o), [{}, { a: 'a', b: 'b', c: 'c' }])
        },
        [`When I call splitByKey(${tap.stringify(keys3)}, o)`]: t => {
            t.sameR(`Then I should get [{  a, b, c }, {}]`, splitByKey(keys3, o), [{ a: 'a', b: 'b', c: 'c' }, {}])
        },
    },
}

tap.describeTests({ splitByKey: tests })
