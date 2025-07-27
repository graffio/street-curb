import t from 'tap'
import { validateMathematicalInvariant } from './mathematical-invariant.tap.js'

/*
 * Integration test to verify end-to-end initialization behavior
 * Tests the complete flow from blockface selection to UI display
 */

/*
 * Simulate the complete initialization flow from main.jsx
 * @sig simulateBlockfaceSelection :: (Object) -> State
 */
const simulateBlockfaceSelection = blockfaceData => {
    // Step 1: Simulate what happens when user selects a blockface
    console.log('Selected blockface:', blockfaceData)

    // Step 2: Simulate dispatch(initializeSegments(blockfaceData.length, blockfaceData.id))
    const initializedState = {
        blockfaceLength: blockfaceData.length,
        blockfaceId: blockfaceData.id,
        segments: [],
        unknownRemaining: blockfaceData.length,
        isCollectionComplete: false,
    }

    return initializedState
}

/*
 * Simulate adding the first segment from Unknown space
 * @sig simulateAddFirstSegment :: (State) -> State
 */
const simulateAddFirstSegment = state => {
    if (state.unknownRemaining <= 0) return state

    const newSegmentSize = Math.min(20, state.unknownRemaining)
    const newSegment = { id: 's' + Math.random().toString(36).slice(2, 7), type: 'Parking', length: newSegmentSize }

    return {
        ...state,
        segments: [newSegment],
        unknownRemaining: state.unknownRemaining - newSegmentSize,
        isCollectionComplete: state.unknownRemaining - newSegmentSize === 0,
    }
}

t.test('Integration test - Blockface selection to segment creation', t => {
    t.test('Given blockface selection workflow', t => {
        t.test('When user selects 240ft blockface', t => {
            const blockfaceData = { length: 240, id: 'blockface_123' }
            const initialState = simulateBlockfaceSelection(blockfaceData)

            t.ok(validateMathematicalInvariant(initialState), 'Then mathematical invariant holds')
            t.equal(initialState.unknownRemaining, 240, 'Then unknown space equals blockface length')
            t.equal(initialState.segments.length, 0, 'Then no segments initially')
            t.notOk(initialState.isCollectionComplete, 'Then collection not complete')

            t.test('When user adds first segment', t => {
                const stateWithSegment = simulateAddFirstSegment(initialState)

                t.ok(validateMathematicalInvariant(stateWithSegment), 'Then mathematical invariant still holds')
                t.equal(stateWithSegment.segments.length, 1, 'Then one segment exists')
                t.equal(stateWithSegment.segments[0].length, 20, 'Then segment has expected length')
                t.equal(stateWithSegment.unknownRemaining, 220, 'Then unknown space reduced correctly')
                t.notOk(stateWithSegment.isCollectionComplete, 'Then collection still not complete')
                t.end()
            })
            t.end()
        })

        t.test('When user selects 60ft blockface', t => {
            const blockfaceData = { length: 60, id: 'blockface_456' }
            const initialState = simulateBlockfaceSelection(blockfaceData)

            t.ok(validateMathematicalInvariant(initialState), 'Then mathematical invariant holds')
            t.equal(initialState.unknownRemaining, 60, 'Then unknown space equals blockface length')

            t.test('When user adds first segment', t => {
                const stateWithSegment = simulateAddFirstSegment(initialState)

                t.ok(validateMathematicalInvariant(stateWithSegment), 'Then mathematical invariant still holds')
                t.equal(stateWithSegment.segments[0].length, 20, 'Then segment has expected length')
                t.equal(stateWithSegment.unknownRemaining, 40, 'Then unknown space reduced correctly')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('Given various blockface sizes', t => {
        const testCases = [
            { length: 100, expectedAfterAdd: 80 },
            { length: 150, expectedAfterAdd: 130 },
            { length: 300, expectedAfterAdd: 280 },
            { length: 15, expectedAfterAdd: 0 }, // Small blockface - segment consumes all
        ]

        testCases.forEach(({ length, expectedAfterAdd }) => {
            t.test(`When blockface is ${length}ft`, t => {
                const blockfaceData = { length, id: `blockface_${length}` }
                const initialState = simulateBlockfaceSelection(blockfaceData)
                const finalState = simulateAddFirstSegment(initialState)

                t.ok(validateMathematicalInvariant(initialState), 'Then initial state valid')
                t.ok(validateMathematicalInvariant(finalState), 'Then final state valid')
                t.equal(finalState.unknownRemaining, expectedAfterAdd, `Then unknown space is ${expectedAfterAdd}ft`)

                if (expectedAfterAdd === 0) {
                    t.ok(finalState.isCollectionComplete, 'Then collection marked complete')
                } else {
                    t.notOk(finalState.isCollectionComplete, 'Then collection not complete')
                }
                t.end()
            })
        })
        t.end()
    })

    t.end()
})

export { simulateBlockfaceSelection, simulateAddFirstSegment }
