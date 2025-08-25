import { tap } from '@graffio/test-helpers'
import * as F from '../../index.js'

tap.describeTests({
    'ramda-like range': {
        'Given I want a range of numbers': {
            'When I give the range 0-5': t => {
                t.sameR('Then I should get [0, 1, 2, 3, 4]', F.range(0, 5), [0, 1, 2, 3, 4])
            },
            'When I give the range 4-7': t => {
                t.sameR('Then I should get [4, 5, 6]', F.range(4, 7), [4, 5, 6])
            },
            'When I give the range 7-3': t => {
                t.sameR('Then I should get [] since the range is out of order', F.range(7, 3), [])
            },
            'When I give the range a-z': t => {
                t.throws(
                    () => F.range('a', 'z'),
                    /Both arguments to range must be numbers/,
                    'Then it should throw because the range is non-numeric',
                )
            },
        },
    },
})
