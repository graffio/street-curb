import { tap } from '@qt/test-helpers'
import dissocPath from '../../src/ramda-like/dissoc-path.js'

const l3 = { a3: 'a3' }
const l2 = { a2: 'a2', l3 }
const l1 = { a1: 'a1', l2 }

tap.describeTests({
    DissocPath: {
        [`Given o = ${tap.stringify(l1)}`]: {
            [`When I dissocPath(['a1'], o)`]: t => {
                const expected = { l2 }
                t.sameR(`Then I should get ${tap.stringify(expected)}`, dissocPath(['a1'], l1), expected)
            },
            [`When I dissocPath(['l2'], o)`]: t => {
                const expected = { a1: 'a1' }
                const actual = dissocPath(['l2'], l1)
                t.sameR(`Then I should get ${tap.stringify(expected)}`, actual, expected)
            },
            [`When I dissocPath(['l2', 'a2'], o)`]: t => {
                const expected = { a1: 'a1', l2: { l3 } }
                const actual = dissocPath(['l2', 'a2'], l1)
                t.sameR(`Then I should get ${tap.stringify(expected)}`, actual, expected)
            },
            [`When I dissocPath(['l2', 'l3'], o)`]: t => {
                const expected = { a1: 'a1', l2: { a2: 'a2' } }
                const actual = dissocPath(['l2', 'l3'], l1)
                t.sameR(`Then I should get ${tap.stringify(expected)}`, actual, expected)
            },
            [`When I dissocPath(['l2', 'l3', 'a3'], o)`]: t => {
                const expected = { a1: 'a1', l2: { a2: 'a2', l3: {} } }
                const actual = dissocPath(['l2', 'l3', 'a3'], l1)
                t.sameR(`Then I should get ${tap.stringify(expected)}`, actual, expected)
            },
            [`When I dissocPath(['a1', 'a2'], o)`]: t => {
                const expected = l1
                const actual = dissocPath(['a1', 'a2'], l1)
                t.sameR(`Then I should get o back since ['a1', 'a2'] isn't a valid path`, actual, expected)
            },
        },
    },
})
