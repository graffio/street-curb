import { createLogger } from '@graffio/logger'
import admin from 'firebase-admin'
import { onRequest } from 'firebase-functions/v2/https'
import { Action, ActionRequest, FieldTypes } from '../../src/types/index.js'
import { createFirestoreContext } from './firestore-admin-context.js'
import handleAuthenticationCompleted from './handlers/handle-authentication-completed.js'
import handleBlockfaceSaved from './handlers/handle-blockface-saved.js'
import handleMemberAdded from './handlers/handle-member-added.js'
import handleMemberRemoved from './handlers/handle-member-removed.js'
import handleOrganizationCreated from './handlers/handle-organization-created.js'
import handleOrganizationDeleted from './handlers/handle-organization-deleted.js'
import handleOrganizationSuspended from './handlers/handle-organization-suspended.js'
import handleOrganizationUpdated from './handlers/handle-organization-updated.js'
import handleRoleChanged from './handlers/handle-role-changed.js'
import handleUserCreated from './handlers/handle-user-created.js'
import handleUserForgotten from './handlers/handle-user-forgotten.js'
import handleUserUpdated from './handlers/handle-user-updated.js'

/*
 * HTTP endpoint for submitting action requests.
 *
 * Endpoint: POST /submitActionRequest
 *
 * Request payload:
 *   - action: Action type (OrganizationCreated, UserCreated, etc.)
 *   - idempotencyKey: String - client-generated key (idm_<cuid12>)
 *   - correlationId: String - client-generated tracing ID (cor_<cuid12>)
 *   - namespace: String (optional, emulator only) - test namespace for isolation
 *
 * Success response (200):
 *   - status: 'completed'
 *   - processedAt: String (ISO timestamp)
 *
 * Duplicate response (409):
 *   - status: 'duplicate'
 *   - message: 'Already processed'
 *   - processedAt: String (ISO timestamp from original request)
 *
 * Error responses:
 *   - 400: Validation failed
 *   - 405: Method not allowed
 *   - 500: Server error
 *
 * Server enrichment:
 *   - Extracts actorId from Firebase Auth token (or emulator bypass)
 *   - Derives organizationId from action
 *   - Derives subjectId and subjectType using Action.getSubject()
 *   - Adds server timestamps (createdAt, processedAt)
 *   - Converts idempotencyKey to document ID (idm_ -> acr_)
 *
 * Idempotency:
 *   Uses Transaction-based pattern with atomic duplicate detection.
 *   IdempotencyKey becomes document ID, ensuring exactly-once processing.
 *   duplicate requests return HTTP 409 with processedAt from original request.
 *
 * Authentication:
 *   Firebase Auth token validation will be implemented in F110.5.
 *   Currently uses emulator bypass for development.
 */

// ---------------------------------------------------------------------------------------------------------------------
// HTTP responses
// ---------------------------------------------------------------------------------------------------------------------

const sendJson = (res, statusCode, payload) => res.status(statusCode).json(payload)

/*
 * Response helpers - one for each status type
 * All responses follow consistent JSON format with status field
 */

const sendValidationFailed = (res, error, field) => {
    const payload = { status: 'validation-failed', error }
    if (field) payload.field = field
    return sendJson(res, 400, payload)
}

const sendMethodNotAllowed = (res, error) => sendJson(res, 405, { status: 'method-not-allowed', error })

const sendCompleted = (res, processedAt) => {
    const payload = { status: 'completed', processedAt }
    return sendJson(res, 200, payload)
}

const sendFailed = (res, errorMessage, handlerName = null) => {
    const response = { status: 'error', message: 'Action processing failed', error: errorMessage }
    if (handlerName) response.handler = handlerName
    return sendJson(res, 500, response)
}

const sendDuplicate = (res, result) =>
    sendJson(res, 409, { status: 'duplicate', message: 'Already processed', processedAt: result.processedAt })

const sendUnauthorized = (logger, res, error, extraData = {}) => {
    logger.error(new Error(error), extraData)
    sendJson(res, 401, { status: 'unauthorized', error })
}

// ---------------------------------------------------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------------------------------------------------

const validateRequiredFields = body =>
    body.action && body.idempotencyKey && body.correlationId
        ? null
        : 'Missing required fields: action, idempotencyKey, correlationId'

// @sig decodeTimestamp :: (String | Timestamp) -> Date
// Decode ISO string from HTTP JSON to Date, or Firestore Timestamp to Date
const decodeTimestamp = timestamp => {
    if (timestamp && typeof timestamp.toDate === 'function') return timestamp.toDate()
    if (typeof timestamp === 'string') return new Date(timestamp)
    return timestamp
}

const validateAction = (plainAction, logger) => {
    try {
        Action.fromFirestore(plainAction, decodeTimestamp)
        return null
    } catch (error) {
        // Can't use Action.toLog since construction failed - redact PII while preserving structure for debugging
        logger.error(error, { action: Action.redactPii(plainAction) })
        return error.message
    }
}

const validateRequest = (req, res, logger) => {
    let error = req.method === 'POST' ? null : 'Only POST requests are allowed'
    if (error) {
        sendMethodNotAllowed(res, error)
        return false
    }

    // Require request body to be a plain object (not array, null, or primitive)
    if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
        sendValidationFailed(res, 'Request body must be a JSON object')
        return false
    }

    error = validateRequiredFields(req.body)
    if (error) {
        sendValidationFailed(res, error)
        return false
    }

    // Namespace (emulator only)
    if (typeof process.env.FUNCTIONS_EMULATOR && !req.body.namespace) req.body.namespace = ''

    // well-formed action
    error = validateAction(req.body.action, logger)
    if (error) {
        sendValidationFailed(res, error, 'action')
        return false
    }

    return true
}

const convertToActionRequest = (rawActionRequest, logger) => {
    try {
        return { actionRequest: ActionRequest.from(rawActionRequest) }
    } catch (error) {
        // Action is valid (passed validateAction), so use Action.toLog to scrub PII
        const scrubbedRequest = { ...rawActionRequest, action: Action.toLog(rawActionRequest.action) }
        logger.error(error, { actionRequest: scrubbedRequest })
        return { error: error.message, field: error.field || 'action' }
    }
}

/*
 * Verifies auth token and extracts userId
 * @sig verifyAuthToken :: (HttpRequest, Logger) -> { userId: UserId } | { error: String }
 */
const verifyAuthToken = async (logger, req) => {
    const getAuthErrorMessage = error => {
        if (error.code === 'auth/id-token-expired') return 'Authorization token has expired'
        if (error.code === 'auth/argument-error') return 'Authorization token is malformed'
        if (error.code === 'auth/invalid-id-token') return 'Authorization token is invalid'
        if (error.code === 'auth/id-token-revoked') return 'Authorization token has been revoked'
        return 'Invalid or expired Authorization token'
    }

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) return { error: 'Missing or invalid Authorization header' }

    const token = authHeader.slice('Bearer '.length).trim()
    if (!token) return { error: 'Authorization token is required' }

    try {
        const { uid } = await admin.auth().verifyIdToken(token)
        return FieldTypes.userId.test(uid)
            ? { userId: uid }
            : { error: 'Malformed userId; uid not properly set to a userId' }
    } catch (error) {
        const message = getAuthErrorMessage(error)
        logger.error(new Error(message), { originalError: error.message, code: error.code })
        return { error: message }
    }
}

const isUserAction = action =>
    Action.UserCreated.is(action) ||
    Action.UserUpdated.is(action) ||
    Action.UserForgotten.is(action) ||
    Action.AuthenticationCompleted.is(action)
const isOrganizationAction = action =>
    Action.OrganizationCreated.is(action) ||
    Action.OrganizationUpdated.is(action) ||
    Action.OrganizationDeleted.is(action) ||
    Action.OrganizationSuspended.is(action) ||
    Action.MemberAdded.is(action) ||
    Action.MemberRemoved.is(action) ||
    Action.RoleChanged.is(action)
/**
 * Validates that user has access to requested organization and project
 * @sig validateTenantAccess :: (ActionRequest, Object) -> String | undefined
 */
const validateTenantAccess = (actionRequest, allowedOrganizations) => {
    const { organizationId, projectId, action, actorId } = actionRequest

    // Special case: there are NO allowedOrganizations. Most actions should fail, but some have to succeed,
    // or we get into a chicken-and-egg situation
    const noAllowedOrganizations = Object.keys(allowedOrganizations).length === 0
    if (noAllowedOrganizations) {
        if (isUserAction(action)) return undefined
        if (Action.AuthenticationCompleted.is(action)) return undefined
        if (Action.OrganizationCreated.is(action)) return undefined // Users can create their first org
        return `User ${actorId} has no access to ${organizationId} for ${action.toString()}`
    }

    // If request doesn't specify organizationId, skip validation
    // (some actions like UserUpdated don't require org context)
    if (!organizationId) {
        if (Action.UserUpdated.is(action)) return undefined
        if (Action.UserForgotten.is(action)) return undefined
        return `Access denied: no organizationId`
    }

    // Allow OrganizationCreated - user is creating a new org, so they won't have access yet
    if (Action.OrganizationCreated.is(action)) return undefined

    // Validate organization access
    const organizationAccess = allowedOrganizations[organizationId]
    if (!organizationAccess) return `Access denied to organization ${organizationId}`

    // Validate projectId is present for project-level actions
    const requiresProjectId = !isOrganizationAction(action) && !isUserAction(action)
    if (requiresProjectId && !projectId) return `Access denied: projectId required for ${action['@@tagName']}`

    // Note: We don't validate specific projectId access here because user.organizations
    // doesn't contain projects list. If user is member of org, they can access any project
    // in that org. Project-specific permissions would require reading org document.

    return undefined
}

// ---------------------------------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const createActionRequestLogger = (logger, actionRequest) => {
    const interesting = () => ActionRequest.toLog(actionRequest)

    return {
        flowStart: (message, extraData = {}, pr = '┌─ ') => logger.flowStart(pr + message, { ...interesting(), ...extraData }),
        flowStep:  (message, extraData = {}, pr = '├─ ') => logger.flowStep( pr + message, { ...interesting(), ...extraData }),
        flowStop:  (message, extraData = {}, pr = '└─ ') => logger.flowStop( pr + message, { ...interesting(), ...extraData }),
        error:     (error,   extraData = {}            ) => logger.error(    error,        { ...interesting(), ...extraData }),
    }
}

/*
 * Handler dispatch - maps Action types to handler functions
 */
// prettier-ignore
const handlerForActionRequest = actionRequest =>
    actionRequest.action.match({
        OrganizationCreated    : () => handleOrganizationCreated,
        OrganizationUpdated    : () => handleOrganizationUpdated,
        OrganizationDeleted    : () => handleOrganizationDeleted,
        OrganizationSuspended  : () => handleOrganizationSuspended,
        UserCreated            : () => handleUserCreated,
        UserUpdated            : () => handleUserUpdated,
        UserForgotten          : () => handleUserForgotten,
        MemberAdded            : () => handleMemberAdded,
        MemberRemoved          : () => handleMemberRemoved,
        RoleChanged            : () => handleRoleChanged,
        AuthenticationCompleted: () => handleAuthenticationCompleted,
        AllInitialDataLoaded   : () => { throw new Error('AllInitialDataLoaded should never reach server (local-only action)') },
        BlockfaceCreated       : () => { throw new Error('BlockfaceCreated should never reach server (local-only action)') },
        BlockfaceSelected      : () => { throw new Error('BlockfaceSelected should never reach server (local-only action)') },
        BlockfaceSaved         : () => handleBlockfaceSaved,
        SegmentUseUpdated      : () => { throw new Error('SegmentUseUpdated should never reach server (local-only action)') },
        SegmentLengthUpdated   : () => { throw new Error('SegmentLengthUpdated should never reach server (local-only action)') },
        SegmentAdded           : () => { throw new Error('SegmentAdded should never reach server (local-only action)') },
        SegmentAddedLeft       : () => { throw new Error('SegmentAddedLeft should never reach server (local-only action)') },
        SegmentsReplaced       : () => { throw new Error('SegmentsReplaced should never reach server (local-only action)') },
    })

/*
 * @sig enrichActionRequest :: Request -> {
 *      namespace: String,
 *      action: Action,
 *      organizationId: String?,
 *      projectId: String?,
 *
 *      // SOC2 fields
 *      subjectId: String,
 *      subjectType: String,
 *      idempotencyKey: String,
 *      correlationId: String
 * }
 */
const enrichActionRequest = req => {
    const namespace = process.env.FUNCTIONS_EMULATOR ? req.body.namespace : ''
    const action = Action.fromFirestore(req.body.action, decodeTimestamp)
    const { organizationId, projectId, idempotencyKey, correlationId } = req.body
    const { id: subjectId, type: subjectType } = Action.getSubject(action, organizationId)

    return { namespace, action, organizationId, projectId, subjectId, subjectType, idempotencyKey, correlationId }
}

/*
 * Send the ActionRequest to a handler
 * @sig handleInTransaction :: (ActionRequest, FirestoreContext, Logger) -> Promise<Result>
 *  Result = {
 *      isDuplicate : Boolean,  // IFF idempotentId was already used
 *      processedAt : String?,  // IFF isDuplicate
 *      errorMessage: String?,  // IFF error
 *      handlerName : String?   // IFF error
 *  }
 *
 */
const handleInTransaction = async (actionRequest, txContext, logger) => {
    const actionRequestLogger = createActionRequestLogger(logger, actionRequest)

    // isDuplicate check using readOrNull
    const existing = await txContext.completedActions.readOrNull(actionRequest.id)
    if (existing) {
        actionRequestLogger.flowStop('Processing skipped - duplicate idempotency key')
        return { isDuplicate: true, processedAt: existing.processedAt.toISOString() }
    }

    // Dispatch to handler
    const handler = handlerForActionRequest(actionRequest)
    actionRequestLogger.flowStep(`Starting ${handler.name}`)

    try {
        await handler(actionRequestLogger, txContext, actionRequest)
        actionRequestLogger.flowStep(`Finished ${handler.name}`)
    } catch (error) {
        // Handler failed - transaction will roll back automatically
        actionRequestLogger.error(error, { handlerName: handler.name })
        actionRequestLogger.flowStop(`Handler ${handler.name} failed`)

        // Return error info for HTTP response
        return { errorMessage: error.message, handlerName: handler.name }
    }

    // Single write with server timestamps
    await txContext.completedActions.create(actionRequest)

    // Success: return nothing (processedAt read after commit)
    return { isDuplicate: false }
}

const checkRole = async (fsContext, actionRequest) => {
    const { organizationId, action, actorId } = actionRequest

    // an actor can update or forget *only* themselves
    if (Action.UserUpdated.is(action))
        return actorId === action.userId ? undefined : `User ${actorId} trying to update user ${action.userId}`
    if (Action.UserForgotten.is(action))
        return actorId === action.userId ? undefined : `User ${actorId} trying to forget user ${action.userId}`

    // UserCreated: Allow system actor (PasscodeVerified handler) or emulator mode (tests)
    // Real-life flow: Client → PasscodeVerified → handlePasscodeVerified → UserCreated
    // PasscodeVerified sets actorId='system' when creating new users
    if (Action.UserCreated.is(action)) {
        const isSystemActor = actorId === 'system'
        const isEmulator = process.env.FUNCTIONS_EMULATOR

        if (isSystemActor || isEmulator) return
        return `UserCreated disallowed for ${actorId}`
    }

    // OrganizationCreated: Check one-org-per-user limit
    if (Action.OrganizationCreated.is(action)) {
        const user = await fsContext.users.read(actorId)
        const existingOrgs = Object.keys(user.organizations || {})

        // two allowed
        return existingOrgs.length < 2 ? undefined : `User ${actorId} can't create another organization`
    }

    // All other actions require org membership
    if (!organizationId) return `Action ${action['@@tagName']} requires an organizationId`

    const organization = await fsContext.organizations.read(organizationId)
    const actorAsMember = organization.members[actorId]
    if (!actorAsMember) return `The actor ${actorId} is not a member of organization ${organizationId}`
    if (actorAsMember.removedAt) return `The actor ${actorId} was removed from organization ${organizationId}`

    if (!Action.mayI(action, actorAsMember.role, actorId))
        return `${actorId} with role ${actorAsMember.role} may not perform ${action['@@tagName']}`
}

const submitActionRequestHandler = async (req, res) => {
    const logger = createLogger(process.env.FUNCTIONS_EMULATOR ? 'dev' : 'production')
    const startTime = Date.now()

    try {
        // Validate all inputs first
        if (!validateRequest(req, res, logger)) return

        // Authentication first – reject missing/invalid tokens before other validation
        const { userId: actorId, error: authError } = await verifyAuthToken(logger, req)
        if (authError) return sendUnauthorized(logger, res, authError)

        // create a raw object by enriching our parameters
        const params = enrichActionRequest(req)
        const { idempotencyKey, namespace, organizationId, projectId } = params
        const createdAt = new Date()
        const id = idempotencyKey.replace(/^idm_/, 'acr_')
        const rawActionRequest = { ...params, id, actorId, schemaVersion: 1, createdAt, processedAt: createdAt }

        // create an ActionRequest (or die) from the raw data
        const wrapper = convertToActionRequest(rawActionRequest, logger)
        if (wrapper.error) return sendValidationFailed(res, wrapper.error, wrapper.field)
        const actionRequest = wrapper.actionRequest

        // Read user document to get organization memberships for tenant validation
        // Skip for UserCreated - user document doesn't exist yet
        let allowedOrganizations = {}
        if (!Action.UserCreated.is(actionRequest.action)) {
            const transactionlessContext = createFirestoreContext(namespace, null, null, null)
            const user = await transactionlessContext.users.read(actorId)
            allowedOrganizations = user.organizations || {}
        }

        // Tenant access validation – ensure user has access to requested organization/project
        const tenantError = validateTenantAccess(actionRequest, allowedOrganizations)
        if (tenantError) return sendUnauthorized(logger, res, tenantError, { action: actionRequest.action })

        const roleError = await checkRole(createFirestoreContext(namespace, organizationId, projectId), actionRequest)
        if (roleError) return sendUnauthorized(logger, res, roleError)

        logger.flowStart('┌─ Processing action request', { ...ActionRequest.toLog(actionRequest), namespace }, '')

        // call the handler in a transaction
        const result = await admin.firestore().runTransaction(async tx => {
            const txContext = createFirestoreContext(namespace, organizationId, projectId, tx)
            return await handleInTransaction(actionRequest, txContext, logger)
        })

        if (result.isDuplicate) return sendDuplicate(res, result)
        if (result.errorMessage) return sendFailed(res, result.errorMessage, result.handlerName)

        // write our SOC2 record
        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const completed = await fsContext.completedActions.readOrNull(actionRequest.id)

        // If null, transaction failed/rolled back - return error
        if (!completed) {
            logger.error(new Error('Transaction completed but action request not found'))
            return sendFailed(res, 'Transaction failed - action request not persisted')
        }

        logger.flowStop('└─ Processing completed', { durationMs: Date.now() - startTime }, '')
        return sendCompleted(res, completed.processedAt.toISOString())
    } catch (error) {
        const durationMs = Date.now() - startTime
        logger.error(error, { durationMs })
        return sendFailed(res, error.message || 'Internal server error')
    }
}

// Export the HTTP function
const submitActionRequest = onRequest(submitActionRequestHandler)

export { submitActionRequest }
