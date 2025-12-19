// ABOUTME: Tests for multi-column sorting
// ABOUTME: Verifies compareValues, sortBy, and applySort functions

import { test } from 'tap'
import { compareValues, sortBy, applySort } from '../../src/query/sort.js'

test('compareValues', async t => {
    t.test('given two strings', async t =>
        t.test('when comparing case-insensitively', async t => {
            t.test('then Apple equals apple', async t => t.equal(compareValues('Apple', 'apple'), 0))
            t.test('then apple comes before Banana', async t => t.equal(compareValues('apple', 'Banana'), -1))
            t.test('then zebra comes after Apple', async t => t.equal(compareValues('zebra', 'Apple'), 1))
        }),
    )

    t.test('given two numbers', async t =>
        t.test('when comparing', async t => {
            t.test('then 1 equals 1', async t => t.equal(compareValues(1, 1), 0))
            t.test('then 1 comes before 2', async t => t.equal(compareValues(1, 2), -1))
            t.test('then 2 comes after 1', async t => t.equal(compareValues(2, 1), 1))
        }),
    )

    t.test('given null values', async t => {
        t.test('when one value is null', async t => {
            t.test('then null comes after non-null', async t => t.equal(compareValues(null, 'a'), 1))
            t.test('then non-null comes before null', async t => t.equal(compareValues('a', null), -1))
        })

        t.test('when both values are null', async t =>
            t.test('then they are equal', async t => t.equal(compareValues(null, null), 0)),
        )
    })
})

test('sortBy', async t => {
    const items = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
    ]

    t.test('given a single column sort spec', async t => {
        t.test('when sorting ascending by name', async t => {
            const comparator = sortBy([{ id: 'name', desc: false }])
            const result = [...items].sort(comparator)

            t.test('then items are sorted alphabetically', async t => {
                t.equal(result[0].name, 'Alice')
                t.equal(result[1].name, 'Bob')
                t.equal(result[2].name, 'Charlie')
            })
        })

        t.test('when sorting descending by name', async t => {
            const comparator = sortBy([{ id: 'name', desc: true }])
            const result = [...items].sort(comparator)

            t.test('then items are sorted in reverse', async t => {
                t.equal(result[0].name, 'Charlie')
                t.equal(result[1].name, 'Bob')
                t.equal(result[2].name, 'Alice')
            })
        })
    })

    t.test('given a multi-column sort spec', async t =>
        t.test('when sorting by age then name', async t => {
            const comparator = sortBy([
                { id: 'age', desc: false },
                { id: 'name', desc: false },
            ])
            const result = [...items].sort(comparator)

            t.test('then items are sorted by primary then secondary column', async t => {
                t.equal(result[0].name, 'Alice')
                t.equal(result[1].name, 'Bob')
                t.equal(result[2].name, 'Charlie')
            })
        }),
    )

    t.test('given column definitions with accessorKey', async t => {
        const columns = [{ id: 'displayName', accessorKey: 'name' }]

        t.test('when sorting by column id', async t => {
            const comparator = sortBy([{ id: 'displayName', desc: false }], columns)
            const result = [...items].sort(comparator)

            t.test('then the accessorKey is used for comparison', async t => {
                t.equal(result[0].name, 'Alice')
                t.equal(result[1].name, 'Bob')
                t.equal(result[2].name, 'Charlie')
            })
        })
    })
})

test('applySort', async t => {
    const items = [
        { name: 'Charlie', amount: -50 },
        { name: 'Alice', amount: 100 },
        { name: 'Bob', amount: -25 },
    ]

    t.test('given items and a sort spec', async t =>
        t.test('when applying the sort', async t => {
            const result = applySort([{ id: 'amount', desc: false }], items)

            t.test('then a new sorted array is returned', async t => {
                t.not(result, items)
                t.equal(result[0].amount, -50)
                t.equal(result[1].amount, -25)
                t.equal(result[2].amount, 100)
            })
        }),
    )

    t.test('given an empty sort spec', async t =>
        t.test('when applying the sort', async t => {
            const result = applySort([], items)

            t.test('then the original items are returned unchanged', async t => t.equal(result, items))
        }),
    )

    t.test('given null sort spec', async t =>
        t.test('when applying the sort', async t => {
            const result = applySort(null, items)

            t.test('then the original items are returned unchanged', async t => t.equal(result, items))
        }),
    )
})
