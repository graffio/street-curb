import { roundToPrecision } from '../utils/formatting.js'
import { calculateCumulativePositions, calculateVisualPercentages } from '../utils/geometry.js'
import { performSegmentSplit } from '../utils/segments.js'

/**
 * Action types for curb segment management
 */
const ACTION_TYPES = {
    INITIALIZE_SEGMENTS: 'INITIALIZE_SEGMENTS',
    UPDATE_SEGMENT_TYPE: 'UPDATE_SEGMENT_TYPE',
    UPDATE_SEGMENT_LENGTH: 'UPDATE_SEGMENT_LENGTH',
    ADD_SEGMENT: 'ADD_SEGMENT',
    ADD_SEGMENT_LEFT: 'ADD_SEGMENT_LEFT',
    REPLACE_SEGMENTS: 'REPLACE_SEGMENTS',
}

/**
 * Creates new segment with default properties for insertion
 * @sig createNewSegment :: (String, Number) -> Segment
 */
const createNewSegment = (type = 'Parking', length = 20) => ({
    id: 's' + Math.random().toString(36).slice(2, 7),
    type,
    length: roundToPrecision(length),
})

/**
 * Adjusts the last segment boundary affecting unknown space
 * @sig adjustLastSegmentBoundary :: (State, Number, Number, Number) -> State
 */
const adjustLastSegmentBoundary = (state, segmentIndex, roundedLength, lengthDelta) => {
    // Last segment affects unknown space
    let newUnknownRemaining = roundToPrecision(state.unknownRemaining - lengthDelta)

    // Snap to zero if very close (handles floating point precision issues)
    if (Math.abs(newUnknownRemaining) < 0.01) {
        newUnknownRemaining = 0
    }

    if (newUnknownRemaining < 0) {
        throw new Error('Insufficient unknown space')
    }

    return {
        ...state,
        segments: state.segments.map((seg, i) => (i === segmentIndex ? { ...seg, length: roundedLength } : seg)),
        unknownRemaining: newUnknownRemaining,
        isCollectionComplete: Math.abs(newUnknownRemaining) < 0.01, // Handle floating point precision
    }
}

/**
 * Universal boundary adjustment operation - core of the refactored implementation
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

    const roundedLength = roundToPrecision(newLength)
    const lengthDelta = roundedLength - state.segments[segmentIndex].length

    if (segmentIndex === state.segments.length - 1) {
        return adjustLastSegmentBoundary(state, segmentIndex, roundedLength, lengthDelta)
    }

    // Middle segment affects next segment
    const nextSegment = state.segments[segmentIndex + 1]
    const newNextLength = roundToPrecision(nextSegment.length - lengthDelta)
    if (newNextLength <= 0) {
        throw new Error('Cannot create zero or negative segment length')
    }

    return {
        ...state,
        segments: state.segments.map((seg, i) => {
            if (i === segmentIndex) return { ...seg, length: roundedLength }
            if (i === segmentIndex + 1) return { ...seg, length: newNextLength }
            return seg
        }),
    }
}

/**
 * Processes adding a new segment by consuming unknown space
 * @sig processAddSegment :: (State, Number) -> State
 */
const processAddSegment = (state, targetIndex) => {
    const newSegmentSize = Math.min(20, state.unknownRemaining)
    const newSegment = createNewSegment('Parking', newSegmentSize)

    // Insert new segment at the specified position
    const newSegments = [...state.segments]
    const insertIndex = targetIndex >= 0 ? targetIndex + 1 : newSegments.length
    newSegments.splice(insertIndex, 0, newSegment)

    return {
        ...state,
        segments: newSegments,
        unknownRemaining: roundToPrecision(state.unknownRemaining - newSegmentSize),
        isCollectionComplete: state.unknownRemaining - newSegmentSize === 0,
    }
}

/**
 * Initial state for curb segments - refactored to use Unknown as system state
 */
const initialState = {
    segments: [],
    unknownRemaining: 240,
    blockfaceLength: 240,
    blockfaceId: null,
    isCollectionComplete: false,
}

/**
 * Action creators
 */

/**
 * Initialize segments for a new blockface
 * @sig initializeSegments :: (Number, String?) -> Action
 */
export const initializeSegments = (blockfaceLength, blockfaceId = null) => ({
    type: ACTION_TYPES.INITIALIZE_SEGMENTS,
    payload: { blockfaceLength, blockfaceId },
})

/**
 * Update segment type
 * @sig updateSegmentType :: (Number, String) -> Action
 */
export const updateSegmentType = (index, type) => ({ type: ACTION_TYPES.UPDATE_SEGMENT_TYPE, payload: { index, type } })

/**
 * Update segment length and adjust Unknown segment accordingly
 * @sig updateSegmentLength :: (Number, Number) -> Action
 */
export const updateSegmentLength = (index, newLength) => ({
    type: ACTION_TYPES.UPDATE_SEGMENT_LENGTH,
    payload: { index, newLength },
})

/**
 * Add new segment by consuming space from Unknown segment
 * @sig addSegment :: Number -> Action
 */
export const addSegment = targetIndex => ({ type: ACTION_TYPES.ADD_SEGMENT, payload: { targetIndex } })

/**
 * Add new segment to the left of target segment by splitting
 * @sig addSegmentLeft :: (Number, Number?) -> Action
 */
export const addSegmentLeft = (index, desiredLength = 10) => ({
    type: ACTION_TYPES.ADD_SEGMENT_LEFT,
    payload: { index, desiredLength },
})

/**
 * Replace all segments (for drag and drop reordering)
 * @sig replaceSegments :: ([Segment] | Function) -> Action
 */
export const replaceSegments = segments => ({ type: ACTION_TYPES.REPLACE_SEGMENTS, payload: { segments } })

/**
 * Main reducer for curb segments
 * @sig curbReducer :: (State, Action) -> State
 */
const curbReducer = (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPES.INITIALIZE_SEGMENTS: {
            const { blockfaceLength, blockfaceId } = action.payload
            return {
                ...state,
                blockfaceLength,
                blockfaceId,
                segments: [],
                unknownRemaining: blockfaceLength,
                isCollectionComplete: false,
            }
        }

        case ACTION_TYPES.UPDATE_SEGMENT_TYPE: {
            const { index, type } = action.payload
            if (!state.segments[index]) return state

            return {
                ...state,
                segments: state.segments.map((segment, i) => (i === index ? { ...segment, type } : segment)),
            }
        }

        case ACTION_TYPES.UPDATE_SEGMENT_LENGTH: {
            const { index, newLength } = action.payload
            if (!state.segments[index]) return state

            try {
                return adjustSegmentBoundary(state, index, newLength)
            } catch (error) {
                // Return unchanged state if adjustment would be invalid
                return state
            }
        }

        case ACTION_TYPES.ADD_SEGMENT: {
            const { targetIndex } = action.payload

            // Check if we have unknown space to consume
            if (state.unknownRemaining <= 0) return state

            return processAddSegment(state, targetIndex)
        }

        case ACTION_TYPES.ADD_SEGMENT_LEFT: {
            const { index, desiredLength } = action.payload
            const result = performSegmentSplit(state.segments, index, desiredLength)

            if (!result.success) return state

            return { ...state, segments: result.segments }
        }

        case ACTION_TYPES.REPLACE_SEGMENTS: {
            const { segments } = action.payload
            const newSegments = typeof segments === 'function' ? segments(state.segments) : segments
            return { ...state, segments: newSegments }
        }

        default:
            return state
    }
}

export default curbReducer

// Selectors
export const selectSegments = state => state.curb.segments
export const selectBlockfaceLength = state => state.curb.blockfaceLength
export const selectBlockfaceId = state => state.curb.blockfaceId
export const selectUnknownRemaining = state => state.curb.unknownRemaining
export const selectIsCollectionComplete = state => state.curb.isCollectionComplete
export const selectTotalLength = state =>
    state.curb.segments.reduce((sum, segment) => sum + segment.length, 0) + state.curb.unknownRemaining

/**
 * Memoized selector for cumulative positions
 * Replaces buildTickPoints from SegmentedCurbEditor.jsx
 * @sig selectCumulativePositions :: State -> [Number]
 */
export const selectCumulativePositions = (() => {
    const createMemoizedSelector = () => {
        let lastSegments = null
        let lastUnknownRemaining = null
        let lastResult = null

        return state => {
            const segments = selectSegments(state)
            const unknownRemaining = selectUnknownRemaining(state)

            if (segments === lastSegments && unknownRemaining === lastUnknownRemaining) {
                return lastResult
            }

            lastSegments = segments
            lastUnknownRemaining = unknownRemaining
            lastResult = calculateCumulativePositions(segments, unknownRemaining)
            return lastResult
        }
    }

    return createMemoizedSelector()
})()

/**
 * Memoized selector for start positions
 * Replaces calculateStartPositions from CurbTable.jsx
 * @sig selectStartPositions :: State -> [Number]
 */
export const selectStartPositions = (() => {
    const createMemoizedSelector = () => {
        let lastSegments = null
        let lastResult = null

        return state => {
            const segments = selectSegments(state)

            if (segments === lastSegments) {
                return lastResult
            }

            lastSegments = segments
            lastResult = segments.reduce((positions, segment) => {
                const start =
                    positions.length === 0 ? 0 : positions[positions.length - 1] + segments[positions.length - 1].length
                return [...positions, start]
            }, [])
            return lastResult
        }
    }

    return createMemoizedSelector()
})()

/**
 * Memoized selector for visual percentages
 * Provides percentage calculations for rendering
 * @sig selectVisualPercentages :: State -> [Number]
 */
export const selectVisualPercentages = (() => {
    const createMemoizedSelector = () => {
        let lastSegments = null
        let lastBlockfaceLength = null
        let lastResult = null

        return state => {
            const segments = selectSegments(state)
            const blockfaceLength = selectBlockfaceLength(state)

            if (segments === lastSegments && blockfaceLength === lastBlockfaceLength) {
                return lastResult
            }

            lastSegments = segments
            lastBlockfaceLength = blockfaceLength
            lastResult = calculateVisualPercentages(segments, blockfaceLength)
            return lastResult
        }
    }

    return createMemoizedSelector()
})()
