/*
 * Tests for Redux selectors that replace component-level calculations
 * Following TDD methodology: RED → GREEN → REFACTOR
 */

import test from 'node:test'
import { selectCumulativePositions, selectStartPositions, selectVisualPercentages } from '../src/store/selectors.js'

/**
 * Creates mock Redux state for testing selectors
 * @sig createMockState :: ([Segment], Number, Number) -> State
 */
const createMockState = (segments, unknownRemaining, blockfaceLength) => ({
    curb: {
        segments,
        unknownRemaining,
        blockfaceLength,
        blockfaceId: 'test-blockface',
        isCollectionComplete: unknownRemaining === 0,
    },
})

test('Redux selectors for replacing component calculations', async t => {
    await t.test('selectCumulativePositions replaces buildTickPoints from SegmentedCurbEditor', async t => {
        await t.test('Given segments of 60ft and 40ft with 140ft unknown remaining', async t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 60 },
                { id: 's2', type: 'NoParking', length: 40 },
            ]
            const state = createMockState(segments, 140, 240)

            await t.test('When calling selectCumulativePositions', async t => {
                const result = selectCumulativePositions(state)

                await t.test('Then it returns 4 position markers', async t => {
                    t.assert.strictEqual(result.length, 4)
                })

                await t.test('Then the first position is at the start (0ft)', async t => {
                    t.assert.strictEqual(result[0], 0)
                })

                await t.test('Then the first segment ends at 60ft', async t => {
                    t.assert.strictEqual(result[1], 60)
                })

                await t.test('Then the second segment ends at 100ft', async t => {
                    t.assert.strictEqual(result[2], 100)
                })

                await t.test('Then the final marker includes the unknown space (240ft total)', async t => {
                    t.assert.strictEqual(result[3], 240)
                })
            })
        })

        await t.test('Given segments of 120ft and 120ft with no unknown space', async t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 120 },
                { id: 's2', type: 'NoParking', length: 120 },
            ]
            const state = createMockState(segments, 0, 240)

            await t.test('When calling selectCumulativePositions', async t => {
                const result = selectCumulativePositions(state)

                await t.test('Then it returns 3 position markers (no unknown space marker)', async t => {
                    t.assert.strictEqual(result.length, 3)
                })

                await t.test('Then the first position is at the start (0ft)', async t => {
                    t.assert.strictEqual(result[0], 0)
                })

                await t.test('Then the first segment ends at 120ft', async t => {
                    t.assert.strictEqual(result[1], 120)
                })

                await t.test('Then the second segment ends at 240ft', async t => {
                    t.assert.strictEqual(result[2], 240)
                })
            })
        })

        await t.test('Given no segments with 240ft of unknown space', async t => {
            const state = createMockState([], 240, 240)

            await t.test('When calling selectCumulativePositions', async t => {
                const result = selectCumulativePositions(state)

                await t.test('Then it returns 2 position markers (start and end only)', async t => {
                    t.assert.strictEqual(result.length, 2)
                })

                await t.test('Then the first position is at the start (0ft)', async t => {
                    t.assert.strictEqual(result[0], 0)
                })

                await t.test('Then the final position includes all unknown space (240ft)', async t => {
                    t.assert.strictEqual(result[1], 240)
                })
            })
        })

        await t.test('Given memoization requirements for array selectors', async t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 60 },
                { id: 's2', type: 'NoParking', length: 40 },
            ]
            const state = createMockState(segments, 140, 240)

            await t.test('When calling selectCumulativePositions multiple times with same state', async t => {
                const result1 = selectCumulativePositions(state)
                const result2 = selectCumulativePositions(state)

                await t.test('Then it returns the same array reference (memoized)', async t => {
                    t.assert.strictEqual(result1, result2, 'Expected same reference for memoization')
                })
            })

            await t.test('When calling selectCumulativePositions with different state', async t => {
                // Create different state with different segments (different total length)
                const differentSegments = [
                    { id: 's1', type: 'Parking', length: 80 }, // Different length
                    { id: 's2', type: 'NoParking', length: 40 },
                ]
                const differentState = createMockState(differentSegments, 120, 240)
                const result1 = selectCumulativePositions(state)
                const result2 = selectCumulativePositions(differentState)

                await t.test('Then it returns different array references', async t => {
                    t.assert.notStrictEqual(result1, result2, 'Expected different references for different states')
                })
            })
        })
    })

    await t.test('selectStartPositions replaces calculateStartPositions from CurbTable', async t => {
        await t.test('Given segments of 60ft and 40ft', async t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 60 },
                { id: 's2', type: 'NoParking', length: 40 },
            ]
            const state = createMockState(segments, 140, 240)

            await t.test('When calling selectStartPositions', async t => {
                const result = selectStartPositions(state)

                await t.test('Then it returns start positions for each segment', async t => {
                    t.assert.strictEqual(result.length, 2)
                })

                await t.test('Then the first segment starts at 0ft', async t => {
                    t.assert.strictEqual(result[0], 0)
                })

                await t.test('Then the second segment starts at 60ft', async t => {
                    t.assert.strictEqual(result[1], 60)
                })
            })
        })

        await t.test('Given segments of 80ft, 60ft, and 40ft', async t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 80 },
                { id: 's2', type: 'NoParking', length: 60 },
                { id: 's3', type: 'Loading', length: 40 },
            ]
            const state = createMockState(segments, 60, 240)

            await t.test('When calling selectStartPositions', async t => {
                const result = selectStartPositions(state)

                await t.test('Then it returns start positions for each segment', async t => {
                    t.assert.strictEqual(result.length, 3)
                })

                await t.test('Then the first segment starts at 0ft', async t => {
                    t.assert.strictEqual(result[0], 0)
                })

                await t.test('Then the second segment starts at 80ft', async t => {
                    t.assert.strictEqual(result[1], 80)
                })

                await t.test('Then the third segment starts at 140ft', async t => {
                    t.assert.strictEqual(result[2], 140)
                })
            })
        })

        await t.test('Given empty segments', async t => {
            const state = createMockState([], 240, 240)

            await t.test('When calling selectStartPositions', async t => {
                const result = selectStartPositions(state)

                await t.test('Then it returns empty array', async t => {
                    t.assert.strictEqual(result.length, 0)
                })
            })
        })

        await t.test('Given memoization requirements for array selectors', async t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 60 },
                { id: 's2', type: 'NoParking', length: 40 },
            ]
            const state = createMockState(segments, 140, 240)

            await t.test('When calling selectStartPositions multiple times with same state', async t => {
                const result1 = selectStartPositions(state)
                const result2 = selectStartPositions(state)

                await t.test('Then it returns the same array reference (memoized)', async t => {
                    t.assert.strictEqual(result1, result2, 'Expected same reference for memoization')
                })
            })
        })
    })

    await t.test('selectVisualPercentages provides percentage calculations for rendering', async t => {
        await t.test('Given segments of 60ft and 40ft on a 240ft blockface', async t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 60 },
                { id: 's2', type: 'NoParking', length: 40 },
            ]
            const state = createMockState(segments, 140, 240)

            await t.test('When calling selectVisualPercentages', async t => {
                const result = selectVisualPercentages(state)

                await t.test('Then it returns percentages for each segment', async t => {
                    t.assert.strictEqual(result.length, 2)
                })

                await t.test('Then the first segment is 25% of the blockface', async t => {
                    t.assert.strictEqual(result[0], 25)
                })

                await t.test('Then the second segment is approximately 16.67% of the blockface', async t => {
                    t.assert.ok(Math.abs(result[1] - 16.666666666666668) < 0.001)
                })
            })
        })

        await t.test('Given segments of 120ft and 120ft on a 240ft blockface', async t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 120 },
                { id: 's2', type: 'NoParking', length: 120 },
            ]
            const state = createMockState(segments, 0, 240)

            await t.test('When calling selectVisualPercentages', async t => {
                const result = selectVisualPercentages(state)

                await t.test('Then it returns 2 percentages', async t => {
                    t.assert.strictEqual(result.length, 2)
                })

                await t.test('Then the first segment is 50% of the blockface', async t => {
                    t.assert.strictEqual(result[0], 50)
                })

                await t.test('Then the second segment is 50% of the blockface', async t => {
                    t.assert.strictEqual(result[1], 50)
                })
            })
        })

        await t.test('Given memoization requirements for array selectors', async t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 60 },
                { id: 's2', type: 'NoParking', length: 40 },
            ]
            const state = createMockState(segments, 140, 240)

            await t.test('When calling selectVisualPercentages multiple times with same state', async t => {
                const result1 = selectVisualPercentages(state)
                const result2 = selectVisualPercentages(state)

                await t.test('Then it returns the same array reference (memoized)', async t => {
                    t.assert.strictEqual(result1, result2, 'Expected same reference for memoization')
                })
            })
        })
    })

    await t.test('Mathematical invariant preservation through selectors', async t => {
        await t.test('Given segments with unknown space', async t => {
            const segments = [
                { id: 's1', type: 'Parking', length: 60 },
                { id: 's2', type: 'NoParking', length: 40 },
            ]
            const unknownRemaining = 140
            const blockfaceLength = 240
            const state = createMockState(segments, unknownRemaining, blockfaceLength)

            await t.test('When using all selectors', async t => {
                const cumulativePositions = selectCumulativePositions(state)
                const visualPercentages = selectVisualPercentages(state)

                await t.test('Then mathematical invariant is preserved', async t => {
                    const sumSegmentLengths = segments.reduce((sum, seg) => sum + seg.length, 0)
                    const totalLength = sumSegmentLengths + unknownRemaining
                    t.assert.strictEqual(totalLength, blockfaceLength, 'Mathematical invariant must hold')
                })

                await t.test('Then cumulative positions end at blockface length', async t => {
                    const lastPosition = cumulativePositions[cumulativePositions.length - 1]
                    t.assert.strictEqual(lastPosition, blockfaceLength, 'Final position should equal blockface length')
                })

                await t.test('Then visual percentages sum to reasonable total', async t => {
                    const totalPercentage = visualPercentages.reduce((sum, pct) => sum + pct, 0)
                    const expectedPercentage = (100 * 100) / 240 // (60 + 40) / 240 * 100
                    t.assert.ok(Math.abs(totalPercentage - expectedPercentage) < 0.001)
                })
            })
        })
    })
})
