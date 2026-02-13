// ABOUTME: Tests for toggleItem utility
// ABOUTME: Verifies data-last toggle for arrays, LookupTables, path variant, and currying

import { test } from 'tap'
import { toggleItem, LookupTable } from '@graffio/functional'

// Simple Tagged type for testing
const Fruit = (id, name) => ({ '@@typeName': 'Fruit', id, name })
Fruit.is = v => v?.['@@typeName'] === 'Fruit'
Fruit.toString = () => 'Fruit'

test('toggleItem', t => {
    t.test('Given an array collection', t => {
        t.test('When toggling an absent item', t => {
            const result = toggleItem('c', ['a', 'b'])
            t.same(result, ['a', 'b', 'c'], 'Then the item is appended')
            t.end()
        })

        t.test('When toggling a present item', t => {
            const result = toggleItem('b', ['a', 'b', 'c'])
            t.same(result, ['a', 'c'], 'Then the item is removed')
            t.end()
        })

        t.test('When toggling into an empty array', t => {
            const result = toggleItem('x', [])
            t.same(result, ['x'], 'Then the array contains only the item')
            t.end()
        })

        t.test('When toggling the only item in an array', t => {
            const result = toggleItem('x', ['x'])
            t.same(result, [], 'Then the array is empty')
            t.end()
        })
        t.end()
    })

    t.test('Given a LookupTable collection', t => {
        t.test('When toggling an absent item', t => {
            const apple = Fruit('fruit-a', 'apple')
            const banana = Fruit('fruit-b', 'banana')
            const cherry = Fruit('fruit-c', 'cherry')
            const table = LookupTable([apple, banana], Fruit)
            const result = toggleItem(cherry, table)
            t.ok(LookupTable.is(result), 'Then the result is a LookupTable')
            t.equal(result.length, 3, 'Then the item is added')
            t.equal(result[2], cherry, 'Then the new item is at the end')
            t.end()
        })

        t.test('When toggling a present item', t => {
            const apple = Fruit('fruit-a', 'apple')
            const banana = Fruit('fruit-b', 'banana')
            const table = LookupTable([apple, banana], Fruit)
            const result = toggleItem(banana, table)
            t.ok(LookupTable.is(result), 'Then the result is a LookupTable')
            t.equal(result.length, 1, 'Then the item is removed')
            t.equal(result[0], apple, 'Then the remaining item is correct')
            t.end()
        })
        t.end()
    })

    t.test('Given three arguments (path variant)', t => {
        t.test('When the item is absent from the nested array', t => {
            const obj = { selectedAccounts: ['a', 'b'] }
            const result = toggleItem('selectedAccounts', 'c', obj)
            t.same(result, { selectedAccounts: ['a', 'b', 'c'] }, 'Then the item is appended at the path')
            t.end()
        })

        t.test('When the item is present in the nested array', t => {
            const obj = { selectedAccounts: ['a', 'b', 'c'] }
            const result = toggleItem('selectedAccounts', 'b', obj)
            t.same(result, { selectedAccounts: ['a', 'c'] }, 'Then the item is removed at the path')
            t.end()
        })

        t.test('When the path target is an empty array', t => {
            const obj = { selectedAccounts: [] }
            const result = toggleItem('selectedAccounts', 'id1', obj)
            t.same(result, { selectedAccounts: ['id1'] }, 'Then the item is added')
            t.end()
        })
        t.end()
    })

    t.test('Given curried usage', t => {
        t.test('When partially applied with one argument', t => {
            const toggleX = toggleItem('x')
            const result = toggleX(['a', 'b'])
            t.same(result, ['a', 'b', 'x'], 'Then the item is appended when called with the collection')
            t.end()
        })

        t.test('When used with evolve', t => {
            const obj = { tags: ['red', 'blue'] }
            const result = { ...obj, tags: toggleItem('green')(obj.tags) }
            t.same(result, { tags: ['red', 'blue', 'green'] }, 'Then evolve applies the toggle')
            t.end()
        })
        t.end()
    })
    t.end()
})
