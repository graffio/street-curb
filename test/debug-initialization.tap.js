import t from 'tap'

/*
 * Debug test to help diagnose the initialization issue
 * This will print detailed state information at each step
 */

/*
 * Test what happens with the exact Redux store setup
 * @sig testReduxInitialization :: () -> TestResult
 */

// Import the actual Redux store and actions
import { createStore, combineReducers } from 'redux'
import curbReducer, {
    initializeSegments,
    addSegment,
    selectUnknownRemaining,
    selectSegments,
    selectIsCollectionComplete,
} from '../src/store/curbStore.js'

const rootReducer = combineReducers({ curb: curbReducer })
const testStore = createStore(rootReducer)

t.test('Debug initialization with real Redux store', t => {
    t.test('Given fresh Redux store', t => {
        const initialState = testStore.getState()
        console.log('Initial store state:', JSON.stringify(initialState, null, 2))

        t.equal(initialState.curb.unknownRemaining, 240, 'Then default unknown remaining is 240')
        t.equal(initialState.curb.segments.length, 0, 'Then no initial segments')
        t.notOk(initialState.curb.isCollectionComplete, 'Then collection not complete')
        t.end()
    })

    t.test('When dispatching initializeSegments with 180ft', t => {
        testStore.dispatch(initializeSegments(180, 'test-blockface'))
        const stateAfterInit = testStore.getState()
        console.log('State after initialization:', JSON.stringify(stateAfterInit, null, 2))

        t.equal(stateAfterInit.curb.blockfaceLength, 180, 'Then blockface length set correctly')
        t.equal(stateAfterInit.curb.unknownRemaining, 180, 'Then unknown remaining equals blockface length')
        t.equal(stateAfterInit.curb.blockfaceId, 'test-blockface', 'Then blockface ID set correctly')
        t.equal(stateAfterInit.curb.segments.length, 0, 'Then no segments after init')
        t.notOk(stateAfterInit.curb.isCollectionComplete, 'Then collection not complete')
        t.end()
    })

    t.test('When adding first segment', t => {
        testStore.dispatch(addSegment(0))
        const stateAfterAdd = testStore.getState()
        console.log('State after adding segment:', JSON.stringify(stateAfterAdd, null, 2))

        t.equal(stateAfterAdd.curb.segments.length, 1, 'Then one segment exists')
        t.equal(stateAfterAdd.curb.segments[0].length, 20, 'Then segment has default length')
        t.equal(stateAfterAdd.curb.unknownRemaining, 160, 'Then unknown space reduced')
        t.notOk(stateAfterAdd.curb.isCollectionComplete, 'Then collection not complete')
        t.end()
    })

    t.test('Testing selector functions', t => {
        const state = testStore.getState()
        const unknownRemaining = selectUnknownRemaining(state)
        const segments = selectSegments(state)
        const isComplete = selectIsCollectionComplete(state)

        console.log('Selector results:')
        console.log('- unknownRemaining:', unknownRemaining)
        console.log('- segments:', segments)
        console.log('- isComplete:', isComplete)

        t.equal(unknownRemaining, 160, 'Then unknownRemaining selector works')
        t.equal(segments.length, 1, 'Then segments selector works')
        t.notOk(isComplete, 'Then isCollectionComplete selector works')
        t.end()
    })

    t.end()
})

export { testStore }
