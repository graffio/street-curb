import { roundToPrecision } from '../constants.js'

/**
 * Action types for curb segment management
 */
const ACTION_TYPES = {
    INITIALIZE_SEGMENTS: 'INITIALIZE_SEGMENTS',
    UPDATE_SEGMENT_TYPE: 'UPDATE_SEGMENT_TYPE',
    UPDATE_SEGMENT_LENGTH: 'UPDATE_SEGMENT_LENGTH',
    ADD_SEGMENT: 'ADD_SEGMENT',
    REPLACE_SEGMENTS: 'REPLACE_SEGMENTS',
    UPDATE_START_POSITION: 'UPDATE_START_POSITION',
}

/**
 * Creates initial segment data structure for new blockface
 * @sig createInitialSegment :: Number -> Segment
 * Segment = { id: String, type: String, length: Number }
 */
const createInitialSegment = blockfaceLength => ({
    id: 's' + Math.random().toString(36).slice(2, 7),
    type: 'Unknown',
    length: blockfaceLength,
})

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
 * Initial state for curb segments
 */
const initialState = { segments: [createInitialSegment(240)], blockfaceLength: 240, blockfaceId: null }

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
 * Replace all segments (for drag and drop reordering)
 * @sig replaceSegments :: ([Segment] | Function) -> Action
 */
export const replaceSegments = segments => ({ type: ACTION_TYPES.REPLACE_SEGMENTS, payload: { segments } })

/**
 * Update start position by adjusting segment lengths
 * @sig updateStartPosition :: (Number, Number) -> Action
 */
export const updateStartPosition = (index, newStart) => ({
    type: ACTION_TYPES.UPDATE_START_POSITION,
    payload: { index, newStart },
})

/**
 * Main reducer for curb segments
 * @sig curbReducer :: (State, Action) -> State
 */
const curbReducer = (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPES.INITIALIZE_SEGMENTS: {
            const { blockfaceLength, blockfaceId } = action.payload
            return { ...state, blockfaceLength, blockfaceId, segments: [createInitialSegment(blockfaceLength)] }
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

            // Round to configured precision
            const roundedLength = roundToPrecision(newLength)
            const oldLength = state.segments[index].length
            const lengthDifference = roundedLength - oldLength

            // Find the Unknown segment
            const unknownIndex = state.segments.findIndex(segment => segment.type === 'Unknown')
            if (unknownIndex === -1) return state

            // Adjust the Unknown segment length
            const unknownSegment = state.segments[unknownIndex]
            const newUnknownLength = roundToPrecision(unknownSegment.length - lengthDifference)

            // Only allow the change if Unknown segment can accommodate it
            if (newUnknownLength < 0) return state

            return {
                ...state,
                segments: state.segments.map((segment, i) => {
                    if (i === index) {
                        return { ...segment, length: roundedLength }
                    }
                    if (i === unknownIndex) {
                        return { ...segment, length: newUnknownLength }
                    }
                    return segment
                }),
            }
        }

        case ACTION_TYPES.ADD_SEGMENT: {
            const { targetIndex } = action.payload
            const target = state.segments[targetIndex]
            if (!target) return state

            const unknownIndex = state.segments.findIndex(segment => segment.type === 'Unknown')
            if (unknownIndex === -1) return state

            const unknownSegment = state.segments[unknownIndex]
            const newSegmentSize = Math.min(20, unknownSegment.length)

            if (newSegmentSize <= 0) return state

            const newSegment = createNewSegment('Parking', newSegmentSize)

            // Create new segments array with updated Unknown segment and new segment
            const newSegments = [...state.segments]
            newSegments[unknownIndex] = {
                ...unknownSegment,
                length: roundToPrecision(unknownSegment.length - newSegmentSize),
            }

            // Insert new segment
            const insertIndex = target.type === 'Unknown' ? unknownIndex : targetIndex + 1
            newSegments.splice(insertIndex, 0, newSegment)

            return { ...state, segments: newSegments }
        }

        case ACTION_TYPES.REPLACE_SEGMENTS: {
            const { segments } = action.payload
            const newSegments = typeof segments === 'function' ? segments(state.segments) : segments
            return { ...state, segments: newSegments }
        }

        case ACTION_TYPES.UPDATE_START_POSITION: {
            const { index, newStart } = action.payload
            if (index <= 0) return state

            // Calculate current start position
            let currentStart = 0
            for (let i = 0; i < index; i++) {
                currentStart += state.segments[i].length
            }

            const startDifference = newStart - currentStart

            // Find Unknown segment
            const unknownIndex = state.segments.findIndex(segment => segment.type === 'Unknown')
            if (unknownIndex === -1) return state

            // Adjust the previous segment and Unknown segment
            const previousSegment = state.segments[index - 1]
            const newPreviousLength = previousSegment.length + startDifference
            const newUnknownLength = state.segments[unknownIndex].length - startDifference

            if (newPreviousLength < 0 || newUnknownLength < 0) return state

            return {
                ...state,
                segments: state.segments.map((segment, i) => {
                    if (i === index - 1) {
                        return { ...segment, length: newPreviousLength }
                    }
                    if (i === unknownIndex) {
                        return { ...segment, length: newUnknownLength }
                    }
                    return segment
                }),
            }
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
export const selectUnknownSegment = state => state.curb.segments.find(segment => segment.type === 'Unknown')
export const selectTotalLength = state => state.curb.segments.reduce((sum, segment) => sum + segment.length, 0)
