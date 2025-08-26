import { createStore } from 'redux'
import rootReducer from '../src/store/reducer.js'
import { addSegment, initializeSegments, updateSegmentLength, updateSegmentType } from '../src/store/actions.js'

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
    empty: () => [initializeSegments(240, 'test-blockface-empty')],

    /**
     * @sig single :: () -> [Action]
     */
    single: () => [
        initializeSegments(240, 'test-blockface-single'),
        addSegment(-1),
        updateSegmentLength(0, 100),
        updateSegmentType(0, 'Parking'),
    ],

    /**
     * @sig multiple :: () -> [Action]
     */
    multiple: () => [
        initializeSegments(240, 'test-blockface-multiple'),
        addSegment(-1),
        updateSegmentLength(0, 80),
        updateSegmentType(0, 'Parking'),
        addSegment(0),
        updateSegmentLength(1, 60),
        updateSegmentType(1, 'Loading'),
        addSegment(1),
        updateSegmentLength(2, 50),
        updateSegmentType(2, 'Parking'),
    ],

    /**
     * @sig full :: () -> [Action]
     */
    full: () => [
        initializeSegments(240, 'test-blockface-full'),
        addSegment(-1),
        updateSegmentLength(0, 120),
        updateSegmentType(0, 'Parking'),
        addSegment(0),
        updateSegmentLength(1, 120),
        updateSegmentType(1, 'Loading'),
    ],
}

export { createStoreWithScenario }
