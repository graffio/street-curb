import { test } from 'tap'
import { createSegment, updateSegmentLengths, insertSegment, adjustSegmentStartPosition } from '../src/types/segment.js'

test('segment manipulation functions', t => {
    t.test('Given I want to create a segment', t => {
        t.test('When I create a segment with default values', t => {
            const segment = createSegment()

            t.test('Then it has the correct structure', t => {
                t.ok(segment.id, 'has an id')
                t.strictSame(segment.type, 'Unknown', 'has default type')
                t.strictSame(segment.length, 240, 'has default length')
                t.end()
            })
            t.end()
        })

        t.test('When I create a segment with custom values', t => {
            const segment = createSegment('Parking', 50)

            t.test('Then it has the specified values', t => {
                t.ok(segment.id, 'has an id')
                t.strictSame(segment.type, 'Parking', 'has specified type')
                t.strictSame(segment.length, 50, 'has specified length')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('Given I have segments with an Unknown segment', t => {
        const segments = [createSegment('Parking', 30), createSegment('Unknown', 100), createSegment('Curb Cut', 20)]

        t.test('When I update a segment length', t => {
            t.test('And the change is valid', t => {
                const result = updateSegmentLengths(segments, 0, 40, 150)

                t.test('Then it successfully updates the target segment and adjusts Unknown segment', t => {
                    t.strictSame(result.isValid, true, 'operation succeeds')
                    t.ok(result.segments, 'returns the updated segment array')
                    t.strictSame(result.segments[0].length, 40, 'Parking segment length increased from 30 to 40')
                    t.strictSame(
                        result.segments[1].length,
                        90,
                        'Unknown segment length decreased from 100 to 90 to compensate',
                    )
                    t.strictSame(result.segments[2].length, 20, 'Curb Cut segment length unchanged at 20')
                    t.end()
                })
                t.end()
            })

            t.test('And the change would make Unknown segment negative', t => {
                const result = updateSegmentLengths(segments, 0, 150, 150)

                t.test('Then it fails because the Unknown segment cannot provide enough space', t => {
                    t.strictSame(result.isValid, false, 'operation fails')
                    t.strictSame(
                        result.error,
                        'Insufficient space in Unknown segment',
                        'returns error message explaining the Unknown segment is too small',
                    )
                    t.end()
                })
                t.end()
            })

            t.test('And the segment index is out of bounds', t => {
                const result = updateSegmentLengths(segments, 5, 40, 150)

                t.test('Then it fails because the segment index does not exist', t => {
                    t.strictSame(result.isValid, false, 'operation fails')
                    t.strictSame(
                        result.error,
                        'Segment index out of bounds',
                        'returns error message explaining the index is invalid',
                    )
                    t.end()
                })
                t.end()
            })

            t.test('And the change would exceed blockface length', t => {
                const result = updateSegmentLengths(segments, 0, 60, 149)

                t.test('Then it fails because the total segment length would exceed the blockface limit', t => {
                    t.strictSame(result.isValid, false, 'operation fails')
                    t.strictSame(
                        result.error,
                        'Total segment length exceeds blockface length',
                        'returns error message explaining the constraint violation',
                    )
                    t.end()
                })
                t.end()
            })
            t.end()
        })

        t.test('When I insert a new segment', t => {
            t.test('And insert after a non-Unknown segment', t => {
                const result = insertSegment(segments, 0, 'Loading', 15, 150)

                t.test('Then it successfully inserts a new Loading segment after the Parking segment', t => {
                    t.strictSame(result.isValid, true, 'operation succeeds')
                    t.ok(result.segments, 'returns the updated segment array')
                    t.strictSame(result.segments.length, 4, 'array now contains 4 segments instead of 3')
                    t.strictSame(result.segments[1].type, 'Loading', 'new segment at index 1 has type Loading')
                    t.strictSame(result.segments[1].length, 15, 'new Loading segment has length 15')
                    t.strictSame(
                        result.segments[2].length,
                        85,
                        'Unknown segment length decreased from 100 to 85 to provide space',
                    )
                    t.end()
                })
                t.end()
            })

            t.test('And insert into Unknown segment', t => {
                const result = insertSegment(segments, 1, 'Loading', 15, 150)

                t.test('Then it successfully inserts a new Loading segment into the Unknown segment position', t => {
                    t.strictSame(result.isValid, true, 'operation succeeds')
                    t.ok(result.segments, 'returns the updated segment array')
                    t.strictSame(result.segments.length, 4, 'array now contains 4 segments instead of 3')
                    t.strictSame(
                        result.segments[1].type,
                        'Loading',
                        'new segment at index 1 (replacing Unknown) has type Loading',
                    )
                    t.strictSame(
                        result.segments[2].length,
                        85,
                        'Unknown segment moved to index 2 with length decreased from 100 to 85',
                    )
                    t.end()
                })
                t.end()
            })

            t.test('And there is insufficient space', t => {
                const result = insertSegment(segments, 0, 'Loading', 150, 150)

                t.test('Then it creates a Loading segment using all available Unknown space', t => {
                    t.strictSame(result.isValid, true, 'operation succeeds despite insufficient requested space')
                    t.ok(result.segments, 'returns the updated segment array')
                    t.strictSame(
                        result.segments[1].length,
                        100,
                        'new Loading segment uses all 100 units from Unknown segment',
                    )
                    t.strictSame(
                        result.segments[2].length,
                        0,
                        'Unknown segment becomes empty (length 0) after providing all its space',
                    )
                    t.end()
                })
                t.end()
            })

            t.test('And the insert would exceed blockface length', t => {
                const result = insertSegment(segments, 0, 'Loading', 30, 149)

                t.test('Then it fails because inserting the new segment would exceed the blockface limit', t => {
                    t.strictSame(result.isValid, false, 'operation fails')
                    t.strictSame(
                        result.error,
                        'Total segment length exceeds blockface length',
                        'returns error message explaining the constraint violation',
                    )
                    t.end()
                })
                t.end()
            })
            t.end()
        })

        t.test('When I adjust segment start position', t => {
            t.test('And the adjustment is valid', t => {
                const result = adjustSegmentStartPosition(segments, 2, 40, 150)

                t.test('Then it successfully adjusts the start position of the Curb Cut segment', t => {
                    t.strictSame(result.isValid, true, 'operation succeeds')
                    t.ok(result.segments, 'returns the updated segment array')
                    t.strictSame(result.segments[0].length, 30, 'Parking segment length unchanged at 30')
                    t.strictSame(
                        result.segments[1].length,
                        10,
                        'Unknown segment length decreased from 100 to 10 to move Curb Cut start from 130 to 40',
                    )
                    t.strictSame(result.segments[2].length, 20, 'Curb Cut segment length unchanged at 20')
                    t.end()
                })
                t.end()
            })

            t.test('And I try to adjust the first segment', t => {
                const result = adjustSegmentStartPosition(segments, 0, 10, 150)

                t.test('Then it fails because the first segment cannot have its start position adjusted', t => {
                    t.strictSame(result.isValid, false, 'operation fails')
                    t.strictSame(
                        result.error,
                        'Cannot adjust start position of first segment',
                        'returns error message explaining the first segment constraint',
                    )
                    t.end()
                })
                t.end()
            })

            t.test('And the adjustment would make segments negative', t => {
                const result = adjustSegmentStartPosition(segments, 2, -50, 150)

                t.test('Then it fails because the adjustment would create negative segment lengths', t => {
                    t.strictSame(result.isValid, false, 'operation fails')
                    t.strictSame(
                        result.error,
                        'Invalid start position adjustment',
                        'returns error message explaining the negative length constraint',
                    )
                    t.end()
                })
                t.end()
            })

            t.test('And the adjustment would exceed blockface length', t => {
                const result = adjustSegmentStartPosition(segments, 2, 160, 149)

                t.test('Then it fails because adjusting the start position would exceed the blockface limit', t => {
                    t.strictSame(result.isValid, false, 'operation fails')
                    t.strictSame(
                        result.error,
                        'Total segment length exceeds blockface length',
                        'returns error message explaining the constraint violation',
                    )
                    t.end()
                })
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('Given I have segments without an Unknown segment', t => {
        const segments = [createSegment('Parking', 30), createSegment('Curb Cut', 20)]

        t.test('When I try to update segment length', t => {
            const result = updateSegmentLengths(segments, 0, 40, 50)

            t.test('Then it fails because there is no Unknown segment to provide space', t => {
                t.strictSame(result.isValid, false, 'operation fails')
                t.strictSame(
                    result.error,
                    'No Unknown segment found',
                    'returns error message explaining the missing Unknown segment',
                )
                t.end()
            })
            t.end()
        })

        t.test('When I try to insert a segment', t => {
            const result = insertSegment(segments, 0, 'Loading', 15, 50)

            t.test('Then it fails because there is no Unknown segment to provide space', t => {
                t.strictSame(result.isValid, false, 'operation fails')
                t.strictSame(
                    result.error,
                    'No Unknown segment found',
                    'returns error message explaining the missing Unknown segment',
                )
                t.end()
            })
            t.end()
        })

        t.test('When I try to adjust start position', t => {
            const result = adjustSegmentStartPosition(segments, 1, 40, 50)

            t.test('Then it fails because there is no Unknown segment to provide space', t => {
                t.strictSame(result.isValid, false, 'operation fails')
                t.strictSame(
                    result.error,
                    'No Unknown segment found',
                    'returns error message explaining the missing Unknown segment',
                )
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.end()
})
