import tap from 'tap'
import diffObjects from '../../src/ramda-like/diff-objects.js'

const a = { a: 1, b: { c: 5, d: [1, 2, 3], e: { f: 6 } } }
const b = { a: 1, b: { d: [1, 2, 3], e: { f: 8, f1: 8 } }, x: { g: 5 } }
const aClone = JSON.parse(JSON.stringify(a))

const expected1 = { deleted: [], changed: [], added: [] }
const expected2 = { deleted: ['b.c'], changed: ['b.e.f'], added: ['b.e.f1', 'x'] }

const s = JSON.stringify

tap.test('diffObjects', t => {
    t.test(`Given a: ${s(a)} and b: ${s(b)}`, t => {
        t.test('When I call diffObjects(a, a) -- both the same object', t => {
            const result = diffObjects(a, a)
            t.same(result, expected1, `Then I should get ${s(expected1)}`)
            t.end()
        })

        t.test('When I call diffObjects(a, clone(a)) -- cloned a', t => {
            const result = diffObjects(a, aClone)
            t.same(result, expected1, `Then I should get ${s(expected1)}`)
            t.end()
        })

        t.test('When I call diffObjects(a, b)', t => {
            const result = diffObjects(a, b)
            t.same(result, expected2, `Then I should get ${s(expected2)}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
