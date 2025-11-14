import { assoc } from '@graffio/functional'
import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Action, Blockface, Organization } from '../types/index.js'

/**
 * Initial state for the application
 */
const initialState = {
    // UI
    currentBlockfaceId: null,
    currentUser: null,
    currentOrganization: null,

    // from Firestore
    blockfaces: LookupTable([], Blockface, 'id'),
}

/*
 * Add the new or modified blockface to the blockfaces; leaves state unchanged in Blockface is undefined
 * @sig addBlockface :: (State, Blockface) -> State
 */
const _addBlockface = (state, blockface) =>
    blockface
        ? { ...state, blockfaces: state.blockfaces.addItemWithId(blockface), currentBlockfaceId: blockface.id }
        : state

/**
 * Get the current blockface from state
 * @sig _currentBlockface :: State -> Blockface?
 */
const _currentBlockface = state => state.blockfaces?.[state.currentBlockfaceId] || null

/**
 * Change the use of a specific segment by index
 * @sig updateSegmentUse :: (State, Action) -> State
 */
const updateSegmentUse = (state, action) =>
    _addBlockface(state, Blockface.updateSegmentUse(_currentBlockface(state), action.index, action.use))

/**
 * Adjust segment length and rebalance affected segments or unknown space
 * @sig updateSegmentLength :: (State, Action) -> State
 */
const updateSegmentLength = (state, action) =>
    _addBlockface(state, Blockface.updateSegmentLength(_currentBlockface(state), action.index, action.newLength))

/**
 * Create new segment by consuming unknown space
 * @sig addSegment :: (State, Action) -> State
 */
const addSegment = (state, action) =>
    _addBlockface(state, Blockface.addSegment(_currentBlockface(state), action.targetIndex))

/**
 * Split existing segment to create new segment on the left
 * @sig addSegmentLeft :: (State, Action) -> State
 */
const addSegmentLeft = (state, action) =>
    _addBlockface(state, Blockface.addSegmentLeft(_currentBlockface(state), action.index, action.desiredLength))

/**
 * Replace entire segments array with new segments
 * @sig replaceSegments :: (State, Action) -> State
 */
const replaceSegments = (state, action) =>
    _addBlockface(state, Blockface.replaceSegments(_currentBlockface(state), action.segments))

/**
 * Create blockface action handler; mostly for testing
 * @sig createBlockface :: (State, Action) -> State
 */
const createBlockface = (state, action) => _addBlockface(state, Blockface.from({ ...action, segments: [] }))

/**
 * Select blockface action handler (with auto-creation)
 // If blockface already exists, just select it, otherwise, create it and select it
 * @sig selectBlockface :: (State, Action) -> State
 */
const selectBlockface = (state, action) =>
    state.blockfaces[action.id] ? { ...state, currentBlockfaceId: action.id } : createBlockface(state, action)

/**
 * Load all initial data action handler
 * @sig loadAllInitialData :: (State, Action) -> State
 */
const loadAllInitialData = (state, action) => ({
    ...state,
    currentUser: action.currentUser,
    currentOrganization: action.currentOrganization,
})

const postRoleChanged = (state, action) =>
    assoc('currentOrganization', Organization.roleChanged(state.currentOrganization, action), state)

/**
 * Rollback state from snapshot (for command failure handling)
 * @sig rollbackState :: (State, Action) -> State
 */
const rollbackState = (state, action) => ({ ...state, ...action })

/**
 * Root reducer handling all actions
 * @sig rootReducer :: (State, Action) -> State
 */
const rootReducer = (state = initialState, { type, payload: action }) => {
    if (type === 'ROLLBACK_STATE') return rollbackState(state, action)

    // prettier-ignore
    if (Action.is(action)) return action.match({
        // Organization Actions
        OrganizationCreated    : () => state,
        OrganizationDeleted    : () => state,
        OrganizationSuspended  : () => state,
        OrganizationUpdated    : () => state,
        
        // Organization Member Actions
        MemberAdded            : () => state,
        MemberRemoved          : () => state,
        RoleChanged            : () => postRoleChanged(state, action),
        UserCreated            : () => state,
        UserForgotten          : () => state,
        UserUpdated            : () => state,
        
        // Firebase Auth
        AuthenticationCompleted: () => state,
        
        // Data Loading
        LoadAllInitialData     : () => loadAllInitialData(state, action),
        
        // Blockface Actions
        CreateBlockface        : () => createBlockface(state, action),
        SelectBlockface        : () => selectBlockface(state, action),
        
        // Segment Actions
        UpdateSegmentUse       : () => updateSegmentUse(state, action),
        UpdateSegmentLength    : () => updateSegmentLength(state, action),
        AddSegment             : () => addSegment(state, action),
        AddSegmentLeft         : () => addSegmentLeft(state, action),
        ReplaceSegments        : () => replaceSegments(state, action),
    })

    return state
}

export { rootReducer }
