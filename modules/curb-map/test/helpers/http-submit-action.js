import { Action, FieldTypes } from '../../src/types/index.js'

/**
 * HTTP client for submitting action requests to the Firebase Functions emulator
 */

if (!process.env.GCLOUD_PROJECT) throw new Error('GCLOUD_PROJECT environment variable must be set for HTTP tests')

const FUNCTIONS_EMULATOR_HOST = 'http://127.0.0.1:5001'
const PROJECT_ID = process.env.GCLOUD_PROJECT
const REGION = 'us-central1'

// -------------------------------------------------------------------------------------------------------------
// Helper functions
// -------------------------------------------------------------------------------------------------------------

// @sig buildUrl :: () -> String
const buildUrl = () => `${FUNCTIONS_EMULATOR_HOST}/${PROJECT_ID}/${REGION}/submitActionRequest`

// @sig convertActionToPlain :: (Action | Object | null) -> Object | null
const convertActionToPlain = action => (action && Action.is(action) ? Action.toFirestore(action) : action)

// @sig buildPayload :: (Object | null, String, String) -> Object
const buildPayload = (plainAction, idempotencyKey, correlationId) => ({
    action: plainAction,
    idempotencyKey,
    correlationId,
})

// @sig addOptionalFields :: (Object, String?, String?) -> Object
const addOptionalFields = (payload, namespace, actorId) => {
    const result = { ...payload }
    if (namespace) result.namespace = namespace
    if (actorId) result.actorId = actorId
    return result
}

// @sig makeHttpRequest :: (String, String, Object) -> Promise<Response>
const makeHttpRequest = (url, method, body) =>
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

// @sig parseResponse :: Response -> Promise<{ status: Number, ok: Boolean, data: Object }>
const parseResponse = async response => {
    try {
        const data = await response.json()
        return { status: response.status, ok: response.ok, data }
    } catch (error) {
        throw new Error(
            `HTTP function returned non-JSON response (Status: ${response.status}). ` +
                `Is the emulator running and the function deployed? URL: ${response.url}`,
        )
    }
}

// @sig validateSuccess :: ({ status: Number, ok: Boolean, data: Object }) -> void
const validateSuccess = ({ status, ok, data }) => {
    if (!ok || data.status !== 'completed')
        throw new Error(
            `Action request failed: ${data.error || 'Unknown error'} (HTTP ${status}, status: ${data.status})`,
        )
}

// @sig validateFailure :: ({ ok: Boolean, data: Object }) -> void
const validateFailure = ({ ok, data }) => {
    if (ok && data.status === 'completed') throw new Error('Expected validation error but request succeeded')
}

// -------------------------------------------------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------------------------------------------------

/**
 * Submit an action request via HTTP function
 *
 * @sig submitActionRequest :: ({
 *   action: Action | Object | null,
 *   idempotencyKey: String?,
 *   correlationId: String?,
 *   namespace: String?,
 *   actorId: String?
 * }) -> Promise<{ status: Number, ok: Boolean, data: Object }>
 */
const submitActionRequest = async ({
    action,
    idempotencyKey = FieldTypes.newIdempotencyKey(),
    correlationId = FieldTypes.newCorrelationId(),
    namespace,
    actorId,
}) => {
    const url = buildUrl()
    const plainAction = convertActionToPlain(action)
    const payload = buildPayload(plainAction, idempotencyKey, correlationId)
    const fullPayload = addOptionalFields(payload, namespace, actorId)
    const response = await makeHttpRequest(url, 'POST', fullPayload)

    return parseResponse(response)
}

/**
 * Submit an action request and wait for successful completion
 * Throws if the request fails
 *
 * @sig submitAndExpectSuccess :: ({
 *   action: Action | Object | null,
 *   idempotencyKey: String?,
 *   correlationId: String?,
 *   namespace: String?,
 *   actorId: String?
 * }) -> Promise<Object>
 */
const submitAndExpectSuccess = async params => {
    const result = await submitActionRequest(params)
    validateSuccess(result)
    return result.data
}

/**
 * Submit an action request and expect it to fail with validation error
 *
 * @sig submitAndExpectValidationError :: ({
 *   action: Action | Object | null,
 *   idempotencyKey: String?,
 *   correlationId: String?,
 *   namespace: String?,
 *   actorId: String?
 * }) -> Promise<Object>
 */
const submitAndExpectValidationError = async params => {
    const result = await submitActionRequest(params)
    validateFailure(result)
    return result.data
}

/**
 * Make a raw HTTP request to the submitActionRequest endpoint
 * Useful for testing HTTP-level behavior (methods, malformed requests, etc.)
 *
 * @sig rawHttpRequest :: ({
 *   method: String?,
 *   body: Any?,
 *   rawBody: Boolean?
 * }) -> Promise<{ status: Number, ok: Boolean, data: Object }>
 */
const rawHttpRequest = async ({ method = 'POST', body, rawBody = false } = {}) => {
    const url = buildUrl()
    const options = { method }

    if (body !== undefined) {
        options.headers = { 'Content-Type': 'application/json' }
        // For testing malformed requests, send raw body without JSON encoding
        options.body = rawBody ? body : JSON.stringify(body)
    }

    const response = await fetch(url, options)
    return parseResponse(response)
}

export { rawHttpRequest, submitActionRequest, submitAndExpectSuccess, submitAndExpectValidationError }
