import { createLogger } from '@graffio/logger'
import { onRequest } from 'firebase-functions/v2/https'
import { Action, ActionRequest } from '../../src/types/index.js'
import * as OH from './events/organization-handlers.js'
import * as UH from './events/user-handlers.js'
import { createFirestoreContext } from './firestore-context.js'

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
 *   - duplicate: Boolean (optional) - true if duplicate request detected
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
 *   Uses Write-First pattern with atomic create() to detect duplicates.
 *   IdempotencyKey becomes document ID, ensuring exactly-once processing.
 *   Concurrent duplicate requests fail atomically on create() with error code 6.
 *
 * Authentication:
 *   Firebase Auth token validation will be implemented in F110.5.
 *   Currently uses emulator bypass for development.
 */

// @sig sendJson :: (Response, Number, Object) -> Void
const sendJson = (res, statusCode, payload) => res.status(statusCode).json(payload)

/*
 * Response helpers - one for each status type
 * All responses follow consistent JSON format with status field
 */

// @sig sendValidationFailed :: (Response, String, String?) -> Void
const sendValidationFailed = (res, error, field) => {
    const payload = { status: 'validation-failed', error }
    if (field) payload.field = field
    return sendJson(res, 400, payload)
}

// @sig sendMethodNotAllowed :: (Response, String) -> Void
const sendMethodNotAllowed = (res, error) => sendJson(res, 405, { status: 'method-not-allowed', error })

// @sig sendCompleted :: (Response, String, Boolean?) -> Void
const sendCompleted = (res, processedAt, duplicate) => {
    const payload = { status: 'completed', processedAt }
    if (duplicate) payload.duplicate = true
    return sendJson(res, 200, payload)
}

// @sig sendFailed :: (Response, String) -> Void
const sendFailed = (res, error) => sendJson(res, 500, { status: 'failed', error })

/*
 * Validation functions - return error message or null
 * Called during request validation phase
 */

// @sig validateRequiredFields :: Object -> String?
const validateRequiredFields = body =>
    body.action && body.idempotencyKey && body.correlationId
        ? null
        : 'Missing required fields: action, idempotencyKey, correlationId'

// @sig validateNamespace :: Object -> String?

// @sig validateAction :: (Object, Logger) -> String?
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

// @sig validateRequest :: (Request, Response, Logger) -> Boolean
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

/*
 * Extraction functions - only called after validation passes
 * Extract values from validated request
 */

// @sig getActorId :: (Request) -> String
const getActorId = req =>
    // TODO (F110.5): Extract from Firebase Auth token
    // const token = req.headers.authorization?.split('Bearer ')[1]
    // const decodedToken = await admin.auth().verifyIdToken(token)
    // return decodedToken.uid

    // Emulator bypass
    req.body.actorId || 'usr_emulatorbypass'

// @sig validateActionRequest :: (Object, Logger) -> { actionRequest: ActionRequest } | { error: String, field: String }
const validateActionRequest = (rawActionRequest, logger) => {
    try {
        return { actionRequest: ActionRequest.from(rawActionRequest) }
    } catch (error) {
        // Action is valid (passed validateAction), so use Action.toLog to scrub PII
        const scrubbedRequest = { ...rawActionRequest, action: Action.toLog(rawActionRequest.action) }
        logger.error(error, { actionRequest: scrubbedRequest })
        return { error: error.message, field: error.field || 'action' }
    }
}

// @sig createActionRequestLogger :: (Logger, ActionRequest) -> Object
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
 * Maps action types to their corresponding handler functions.
 * Each handler applies the action's side effects to the system.
 * Uses taggedSum pattern matching for type-safe dispatch.
 * @sig dispatchToHandler :: (ActionRequest) -> Function
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
        UserDeleted:           () => UH.handleUserDeleted,
        UserForgotten:         () => UH.handleUserForgotten,
        RoleAssigned:          () => UH.handleRoleAssigned,
    })

// @sig submitActionRequestHandler :: (Request, Response) -> Promise<Void>
const submitActionRequestHandler = async (req, res) => {
    const logger = createLogger(process.env.FUNCTIONS_EMULATOR ? 'dev' : 'production')
    const startTime = Date.now()

    try {
        // Validate all inputs first
        if (!validateRequest(req, res, logger)) return

        // Extract validated values
        const namespace = process.env.FUNCTIONS_EMULATOR ? req.body.namespace : ''
        const actorId = getActorId(req)
        const action = Action.fromFirestore(req.body.action)
        const organizationId = action.organizationId || null
        const projectId = action.projectId || null

        // Build and validate ActionRequest
        const { id: subjectId, type: subjectType } = Action.getSubject(action)
        const { idempotencyKey, correlationId } = req.body

        // Use idempotencyKey as document ID (convert idm_ prefix to acr_)
        const actionRequestId = idempotencyKey.replace(/^idm_/, 'acr_')

        const rawActionRequest = {
            id: actionRequestId,
            action,
            actorId,
            subjectId,
            subjectType,
            organizationId,
            projectId,
            idempotencyKey,
            correlationId,
            status: 'pending',
            createdAt: new Date(),
            schemaVersion: 1,
        }

        const actionRequestResult = validateActionRequest(rawActionRequest, logger)
        if (actionRequestResult.error)
            return sendValidationFailed(res, actionRequestResult.error, actionRequestResult.field)

        const actionRequest = actionRequestResult.actionRequest
        logger.flowStart('┌─ Processing action request', { ...ActionRequest.toLog(actionRequest), namespace })

        // Create Firestore context and logger
        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const actionRequestLogger = createActionRequestLogger(logger, actionRequest)

        /*
         * Write-First idempotency pattern:
         * Atomically create pending action record using idempotencyKey as document ID.
         * If create() fails (error code 6), another request with same key already exists.
         * This ensures exactly-once processing even with concurrent duplicate requests.
         */
        const completedAction = ActionRequest.from({ ...actionRequest, status: 'pending', createdAt: new Date() })

        try {
            await fsContext.completedActions.create(completedAction)
        } catch (error) {
            // Duplicate detected - document already exists (another request used this idempotency key)
            if (error.code === 6 || error.message?.includes('already exists')) {
                const existing = await fsContext.completedActions.read(actionRequest.id)
                actionRequestLogger.flowStop('Processing skipped - duplicate idempotency key')
                return sendCompleted(res, existing.processedAt.toISOString(), true)
            }
            throw error
        }

        // Dispatch to handler (we won the race)
        const handler = dispatchToHandler(actionRequest)
        actionRequestLogger.flowStep(`Starting ${handler.name}`)
        await handler(actionRequestLogger, fsContext, actionRequest)
        actionRequestLogger.flowStep(`Finished ${handler.name}`)

        // Update to completed
        const processedAt = new Date()
        await fsContext.completedActions.update(actionRequest.id, { status: 'completed', processedAt })

        const durationMs = Date.now() - startTime
        actionRequestLogger.flowStop('└─ Processing completed', { durationMs }, '')

        // Return success
        return sendCompleted(res, processedAt.toISOString())
    } catch (error) {
        const durationMs = Date.now() - startTime
        logger.error(error, { durationMs })

        return sendFailed(res, error.message || 'Internal server error')
    }
}

// Export the HTTP function
const submitActionRequest = onRequest(submitActionRequestHandler)

export { submitActionRequest }
