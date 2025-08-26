import t from 'tap'
import { NestedArray, DoubleNestedArray } from './generated/index.js'

t.test('Empty Array Validation Fix', async t => {
    await t.test('Given NestedArray with [Number] type', async t => {
        await t.test('When creating with empty array', async t => {
            const emptyArray = NestedArray([])
            t.ok(emptyArray, 'Then empty array should be accepted')
            t.equal(emptyArray.toString(), 'NestedArray([])', 'Then toString should work correctly')
        })

        await t.test('When creating with non-empty valid array', async t => {
            const validArray = NestedArray([1, 2, 3])
            t.ok(validArray, 'Then valid non-empty array should be accepted')
            t.equal(validArray.toString(), 'NestedArray([1, 2, 3])', 'Then toString should work correctly')
        })

        await t.test('When creating with non-empty invalid array', async t => {
            t.throws(
                () => NestedArray(['invalid']),
                /expected p to have type \[Number\]/,
                'Then invalid array should be rejected',
            )
        })
    })

    await t.test('Given DoubleNestedArray with [[Number]] type', async t => {
        await t.test('When creating with empty outer array', async t => {
            const emptyOuter = DoubleNestedArray([])
            t.ok(emptyOuter, 'Then empty outer array should be accepted')
            t.equal(emptyOuter.toString(), 'DoubleNestedArray([])', 'Then toString should work correctly')
        })

        await t.test('When creating with empty inner arrays', async t => {
            const emptyInner = DoubleNestedArray([[], []])
            t.ok(emptyInner, 'Then empty inner arrays should be accepted')
            t.equal(emptyInner.toString(), 'DoubleNestedArray([[], []])', 'Then toString should work correctly')
        })

        await t.test('When creating with mixed empty and non-empty arrays', async t => {
            const mixed = DoubleNestedArray([[], [1, 2], []])
            t.ok(mixed, 'Then mixed empty/non-empty arrays should be accepted')
            t.equal(mixed.toString(), 'DoubleNestedArray([[], [1, 2], []])', 'Then toString should work correctly')
        })

        await t.test('When creating with non-empty valid arrays', async t => {
            const validNested = DoubleNestedArray([
                [1, 2],
                [3, 4],
            ])
            t.ok(validNested, 'Then valid nested arrays should be accepted')
            t.equal(
                validNested.toString(),
                'DoubleNestedArray([[1, 2], [3, 4]])',
                'Then toString should work correctly',
            )
        })
    })
})
