import t from 'tap'

/*
 * Mathematical invariant validation for segment management
 * This invariant must hold for BOTH current and refactored implementations
 * @sig validateMathematicalInvariant :: (State) -> Boolean
 *     State = { segments: [Segment], ...otherFields }
 *     Segment = { id: String, type: String, length: Number }
 */
const validateMathematicalInvariant = state => {
    const blockfaceLength = state.blockfaceLength || 240 // Default for tests

    // Current implementation: Unknown stored as fake segment
    if (state.segments.some(seg => seg.type === 'Unknown')) {
        const totalLength = state.segments.reduce((sum, seg) => sum + seg.length, 0)
        return Math.abs(totalLength - blockfaceLength) < 0.01
    }

    // Future implementation: Unknown as system state
    if (typeof state.unknownRemaining === 'number') {
        const realSegmentLength = state.segments.reduce((sum, seg) => sum + seg.length, 0)
        return Math.abs(realSegmentLength + state.unknownRemaining - blockfaceLength) < 0.01
    }

    // Fallback: assume no unknown space
    const totalLength = state.segments.reduce((sum, seg) => sum + seg.length, 0)
    return Math.abs(totalLength - blockfaceLength) < 0.01
}

/*
 * Test helper to create current implementation state structure
 * @sig createCurrentState :: ([Number], Number) -> State
 *     Creates state with fake Unknown segment
 */
const createCurrentState = (segmentLengths, unknownLength) => ({
    blockfaceLength: 240,
    segments: [
        ...segmentLengths.map((length, i) => ({ id: `s${i + 1}`, type: 'Parking', length })),
        ...(unknownLength > 0 ? [{ id: 'unknown', type: 'Unknown', length: unknownLength }] : []),
    ],
})

/*
 * Test helper to create future implementation state structure
 * @sig createFutureState :: ([Number], Number) -> State
 *     Creates state with Unknown as system state
 */
const createFutureState = (segmentLengths, unknownRemaining) => ({
    blockfaceLength: 240,
    segments: segmentLengths.map((length, i) => ({ id: `s${i + 1}`, type: 'Parking', length })),
    unknownRemaining,
    isCollectionComplete: unknownRemaining === 0,
})

t.test('Mathematical invariant validation', t => {
    t.test('Given empty state with current implementation', t => {
        t.test('When all space is unknown', t => {
            const state = createCurrentState([], 240)
            t.ok(validateMathematicalInvariant(state), 'Then invariant holds')
            t.end()
        })
        t.end()
    })

    t.test('Given partial collection with current implementation', t => {
        t.test('When some segments exist with unknown remainder', t => {
            const state = createCurrentState([15.3, 28.7], 196)
            t.ok(validateMathematicalInvariant(state), 'Then invariant holds')
            t.end()
        })
        t.end()
    })

    t.test('Given complete collection with current implementation', t => {
        t.test('When all space is measured', t => {
            const state = createCurrentState([60, 80, 100], 0)
            t.ok(validateMathematicalInvariant(state), 'Then invariant holds')
            t.end()
        })
        t.end()
    })

    t.test('Given empty state with future implementation', t => {
        t.test('When all space is unknown', t => {
            const state = createFutureState([], 240)
            t.ok(validateMathematicalInvariant(state), 'Then invariant holds')
            t.end()
        })
        t.end()
    })

    t.test('Given partial collection with future implementation', t => {
        t.test('When some segments exist with unknown remainder', t => {
            const state = createFutureState([15.3, 28.7], 196)
            t.ok(validateMathematicalInvariant(state), 'Then invariant holds')
            t.end()
        })
        t.end()
    })

    t.test('Given complete collection with future implementation', t => {
        t.test('When all space is measured', t => {
            const state = createFutureState([60, 80, 100], 0)
            t.ok(validateMathematicalInvariant(state), 'Then invariant holds')
            t.end()
        })
        t.end()
    })

    t.test('Given invalid state', t => {
        t.test('When total exceeds blockface length', t => {
            const state = createCurrentState([100, 150], 50) // Total = 300, blockface = 240
            t.notOk(validateMathematicalInvariant(state), 'Then invariant fails')
            t.end()
        })
        t.end()
    })

    t.end()
})

export { validateMathematicalInvariant, createCurrentState, createFutureState }
