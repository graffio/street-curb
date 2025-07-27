import t from 'tap'
import { createCurrentState, validateMathematicalInvariant } from './mathematical-invariant.tap.js'

/*
 * Simulate current UPDATE_SEGMENT_LENGTH action
 * @sig simulateCurrentUpdateLength :: (State, String, Number) -> State
 */
const simulateCurrentUpdateLength = (state, segmentId, newLength) => {
    const segmentIndex = state.segments.findIndex(seg => seg.id === segmentId)
    if (segmentIndex === -1) return state

    const oldLength = state.segments[segmentIndex].length
    const lengthDelta = newLength - oldLength

    // Current implementation logic: find Unknown and adjust it
    const unknownIndex = state.segments.findIndex(seg => seg.type === 'Unknown')
    if (unknownIndex === -1) return state

    const newUnknownLength = state.segments[unknownIndex].length - lengthDelta
    if (newUnknownLength < 0) return state // Invalid operation

    return {
        ...state,
        segments: state.segments.map((seg, i) => {
            if (i === segmentIndex) return { ...seg, length: newLength }
            if (i === unknownIndex) return { ...seg, length: newUnknownLength }
            return seg
        }),
    }
}

/*
 * Simulate current ENTER_NEXT_POSITION action
 * @sig simulateCurrentEnterPosition :: (State, Number) -> State
 */
const simulateCurrentEnterPosition = (state, cumulativePosition) => {
    const unknownIndex = state.segments.findIndex(seg => seg.type === 'Unknown')
    if (unknownIndex === -1) return state

    const currentTotal = state.segments.filter(seg => seg.type !== 'Unknown').reduce((sum, seg) => sum + seg.length, 0)

    const newSegmentLength = cumulativePosition - currentTotal
    if (newSegmentLength <= 0) return state

    const unknownLength = state.segments[unknownIndex].length
    if (newSegmentLength > unknownLength) return state

    const newUnknownLength = unknownLength - newSegmentLength

    return {
        ...state,
        segments: [
            ...state.segments.filter(seg => seg.type !== 'Unknown'),
            { id: `s${Date.now()}`, type: 'Parking', length: newSegmentLength },
            ...(newUnknownLength > 0 ? [{ id: 'unknown', type: 'Unknown', length: newUnknownLength }] : []),
        ],
    }
}

t.test('Current implementation behavior validation', t => {
    t.test('Given initial state with full unknown space', t => {
        const initialState = createCurrentState([], 240)

        t.test('When entering first position of 15.3', t => {
            const result = simulateCurrentEnterPosition(initialState, 15.3)
            t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
            t.equal(result.segments.length, 2, 'Then creates real segment plus unknown')
            t.equal(result.segments[0].length, 15.3, 'Then first segment has correct length')
            t.equal(result.segments[1].type, 'Unknown', 'Then unknown segment remains')
            t.equal(result.segments[1].length, 224.7, 'Then unknown length is reduced correctly')
            t.end()
        })
        t.end()
    })

    t.test('Given state with one segment and unknown remainder', t => {
        const state = createCurrentState([15.3], 224.7)

        t.test('When updating first segment length to 20', t => {
            const result = simulateCurrentUpdateLength(state, 's1', 20)
            t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
            t.equal(result.segments[0].length, 20, 'Then segment length updated')
            t.equal(result.segments[1].length, 220, 'Then unknown length adjusted by delta')
            t.end()
        })

        t.test('When entering next position of 43.8', t => {
            const result = simulateCurrentEnterPosition(state, 43.8)
            t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
            t.equal(result.segments.length, 3, 'Then creates second real segment')
            t.ok(Math.abs(result.segments[1].length - 28.5) < 0.01, 'Then second segment has correct length')
            t.equal(result.segments[2].length, 196.2, 'Then unknown space reduced correctly')
            t.end()
        })
        t.end()
    })

    t.test('Given state near completion', t => {
        const state = createCurrentState([100, 80, 50], 10)

        t.test('When entering final position to complete collection', t => {
            const result = simulateCurrentEnterPosition(state, 240)
            t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
            t.equal(result.segments.length, 4, 'Then creates final segment without unknown')
            t.notOk(
                result.segments.some(seg => seg.type === 'Unknown'),
                'Then unknown segment removed',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given invalid operations', t => {
        const state = createCurrentState([100], 140)

        t.test('When trying to make segment longer than unknown space', t => {
            const result = simulateCurrentUpdateLength(state, 's1', 250)
            t.same(result, state, 'Then state unchanged')
            t.ok(validateMathematicalInvariant(result), 'Then invariant still holds')
            t.end()
        })

        t.test('When trying to enter position beyond blockface', t => {
            const result = simulateCurrentEnterPosition(state, 300)
            t.same(result, state, 'Then state unchanged')
            t.ok(validateMathematicalInvariant(result), 'Then invariant still holds')
            t.end()
        })
        t.end()
    })

    t.end()
})

export { simulateCurrentUpdateLength, simulateCurrentEnterPosition }
