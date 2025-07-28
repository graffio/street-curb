import t from 'tap'
import { createFutureState, validateMathematicalInvariant } from './mathematical-invariant.tap.js'

/*
 * Universal boundary adjustment operation - the core of the refactored implementation
 * This replaces all current segment manipulation logic
 * @sig adjustSegmentBoundary :: (State, Number, Number) -> State
 *     State = { segments: [Segment], unknownRemaining: Number, blockfaceLength: Number }
 *     Segment = { id: String, type: String, length: Number }
 */
const adjustSegmentBoundary = (state, segmentIndex, newLength) => {
    if (segmentIndex < 0 || segmentIndex >= state.segments.length) {
        throw new Error('Invalid segment index')
    }

    if (newLength <= 0) {
        throw new Error('Segment length must be positive')
    }

    const lengthDelta = newLength - state.segments[segmentIndex].length

    if (segmentIndex === state.segments.length - 1) {
        // Last segment affects unknown space
        const newUnknownRemaining = state.unknownRemaining - lengthDelta
        if (newUnknownRemaining < 0) {
            throw new Error('Insufficient unknown space')
        }

        return {
            ...state,
            segments: state.segments.map((seg, i) => (i === segmentIndex ? { ...seg, length: newLength } : seg)),
            unknownRemaining: newUnknownRemaining,
            isCollectionComplete: newUnknownRemaining === 0,
        }
    }

    // Middle segment affects next segment
    const nextSegment = state.segments[segmentIndex + 1]
    const newNextLength = nextSegment.length - lengthDelta
    if (newNextLength <= 0) {
        throw new Error('Cannot create zero or negative segment length')
    }

    return {
        ...state,
        segments: state.segments.map((seg, i) => {
            if (i === segmentIndex) return { ...seg, length: newLength }
            if (i === segmentIndex + 1) return { ...seg, length: newNextLength }
            return seg
        }),
    }
}

t.test('Universal boundary adjustment operation', t => {
    t.test('Given state with single segment and unknown space', t => {
        const state = createFutureState([15.3], 224.7)

        t.test('When adjusting last segment to expand into unknown space', t => {
            const result = adjustSegmentBoundary(state, 0, 20.0)
            t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
            t.equal(result.segments[0].length, 20.0, 'Then segment length updated')
            t.equal(result.unknownRemaining, 220.0, 'Then unknown space reduced by delta')
            t.notOk(result.isCollectionComplete, 'Then collection not complete')
            t.end()
        })

        t.test('When adjusting last segment to consume all unknown space', t => {
            const result = adjustSegmentBoundary(state, 0, 240.0)
            t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
            t.equal(result.segments[0].length, 240.0, 'Then segment consumes all space')
            t.equal(result.unknownRemaining, 0, 'Then no unknown space remains')
            t.ok(result.isCollectionComplete, 'Then collection marked complete')
            t.end()
        })
        t.end()
    })

    t.test('Given state with multiple segments', t => {
        const state = createFutureState([10, 20, 15], 195)

        t.test('When adjusting middle segment to expand', t => {
            const result = adjustSegmentBoundary(state, 1, 25)
            t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
            t.equal(result.segments[1].length, 25, 'Then target segment expanded')
            t.equal(result.segments[2].length, 10, 'Then next segment shrunk by delta')
            t.equal(result.unknownRemaining, 195, 'Then unknown space unchanged')
            t.end()
        })

        t.test('When adjusting first segment to expand', t => {
            const result = adjustSegmentBoundary(state, 0, 15)
            t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
            t.equal(result.segments[0].length, 15, 'Then first segment expanded')
            t.equal(result.segments[1].length, 15, 'Then second segment shrunk by delta')
            t.equal(result.segments[2].length, 15, 'Then third segment unchanged')
            t.equal(result.unknownRemaining, 195, 'Then unknown space unchanged')
            t.end()
        })
        t.end()
    })

    t.test('Given error conditions', t => {
        const state = createFutureState([10, 20], 210)

        t.test('When trying to expand segment beyond unknown space', t => {
            t.throws(
                () => adjustSegmentBoundary(state, 1, 250),
                /Insufficient unknown space/,
                'Then throws insufficient space error',
            )
            t.end()
        })

        t.test('When trying to expand middle segment beyond next segment', t => {
            t.throws(
                () => adjustSegmentBoundary(state, 0, 35),
                /Cannot create zero or negative segment length/,
                'Then throws negative length error',
            )
            t.end()
        })

        t.test('When providing invalid segment index', t => {
            t.throws(
                () => adjustSegmentBoundary(state, 5, 15),
                /Invalid segment index/,
                'Then throws invalid index error',
            )
            t.end()
        })

        t.test('When providing zero or negative length', t => {
            t.throws(
                () => adjustSegmentBoundary(state, 0, 0),
                /Segment length must be positive/,
                'Then throws positive length error',
            )

            t.throws(
                () => adjustSegmentBoundary(state, 0, -5),
                /Segment length must be positive/,
                'Then throws positive length error for negative',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given edge cases', t => {
        t.test('When state has no unknown space remaining', t => {
            const state = createFutureState([60, 80, 100], 0)

            t.test('When adjusting middle segment', t => {
                const result = adjustSegmentBoundary(state, 1, 75)
                t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
                t.equal(result.segments[1].length, 75, 'Then middle segment adjusted')
                t.equal(result.segments[2].length, 105, 'Then last segment compensates')
                t.equal(result.unknownRemaining, 0, 'Then unknown space remains zero')
                t.ok(result.isCollectionComplete, 'Then collection remains complete')
                t.end()
            })
            t.end()
        })

        t.test('When state has only unknown space', t => {
            const state = createFutureState([], 240)

            t.test('When trying to adjust non-existent segment', t => {
                t.throws(
                    () => adjustSegmentBoundary(state, 0, 10),
                    /Invalid segment index/,
                    'Then throws invalid index error',
                )
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.end()
})

export { adjustSegmentBoundary }
