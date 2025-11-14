// ABOUTME: Command execution layer for domain Actions
// ABOUTME: Handles authorization, Redux dispatch, Firestore persistence, and rollback

import { getAuth } from 'firebase/auth'
import { functionsUrl } from '../config/index.js'
import { store } from '../store/index.js'
import { Action, FieldTypes, Organization } from '../types/index.js'

/**
 * Get current user's Firebase Auth ID token
 * @sig getIdToken :: () -> Promise<String>
 */
const getIdToken = async () => {
    const auth = getAuth()
    if (!auth.currentUser) throw new Error('User must be authenticated to submit actions')

    return auth.currentUser.getIdToken()
}

/**
 * Submit an action to Firestore via HTTP Cloud Function
 * Private helper - only called from executeCommand
 *
 * @sig submitActionRequest :: Action -> Promise<void>
 * @throws {Error} If submission fails or action is invalid
 */
const submitActionRequest = async action => {
    const message = () =>
        `Failed to submit action: ${data.error || data.status || response.statusText} (HTTP ${response.status})`

    const token = await getIdToken()

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const payload = {
        action: Action.toFirestore(action),
        idempotencyKey: FieldTypes.newIdempotencyKey(),
        correlationId: FieldTypes.newCorrelationId(),
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
 *
 * @sig captureStateSnapshot :: (Action, State) -> Object
 */
const captureStateSnapshot = (action, state) =>
    action.match({
        // Organization member actions snapshot currentOrganization
        RoleChanged: () => ({ currentOrganization: state.currentOrganization }),
        MemberAdded: () => ({ currentOrganization: state.currentOrganization }),
        MemberRemoved: () => ({ currentOrganization: state.currentOrganization }),
        OrganizationUpdated: () => ({ currentOrganization: state.currentOrganization }),

        // User actions snapshot currentUser
        UserUpdated: () => ({ currentUser: state.currentUser }),

        // These don't need rollback (no optimistic update or local-only)
        OrganizationCreated: () => ({}),
        OrganizationDeleted: () => ({}),
        OrganizationSuspended: () => ({}),
        UserCreated: () => ({}),
        UserForgotten: () => ({}),
        AuthenticationCompleted: () => ({}),

        // Data loading doesn't need rollback (initialization only)
        LoadAllInitialData: () => ({}),

        // Blockface actions snapshot currentBlockfaceId for rollback
        CreateBlockface: () => ({ currentBlockfaceId: state.currentBlockfaceId, blockfaces: state.blockfaces }),
        SelectBlockface: () => ({ currentBlockfaceId: state.currentBlockfaceId }),

        // Segment actions snapshot the current blockface for rollback
        UpdateSegmentUse: () => ({ blockfaces: state.blockfaces }),
        UpdateSegmentLength: () => ({ blockfaces: state.blockfaces }),
        AddSegment: () => ({ blockfaces: state.blockfaces }),
        AddSegmentLeft: () => ({ blockfaces: state.blockfaces }),
        ReplaceSegments: () => ({ blockfaces: state.blockfaces }),
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

/**
 * Get persistence strategy for action
 * Returns null if action is local-only (Redux only)
 *
 * @sig getPersistenceStrategy :: Action -> (Action -> Promise<void>)?
 */
const getPersistenceStrategy = action =>
    action.match({
        // Organization actions persist to Firestore
        RoleChanged: () => submitActionRequest,
        MemberAdded: () => submitActionRequest,
        MemberRemoved: () => submitActionRequest,
        OrganizationCreated: () => submitActionRequest,
        OrganizationDeleted: () => submitActionRequest,
        OrganizationSuspended: () => submitActionRequest,
        OrganizationUpdated: () => submitActionRequest,

        // User actions persist to Firestore
        UserCreated: () => submitActionRequest,
        UserForgotten: () => submitActionRequest,
        UserUpdated: () => submitActionRequest,

        // Auth is local-only (already persisted by Firebase Auth)
        AuthenticationCompleted: () => null,

        // Data loading is local-only (Redux initialization)
        LoadAllInitialData: () => null,

        // Blockface/Segment actions are local-only (no Firestore persistence yet)
        CreateBlockface: () => null,
        SelectBlockface: () => null,
        UpdateSegmentUse: () => null,
        UpdateSegmentLength: () => null,
        AddSegment: () => null,
        AddSegmentLeft: () => null,
        ReplaceSegments: () => null,
    })

/**
 * Post a domain Action: authorize, update Redux, persist to Firestore
 * Uses optimistic updates with rollback on failure
 *
 * Phase 1: Validate and authorize
 * Phase 2: Capture state snapshot
 * Phase 3: Optimistic Redux update
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
        // eslint-disable-next-line no-undef
        alert(`Failed to save changes: ${error.message}`)
    }

    const checkAuthorization = () => {
        if (!state.currentUser) throw new Error('Cannot execute command: currentUser not loaded')
        if (!state.currentOrganization) throw new Error('Cannot execute command: currentOrganization not loaded')

        const actorRole = Organization.role(state.currentOrganization, state.currentUser.id)

        // Authorization check
        if (!Action.mayI(action, actorRole, state.currentUser.id))
            throw new Error(`Unauthorized: ${action.constructor.toString()}`)
    }

    if (!Action.is(action)) throw new Error('post requires an Action; found: ' + action)

    // Phase 1: Get current state and validate
    const state = store.getState()

    // LoadAllInitialData is the ONLY action that bypasses authorization
    // It runs before currentUser/currentOrganization exist (it loads them)
    // All other actions MUST have currentUser loaded for authorization
    if (!Action.LoadAllInitialData.is(action)) checkAuthorization()

    // Phase 2: Capture state snapshot for rollback
    const snapshot = captureStateSnapshot(action, state)

    // Phase 3: Optimistic Redux update (always happens)
    store.dispatch({ type: action.constructor.toString(), payload: action })

    // Phase 4: Persist to backend (async, may fail)
    const persistenceStrategy = getPersistenceStrategy(action)
    if (persistenceStrategy) persistenceStrategy(action).catch(handlePersistenceFailure)
}

export { post }
