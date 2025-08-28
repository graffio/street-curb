import tap from 'tap'
import diffLookupTables from '../../src/ramda-like/diff-lookup-tables.js'

const o1 = { a: 1 }
const o2 = { a: 2 }
const o3 = { a: 3 }
const o33 = { a: 33 }
const o4 = { a: 4 }

const a = { 12: o1, 14: o2, 16: o3 }

const b = { 13: o2, 14: o2, 15: o4, 16: o33 }

/*
    12:  o1      -> nothing   removed
    13:  nothing -> o2        added
    14:  o2      -> o2        <identical>
    15:  nothing -> o4        added
    16:  o3      -> o33       changed
 */

const expected = { removed: [12], changed: [16], added: [13, 15] }

const s = JSON.stringify

tap.test('diffLookupTables', t => {
    t.test(`Given before: ${s(a)} and after: ${s(b)}`, t => {
        t.test('When I call diffLookupTable(before, after)', t => {
            const result = diffLookupTables(a, b)
            t.same(result, expected, `Then I should get ${s(expected)}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
