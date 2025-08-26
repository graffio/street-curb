import { combineReducers } from 'redux'
import { roundToPrecision } from '../utils/formatting.js'
import { performSegmentSplit } from '../utils/segments.js'
import { ACTION_TYPES } from './actions.js'
import { selectUnknownRemaining } from './selectors.js'

/**
 * Reset segments array and set new blockface parameters
 * @sig initializeSegments :: (State, Action) -> State
 */
const initializeSegments = (state, action) => {
    const { blockfaceLength, blockfaceId } = action.payload
    return { ...state, blockfaceLength, blockfaceId, segments: [], isCollectionComplete: false }
}

/**
 * Change the type of a specific segment by index
 * @sig updateSegmentType :: (State, Action) -> State
 */
const updateSegmentType = (state, action) => {
    const { index, type } = action.payload
    if (!state.segments[index]) return state

    return { ...state, segments: state.segments.map((segment, i) => (i === index ? { ...segment, type } : segment)) }
}

/**
 * Adjust segment length and rebalance affected segments or unknown space
 * @sig updateSegmentLength :: (State, Action) -> State
 */
const updateSegmentLength = (state, action) => {
    /**
     * Handle last segment length adjustment (affects unknown space)
     * @sig adjustLastSegment :: () -> State
     */
    const adjustLastSegment = () => {
        const currentUnknownRemaining = selectUnknownRemaining({ curb: state })
        let newUnknownRemaining = roundToPrecision(currentUnknownRemaining - lengthDelta)

        // Snap to zero if very close (handles floating point precision issues)
        if (Math.abs(newUnknownRemaining) < 0.01) newUnknownRemaining = 0
        if (newUnknownRemaining < 0) throw new Error('Insufficient unknown space')

        const newSegments = state.segments.map((seg, i) => (i === index ? { ...seg, length: roundedLength } : seg))
        return { ...state, segments: newSegments, isCollectionComplete: Math.abs(newUnknownRemaining) < 0.01 }
    }

    /**
     * Handle middle segment length adjustment (affects next segment)
     * @sig adjustMiddleSegment :: () -> State
     */
    const adjustMiddleSegment = () => {
        /**
         * Map segments to update lengths for current and next segment
         * @sig mapSegmentLengths :: (Segment, Number) -> Segment
         */
        const mapSegmentLengths = (seg, i) => {
            if (i === index) return { ...seg, length: roundedLength }
            if (i === index + 1) return { ...seg, length: newNextLength }
            return seg
        }

        const nextSegment = state.segments[index + 1]
        const newNextLength = roundToPrecision(nextSegment.length - lengthDelta)
        if (newNextLength <= 0) throw new Error('Cannot create zero or negative segment length')

        const newSegments = state.segments.map(mapSegmentLengths)
        return { ...state, segments: newSegments }
    }

    const { index, newLength } = action.payload
    if (!state.segments[index]) return state

    // Validate parameters
    if (index < 0 || index >= state.segments.length) return state
    if (newLength <= 0) return state

    const roundedLength = roundToPrecision(newLength)
    const lengthDelta = roundedLength - state.segments[index].length

    try {
        if (index === state.segments.length - 1) return adjustLastSegment()

        return adjustMiddleSegment()
    } catch (error) {
        return state
    }
}

/**
 * Create new segment by consuming unknown space
 * @sig addSegment :: (State, Action) -> State
 */
const addSegment = (state, action) => {
    const { targetIndex } = action.payload

    // Check if we have unknown space to consume
    if (selectUnknownRemaining({ curb: state }) <= 0) return state

    // Process adding segment by consuming unknown space
    const currentUnknownRemaining = selectUnknownRemaining({ curb: state })
    const newSegmentSize = Math.min(20, currentUnknownRemaining)

    // Create new segment with default properties
    const newSegment = {
        id: 's' + Math.random().toString(36).slice(2, 7),
        type: 'Parking',
        length: roundToPrecision(newSegmentSize),
    }

    // Insert new segment at the specified position
    const newSegments = [...state.segments]
    const insertIndex = targetIndex >= 0 ? targetIndex + 1 : newSegments.length
    newSegments.splice(insertIndex, 0, newSegment)

    const newUnknownRemaining = roundToPrecision(currentUnknownRemaining - newSegmentSize)
    return { ...state, segments: newSegments, isCollectionComplete: newUnknownRemaining === 0 }
}

/**
 * Split existing segment to create new segment on the left
 * @sig addSegmentLeft :: (State, Action) -> State
 */
const addSegmentLeft = (state, action) => {
    const { index, desiredLength } = action.payload
    const result = performSegmentSplit(state.segments, index, desiredLength)

    if (!result.success) return state

    return { ...state, segments: result.segments }
}

/**
 * Replace entire segments array with new segments
 * @sig replaceSegments :: (State, Action) -> State
 */
const replaceSegments = (state, action) => {
    const { segments } = action.payload
    const newSegments = typeof segments === 'function' ? segments(state.segments) : segments
    return { ...state, segments: newSegments }
}

/**
 * Curb reducer for segment management
 * @sig curbReducer :: (State, Action) -> State
 */
const curbReducer = (state = curbInitialState, action) => {
    if (action.type === ACTION_TYPES.INITIALIZE_SEGMENTS) return initializeSegments(state, action)
    if (action.type === ACTION_TYPES.UPDATE_SEGMENT_TYPE) return updateSegmentType(state, action)
    if (action.type === ACTION_TYPES.UPDATE_SEGMENT_LENGTH) return updateSegmentLength(state, action)
    if (action.type === ACTION_TYPES.ADD_SEGMENT) return addSegment(state, action)
    if (action.type === ACTION_TYPES.ADD_SEGMENT_LEFT) return addSegmentLeft(state, action)
    if (action.type === ACTION_TYPES.REPLACE_SEGMENTS) return replaceSegments(state, action)
    return state
}

/**
 * Initial state for curb segments - unknownRemaining now computed
 */
const curbInitialState = { segments: [], blockfaceLength: 240, blockfaceId: null, isCollectionComplete: false }

/**
 * Root reducer combining all slice reducers
 * @sig rootReducer :: (State, Action) -> State
 */
const rootReducer = combineReducers({ curb: curbReducer })

export { rootReducer }
