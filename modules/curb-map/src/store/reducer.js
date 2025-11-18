import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Action, Blockface, Organization } from '../types/index.js'

/**
 * Initial state for the application
 */
const initialState = {
    // local state
    currentBlockfaceId: null,
    currentUser: null,
    currentOrganization: null,
    currentProjectId: null,

    // persisted from Firestore
    blockfaces: LookupTable([], Blockface, 'id'),
}

/**********************************************************************************************************************
 * Getters
 **********************************************************************************************************************/

const _blockface = (state, id = state.currentBlockfaceId) => state.blockfaces[id] // defaults to current blockface
const _organization = state => state.currentOrganization // there is only one organization loaded at a time

/***********************************************************************************************************************
 * Setters: KEEP IDEMPOTENT!
 **********************************************************************************************************************/
const _setOrganization = (state, currentOrganization) =>
    state.currentOrganization === currentOrganization ? state : { ...state, currentOrganization }

const _setBlockface = (state, blockface) =>
    _blockface(state) === blockface && _blockface(state, blockface.id) === blockface
        ? state // is already set
        : { ...state, blockfaces: state.blockfaces.addItemWithId(blockface), currentBlockfaceId: blockface.id }

/**********************************************************************************************************************
 * Reducer
 **********************************************************************************************************************/

/**
 * Root reducer handling all actions
 * @sig rootReducer :: (State, Action) -> State
 */
const rootReducer = (state = initialState, { type, payload: action }) => {
    if (type === 'ROLLBACK_STATE') return { ...state, ...action }

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
        RoleChanged            : () => _setOrganization(state, Organization.roleChanged(_organization(state), action)),
        UserCreated            : () => state,
        UserForgotten          : () => state,
        UserUpdated            : () => state,
        
        // Firebase Auth
        AuthenticationCompleted: () => state,
        
        // Data Loading. For now, with 1:1 org:project mapping, store just the project ID
        AllInitialDataLoaded     : () => ({ ...state, ...action, currentProjectId: action.currentOrganization?.defaultProjectId || null }),
        
        // Blockface Actions
        BlockfaceCreated       : () => _setBlockface(state, action.blockface),
        BlockfaceSelected      : () => _setBlockface(state, _blockface(state, action.blockface.id)),
        BlockfaceSaved         : () => state,

        // Segment Actions
        SegmentUseUpdated      : () => _setBlockface(state, Blockface.updateSegmentUse(_blockface(state), action)),
        SegmentLengthUpdated   : () => _setBlockface(state, Blockface.updateSegmentLength(_blockface(state), action)),
        SegmentAdded           : () => _setBlockface(state, Blockface.addSegment(_blockface(state), action)),
        SegmentAddedLeft       : () => _setBlockface(state, Blockface.addSegmentLeft(_blockface(state), action)),
        SegmentsReplaced       : () => _setBlockface(state, Blockface.replaceSegments(_blockface(state), action)),
    })

    return state
}

export { rootReducer }
