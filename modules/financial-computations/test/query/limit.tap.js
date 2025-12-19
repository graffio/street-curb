// ABOUTME: Tests for pagination and limiting operations
// ABOUTME: Verifies take, skip, and paginate functions

import { test } from 'tap'
import { take, skip, paginate } from '../../src/query/limit.js'

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

test('take', async t => {
    t.test('given a count less than array length', async t =>
        t.test('when taking items', async t => {
            const result = take(3, items)

            t.test('then the first n items are returned', async t => t.same(result, [1, 2, 3]))
        }),
    )

    t.test('given a count greater than array length', async t =>
        t.test('when taking items', async t => {
            const result = take(20, items)

            t.test('then all items are returned', async t => t.same(result, items))
        }),
    )

    t.test('given zero', async t =>
        t.test('when taking items', async t => {
            const result = take(0, items)

            t.test('then an empty array is returned', async t => t.same(result, []))
        }),
    )
})

test('skip', async t => {
    t.test('given a count less than array length', async t =>
        t.test('when skipping items', async t => {
            const result = skip(3, items)

            t.test('then items after the first n are returned', async t => t.same(result, [4, 5, 6, 7, 8, 9, 10]))
        }),
    )

    t.test('given a count greater than array length', async t =>
        t.test('when skipping items', async t => {
            const result = skip(20, items)

            t.test('then an empty array is returned', async t => t.same(result, []))
        }),
    )

    t.test('given zero', async t =>
        t.test('when skipping items', async t => {
            const result = skip(0, items)

            t.test('then all items are returned', async t => t.same(result, items))
        }),
    )
})

test('paginate', async t => {
    t.test('given page 0 with page size 3', async t =>
        t.test('when paginating', async t => {
            const result = paginate(0, 3, items)

            t.test('then the first page is returned', async t => t.same(result, [1, 2, 3]))
        }),
    )

    t.test('given page 1 with page size 3', async t =>
        t.test('when paginating', async t => {
            const result = paginate(1, 3, items)

            t.test('then the second page is returned', async t => t.same(result, [4, 5, 6]))
        }),
    )

    t.test('given the last partial page', async t =>
        t.test('when paginating', async t => {
            const result = paginate(3, 3, items)

            t.test('then the remaining items are returned', async t => t.same(result, [10]))
        }),
    )

    t.test('given a page beyond the data', async t =>
        t.test('when paginating', async t => {
            const result = paginate(10, 3, items)

            t.test('then an empty array is returned', async t => t.same(result, []))
        }),
    )
})
