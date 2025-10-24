import { createLogger } from '@graffio/logger'
import admin from 'firebase-admin'
import { onRequest } from 'firebase-functions/v2/https'
import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { Action, ActionRequest, FieldTypes } from '../../src/types/index.js'
import { createFirestoreContext } from './firestore-context.js'
import * as OH from './handlers/organization-handlers.js'
import * as UH from './handlers/user-handlers.js'

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

const sendUnauthorized = (res, error) => sendJson(res, 401, { status: 'unauthorized', error })

// ---------------------------------------------------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------------------------------------------------

const validateRequiredFields = body =>
    body.action && body.idempotencyKey && body.correlationId
        ? null
        : 'Missing required fields: action, idempotencyKey, correlationId'

const validateAction = (plainAction, logger) => {
    try {
        Action.fromFirestore(plainAction)
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
    error = process.env.FUNCTIONS_EMULATOR && !req.body.namespace ? 'namespace is required' : null
    if (error) {
        sendValidationFailed(res, error, 'namespace')
        return false
    }

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

// ---------------------------------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------------------------------

/*
 * The authorization header includes a `bearer: token` which we use to identify the sender of the ActionRequest
 * From that Auth user, we get the userId buried in its custom claims
 * @sig readUserIdFromAuthCustomClaims :: (HttpRequest, Logger) -> { userId: UserId } | { error: String }
 */
const readUserIdFromAuthCustomClaims = async (req, logger) => {
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
        const decoded = await admin.auth().verifyIdToken(token)
        const { userId } = decoded

        if (!userId || !FieldTypes.userId.test(userId)) return { error: 'Authorization token missing userId claim' }
        return { userId }
    } catch (error) {
        const message = getAuthErrorMessage(error)
        logger.error(new Error(message), { originalError: error.message, code: error.code })
        return { error: message }
    }
}

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
const dispatchToHandler = actionRequest =>
    actionRequest.action.match({
        OrganizationCreated:   () => OH.handleOrganizationCreated,
        OrganizationUpdated:   () => OH.handleOrganizationUpdated,
        OrganizationDeleted:   () => OH.handleOrganizationDeleted,
        OrganizationSuspended: () => OH.handleOrganizationSuspended,
        UserCreated:           () => UH.handleUserCreated,
        UserUpdated:           () => UH.handleUserUpdated,
        UserForgotten:         () => UH.handleUserForgotten,
        MemberAdded:           () => UH.handleMemberAdded,
        MemberRemoved:         () => UH.handleMemberRemoved,
        RoleChanged:           () => UH.handleRoleChanged,
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
    const action = Action.fromFirestore(req.body.action)
    const { organizationId, projectId } = action
    const { id: subjectId, type: subjectType } = Action.getSubject(action)
    const { idempotencyKey, correlationId } = req.body

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
    const handler = dispatchToHandler(actionRequest)
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

const submitActionRequestHandler = async (req, res) => {
    const logger = createLogger(process.env.FUNCTIONS_EMULATOR ? 'dev' : 'production')
    const startTime = Date.now()

    try {
        // Authentication first – reject missing/invalid tokens before other validation
        const { userId: actorId, error } = await readUserIdFromAuthCustomClaims(req, logger)
        if (error) return sendUnauthorized(res, error)

        // Validate all inputs first
        if (!validateRequest(req, res, logger)) return

        // create a raw object by enriching our parameters
        const params = enrichActionRequest(req)
        const { idempotencyKey, namespace, organizationId, projectId } = params
        const createdAt = FirestoreAdminFacade.serverTimestamp()
        const id = idempotencyKey.replace(/^idm_/, 'acr_')
        const rawActionRequest = { ...params, id, actorId, schemaVersion: 1, createdAt, processedAt: createdAt }

        // create an ActionRequest (or die) from the raw data
        const wrapper = convertToActionRequest(rawActionRequest, logger)
        if (wrapper.error) return sendValidationFailed(res, wrapper.error, wrapper.field)
        const actionRequest = wrapper.actionRequest

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
