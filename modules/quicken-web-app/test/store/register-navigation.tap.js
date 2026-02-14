// ABOUTME: Tests for RegisterNavigation pure transform functions
// ABOUTME: Verifies search match navigation respects display sort order

import tap from 'tap'
import { RegisterNavigation } from '../../src/store/register-navigation.js'

const row = id => ({ transaction: { id } })

tap.test('toAdjacentMatchRowIdx', t => {
    t.test('Given data sorted by amount (non-date order) and matchIds in date order', t => {
        // Transactions by date: A(Jan,$100), B(Feb,$300), C(Mar,$200)
        // Display order (sorted by amount asc): A($100), C($200), B($300)
        const data = [row('A'), row('C'), row('B')]

        // matchIds from selector — always in date order: A, B, C
        const matchIds = ['A', 'B', 'C']

        t.test('When navigating forward from match A (first in display order)', t => {
            const currentIdx = matchIds.indexOf('A') // 0
            const rowIdx = RegisterNavigation.toAdjacentMatchRowIdx(data, matchIds, currentIdx, 1)
            t.equal(rowIdx, 1, 'Then it jumps to C (next match in display order), not B (next in date order)')
            t.end()
        })

        t.test('When navigating backward from match B (last in display order)', t => {
            const currentIdx = matchIds.indexOf('B') // 1
            const rowIdx = RegisterNavigation.toAdjacentMatchRowIdx(data, matchIds, currentIdx, -1)
            t.equal(rowIdx, 1, 'Then it jumps to C (previous match in display order), not A (previous in date order)')
            t.end()
        })

        t.test('When navigating forward from match B (last in display order)', t => {
            const currentIdx = matchIds.indexOf('B') // 1
            const rowIdx = RegisterNavigation.toAdjacentMatchRowIdx(data, matchIds, currentIdx, 1)
            t.equal(rowIdx, 0, 'Then it wraps to A (first match in display order)')
            t.end()
        })

        t.end()
    })

    t.test('Given data in default date order (no column sort)', t => {
        const data = [row('A'), row('B'), row('C')]
        const matchIds = ['A', 'B', 'C']

        t.test('When navigating forward from match A', t => {
            const currentIdx = 0
            const rowIdx = RegisterNavigation.toAdjacentMatchRowIdx(data, matchIds, currentIdx, 1)
            t.equal(rowIdx, 1, 'Then it jumps to B (next match — date and display order agree)')
            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('toNearestMatchRowIdx', t => {
    t.test('Given data with matches at various positions', t => {
        const data = [row('A'), row('X'), row('B'), row('Y'), row('C')]
        const matchIds = ['A', 'B', 'C']

        t.test('When searching forward from a non-match row', t => {
            const fromRowIdx = 1 // row X
            const rowIdx = RegisterNavigation.toNearestMatchRowIdx(data, matchIds, fromRowIdx, 1)
            t.equal(rowIdx, 2, 'Then it finds B (nearest match forward in display order)')
            t.end()
        })

        t.test('When searching backward from a non-match row', t => {
            const fromRowIdx = 3 // row Y
            const rowIdx = RegisterNavigation.toNearestMatchRowIdx(data, matchIds, fromRowIdx, -1)
            t.equal(rowIdx, 2, 'Then it finds B (nearest match backward in display order)')
            t.end()
        })

        t.end()
    })

    t.end()
})
