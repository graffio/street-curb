// ABOUTME: Tests for wrapIndex utility
// ABOUTME: Verifies index clamping and wraparound with next/prev navigation

import { test } from 'tap'
import { wrapIndex } from '@graffio/functional'

test('wrapIndex', t => {
    t.test('Given an empty list (count 0)', t => {
        t.test('When called with index -1', t => {
            const result = wrapIndex(-1, 0)
            t.same(result, { index: -1, next: -1, prev: -1 }, 'Then all positions are -1')
            t.end()
        })

        t.test('When called with index 0', t => {
            const result = wrapIndex(0, 0)
            t.same(result, { index: -1, next: -1, prev: -1 }, 'Then all positions are -1')
            t.end()
        })
        t.end()
    })

    t.test('Given a single-item list (count 1)', t => {
        t.test('When called with index 0', t => {
            const result = wrapIndex(0, 1)
            t.same(result, { index: 0, next: 0, prev: 0 }, 'Then next and prev wrap to same item')
            t.end()
        })

        t.test('When called with index -1 (no selection)', t => {
            const result = wrapIndex(-1, 1)
            t.same(result, { index: -1, next: 0, prev: 0 }, 'Then next and prev go to the only item')
            t.end()
        })
        t.end()
    })

    t.test('Given a multi-item list (count 5)', t => {
        t.test('When called with index -1 (no selection)', t => {
            const result = wrapIndex(-1, 5)
            t.equal(result.index, -1, 'Then index stays at -1')
            t.equal(result.next, 0, 'Then next goes to first item')
            t.equal(result.prev, 4, 'Then prev goes to last item')
            t.end()
        })

        t.test('When called with index 0 (first item)', t => {
            const result = wrapIndex(0, 5)
            t.equal(result.index, 0, 'Then index is 0')
            t.equal(result.next, 1, 'Then next goes to second item')
            t.equal(result.prev, 4, 'Then prev wraps to last item')
            t.end()
        })

        t.test('When called with index 4 (last item)', t => {
            const result = wrapIndex(4, 5)
            t.equal(result.index, 4, 'Then index is 4')
            t.equal(result.next, 0, 'Then next wraps to first item')
            t.equal(result.prev, 3, 'Then prev goes to previous item')
            t.end()
        })

        t.test('When called with index 2 (middle)', t => {
            const result = wrapIndex(2, 5)
            t.equal(result.index, 2, 'Then index is 2')
            t.equal(result.next, 3, 'Then next goes forward')
            t.equal(result.prev, 1, 'Then prev goes backward')
            t.end()
        })

        t.test('When called with an index beyond range', t => {
            const result = wrapIndex(10, 5)
            t.equal(result.index, 4, 'Then index clamps to last valid position')
            t.end()
        })
        t.end()
    })
    t.end()
})
