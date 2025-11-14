/**
 * Initialize segments for a new blockface
 * @sig initializeSegments :: (Number, String?) -> Action
 */
const initializeSegments = (blockfaceLength, blockfaceId = null) => ({
    type: ACTION_TYPES.INITIALIZE_SEGMENTS,
    payload: { blockfaceLength, blockfaceId },
})

/**
 * Update segment use
 * @sig updateSegmentUse :: (Number, String) -> Action
 */
const updateSegmentUse = (index, use) => ({ type: ACTION_TYPES.UPDATE_SEGMENT_USE, payload: { index, use } })

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
 * Action types for blockface and segment management
 */
const ACTION_TYPES = {
    // Legacy segment actions
    INITIALIZE_SEGMENTS: 'INITIALIZE_SEGMENTS',
    UPDATE_SEGMENT_USE: 'UPDATE_SEGMENT_USE',
    UPDATE_SEGMENT_LENGTH: 'UPDATE_SEGMENT_LENGTH',
    ADD_SEGMENT: 'ADD_SEGMENT',
    ADD_SEGMENT_LEFT: 'ADD_SEGMENT_LEFT',
    REPLACE_SEGMENTS: 'REPLACE_SEGMENTS',

    // New blockface actions
    SELECT_BLOCKFACE: 'SELECT_BLOCKFACE',
    CREATE_BLOCKFACE: 'CREATE_BLOCKFACE',

    // Data loading
    LOAD_ALL_INITIAL_DATA: 'LOAD_ALL_INITIAL_DATA',
}

/**
 * Select an existing blockface for editing, creating it if necessary
 * @sig selectBlockface :: (String, Object?, String?, String?) -> Action
 */
const selectBlockface = (blockfaceId, geometry = {}, streetName = '', cnnId = undefined) => ({
    type: ACTION_TYPES.SELECT_BLOCKFACE,
    payload: { blockfaceId, geometry, streetName, cnnId },
})

/**
 * Create a new blockface and select it for editing
 * @sig createBlockface :: (String, Object?, String?, String?) -> Action
 */
const createBlockface = (id, geometry = {}, streetName = '', cnnId = undefined) => ({
    type: ACTION_TYPES.CREATE_BLOCKFACE,
    payload: { id, geometry, streetName, cnnId },
})

/**
 * Load all initial data (currentUser, currentOrganization, members)
 * @sig loadAllInitialData :: (User, Organization, LookupTable<Member>) -> Action
 */
const loadAllInitialData = (currentUser, currentOrganization) => ({
    type: ACTION_TYPES.LOAD_ALL_INITIAL_DATA,
    payload: { currentUser, currentOrganization },
})

export {
    ACTION_TYPES,
    addSegment,
    addSegmentLeft,
    createBlockface,
    initializeSegments,
    loadAllInitialData,
    replaceSegments,
    selectBlockface,
    updateSegmentLength,
    updateSegmentUse,
}
