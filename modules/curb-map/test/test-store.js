import { createStore } from 'redux'
import { addSegment, createBlockface, updateSegmentLength, updateSegmentUse } from '../src/store/actions.js'
import { rootReducer } from '../src/store/reducer.js'

/**
 * Vanilla Redux test store utilities for test data consistency
 * Supports Playwright tests, unit (tap) tests, and Storybook tests
 */

/**
 * Creates a store with scenario actions applied
 * @sig createStoreWithScenario :: String -> Store
 */
const createStoreWithScenario = scenarioName => {
    const store = createTestStore()
    const actions = TEST_SCENARIOS[scenarioName]()
    actions.forEach(action => store.dispatch(action))
    return store
}

/**
 * Creates a vanilla Redux store with real rootReducer
 * @sig createTestStore :: () -> Store
 */
const createTestStore = () => createStore(rootReducer)

/**
 * Predefined test data scenarios
 * Each scenario returns an array of actions to dispatch
 */
const TEST_SCENARIOS = {
    /**
     * @sig empty :: () -> [Action]
     */
    empty: () => [createBlockface('test-blockface-empty', {}, 'Empty Street')],

    /**
     * @sig single :: () -> [Action]
     */
    single: () => [
        createBlockface('test-blockface-single', {}, 'Single Street'),
        addSegment(-1),
        updateSegmentLength(0, 100),
        updateSegmentUse(0, 'Parking'),
    ],

    /**
     * @sig multiple :: () -> [Action]
     */
    multiple: () => [
        createBlockface('test-blockface-multiple', {}, 'Multiple Street'),
        addSegment(-1),
        updateSegmentLength(0, 80),
        updateSegmentUse(0, 'Parking'),
        addSegment(0),
        updateSegmentLength(1, 60),
        updateSegmentUse(1, 'Loading'),
        addSegment(1),
        updateSegmentLength(2, 50),
        updateSegmentUse(2, 'Parking'),
    ],

    /**
     * @sig full :: () -> [Action]
     */
    full: () => [
        createBlockface('test-blockface-full', {}, 'Full Street'),
        addSegment(-1),
        updateSegmentLength(0, 120),
        updateSegmentUse(0, 'Parking'),
        addSegment(0),
        updateSegmentLength(1, 120),
        updateSegmentUse(1, 'Loading'),
    ],
}

export { createStoreWithScenario }
