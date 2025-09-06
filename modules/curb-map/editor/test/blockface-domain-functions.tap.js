/**
 * Simple tests for Blockface domain functions
 * Tests the business logic functions directly without Redux
 */

import { test } from 'tap'
import { Blockface, Segment } from '../src/types/index.js'

test('Blockface domain functions', t => {
    t.test('Blockface.unknownRemaining', t => {
        t.test('Given segments using 100ft of a 240ft blockface', t => {
            t.test('When calling unknownRemaining', t => {
                const segments = [Segment('Parking', 60), Segment('NoParking', 40)]
                const blockface = Blockface('test-id', null, 'Test St', null, segments)

                const result = Blockface.unknownRemaining(blockface)

                t.equal(result, 140, 'Then it returns 140ft of unknown remaining space')
                t.end()
            })
            t.end()
        })

        t.test('Given segments using all 240ft of a blockface', t => {
            t.test('When calling unknownRemaining', t => {
                const segments = [Segment('Parking', 120), Segment('NoParking', 120)]
                const blockface = Blockface('test-id', null, 'Test St', null, segments)

                const result = Blockface.unknownRemaining(blockface)

                t.equal(result, 0, 'Then it returns 0ft of unknown remaining space')
                t.end()
            })
            t.end()
        })

        t.test('Given a null blockface', t => {
            t.test('When calling unknownRemaining', t => {
                const result = Blockface.unknownRemaining(null)

                t.equal(result, 0, 'Then it returns 0ft for a null blockface')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('Blockface.addSegmentLeft', t => {
        t.test('Given a segment with sufficient length', t => {
            t.test('When calling addSegmentLeft with a desired length of 10ft', t => {
                const segments = [Segment('NoParking', 30)]
                const blockface = Blockface('test-id', null, 'Test St', null, segments)

                const result = Blockface.addSegmentLeft(blockface, 0, 10)

                t.equal(result.segments.length, 2, 'Then it creates two segments')
                t.equal(result.segments[0].length, 10, 'Then the new segment has the desired length')
                t.equal(result.segments[0].use, 'Parking', 'Then the new segment has the default Parking use')
                t.equal(result.segments[1].length, 20, 'Then the original segment is reduced by the desired length')
                t.equal(result.segments[1].use, 'NoParking', 'Then the original segment use is preserved')
                t.end()
            })
            t.end()
        })

        t.test('Given a segment that is too small - split in half', t => {
            t.test('When calling addSegmentLeft wanting 10ft but only having 6ft', t => {
                const segments = [Segment('NoParking', 6)]
                const blockface = Blockface('test-id', null, 'Test St', null, segments)

                const result = Blockface.addSegmentLeft(blockface, 0, 10)

                t.equal(result.segments.length, 2, 'Then it creates two segments')
                t.equal(result.segments[0].length, 3, 'Then the new segment gets half the length (3ft)')
                t.equal(result.segments[0].use, 'Parking', 'Then the new segment has the default use')
                t.equal(result.segments[1].length, 3, 'Then the remaining segment gets half the length (3ft)')
                t.equal(result.segments[1].use, 'NoParking', 'Then the original segment use is preserved')
                t.end()
            })
            t.end()
        })

        t.test('Given a tiny segment', t => {
            t.test('When calling addSegmentLeft on a 1ft segment', t => {
                const segments = [Segment('NoParking', 1)]
                const blockface = Blockface('test-id', null, 'Test St', null, segments)

                const result = Blockface.addSegmentLeft(blockface, 0, 10)

                t.equal(result.segments.length, 2, 'Then it creates two segments')
                t.equal(result.segments[0].length, 0.5, 'Then the new segment gets half the length (0.5ft)')
                t.equal(result.segments[0].use, 'Parking', 'Then the new segment has the default use')
                t.equal(result.segments[1].length, 0.5, 'Then the remaining segment gets half the length (0.5ft)')
                t.equal(result.segments[1].use, 'NoParking', 'Then the original segment use is preserved')
                t.end()
            })
            t.end()
        })

        t.test('Given a null blockface', t => {
            t.test('When calling addSegmentLeft', t => {
                const result = Blockface.addSegmentLeft(null, 0, 10)

                t.equal(result, null, 'Then it returns null for a null blockface')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('Blockface.updateSegmentLength', t => {
        t.test('Given a segment adjustment that consumes unknown space', t => {
            t.test('When expanding the last segment from 40ft to 60ft', t => {
                const segments = [Segment('Parking', 60), Segment('NoParking', 40)]
                const blockface = Blockface('test-id', null, 'Test St', null, segments)

                const result = Blockface.updateSegmentLength(blockface, 1, 60)

                t.equal(result.segments.length, 2, 'Then it maintains the segment count')
                t.equal(result.segments[0].length, 60, 'Then the first segment remains unchanged')
                t.equal(result.segments[1].length, 60, 'Then the second segment is expanded')
                t.equal(Blockface.unknownRemaining(result), 120, 'Then the unknown space is reduced by 20ft')
                t.end()
            })
            t.end()
        })

        t.test('Given invalid adjustments', t => {
            t.test('When providing a zero length', t => {
                const segments = [Segment('Parking', 60)]
                const blockface = Blockface('test-id', null, 'Test St', null, segments)

                const result = Blockface.updateSegmentLength(blockface, 0, 0)

                t.equal(result, blockface, 'Then it returns the original blockface for zero length')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('Blockface.addSegment', t => {
        t.test('Given a blockface with unknown space', t => {
            t.test('When adding a segment at the end', t => {
                const segments = [Segment('Parking', 100)]
                const blockface = Blockface('test-id', null, 'Test St', null, segments)

                const result = Blockface.addSegment(blockface, -1)

                t.equal(result.segments.length, 2, 'Then it adds a new segment')
                t.equal(result.segments[0].length, 100, 'Then the original segment remains unchanged')
                t.equal(result.segments[1].use, 'Parking', 'Then the new segment has the default use')
                t.equal(result.segments[1].length, 20, 'Then the new segment has the default size')
                t.equal(Blockface.unknownRemaining(result), 120, 'Then the unknown space is reduced by 20ft')
                t.end()
            })
            t.end()
        })

        t.test('Given a blockface with no unknown space', t => {
            t.test('When trying to add a segment', t => {
                const segments = [Segment('Parking', 120), Segment('NoParking', 120)]
                const blockface = Blockface('test-id', null, 'Test St', null, segments)

                const result = Blockface.addSegment(blockface, 0)

                t.equal(result, blockface, 'Then it returns the original blockface when no space is available')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('Blockface.replaceSegments', t => {
        t.test('Given a new segments array', t => {
            t.test('When replacing the existing segments with new segments', t => {
                const originalSegments = [Segment('Parking', 100)]
                const blockface = Blockface('test-id', null, 'Test St', null, originalSegments)

                const newSegments = [
                    { use: 'Loading', length: 80 },
                    { use: 'NoParking', length: 60 },
                ]

                const result = Blockface.replaceSegments(blockface, newSegments)

                t.equal(result.segments.length, 2, 'Then it replaces the segments with the new segments')
                t.equal(result.segments[0].use, 'Loading', 'Then the first segment has the correct use')
                t.equal(result.segments[0].length, 80, 'Then the first segment has the correct length')
                t.equal(result.segments[1].use, 'NoParking', 'Then the second segment has the correct use')
                t.equal(result.segments[1].length, 60, 'Then the second segment has the correct length')
                t.end()
            })
            t.end()
        })
        t.end()
    })
    t.end()
})
