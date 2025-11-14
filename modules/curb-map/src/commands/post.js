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
 * Capture current state for potential rollback
 * Returns a snapshot of the state that can be used to restore if persistence fails
 *
 * @sig captureStateSnapshot :: () -> Object
 */
const captureStateSnapshot = () => {
    const state = store.getState()
    return {
        currentOrganization: state.currentOrganization,
        // Add other state slices as needed when more commands are added
    }
}

/**
 * Restore state from snapshot (rollback)
 * Dispatches actions to restore previous state
 *
 * @sig rollbackState :: Object -> void
 */
const rollbackState = snapshot => {
    // For now, just dispatch a redux action to restore the organization
    // In the future, this could be more sophisticated
    store.dispatch({ type: 'ROLLBACK_STATE', payload: snapshot })
}

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
    const handleSubmitActionError = error => {
        console.error('Failed to persist action to Firestore:', Action.toLog(action), error)

        // Phase 5: Rollback Redux state
        rollbackState(snapshot)

        // TODO: Show toast notification to user
        // For now, just alert (replace with proper toast system later)
        // eslint-disable-next-line no-undef
        alert(`Failed to save changes: ${error.message}`)
    }

    const state = store.getState()
    const currentUser = state.currentUser
    const currentOrganization = state.currentOrganization

    if (!currentUser) throw new Error('Cannot execute command: currentUser not loaded')
    if (!currentOrganization) throw new Error('Cannot execute command: currentOrganization not loaded')
    if (!Action.is(action)) throw new Error('post requires a Action; found: ' + action)

    const actorRole = Organization.role(currentOrganization, currentUser.id)

    // Authorization check
    if (!Action.mayI(action, actorRole, currentUser.id))
        throw new Error(`Unauthorized: ${action.constructor.toString()}`)

    const snapshot = captureStateSnapshot()
    store.dispatch({ type: action.constructor.toString(), payload: action })
    submitActionRequest(action).catch(handleSubmitActionError)
}

export { post }
