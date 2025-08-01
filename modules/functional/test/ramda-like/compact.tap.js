import { tap } from '@qt/test-helpers'
import compact from '../../src/ramda-like/compact.js'

const a = [3, undefined, null, {}, 'a']
const expected = [3, {}, 'a']

tap.describeTests({
    Compact: {
        [`Given a = ${tap.stringify(a)}`]: {
            [`When I call compact(a)`]: t => {
                t.sameR(`Then I should get ${tap.stringify(expected)}`, compact(a), expected)
            },
        },
    },
})
