import { tap } from '@graffio/test-helpers'
import { mapObject } from '../../index.js'

tap.describeTests({
    'Map object': {
        'Given object o = { a: 1, b: 2 } and function times2': {
            'When I mapObject(times2, o)': t => {
                t.sameR(
                    'Then I should get { a: 2, b: 4 }',
                    mapObject(x => 2 * x, { a: 1, b: 2 }),
                    { a: 2, b: 4 },
                )
            },
        },
    },
})
