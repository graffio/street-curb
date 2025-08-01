import { tap } from '@qt/test-helpers'
import { nonNilValues } from '../../index.js'

const o = { a: 'hello', b: undefined, c: null }
const expected = ['hello']

const s = tap.stringify
const tests = {
    [`Given array o = { a: 'hello', b: undefined, c: null, }`]: {
        'When I call nonNilValues(o)': t => {
            t.sameR(`Then I should get ${s(expected)}`, expected, nonNilValues(o))
        },
    },
}

tap.describeTests({ aperture: tests })
