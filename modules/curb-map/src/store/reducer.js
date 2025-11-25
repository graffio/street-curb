import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Action, Blockface, Organization } from '../types/index.js'

/**
 * Initial state for the application
 */
const initialState = {
    // local state
    currentBlockfaceId: null,
    currentOrganization: null,
    currentProjectId: null,
    currentUser: null,
    projectDataLoading: false,

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

// organization changed; only wipe project data if projectId changed
const organizationSynced = (state, action) => {
    const newProjectId = action.organization.defaultProjectId

    return newProjectId === state.currentProjectId
        ? { ...state, currentOrganization: action.organization }
        : {
              currentUser: state.currentUser,
              currentOrganization: action.organization,
              currentProjectId: newProjectId,
              blockfaces: LookupTable([], Blockface, 'id'),
              currentBlockfaceId: null,
              projectDataLoading: true,
          }
}

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
        
        // Data Loading
        UserLoaded             : () => ({ ...state, currentUser: action.user }),
        OrganizationSynced     : () => organizationSynced(state, action),
        BlockfacesSynced       : () => ({ ...state, blockfaces: LookupTable(action.blockfaces, Blockface, 'id'), projectDataLoading: false }),

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
