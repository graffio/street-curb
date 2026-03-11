// ABOUTME: Tests for Kahan compensated summation
// ABOUTME: Verifies sumCompensated eliminates floating-point accumulation drift

import t from 'tap'
import { sumCompensated } from '../src/sum-compensated.js'

t.test('sumCompensated', t => {
    t.test('Given an empty array', t => {
        t.test('When summed', t => {
            t.equal(sumCompensated([]), 0, 'Then returns 0')
            t.end()
        })
        t.end()
    })

    t.test('Given a single element', t => {
        t.test('When summed', t => {
            t.equal(sumCompensated([42.5]), 42.5, 'Then returns the element')
            t.end()
        })
        t.end()
    })

    t.test('Given values that drift with naive addition', t => {
        t.test('When summing [0.1, 0.2, 0.3]', t => {
            const result = sumCompensated([0.1, 0.2, 0.3])
            t.equal(result, 0.6, 'Then returns exactly 0.6')
            t.end()
        })

        t.test('When summing 1000 values of 0.01', t => {
            const values = Array.from({ length: 1000 }, () => 0.01)
            const result = sumCompensated(values)
            t.equal(result, 10.0, 'Then returns exactly 10.0')
            t.end()
        })
        t.end()
    })

    t.test('Given negative values', t => {
        t.test('When summing a mix of positive and negative', t => {
            const result = sumCompensated([1.0, -0.1, -0.2, -0.3])
            t.equal(result, 0.4, 'Then returns the correct sum')
            t.end()
        })
        t.end()
    })

    t.end()
})
