import tap from 'tap'
import dissocPath from '../../src/ramda-like/dissoc-path.js'

const l3 = { a3: 'a3' }
const l2 = { a2: 'a2', l3 }
const l1 = { a1: 'a1', l2 }

tap.test('DissocPath', t => {
    t.test(`Given o = ${JSON.stringify(l1)}`, t => {
        t.test(`When I dissocPath(['a1'], o)`, t => {
            const expected = { l2 }
            const result = dissocPath(['a1'], l1)
            t.same(result, expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.test(`When I dissocPath(['l2'], o)`, t => {
            const expected = { a1: 'a1' }
            const actual = dissocPath(['l2'], l1)
            t.same(actual, expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.test(`When I dissocPath(['l2', 'a2'], o)`, t => {
            const expected = { a1: 'a1', l2: { l3 } }
            const actual = dissocPath(['l2', 'a2'], l1)
            t.same(actual, expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.test(`When I dissocPath(['l2', 'l3'], o)`, t => {
            const expected = { a1: 'a1', l2: { a2: 'a2' } }
            const actual = dissocPath(['l2', 'l3'], l1)
            t.same(actual, expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.test(`When I dissocPath(['l2', 'l3', 'a3'], o)`, t => {
            const expected = { a1: 'a1', l2: { a2: 'a2', l3: {} } }
            const actual = dissocPath(['l2', 'l3', 'a3'], l1)
            t.same(actual, expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.test(`When I dissocPath(['a1', 'a2'], o)`, t => {
            const expected = l1
            const actual = dissocPath(['a1', 'a2'], l1)
            t.same(actual, expected, `Then I should get o back since ['a1', 'a2'] isn't a valid path`)
            t.end()
        })

        t.end()
    })

    t.end()
})
