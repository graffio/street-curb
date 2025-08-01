import { tap } from '@qt/test-helpers'
import { asyncMapObject } from '../../index.js'

const f = async x => Promise.resolve(2 * x)

tap.describeTests({
    'Map object': {
        'Given object o = { a: 1, b: 2 } and async f = x => Promise.resolve(2 * x)': {
            'When I await asyncMapObject(f, o)': async t => {
                const actual = await asyncMapObject(f, { a: 1, b: 2 })
                t.sameR('Then I should get { a: 2, b: 4 }', actual, { a: 2, b: 4 })
            },
        },
    },
})
