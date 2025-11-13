import t from 'tap'
import { calculateCumulativePositions, calculateVisualPercentages } from '../src/utils/geometry.js'

/*
 * TDD tests for pure mathematical geometry functions
 * These tests should FAIL initially (RED phase), then pass after implementation (GREEN phase)
 */

t.test('Extract buildTickPoints from SegmentedCurbEditor as calculateCumulativePositions', t => {
    t.test('Given segments of 60ft and 40ft with 140ft unknown remaining', t => {
        t.test('When calculating cumulative positions', t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 60 },
                { id: 's2', type: 'Loading', length: 40 },
            ]
            const unknownRemaining = 140

            const positions = calculateCumulativePositions(segments, unknownRemaining)

            // Should match exact behavior of buildTickPoints from SegmentedCurbEditor.jsx lines 46-57
            t.equal(positions.length, 4, 'Then it returns 4 position markers')
            t.equal(positions[0], 0, 'Then the first position is at the start (0ft)')
            t.equal(positions[1], 60, 'Then the first segment ends at 60ft')
            t.equal(positions[2], 100, 'Then the second segment ends at 100ft')
            t.equal(positions[3], 240, 'Then the final marker includes the unknown space (240ft total)')
            t.end()
        })
        t.end()
    })

    t.test('Given segments of 120ft and 120ft with no unknown space', t => {
        t.test('When calculating cumulative positions', t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 120 },
                { id: 's2', type: 'Loading', length: 120 },
            ]
            const unknownRemaining = 0

            const positions = calculateCumulativePositions(segments, unknownRemaining)

            // When no unknown space, should not add extra tick point
            t.equal(positions.length, 3, 'Then it returns 3 position markers (no unknown space marker)')
            t.equal(positions[0], 0, 'Then the first position is at the start (0ft)')
            t.equal(positions[1], 120, 'Then the first segment ends at 120ft')
            t.equal(positions[2], 240, 'Then the second segment ends at 240ft')
            t.end()
        })
        t.end()
    })

    t.test('Given no segments with 240ft of unknown space', t => {
        t.test('When calculating cumulative positions', t => {
            const segments = []
            const unknownRemaining = 240

            const positions = calculateCumulativePositions(segments, unknownRemaining)

            // Should handle empty segments case - starts at [0] then adds unknown
            t.equal(positions.length, 2, 'Then it returns 2 position markers (start and end only)')
            t.equal(positions[0], 0, 'Then the first position is at the start (0ft)')
            t.equal(positions[1], 240, 'Then the final position includes all unknown space (240ft)')
            t.end()
        })
        t.end()
    })

    t.end()
})

t.test('calculateVisualPercentages for segment rendering', t => {
    t.test('Given segments of 60ft and 40ft on a 240ft blockface', t => {
        t.test('When calculating visual percentages', t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 60 },
                { id: 's2', type: 'Loading', length: 40 },
            ]
            const blockfaceLength = 240

            const percentages = calculateVisualPercentages(segments, blockfaceLength)

            t.equal(percentages.length, 2, 'Then it returns percentages for each segment')
            t.equal(percentages[0], 25, 'Then the first segment is 25% of the blockface')
            t.ok(
                Math.abs(percentages[1] - 16.666666666666668) < 0.01,
                'Then the second segment is approximately 16.67% of the blockface',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given segments of 120ft and 120ft on a 240ft blockface', t => {
        t.test('When calculating visual percentages', t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 120 },
                { id: 's2', type: 'Loading', length: 120 },
            ]
            const blockfaceLength = 240

            const percentages = calculateVisualPercentages(segments, blockfaceLength)

            t.equal(percentages.length, 2, 'Then it returns 2 percentages')
            t.equal(percentages[0], 50, 'Then the first segment is 50% of the blockface')
            t.equal(percentages[1], 50, 'Then the second segment is 50% of the blockface')
            t.end()
        })
        t.end()
    })

    t.end()
})
