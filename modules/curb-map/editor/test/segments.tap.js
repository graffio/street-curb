import t from 'tap'
import { performSegmentSplit, canSplitSegment, createSegmentWithLength } from '../src/utils/segments.js'

t.test('Segment splitting operations', async t => {
    await t.test('Given a segment with sufficient length', async t => {
        await t.test('When splitting the current segment', async t => {
            const segments = [{ use: 'Parking', length: 30 }]
            const result = performSegmentSplit(segments, 0, 10)

            t.ok(result.success, 'Then the split operation succeeds')
            t.equal(result.segments.length, 2, 'Then two segments exist')
            t.equal(result.segments[0].length, 10, 'Then the first segment has the desired length')
            t.equal(result.segments[1].length, 20, 'Then the second segment has the remaining length')
            t.equal(result.segments[0].use, 'Parking', 'Then the first segment has the correct use')
            t.equal(result.segments[1].use, 'Parking', 'Then the second segment preserves the original use')
        })

        await t.test('When splitting the previous segment', async t => {
            const segments = [
                { use: 'Loading', length: 25 },
                { use: 'NoParking', length: 5 },
            ]
            const result = performSegmentSplit(segments, 1, 10)

            t.ok(result.success, 'Then the split operation succeeds')
            t.equal(result.segments.length, 3, 'Then three segments exist')
            t.equal(result.segments[0].length, 15, 'Then the first segment is reduced by the desired length')
            t.equal(result.segments[1].length, 10, 'Then the new segment has the desired length')
            t.equal(result.segments[2].length, 5, 'Then the target segment is unchanged')
            t.equal(result.segments[1].use, 'Parking', 'Then the new segment has the default use')
        })
    })

    await t.test('Given segments with insufficient space', async t => {
        await t.test('When trying to split a segment that is too small', async t => {
            const segments = [{ use: 'Parking', length: 10 }]
            const result = performSegmentSplit(segments, 0, 10)

            t.notOk(result.success, 'Then the split operation fails')
            t.equal(
                result.error,
                'Insufficient space to create new segment',
                'Then the appropriate error message is provided',
            )
        })

        await t.test('When the previous segment is also too small', async t => {
            const segments = [
                { use: 'Loading', length: 10 },
                { use: 'NoParking', length: 5 },
            ]
            const result = performSegmentSplit(segments, 1, 10)

            t.notOk(result.success, 'Then the split operation fails')
            t.equal(
                result.error,
                'Insufficient space to create new segment',
                'Then the appropriate error message is provided',
            )
        })
    })

    await t.test('Given invalid inputs', async t => {
        await t.test('When providing an invalid segment index', async t => {
            const segments = [{ use: 'Parking', length: 30 }]
            const result = performSegmentSplit(segments, 5, 10)

            t.notOk(result.success, 'Then the split operation fails')
            t.equal(result.error, 'Invalid segment index', 'Then the appropriate error message is provided')
        })

        await t.test('When providing a negative index', async t => {
            const segments = [{ use: 'Parking', length: 30 }]
            const result = performSegmentSplit(segments, -1, 10)

            t.notOk(result.success, 'Then the split operation fails')
            t.equal(result.error, 'Invalid segment index', 'Then the appropriate error message is provided')
        })
    })
})

t.test('Segment split validation', async t => {
    await t.test('Given a segment with adequate length', async t => {
        await t.test('When checking if the current segment can be split', async t => {
            const segments = [{ use: 'Parking', length: 30 }]
            const canSplit = canSplitSegment(segments, 0, 10)

            t.ok(canSplit, 'Then the segment can be split')
        })
    })

    await t.test('Given a segment with minimal required length', async t => {
        await t.test('When checking if the segment can be split', async t => {
            const segments = [{ use: 'Parking', length: 11 }]
            const canSplit = canSplitSegment(segments, 0, 10)

            t.ok(canSplit, 'Then the segment can just barely be split')
        })
    })

    await t.test('Given a segment that is too small', async t => {
        await t.test('When checking if the segment can be split', async t => {
            const segments = [{ use: 'Parking', length: 10 }]
            const canSplit = canSplitSegment(segments, 0, 10)

            t.notOk(canSplit, 'Then the segment cannot be split')
        })
    })
})

t.test('Segment creation utilities', async t => {
    await t.test('Given a desired length and type', async t => {
        await t.test('When creating a new segment', async t => {
            const segment = createSegmentWithLength(15, 'Loading')

            t.equal(segment.use, 'Loading', 'Then the segment has the specified use')
            t.equal(segment.length, 15, 'Then the segment has the specified length')
        })
    })

    await t.test('Given only a length (default type)', async t => {
        await t.test('When creating a new segment', async t => {
            const segment = createSegmentWithLength(20)

            t.equal(segment.use, 'Parking', 'Then the segment defaults to Parking use')
            t.equal(segment.length, 20, 'Then the segment has the specified length')
        })
    })
})
