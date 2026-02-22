// ABOUTME: HTTP endpoint for submitting action requests with validation and authorization
// ABOUTME: Validates metadata inside transaction, checks permissions, executes handlers atomically

import { RuntimeForGeneratedTypes } from '@graffio/cli-type-generator'
import { isNil, path } from '@graffio/functional'
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

const { redact } = RuntimeForGeneratedTypes

// COMPLEXITY: function-naming — throwError/throw* helpers are a domain pattern for HTTP
//   error responses; no verb prefix fits throw-and-never-return semantics
// COMPLEXITY: export-structure — Firebase onRequest export name determines the deployed
//   Cloud Function name; PascalCase would break the deployment

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    /**
     * Decode a Firestore timestamp or ISO string to a Date
     * @sig parseTimestamp :: (String | Timestamp) -> Date
     */
    parseTimestamp: timestamp => {
        if (timestamp && typeof timestamp.toDate === 'function') return timestamp.toDate()
        if (typeof timestamp === 'string') return new Date(timestamp)
        return timestamp
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    /**
     * Create and throw an Error with a name and HTTP status code
     * @sig createError :: (String, String, Number) -> throws Error
     */
    createError: (message, name, statusCode) => {
        const error = new Error(message)
        error.name = name
        error.statusCode = statusCode
        throw error
    },

    /**
     * Throw a 400 validation error
     * @sig createValidationError :: String -> throws Error
     */
    createValidationError: message => F.createError(message, 'ValidationError', 400),

    /**
     * Throw a 401 authorization error
     * @sig createAuthorizationError :: String -> throws Error
     */
    createAuthorizationError: message => F.createError(message, 'AuthorizationError', 401),

    /**
     * Throw a 405 method not allowed error
     * @sig createMethodNotAllowedError :: String -> throws Error
     */
    createMethodNotAllowedError: message => F.createError(message, 'MethodNotAllowedError', 405),

    /**
     * Throw a 409 duplicate request error
     * @sig createDuplicateRequestError :: String -> throws Error
     */
    createDuplicateRequestError: message => F.createError(message, 'DuplicateRequestError', 409),

    /**
     * Throw a 500 metadata spoofing error
     * @sig createMetadataSpoofingError :: String -> throws Error
     */
    createMetadataSpoofingError: message => F.createError(message, 'MetadataSpoofingError', 500),

    /**
     * Parse and construct an ActionRequest from an HTTP request
     * @sig buildActionRequest :: (Request, String) -> ActionRequest
     */
    buildActionRequest: (req, actorId) => {
        try {
            const action = Action.fromFirestore(req.body.action, T.parseTimestamp)
            const { organizationId, projectId, idempotencyKey, correlationId } = req.body
            const { id: subjectId, type: subjectType } = Action.getSubject(action, organizationId)

            const rawActionRequest = {
                actorId,
                action,
                organizationId,
                projectId,
                idempotencyKey,
                correlationId,
                subjectId,
                subjectType,
                id: idempotencyKey.replace(/^idm_/, 'acr_'),
                createdAt: new Date(),
                processedAt: new Date(),
                schemaVersion: 1,
            }

            return ActionRequest.from(rawActionRequest)
        } catch (error) {
            F.createValidationError(error.message)
        }
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Validators
//
// ---------------------------------------------------------------------------------------------------------------------

const V = {
    /**
     * Validate HTTP request structure: must be POST with required fields and valid Action
     * @sig validateRequestParameters :: Request -> void | throws
     */
    validateRequestParameters: req => {
        const { body, method } = req

        if (method !== 'POST') F.createMethodNotAllowedError('Only POST requests are allowed')
        if (isNil(body) || typeof body !== 'object' || Array.isArray(body))
            F.createValidationError('Request body must be a JSON object')

        const { action, idempotencyKey, correlationId } = body
        if (!action || !idempotencyKey || !correlationId)
            F.createValidationError('Missing required fields: action, idempotencyKey, correlationId')

        try {
            Action.fromFirestore(action, T.parseTimestamp)
        } catch (error) {
            F.createValidationError(error.message)
        }
    },

    /**
     * Validate metadata timestamps and ownership inside a transaction
     * @sig validateMetadata :: (ActionRequest, Object, Object) -> void | throws
     */
    validateMetadata: (actionRequest, metadata, existingDocs) => {
        /**
         * Validate that a new document has correct metadata (createdBy/updatedBy match actor, timestamps recent)
         * @sig validateCreate :: Object -> void | throws
         */
        const validateCreate = doc => {
            const { createdBy, updatedBy, createdAt, updatedAt } = doc
            if (createdBy !== actorId)
                F.createMetadataSpoofingError(`Invalid createdBy: expected ${actorId}, got ${createdBy}`)
            if (updatedBy !== actorId)
                F.createMetadataSpoofingError(`Invalid updatedBy: expected ${actorId}, got ${updatedBy}`)

            const date = new Date()
            const createdAge = date - createdAt
            const updatedAge = date - updatedAt
            const isLegalCreatedAt = createdAge > 0 && createdAge < MAXIMUM_ALLOWED_AGE
            const isLegalUpdatedAt = updatedAge > 0 && updatedAge < MAXIMUM_ALLOWED_AGE

            if (!isLegalCreatedAt)
                F.createMetadataSpoofingError('Invalid createdAt: timestamp must be recent (server-generated)')
            if (!isLegalUpdatedAt)
                F.createMetadataSpoofingError('Invalid updatedAt: timestamp must be recent (server-generated)')
        }

        /**
         * Validate that an updated document preserves original metadata and has valid updates
         * @sig validateUpdate :: (Object, Object) -> void | throws
         */
        const validateUpdate = (doc, alreadyExists) => {
            const { createdBy, createdAt, updatedBy, updatedAt } = doc
            const { createdBy: existingCreatedBy, createdAt: existingCreatedAt } = alreadyExists
            const updatedAge = new Date() - updatedAt

            const createdByMatches = createdBy === existingCreatedBy
            const createdAtMatches = createdAt.getTime() === existingCreatedAt.getTime()
            const isLegalUpdatedBy = updatedBy === actorId
            const isLegalUpdatedAt = updatedAge > 0 && updatedAge < MAXIMUM_ALLOWED_AGE

            if (!createdByMatches)
                F.createMetadataSpoofingError(
                    `Cannot modify createdBy (existing: ${existingCreatedBy}, provided: ${createdBy})`,
                )
            if (!createdAtMatches) F.createMetadataSpoofingError('Cannot modify createdAt')
            if (!isLegalUpdatedBy)
                F.createMetadataSpoofingError(`Invalid updatedBy: expected ${actorId}, got ${updatedBy}`)
            if (!isLegalUpdatedAt)
                F.createMetadataSpoofingError('Invalid updatedAt: timestamp must be recent (server-generated)')
        }

        /**
         * Validate a single write target (create or update based on prior existence)
         * @sig validateCreateOrUpdate :: Object -> void | throws
         */
        const validateCreateOrUpdate = writeTo => {
            const docId = path(writeTo.path, actionRequest)
            const previousValue = existingDocs[docId]

            const currentDocPath = writeTo.path.replace(/\.id$/, '')
            const currentValue = path(currentDocPath, actionRequest)

            previousValue ? validateUpdate(currentValue, previousValue) : validateCreate(currentValue)
        }

        const MAXIMUM_ALLOWED_AGE = 60 * 1000 // allow time for debouncing
        const { actorId, action } = actionRequest

        metadata.writesTo.forEach(validateCreateOrUpdate)

        // Run custom validateInput if provided (will throw ValidationError if fails)
        if (metadata.validateInput) metadata.validateInput(action, actionRequest, existingDocs)
    },

    /**
     * Verify actor has access to the organization and project
     * @sig checkTenantAccess :: (Object, String, String, Object) -> void | throws
     */
    checkTenantAccess: (actor, organizationId, projectId, actionMetadata) => {
        const { requiresOrganization, requiresProject } = actionMetadata
        const isMissingOrganization = requiresOrganization && !organizationId
        const isMissingProject = requiresProject && !projectId
        const isntMemberOfOrganization = requiresOrganization && !actor.organizations?.[organizationId]

        if (isMissingOrganization) F.createAuthorizationError('organizationId required for this action')
        if (isntMemberOfOrganization) F.createAuthorizationError(`Access denied to organization ${organizationId}`)
        if (isMissingProject) F.createAuthorizationError('projectId required for this action')
    },

    /**
     * Verify the completed action was persisted after transaction
     * @sig checkTransactionCommitted :: (Object, String) -> Promise<void> | throws
     */
    checkTransactionCommitted: async (fsContext, actionRequestId) => {
        const completed = await fsContext.completedActions.readOrNull(actionRequestId)
        if (!completed) throw new Error('Transaction completed but action request not found')
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    /**
     * Resolve which handler function to use for a given action request
     * @sig findHandlerForActionRequest :: ActionRequest -> Function
     */
    // prettier-ignore
    findHandlerForActionRequest: actionRequest =>
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
        }),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    /**
     * Authenticate the request via Firebase Auth token
     * @sig handleAuthentication :: Request -> Promise<String>
     */
    handleAuthentication: async req => {
        /**
         * Map Firebase Auth error codes to user-facing messages
         * @sig toAuthErrorMessage :: Error -> String
         */
        const toAuthErrorMessage = error => {
            const code = error.code
            if (code === 'auth/id-token-expired') return 'Authorization token has expired'
            if (code === 'auth/argument-error') return 'Authorization token is malformed'
            if (code === 'auth/invalid-id-token') return 'Authorization token is invalid'
            if (code === 'auth/id-token-revoked') return 'Authorization token has been revoked'
            return 'Invalid or expired Authorization token'
        }

        const authHeader = req.headers.authorization
        if (!authHeader?.startsWith('Bearer ')) F.createAuthorizationError('Missing or invalid Authorization header')
        const token = authHeader.slice('Bearer '.length).trim()
        if (!token) F.createAuthorizationError('Authorization token is required')

        try {
            const { uid } = await admin.auth().verifyIdToken(token)
            if (!FieldTypes.userId.test(uid)) F.createAuthorizationError(`Malformed uid ${uid} is not a valid userId`)
            return uid
        } catch (error) {
            if (error.name === 'AuthorizationError') throw error // ie. a malformed uid error we just generated
            F.createAuthorizationError(toAuthErrorMessage(error))
        }
    },

    /**
     * Read existing documents for metadata validation inside a transaction
     * @sig loadExistingDocuments :: (Object, Object, ActionRequest) -> Promise<Object>
     */
    loadExistingDocuments: async (fsContext, metadata, actionRequest) => {
        const existingDocs = {}

        for (const writeTo of metadata.writesTo) {
            const { collection, path: idPath } = writeTo
            const docId = path(idPath, actionRequest)
            existingDocs[docId] = await fsContext[collection].readOrNull(docId)
        }

        return existingDocs
    },

    /**
     * Execute the action request handler inside a Firestore transaction
     * @sig handleInTransaction :: (ActionRequest, Object, Object) -> Promise<void>
     */
    handleInTransaction: async (actionRequest, metadata, txContext) => {
        const existingDocs = await E.loadExistingDocuments(txContext, metadata, actionRequest)
        V.validateMetadata(actionRequest, metadata, existingDocs)

        const existing = await txContext.completedActions.readOrNull(actionRequest.id)
        if (existing) F.createDuplicateRequestError(`Already processed at: ${existing.processedAt.toISOString()}`)

        const handler = A.findHandlerForActionRequest(actionRequest)
        await handler(txContext, actionRequest)

        const redactedActionRequest = ActionRequest.from({ ...actionRequest, action: redact(actionRequest.action) })
        await txContext.completedActions.create(redactedActionRequest)
    },

    /**
     * Main HTTP handler: validate, authenticate, authorize, execute in transaction
     * @sig handleSubmitActionRequest :: (Request, Response) -> Promise<Response>
     */
    handleSubmitActionRequest: async (req, res) => {
        const namespace = process.env.FUNCTIONS_EMULATOR ? req.body.namespace || '' : ''
        const logger = createLogger(process.env.FUNCTIONS_EMULATOR ? 'dev' : 'production')

        try {
            V.validateRequestParameters(req)
            const actorId = await E.handleAuthentication(req)

            const action = Action.fromFirestore(req.body.action, T.parseTimestamp)
            const actionMetadata = Action.metadata(action)

            const actionRequest = F.buildActionRequest(req, actorId)
            const { organizationId, projectId } = actionRequest
            const fsContext = createFirestoreContext(namespace, organizationId, projectId)
            const actor = actionMetadata.requiresUser && (await fsContext.users.read(actorId))
            V.checkTenantAccess(actor, organizationId, projectId, actionMetadata)

            authStrategies[actionMetadata.authStrategy](actionRequest.action, { actor, organizationId, projectId })

            await admin.firestore().runTransaction(async tx => {
                const txContext = createFirestoreContext(namespace, organizationId, projectId, tx)
                await E.handleInTransaction(actionRequest, actionMetadata, txContext)
            })

            await V.checkTransactionCommitted(fsContext, actionRequest.id)

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
            const { message, name: errorType, statusCode } = error
            logger.error(error, { errorType, errorMessage: message, requestBody: req.body })

            return res.status(statusCode || 500).send(message || 'Internal server error')
        }
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const authStrategies = {
    requireSelfOnly: (action, { actor }) => {
        if (action.userId !== actor.id) F.createAuthorizationError('Can only modify own user')
    },

    /**
     * Verify actor has membership and sufficient role for the action
     * @sig requireActorIsOrganizationMember :: (Action, Object) -> void | throws
     */
    requireActorIsOrganizationMember: (action, { actor, organizationId }) => {
        const membership = actor.organizations[organizationId]
        if (!membership) F.createAuthorizationError(`Access denied to organization ${organizationId}`)
        if (!Action.mayI(action, membership.role, actor.id))
            F.createAuthorizationError(`${actor.id} with role ${membership.role} may not perform ${action.toString()}`)
    },

    requireOrganizationLimit: (action, { actor }) => {
        const organizationCount = actor.organizations.length
        if (organizationCount >= 2) F.createAuthorizationError('Cannot create more than 2 organizations')
    },

    requireSystem: (action, ctx) => {
        const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true'
        if (!isEmulator) F.createAuthorizationError('UserCreated only allowed in emulator')
    },

    allowAll: (action, ctx) => {},
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const submitActionRequest = onRequest(E.handleSubmitActionRequest)

export { submitActionRequest }
