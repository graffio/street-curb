import tap from 'tap'
import { flatMap } from '../../src/ramda-like/list.js'

tap.test('flatMap', t => {
    t.test('maps and flattens one level', t => {
        const result = flatMap(x => [x, x * 2], [1, 2, 3])
        t.same(result, [1, 2, 2, 4, 3, 6])
        t.end()
    })

    t.test('returns empty array for empty input', t => {
        const result = flatMap(x => [x], [])
        t.same(result, [])
        t.end()
    })

    t.test('handles functions that return empty arrays', t => {
        const result = flatMap(() => [], [1, 2, 3])
        t.same(result, [])
        t.end()
    })

    t.test('handles functions that return single-element arrays', t => {
        const result = flatMap(x => [x + 1], [1, 2, 3])
        t.same(result, [2, 3, 4])
        t.end()
    })

    t.end()
})
