import { tap } from '@graffio/test-helpers'
import without from '../../src/ramda-like/without.js'

tap.describeTests({
    without: {
        'Given a = [1, 2, 3, 4]': {
            'When I remove [1,3]': t => {
                t.sameR('Then I should get [2,4]', without([1, 3], [1, 2, 3, 4]), [2, 4])
            },
        },
        'Given a = [1, [2, 3], 4]': {
            'When I remove [[2,3]]': t => {
                t.sameR(
                    'Then I should be unchanged because the two [2,3] subarray are NOT identical (by JS standards)',
                    without([[2, 3]], [1, [2, 3], 4]),
                    [1, [2, 3], 4],
                )
            },
        },
    },
})
