import { tap } from '@graffio/test-helpers'
import { aperture } from '../../index.js'

const as = [1, 2, 3, 4, 5]
const expected1 = [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
]
const expected2 = [
    [1, 2, 3],
    [2, 3, 4],
    [3, 4, 5],
]

const s = tap.stringify
const tests = {
    [`Given array a = ${s(as)}`]: {
        'When I call aperture(2, as)': t => {
            t.sameR(`Then I should get ${s(expected1)}`, expected1, aperture(2, as))
        },
        'When I call aperture(3, as)': t => {
            t.sameR(`Then I should get ${s(expected2)}`, expected2, aperture(3, as))
        },
        'When I call aperture(7, as)': t => {
            t.sameR(`Then I should get []`, [], aperture(7, as))
        },
    },
}

tap.describeTests({ aperture: tests })
