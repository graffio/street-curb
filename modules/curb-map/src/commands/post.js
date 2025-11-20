// ABOUTME: Command execution layer for domain Actions
// ABOUTME: Handles authorization, Redux dispatch, Firestore persistence, and rollback

import { getAuth } from 'firebase/auth'
import { functionsUrl } from '../config/index.js'
import { store } from '../store/index.js'
import * as S from '../store/selectors.js'
import { Action, FieldTypes, Organization } from '../types/index.js'

const { getState } = store

/**
 * Get current user's Firebase Auth ID token
 * @sig getIdToken :: () -> Promise<String>
 */
const getIdToken = async () => {
    const auth = getAuth()
    if (!auth.currentUser) throw new Error('User must be authenticated to submit actions')

    return auth.currentUser.getIdToken()
}

const encodeTimestamp = date => (date instanceof Date ? date.toISOString() : date)

/**
 * Submit an action to Firestore via HTTP Cloud Function
 * Private helper - only called from executeCommand
 *
 * @sig submitActionRequest :: Action -> Promise<void>
 * @throws {Error} If submission fails or action is invalid
 */
const submitActionRequest = async (action, organizationId, projectId) => {
    const message = () =>
        `Failed to submit action: ${data.error || data.status || response.statusText} (HTTP ${response.status})`

    const token = await getIdToken()

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const payload = {
        action: Action.toFirestore(action, encodeTimestamp),
        idempotencyKey: FieldTypes.newIdempotencyKey(),
        correlationId: FieldTypes.newCorrelationId(),
        organizationId,
        projectId,
        // namespace: '',
    }
    const url = functionsUrl('submitActionRequest')
    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
    const data = await response.json()
    if (!response.ok || data.status !== 'completed') throw new Error(message())
}

/**
 * Capture state snapshot for potential rollback (action-specific)
 * Returns empty object for actions that don't need rollback
 * @sig captureRollbackSnapshot :: (Action, State) -> Object
 */
// prettier-ignore
const captureRollbackSnapshot = (action, state) =>
    action.match({
        // Organization member actions snapshot currentOrganization
        RoleChanged            : () => ({ currentOrganization: S.currentOrganization(state) }),
        MemberAdded            : () => ({ currentOrganization: S.currentOrganization(state) }),
        MemberRemoved          : () => ({ currentOrganization: S.currentOrganization(state) }),
        OrganizationUpdated    : () => ({ currentOrganization: S.currentOrganization(state) }),

        // User actions snapshot currentUser
        UserUpdated            : () => ({ currentUser: S.currentUser(state) }),

        // These don't need rollback (no optimistic update or local-only)
        OrganizationCreated    : () => ({}),
        OrganizationDeleted    : () => ({}),
        OrganizationSuspended  : () => ({}),
        UserCreated            : () => ({}),
        UserForgotten          : () => ({}),
        AuthenticationCompleted: () => ({}),

        // Data loading doesn't need rollback (initialization only)
        AllInitialDataLoaded     : () => ({}),

        // Blockface actions snapshot currentBlockfaceId for rollback
        BlockfaceCreated        : () => ({ currentBlockfaceId: S.currentBlockfaceId(state), blockfaces: S.blockfaces(state) }),
        BlockfaceSelected        : () => ({ currentBlockfaceId: S.currentBlockfaceId(state) }),
        BlockfaceSaved          : () => ({}),

        // Segment actions snapshot the current blockface for rollback
        SegmentUseUpdated       : () => ({ blockfaces: S.blockfaces(state) }),
        SegmentLengthUpdated    : () => ({ blockfaces: S.blockfaces(state) }),
        SegmentAdded             : () => ({ blockfaces: S.blockfaces(state) }),
        SegmentAddedLeft         : () => ({ blockfaces: S.blockfaces(state) }),
        SegmentsReplaced        : () => ({ blockfaces: S.blockfaces(state) }),
    })

/**
 * Restore state from snapshot (rollback)
 * Only dispatches if snapshot is non-empty
 *
 * @sig rollbackState :: Object -> void
 */
const rollbackState = snapshot => {
    if (!snapshot || Object.keys(snapshot).length === 0) return
    store.dispatch({ type: 'ROLLBACK_STATE', payload: snapshot })
}

// Debounce timer for blockface auto-save
// Only one blockface is selected at a time, so only one pending save
let timeoutId = null

// Call Action.BlockfaceSaved and clear pending timer
const saveBlockfaceImmediately = blockfaceId => {
    if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
    }

    const state = getState()
    const currentBlockface = S.blockface(state, blockfaceId)
    if (!currentBlockface) return console.warn(`Cannot save blockface ${blockfaceId}: not found in state`)

    post(Action.BlockfaceSaved(currentBlockface))
}

/*
 * Schedule a debounced save for a blockface
 * Clears any existing pending save and schedules a new one after 3 seconds
 * @sig debounceBlockfaceSave :: String -> void
 */
const debounceBlockfaceSave = blockfaceId => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => saveBlockfaceImmediately(blockfaceId), 3000)
}

/**
 * Get persistence strategy for action
 * Returns null if action is local-only (Redux only)
 *
 * @sig getPersistenceStrategy :: Action -> (Action -> Promise<void>)?
 */
// prettier-ignore
const getPersistenceStrategy = action =>
    action.match({
        // Organization actions persist to Firestore
        RoleChanged            : () => submitActionRequest,
        MemberAdded            : () => submitActionRequest,
        MemberRemoved          : () => submitActionRequest,
        OrganizationCreated    : () => submitActionRequest,
        OrganizationDeleted    : () => submitActionRequest,
        OrganizationSuspended  : () => submitActionRequest,
        OrganizationUpdated    : () => submitActionRequest,

        // User actions persist to Firestore
        UserCreated            : () => submitActionRequest,
        UserForgotten          : () => submitActionRequest,
        UserUpdated            : () => submitActionRequest,
        
        BlockfaceSaved          : () => submitActionRequest,
        
        // Auth is local-only (already persisted by Firebase Auth)
        AuthenticationCompleted: () => null,

        // Data loading is local-only (Redux initialization)
        AllInitialDataLoaded     : () => null,
        OrganizationSynced: () => null,
        BlockfacesSynced: () => null,

        // Blockface/Segment actions are local-only (no Firestore persistence yet)
        BlockfaceCreated        : () => null,
        BlockfaceSelected        : () => null,
        SegmentUseUpdated       : () => null,
        SegmentLengthUpdated    : () => null,
        SegmentAdded             : () => null,
        SegmentAddedLeft         : () => null,
        SegmentsReplaced        : () => null,
    })

const actionTriggersBlockfaceChange = action =>
    Action.SegmentUseUpdated.is(action) ||
    Action.SegmentLengthUpdated.is(action) ||
    Action.SegmentAdded.is(action) ||
    Action.SegmentAddedLeft.is(action) ||
    Action.SegmentsReplaced.is(action)

/**
 * Post a domain Action: authorize, update Redux, persist to Firestore
 * Uses optimistic updates with rollback on failure
 *
 * Phase 1: Validate and authorize
 * Phase 2: Capture state snapshot
 * Phase 3: Optimistic Redux update
 * Phase 3.5: debounce blockface saves
 * Phase 4: Persist to Firestore (async)
 * Phase 5: Rollback on failure with toast notification
 *
 * @sig post :: Action -> void
 * @throws {Error} If authorization fails or user/organization not loaded
 */
const post = action => {
    const handlePersistenceFailure = error => {
        console.error('Failed to persist action:', Action.toLog(action), error)

        // Phase 5: Rollback Redux state
        rollbackState(snapshot)

        // TODO: Replace with proper toast notification

        console.error(`Failed to save changes: ${error.message}`)
    }

    const checkAuthorization = () => {
        if (!S.currentUser(state)) throw new Error('Cannot execute command: currentUser not loaded')
        if (!S.currentOrganization(state)) throw new Error('Cannot execute command: currentOrganization not loaded')

        const actorRole = Organization.role(S.currentOrganization(state), S.currentUser(state).id)

        // Authorization check
        if (!Action.mayI(action, actorRole, S.currentUser(state).id))
            throw new Error(`Unauthorized: ${action.constructor.toString()}`)
    }

    if (!Action.is(action)) throw new Error('post requires an Action; found: ' + action)

    // Phase 1: Get current state and validate
    const state = getState()
    const previousBlockfaceId = S.currentBlockfaceId(state)

    // AllInitialDataLoaded is the ONLY action that bypasses authorization
    // It runs before currentUser/currentOrganization exist (it loads them)
    // All other actions MUST have currentUser loaded for authorization
    if (!Action.AllInitialDataLoaded.is(action)) checkAuthorization()

    // Phase 2: Capture state snapshot for rollback
    const snapshot = captureRollbackSnapshot(action, state)

    // Phase 3: Optimistic Redux update (always happens)
    store.dispatch({ type: action.constructor.toString(), payload: action })

    // Phase 3.5: debounce blockface saves
    // Any action that affects the current Blockface is debounced for 3 seconds before saving,
    // but if a new Blockface is selected then immediately save the previously-pending saves
    const newState = getState()
    const currentBlockfaceId = S.currentBlockfaceId(newState)
    const organizationId = S.currentOrganizationId(newState)
    const projectId = S.currentProjectId(newState)

    if (actionTriggersBlockfaceChange(action)) debounceBlockfaceSave(currentBlockfaceId) // reset 3-second timer
    if (previousBlockfaceId && Action.BlockfaceSelected.is(action)) saveBlockfaceImmediately(previousBlockfaceId)

    // Phase 4: Persist to backend (async, may fail)
    const persistenceStrategy = getPersistenceStrategy(action)
    if (persistenceStrategy) persistenceStrategy(action, organizationId, projectId).catch(handlePersistenceFailure)
}

export { post }
