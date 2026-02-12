// ABOUTME: Tests for truncateWithCount utility
// ABOUTME: Verifies array truncation with '+N more' suffix at threshold

import { test } from 'tap'
import { truncateWithCount } from '@graffio/functional'

test('truncateWithCount', t => {
    t.test('Given an empty array', t => {
        t.test('When truncated at any max', t => {
            const result = truncateWithCount([], 3)
            t.same(result, [], 'Then it returns an empty array')
            t.end()
        })
        t.end()
    })

    t.test('Given an array shorter than the max', t => {
        const items = ['a', 'b']

        t.test('When truncated at max 3', t => {
            const result = truncateWithCount(items, 3)
            t.same(result, ['a', 'b'], 'Then it returns the original items')
            t.end()
        })
        t.end()
    })

    t.test('Given an array equal to the max', t => {
        const items = ['a', 'b', 'c']

        t.test('When truncated at max 3', t => {
            const result = truncateWithCount(items, 3)
            t.same(result, ['a', 'b', 'c'], 'Then it returns the original items')
            t.end()
        })
        t.end()
    })

    t.test('Given an array longer than the max', t => {
        const items = ['a', 'b', 'c', 'd', 'e']

        t.test('When truncated at max 3', t => {
            const result = truncateWithCount(items, 3)
            t.same(result, ['a', 'b', '+3 more'], 'Then it shows max-1 items and a count suffix')
            t.end()
        })

        t.test('When truncated at max 1', t => {
            const result = truncateWithCount(items, 1)
            t.same(result, ['+5 more'], 'Then it shows only the count suffix')
            t.end()
        })
        t.end()
    })

    t.test('Given a single-item overflow', t => {
        const items = ['a', 'b', 'c', 'd']

        t.test('When truncated at max 3', t => {
            const result = truncateWithCount(items, 3)
            t.same(result, ['a', 'b', '+2 more'], 'Then the count reflects exact overflow')
            t.end()
        })
        t.end()
    })
    t.end()
})
