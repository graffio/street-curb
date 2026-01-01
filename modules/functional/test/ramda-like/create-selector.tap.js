// ABOUTME: Tests for createSelector auto-currying utility
// ABOUTME: Verifies both curried and uncurried selector patterns work correctly

import tap from 'tap'
import createSelector from '../../src/ramda-like/create-selector.js'

tap.test('createSelector', t => {
    t.test('Given a selector (s, id) => s.items[id]', t => {
        const selectItem = createSelector((s, id) => s.items[id])
        const data = { items: { a: 'apple', b: 'banana' } }

        t.test('When called with all arguments (s, id)', t => {
            const result = selectItem(data, 'a')
            t.equal(result, 'apple', 'Then it returns the value directly')
            t.end()
        })

        t.test('When called with partial arguments (id) then (s)', t => {
            const result = selectItem('b')(data)
            t.equal(result, 'banana', 'Then it returns the same value as uncurried')
            t.end()
        })

        t.end()
    })

    t.test('Given a selector with multiple extra args (s, a, b) => s.sum + a + b', t => {
        const selectSum = createSelector((s, a, b) => s.sum + a + b)
        const data = { sum: 10 }

        t.test('When called uncurried', t => {
            const result = selectSum(data, 2, 3)
            t.equal(result, 15, 'Then it returns 10 + 2 + 3 = 15')
            t.end()
        })

        t.test('When called curried', t => {
            const result = selectSum(2, 3)(data)
            t.equal(result, 15, 'Then it returns the same result')
            t.end()
        })

        t.end()
    })

    t.test('Given a selector with only state (s) => s.count', t => {
        const selectCount = createSelector(s => s.count)
        const data = { count: 42 }

        t.test('When called with state', t => {
            const result = selectCount(data)
            t.equal(result, 42, 'Then it returns the count')
            t.end()
        })

        t.end()
    })

    t.end()
})
