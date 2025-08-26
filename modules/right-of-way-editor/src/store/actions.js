/**
 * Initialize segments for a new blockface
 * @sig initializeSegments :: (Number, String?) -> Action
 */
const initializeSegments = (blockfaceLength, blockfaceId = null) => ({
    type: ACTION_TYPES.INITIALIZE_SEGMENTS,
    payload: { blockfaceLength, blockfaceId },
})

/**
 * Update segment type
 * @sig updateSegmentType :: (Number, String) -> Action
 */
const updateSegmentType = (index, type) => ({ type: ACTION_TYPES.UPDATE_SEGMENT_TYPE, payload: { index, type } })

/**
 * Update segment length and adjust Unknown segment accordingly
 * @sig updateSegmentLength :: (Number, Number) -> Action
 */
const updateSegmentLength = (index, newLength) => ({
    type: ACTION_TYPES.UPDATE_SEGMENT_LENGTH,
    payload: { index, newLength },
})

/**
 * Add new segment by consuming space from Unknown segment
 * @sig addSegment :: Number -> Action
 */
const addSegment = targetIndex => ({ type: ACTION_TYPES.ADD_SEGMENT, payload: { targetIndex } })

/**
 * Add new segment to the left of target segment by splitting
 * @sig addSegmentLeft :: (Number, Number?) -> Action
 */
const addSegmentLeft = (index, desiredLength = 10) => ({
    type: ACTION_TYPES.ADD_SEGMENT_LEFT,
    payload: { index, desiredLength },
})

/**
 * Replace all segments (for drag and drop reordering)
 * @sig replaceSegments :: ([Segment] | Function) -> Action
 */
const replaceSegments = segments => ({ type: ACTION_TYPES.REPLACE_SEGMENTS, payload: { segments } })

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

export {
    ACTION_TYPES,
    addSegment,
    addSegmentLeft,
    initializeSegments,
    replaceSegments,
    updateSegmentLength,
    updateSegmentType,
}
