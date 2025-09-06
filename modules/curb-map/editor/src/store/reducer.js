import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Blockface } from '../types/index.js'
import { ACTION_TYPES } from './actions.js'

/**
 * Initial state for the application
 */
const initialState = { blockfaces: LookupTable([], Blockface, 'id'), currentBlockfaceId: null }

/*
 * Add the new or modified blockface to the blockfaces; leaves state unchanged in Blockface is undefined
 * @sig addBlockface :: (State, Blockface) -> State
 */
const _addBlockface = (state, blockface) =>
    blockface
        ? { ...state, blockfaces: state.blockfaces.addItemWithId(blockface), currentBlockfaceId: blockface.id }
        : state

/**
 * Helper functions for working with current blockface
 */

/**
 * Get the current blockface from state
 * @sig _currentBlockface :: State -> Blockface?
 */
const _currentBlockface = state => state.blockfaces?.[state.currentBlockfaceId] || null

/**
 * New blockface management reducers
 */

/**
 * Segment operation functions using domain functions
 */

/**
 * Change the use of a specific segment by index
 * @sig updateSegmentUse :: (State, Action) -> State
 */
const updateSegmentUse = (state, action) => {
    const { index, use } = action.payload
    return _addBlockface(state, Blockface.updateSegmentUse(_currentBlockface(state), index, use))
}

/**
 * Adjust segment length and rebalance affected segments or unknown space
 * @sig updateSegmentLength :: (State, Action) -> State
 */
const updateSegmentLength = (state, action) => {
    const { index, newLength } = action.payload
    return _addBlockface(state, Blockface.updateSegmentLength(_currentBlockface(state), index, newLength))
}

/**
 * Create new segment by consuming unknown space
 * @sig addSegment :: (State, Action) -> State
 */
const addSegment = (state, action) => {
    const { targetIndex } = action.payload
    return _addBlockface(state, Blockface.addSegment(_currentBlockface(state), targetIndex))
}

/**
 * Split existing segment to create new segment on the left
 * @sig addSegmentLeft :: (State, Action) -> State
 */
const addSegmentLeft = (state, action) => {
    const { index, desiredLength } = action.payload
    return _addBlockface(state, Blockface.addSegmentLeft(_currentBlockface(state), index, desiredLength))
}

/**
 * Replace entire segments array with new segments
 * @sig replaceSegments :: (State, Action) -> State
 */
const replaceSegments = (state, action) => {
    const { segments } = action.payload
    return _addBlockface(state, Blockface.replaceSegments(_currentBlockface(state), segments))
}

/**
 * Create blockface action handler; mostly for testing
 * @sig createBlockface :: (State, Action) -> State
 */
const createBlockface = (state, action) => {
    const { id, geometry, streetName, cnnId } = action.payload
    return _addBlockface(state, Blockface(id, geometry, streetName, cnnId, []))
}

/**
 * Select blockface action handler (with auto-creation)
 * @sig selectBlockface :: (State, Action) -> State
 */
const selectBlockface = (state, action) => {
    const { blockfaceId, geometry, streetName, cnnId } = action.payload

    // If blockface already exists, just select it, otherwise, create it and select it
    return state.blockfaces[blockfaceId]
        ? { ...state, currentBlockfaceId: blockfaceId }
        : _addBlockface(state, Blockface(blockfaceId, geometry, streetName, cnnId, []))
}

/**
 * Root reducer handling all actions
 * @sig rootReducer :: (State, Action) -> State
 */
const rootReducer = (state = initialState, action) => {
    if (action.type === ACTION_TYPES.CREATE_BLOCKFACE) return createBlockface(state, action)
    if (action.type === ACTION_TYPES.SELECT_BLOCKFACE) return selectBlockface(state, action)
    if (action.type === ACTION_TYPES.UPDATE_SEGMENT_USE) return updateSegmentUse(state, action)
    if (action.type === ACTION_TYPES.UPDATE_SEGMENT_LENGTH) return updateSegmentLength(state, action)
    if (action.type === ACTION_TYPES.ADD_SEGMENT) return addSegment(state, action)
    if (action.type === ACTION_TYPES.ADD_SEGMENT_LEFT) return addSegmentLeft(state, action)
    if (action.type === ACTION_TYPES.REPLACE_SEGMENTS) return replaceSegments(state, action)
    return state
}

export { rootReducer }
