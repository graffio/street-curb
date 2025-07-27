import t from 'tap'

/*
 * Test visual calculations for SegmentedCurbEditor
 * Ensures Unknown space is properly included in visual rendering
 */

/*
 * Simulate the visual calculation logic from SegmentedCurbEditor
 * @sig calculateVisualPercentages :: ([Segment], Number, Number) -> [Number]
 */
const calculateVisualPercentages = (segments, unknownRemaining, blockfaceLength) => {
    const segmentPercentages = segments.map(seg => (seg.length / blockfaceLength) * 100)
    const unknownPercentage = unknownRemaining > 0 ? (unknownRemaining / blockfaceLength) * 100 : 0

    return {
        segments: segmentPercentages,
        unknown: unknownPercentage,
        total: segmentPercentages.reduce((sum, pct) => sum + pct, 0) + unknownPercentage,
    }
}

/*
 * Simulate tick point calculation including unknown space
 * @sig buildTickPoints :: ([Segment], Number) -> [Number]
 */
const buildTickPoints = (segments, unknownRemaining) => {
    const addCumulative = (acc, s) => [...acc, acc[acc.length - 1] + s.length]
    const segmentTicks = segments.reduce(addCumulative, [0])

    // Add final tick point including unknown space if it exists
    if (unknownRemaining > 0) {
        const lastPoint = segmentTicks[segmentTicks.length - 1]
        return [...segmentTicks, lastPoint + unknownRemaining]
    }

    return segmentTicks
}

t.test('Visual calculation validation for SegmentedCurbEditor', t => {
    t.test('Given state with segments and unknown space', t => {
        const segments = [
            { id: 's1', type: 'Parking', length: 60 },
            { id: 's2', type: 'Loading', length: 40 },
        ]
        const unknownRemaining = 140
        const blockfaceLength = 240

        t.test('When calculating visual percentages', t => {
            const result = calculateVisualPercentages(segments, unknownRemaining, blockfaceLength)

            t.equal(result.segments[0], 25, 'Then first segment is 25% of blockface')
            t.ok(
                Math.abs(result.segments[1] - 16.666666666666668) < 0.01,
                'Then second segment is ~16.67% of blockface',
            )
            t.equal(Math.round(result.unknown * 100) / 100, 58.33, 'Then unknown space is ~58.33% of blockface')
            t.equal(result.total, 100, 'Then total equals 100%')
            t.end()
        })

        t.test('When calculating tick points', t => {
            const ticks = buildTickPoints(segments, unknownRemaining)

            t.equal(ticks.length, 4, 'Then has 4 tick points (0, 60, 100, 240)')
            t.equal(ticks[0], 0, 'Then first tick at 0')
            t.equal(ticks[1], 60, 'Then second tick at 60 (first segment end)')
            t.equal(ticks[2], 100, 'Then third tick at 100 (second segment end)')
            t.equal(ticks[3], 240, 'Then final tick at 240 (blockface end)')
            t.end()
        })
        t.end()
    })

    t.test('Given complete collection with no unknown space', t => {
        const segments = [
            { id: 's1', type: 'Parking', length: 120 },
            { id: 's2', type: 'Loading', length: 120 },
        ]
        const unknownRemaining = 0
        const blockfaceLength = 240

        t.test('When calculating visual percentages', t => {
            const result = calculateVisualPercentages(segments, unknownRemaining, blockfaceLength)

            t.equal(result.segments[0], 50, 'Then first segment is 50% of blockface')
            t.equal(result.segments[1], 50, 'Then second segment is 50% of blockface')
            t.equal(result.unknown, 0, 'Then no unknown space percentage')
            t.equal(result.total, 100, 'Then total equals 100%')
            t.end()
        })

        t.test('When calculating tick points', t => {
            const ticks = buildTickPoints(segments, unknownRemaining)

            t.equal(ticks.length, 3, 'Then has 3 tick points (0, 120, 240)')
            t.equal(ticks[0], 0, 'Then first tick at 0')
            t.equal(ticks[1], 120, 'Then second tick at 120')
            t.equal(ticks[2], 240, 'Then final tick at 240')
            t.end()
        })
        t.end()
    })

    t.test('Given initial state with all unknown space', t => {
        const segments = []
        const unknownRemaining = 240
        const blockfaceLength = 240

        t.test('When calculating visual percentages', t => {
            const result = calculateVisualPercentages(segments, unknownRemaining, blockfaceLength)

            t.equal(result.segments.length, 0, 'Then no segment percentages')
            t.equal(result.unknown, 100, 'Then unknown space is 100% of blockface')
            t.equal(result.total, 100, 'Then total equals 100%')
            t.end()
        })

        t.test('When calculating tick points', t => {
            const ticks = buildTickPoints(segments, unknownRemaining)

            t.equal(ticks.length, 2, 'Then has 2 tick points (0, 240)')
            t.equal(ticks[0], 0, 'Then first tick at 0')
            t.equal(ticks[1], 240, 'Then final tick at 240')
            t.end()
        })
        t.end()
    })

    t.end()
})

export { calculateVisualPercentages, buildTickPoints }
