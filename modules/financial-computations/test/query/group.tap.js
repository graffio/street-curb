// ABOUTME: Tests for grouping functions
// ABOUTME: Verifies groupBy and category hierarchy expansion

import { test } from 'tap'
import { groupBy, expandCategoryHierarchy, groupByCategoryHierarchy } from '../../src/query/group.js'

test('groupBy', async t => {
    const items = [
        { category: 'food', amount: -50 },
        { category: 'transport', amount: -25 },
        { category: 'food', amount: -100 },
    ]

    t.test('given a field name', async t =>
        t.test('when grouping by that field', async t => {
            const result = groupBy('category', items)

            t.test('then items are grouped by field value', async t => {
                t.equal(Object.keys(result).length, 2)
                t.equal(result.food.length, 2)
                t.equal(result.transport.length, 1)
            })
        }),
    )

    t.test('given a key function', async t =>
        t.test('when grouping by computed key', async t => {
            const result = groupBy(item => (item.amount < -50 ? 'large' : 'small'), items)

            t.test('then items are grouped by computed value', async t => {
                t.equal(result.large.length, 1)
                t.equal(result.small.length, 2)
            })
        }),
    )

    t.test('given items with null/undefined keys', async t => {
        const itemsWithNull = [{ category: null }, { category: 'food' }, { category: undefined }]

        t.test('when grouping', async t => {
            const result = groupBy('category', itemsWithNull)

            t.test('then null/undefined are grouped under "undefined"', async t => {
                t.equal(result.undefined.length, 2)
                t.equal(result.food.length, 1)
            })
        })
    })
})

test('expandCategoryHierarchy', async t => {
    t.test('given a nested category path', async t =>
        t.test('when expanding', async t => {
            const result = expandCategoryHierarchy('food:restaurant:lunch')

            t.test('then all ancestor paths are returned', async t =>
                t.same(result, ['food', 'food:restaurant', 'food:restaurant:lunch']),
            )
        }),
    )

    t.test('given a single-level category', async t =>
        t.test('when expanding', async t => {
            const result = expandCategoryHierarchy('food')

            t.test('then just that category is returned', async t => t.same(result, ['food']))
        }),
    )

    t.test('given an empty string', async t =>
        t.test('when expanding', async t => {
            const result = expandCategoryHierarchy('')

            t.test('then an empty array is returned', async t => t.same(result, []))
        }),
    )

    t.test('given null', async t =>
        t.test('when expanding', async t => {
            const result = expandCategoryHierarchy(null)

            t.test('then an empty array is returned', async t => t.same(result, []))
        }),
    )
})

test('groupByCategoryHierarchy', async t => {
    const transactions = [
        { categoryName: 'food:restaurant', amount: -50 },
        { categoryName: 'food:grocery', amount: -100 },
        { categoryName: 'transport', amount: -25 },
    ]

    t.test('given transactions with hierarchical categories', async t =>
        t.test('when grouping by hierarchy', async t => {
            const result = groupByCategoryHierarchy(transactions)

            t.test('then parent groups contain all children', async t => {
                t.equal(result.food.length, 2)
                t.equal(result['food:restaurant'].length, 1)
                t.equal(result['food:grocery'].length, 1)
                t.equal(result.transport.length, 1)
            })
        }),
    )

    t.test('given transactions without categories', async t => {
        const txns = [{ amount: -50 }, { categoryName: 'food', amount: -25 }]

        t.test('when grouping', async t => {
            const result = groupByCategoryHierarchy(txns)

            t.test('then uncategorized transactions go to Uncategorized group', async t => {
                t.equal(result.Uncategorized.length, 1)
                t.equal(result.food.length, 1)
            })
        })
    })
})
