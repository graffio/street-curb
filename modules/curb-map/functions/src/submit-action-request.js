// ABOUTME: HTTP endpoint for submitting action requests with validation and authorization
// ABOUTME: Validates metadata inside transaction, checks permissions, executes handlers atomically

import { path } from '@graffio/functional'
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
import handleOrganizationUpdated from './handlers/handle-organization-updated.js'
import handleRoleChanged from './handlers/handle-role-changed.js'
import handleUserCreated from './handlers/handle-user-created.js'
import handleUserForgotten from './handlers/handle-user-forgotten.js'
import handleUserUpdated from './handlers/handle-user-updated.js'

// ---------------------------------------------------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------------------------------------------------

// @sig decodeTimestamp :: (String | Timestamp) -> Date
const decodeTimestamp = timestamp => {
    if (timestamp && typeof timestamp.toDate === 'function') return timestamp.toDate()
    if (typeof timestamp === 'string') return new Date(timestamp)
    return timestamp
}

const throwError = (message, name, statusCode) => {
    const error = new Error(message)
    error.name = name
    error.statusCode = statusCode
    throw error
}

const throwValidationError = message => throwError(message, 'ValidationError', 400)
const throwAuthorizationError = message => throwError(message, 'AuthorizationError', 401)
const throwMethodNotAllowedError = message => throwError(message, 'MethodNotAllowedError', 405)
const throwDuplicateRequestError = message => throwError(message, 'DuplicateRequestError', 409)
const throwMetadataSpoofingError = message => throwError(message, 'MetadataSpoofingError', 500)

// ---------------------------------------------------------------------------------------------------------------------
// Validations
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Must be a `POST`; have all required fields, include a valid Action
 */
const validateRequestParameters = req => {
    const { body, method } = req

    if (method !== 'POST') throwMethodNotAllowedError('Only POST requests are allowed')
    if (typeof body !== 'object' || body === null || Array.isArray(body))
        throwValidationError('Request body must be a JSON object')

    const { action, idempotencyKey, correlationId } = body
    if (!action || !idempotencyKey || !correlationId)
        throwValidationError('Missing required fields: action, idempotencyKey, correlationId')

    try {
        Action.fromFirestore(action, decodeTimestamp)
    } catch (error) {
        throwValidationError(error.message)
    }
}

const buildActionRequest = (req, actorId) => {
    try {
        const action = Action.fromFirestore(req.body.action, decodeTimestamp)
        const { organizationId, projectId, idempotencyKey, correlationId } = req.body
        const { id: subjectId, type: subjectType } = Action.getSubject(action, organizationId)

        const rawActionRequest = {
            // from authenticated user
            actorId,

            // generated from request body
            action,

            // from request body
            organizationId,
            projectId,
            idempotencyKey,
            correlationId,

            // from Action's getSubject
            subjectId,
            subjectType,

            // generated on demand
            id: idempotencyKey.replace(/^idm_/, 'acr_'),
            createdAt: new Date(),
            processedAt: new Date(),

            // current version
            schemaVersion: 1,
        }

        return ActionRequest.from(rawActionRequest)
    } catch (error) {
        throwValidationError(error.message)
    }
}

const authenticate = async req => {
    const getAuthErrorMessage = error => {
        if (error.code === 'auth/id-token-expired') return 'Authorization token has expired'
        if (error.code === 'auth/argument-error') return 'Authorization token is malformed'
        if (error.code === 'auth/invalid-id-token') return 'Authorization token is invalid'
        if (error.code === 'auth/id-token-revoked') return 'Authorization token has been revoked'
        return 'Invalid or expired Authorization token'
    }

    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) throwAuthorizationError('Missing or invalid Authorization header')
    const token = authHeader.slice('Bearer '.length).trim()
    if (!token) throwAuthorizationError('Authorization token is required')

    try {
        const { uid } = await admin.auth().verifyIdToken(token)
        if (!FieldTypes.userId.test(uid)) throwAuthorizationError(`Malformed uid ${uid} is not a valid userId`)
        return uid
    } catch (error) {
        if (error.name === 'AuthorizationError') throw error // ie. a malformed uid error we just generated
        throwAuthorizationError(getAuthErrorMessage(error))
    }
}

const getDocumentId = (actionRequest, idPath) => {
    const value = path(idPath, actionRequest)
    if (value === undefined) throw new Error(`Invalid path: ${idPath}`)
    return value
}

// ---------------------------------------------------------------------------------------------------------------------
// Authorization strategies
// ---------------------------------------------------------------------------------------------------------------------

const authStrategies = {
    requireSelfOnly: (action, { actor }) => {
        if (action.userId !== actor.id) throwAuthorizationError('Can only modify own user')
    },

    requireActorIsOrganizationMember: (action, { actor, organizationId }) => {
        const membership = actor.organizations[organizationId]
        if (!membership) throwAuthorizationError(`Access denied to organization ${organizationId}`)
        if (!Action.mayI(action, membership.role, actor.id))
            throwAuthorizationError(`${actor.id} with role ${membership.role} may not perform ${action.toString()}`)
    },

    requireOrganizationLimit: (action, { actor }) => {
        const organizationCount = actor.organizations.length
        if (organizationCount >= 2) throwAuthorizationError('Cannot create more than 2 organizations')
    },

    requireSystem: (action, ctx) => {
        const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true'
        if (!isEmulator) throwAuthorizationError('UserCreated only allowed in emulator')
    },

    // No restrictions
    allowAll: (action, ctx) => {},
}

// ---------------------------------------------------------------------------------------------------------------------
// Metadata validation
// ---------------------------------------------------------------------------------------------------------------------

const readExistingDocuments = async (fsContext, metadata, actionRequest) => {
    const existingDocs = {}

    for (const writeTo of metadata.writesTo) {
        const { collection, path } = writeTo
        const docId = getDocumentId(actionRequest, path) // pull the existing doc's id from the current actionRequest
        existingDocs[docId] = await fsContext[collection].readOrNull(docId)
    }

    return existingDocs
}

const validateMetadata = (actionRequest, metadata, existingDocs) => {
    // prettier-ignore
    const validateCreate = doc => {
        if (doc.createdBy !== actorId) throwMetadataSpoofingError(`Invalid createdBy: expected ${actorId}, got ${doc.createdBy}`)
        if (doc.updatedBy !== actorId) throwMetadataSpoofingError(`Invalid updatedBy: expected ${actorId}, got ${doc.updatedBy}`)

        const date = new Date()
        const createdAge = date - doc.createdAt
        const updatedAge = date - doc.updatedAt
        const isLegalCreatedAt = createdAge > 0 && createdAge < MAXIMUM_ALLOWED_AGE
        const isLegalUpdatedAt = updatedAge > 0 && updatedAge < MAXIMUM_ALLOWED_AGE

        if (!isLegalCreatedAt) throwMetadataSpoofingError(`Invalid createdAt: timestamp must be recent (server-generated)`)
        if (!isLegalUpdatedAt) throwMetadataSpoofingError(`Invalid updatedAt: timestamp must be recent (server-generated)`)}

    // prettier-ignore
    const validateUpdate = (doc, alreadyExists) => {
        const updatedAge = new Date() - doc.updatedAt
       
        const createdByMatches = doc.createdBy === alreadyExists.createdBy
        const createdAtMatches = doc.createdAt.getTime() === alreadyExists.createdAt.getTime()
        const isLegalUpdatedBy = doc.updatedBy === actorId
        const isLegalUpdatedAt = updatedAge > 0 && updatedAge < MAXIMUM_ALLOWED_AGE
        
        if (!createdByMatches) throwMetadataSpoofingError(`Cannot modify createdBy (existing: ${alreadyExists.createdBy}, provided: ${doc.createdBy})`)
        if (!createdAtMatches) throwMetadataSpoofingError(`Cannot modify createdAt`)
        if (!isLegalUpdatedBy) throwMetadataSpoofingError(`Invalid updatedBy: expected ${actorId}, got ${doc.updatedBy}`)
        if (!isLegalUpdatedAt) throwMetadataSpoofingError(`Invalid updatedAt: timestamp must be recent (server-generated)`)
    }

    const validateCreateOrUpdate = writeTo => {
        // get the previous doc using the id found at writeTo.path in the actionRequest
        const docId = path(writeTo.path, actionRequest)
        const previousValue = existingDocs[docId]

        // get the current doc from directly in the actionRequest
        // (Assume the current document is the parent of the idPath, e.g., 'action.blockface.id' -> 'action.blockface')
        const currentDocPath = writeTo.path.replace(/\.id$/, '')
        const currentValue = path(currentDocPath, actionRequest)

        previousValue ? validateUpdate(currentValue, previousValue) : validateCreate(currentValue)
    }

    const MAXIMUM_ALLOWED_AGE = 60 * 1000 // allow time for debouncing
    const { actorId, action } = actionRequest

    metadata.writesTo.forEach(validateCreateOrUpdate)

    // Run custom validateInput if provided (will throw ValidationError if fails)
    if (metadata.validateInput) metadata.validateInput(action, actionRequest, existingDocs)
}

// ---------------------------------------------------------------------------------------------------------------------
// Handler dispatch
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const handlerForActionRequest = actionRequest =>
    actionRequest.action.match({
        AuthenticationCompleted: () => handleAuthenticationCompleted,
        MemberAdded            : () => handleMemberAdded,
        MemberRemoved          : () => handleMemberRemoved,
        OrganizationCreated    : () => handleOrganizationCreated,
        OrganizationDeleted    : () => handleOrganizationDeleted,
        OrganizationUpdated    : () => handleOrganizationUpdated,
        RoleChanged            : () => handleRoleChanged,
        UserCreated            : () => handleUserCreated,
        UserForgotten          : () => handleUserForgotten,
        UserUpdated            : () => handleUserUpdated,
        BlockfaceSaved         : () => handleBlockfaceSaved,

        BlockfaceCreated       : () => { throw new Error('BlockfaceCreated should never reach server (local-only action)') },
        BlockfaceSelected      : () => { throw new Error('BlockfaceSelected should never reach server (local-only action)') },
        BlockfacesSynced       : () => { throw new Error('BlockfacesSynced should never reach server (local-only action)') },
        OrganizationSynced     : () => { throw new Error('OrganizationSynced should never reach server (local-only action)') },
        SegmentAdded           : () => { throw new Error('SegmentAdded should never reach server (local-only action)') },
        SegmentAddedLeft       : () => { throw new Error('SegmentAddedLeft should never reach server (local-only action)') },
        SegmentLengthUpdated   : () => { throw new Error('SegmentLengthUpdated should never reach server (local-only action)') },
        SegmentUseUpdated      : () => { throw new Error('SegmentUseUpdated should never reach server (local-only action)') },
        SegmentsReplaced       : () => { throw new Error('SegmentsReplaced should never reach server (local-only action)') },
        UserLoaded             : () => { throw new Error('UserLoaded should never reach server (local-only action)') },
    })

// ---------------------------------------------------------------------------------------------------------------------
// Transaction execution
// ---------------------------------------------------------------------------------------------------------------------

const handleInTransaction = async (actionRequest, metadata, txContext) => {
    // Read existing documents and validate metadata (inside transaction for atomicity)
    const existingDocs = await readExistingDocuments(txContext, metadata, actionRequest)
    validateMetadata(actionRequest, metadata, existingDocs)

    // Check idempotency
    const existing = await txContext.completedActions.readOrNull(actionRequest.id)
    if (existing) throwDuplicateRequestError(`Already processed at: ${existing.processedAt.toISOString()}`)

    // Execute handler
    const handler = handlerForActionRequest(actionRequest)
    await handler(txContext, actionRequest)

    // Write completedAction
    await txContext.completedActions.create(actionRequest)
}

// ---------------------------------------------------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------------------------------------------------

const checkTenantAccess = (actor, organizationId, projectId, actionMetadata) => {
    const isMissingOrganization = actionMetadata.requiresOrganization && !organizationId
    const isMissingProject = actionMetadata.requiresProject && !projectId
    const isntMemberOfOrganization = actionMetadata.requiresOrganization && !actor.organizations?.[organizationId]

    if (isMissingOrganization) throwAuthorizationError('organizationId required for this action')
    if (isntMemberOfOrganization) throwAuthorizationError(`Access denied to organization ${organizationId}`)
    if (isMissingProject) throwAuthorizationError('projectId required for this action')
}

const verifyTransactionCommitted = async (fsContext, actionRequestId) => {
    const completed = await fsContext.completedActions.readOrNull(actionRequestId)
    if (!completed) throw new Error('Transaction completed but action request not found')
}

// 1. Validate HTTP request structure
// 2. Authenticate and read actor
// 3. Build ActionRequest
// 4. Check tenant access
// 5. Build validation context and authorize
// 6. Execute in transaction:
//    a. Read existing documents (for metadata validation)
//    b. Validate metadata (REJECT if spoofed)
//    c. Check idempotency
//    d. Execute handler
//    e. Write completedAction
// 7. Verify transaction committed
// 8. Log success (or error if any step fails)
const submitActionRequestHandler = async (req, res) => {
    const namespace = process.env.FUNCTIONS_EMULATOR ? req.body.namespace || '' : ''
    const logger = createLogger(process.env.FUNCTIONS_EMULATOR ? 'dev' : 'production')

    try {
        validateRequestParameters(req)
        const actorId = await authenticate(req)

        // Parse action to determine if we need to read the actor
        const action = Action.fromFirestore(req.body.action, decodeTimestamp)
        const actionMetadata = Action.metadata(action)

        // Only read actor if the action requires it (e.g., UserCreated doesn't have a user yet)
        const actionRequest = buildActionRequest(req, actorId)
        const { organizationId, projectId } = actionRequest
        const fsContext = createFirestoreContext(namespace, organizationId, projectId)
        const actor = actionMetadata.requiresUser && (await fsContext.users.read(actorId))
        checkTenantAccess(actor, organizationId, projectId, actionMetadata)

        authStrategies[actionMetadata.authStrategy](actionRequest.action, { actor, organizationId, projectId })

        await admin.firestore().runTransaction(async tx => {
            const txContext = createFirestoreContext(namespace, organizationId, projectId, tx)
            await handleInTransaction(actionRequest, actionMetadata, txContext)
        })

        await verifyTransactionCommitted(fsContext, actionRequest.id)

        // Log successful completion with action details and queryable metadata
        const { id, idempotencyKey, correlationId, subjectId, subjectType } = actionRequest
        logger.info(actionRequest.action['@@tagName'], {
            actionRequest: {
                id,
                actorId,
                organizationId,
                projectId,
                idempotencyKey,
                correlationId,
                subjectId,
                subjectType,
                action: Action.toLog(action),
            },
        })

        return res.status(200).send({ status: 'completed' })
    } catch (error) {
        // Always log request body with redacted action for debugging
        logger.error(error, {
            errorType: error.name,
            errorMessage: error.message,
            requestBody: { ...req.body, action: req.body?.action ? Action.redactPii(req.body.action) : undefined },
        })

        return res.status(error.statusCode || 500).send(error.message || 'Internal server error')
    }
}

// Export the HTTP function
const submitActionRequest = onRequest(submitActionRequestHandler)

export { submitActionRequest }
