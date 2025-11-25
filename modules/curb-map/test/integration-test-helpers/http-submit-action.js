import { Action, FieldTypes } from '../../src/types/index.js'

/**
 * Shared HTTP helpers for exercising submitActionRequest in integration tests.
 * All helpers require a Firebase Auth ID token and automatically attach it to requests.
 */

const resolveProjectId = () => {
    const projectId = process.env.GCLOUD_PROJECT
    if (!projectId)
        throw new Error('GCLOUD_PROJECT environment variable must be set (use withAuthTestEnvironment in tests)')
    return projectId
}

const resolveFunctionsOrigin = () => {
    const origin = process.env.FUNCTIONS_EMULATOR_ORIGIN || 'http://127.0.0.1:5001'
    return origin.startsWith('http') ? origin : `http://${origin}`
}

const resolveRegion = () => process.env.FIREBASE_FUNCTIONS_REGION || 'us-central1'

// @sig buildUrl :: () -> String
const buildUrl = () => {
    const projectId = resolveProjectId()
    const origin = resolveFunctionsOrigin()
    const region = resolveRegion()
    return `${origin}/${projectId}/${region}/submitActionRequest`
}

// @sig encodeTimestamp :: Date -> String
// Encode Date to ISO string for JSON transport over HTTP
const encodeTimestamp = date => (date instanceof Date ? date.toISOString() : date)

// @sig convertActionToPlain :: (Action | Object | null) -> Object | null
const convertActionToPlain = action =>
    action && Action.is(action) ? Action.toFirestore(action, encodeTimestamp) : action

// @sig buildPayload :: (Object | null, String, String, String?, String?) -> Object
const buildPayload = (plainAction, idempotencyKey, correlationId, organizationId, projectId) => {
    const payload = { action: plainAction, idempotencyKey, correlationId }
    if (organizationId) payload.organizationId = organizationId
    if (projectId) payload.projectId = projectId
    return payload
}

// @sig addOptionalFields :: (Object, String?) -> Object
const addOptionalFields = (payload, namespace) => {
    const result = { ...payload }
    if (namespace) result.namespace = namespace
    return result
}

const assertTokenPresent = token => {
    if (!token) throw new Error('Authorization token is required for submitActionRequest')
    return token
}

// @sig makeHttpRequest :: (String, String, Object, String?) -> Promise<Response>
const makeHttpRequest = (url, method, body, token) => {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    return fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
}

// @sig parseResponse :: Response -> Promise<{ status: Number, ok: Boolean, data: Object }>
const parseResponse = async response => {
    // Read text first (can only read body once)
    const text = await response.text()

    // Try to parse as JSON, fall back to plain text
    try {
        const data = JSON.parse(text)
        return { status: response.status, ok: response.ok, data }
    } catch (error) {
        // Plain text response
        return { status: response.status, ok: response.ok, data: text }
    }
}

// @sig validateSuccess :: ({ status: Number, ok: Boolean, data: String }) -> void
const validateSuccess = ({ status, ok, data }) => {
    if (!ok) throw new Error(`Action request failed: ${data} (HTTP ${status})`)
}

// @sig validateFailure :: ({ ok: Boolean, data: String }) -> void
const validateFailure = ({ ok, data }) => {
    if (ok) throw new Error('Expected validation error but request succeeded')
}

// -------------------------------------------------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------------------------------------------------

/**
 * Submit an action request via HTTP function.
 * @sig submitActionRequest :: ({ action: Any, idempotencyKey?: String, correlationId?: String, namespace?: String, token: String }) -> Promise<{ status: Number, ok: Boolean, data: Object }>
 */
const submitActionRequest = async ({
    action,
    idempotencyKey = FieldTypes.newIdempotencyKey(),
    correlationId = FieldTypes.newCorrelationId(),
    namespace,
    token,
    organizationId,
    projectId,
}) => {
    const url = buildUrl()
    const bearer = assertTokenPresent(token)
    const plainAction = convertActionToPlain(action)

    const payload = buildPayload(plainAction, idempotencyKey, correlationId, organizationId, projectId)
    const fullPayload = addOptionalFields(payload, namespace)
    const response = await makeHttpRequest(url, 'POST', fullPayload, bearer)

    return parseResponse(response)
}

/**
 * Submit an action request and wait for successful completion.
 * @sig submitAndExpectSuccess :: ({ action: Any, idempotencyKey?: String, correlationId?: String, namespace?: String, token: String }) -> Promise<Object>
 */
const submitAndExpectSuccess = async params => {
    const result = await submitActionRequest(params)
    validateSuccess(result)
    return result.data
}

/**
 * Submit an action request and expect validation failure.
 * @sig submitAndExpectValidationError :: ({ action: Any, idempotencyKey?: String, correlationId?: String, namespace?: String, token: String }) -> Promise<Object>
 */
const submitAndExpectValidationError = async params => {
    const result = await submitActionRequest(params)
    validateFailure(result)
    return result.data
}

/**
 * Submit an action request and expect HTTP 409 duplicate response.
 * @sig submitAndExpectDuplicate :: ({ action: Any, idempotencyKey?: String, correlationId?: String, namespace?: String, token: String }) -> Promise<String>
 */
const submitAndExpectDuplicate = async params => {
    const result = await submitActionRequest(params)
    if (result.status !== 409) throw new Error(`Expected duplicate (HTTP 409) but got HTTP ${result.status}`)

    return result.data
}

/**
 * Make a raw HTTP request to the submitActionRequest endpoint.
 * @sig rawHttpRequest :: ({ method?: String, body?: Any, rawBody?: Boolean, token?: String }) -> Promise<{ status: Number, ok: Boolean, data: Object }>
 */
const rawHttpRequest = async ({ method = 'POST', body, rawBody = false, token } = {}) => {
    const url = buildUrl()
    const options = { method }

    if (body !== undefined) {
        options.headers = { 'Content-Type': 'application/json' }
        options.body = rawBody ? body : JSON.stringify(body)
    }

    if (token) {
        options.headers = options.headers || {}
        options.headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, options)
    return parseResponse(response)
}

/**
 * Build a payload for rawHttpRequest from an action.
 * Helper to reduce boilerplate when testing unauthorized requests or custom scenarios.
 *
 * @sig buildActionPayload :: (String, Action, { idempotencyKey?: String, correlationId?: String }) -> Object
 */
const buildActionPayload = (namespace, action, { idempotencyKey, correlationId } = {}) => ({
    action: Action.toFirestore(action),
    idempotencyKey: idempotencyKey || FieldTypes.newIdempotencyKey(),
    correlationId: correlationId || FieldTypes.newCorrelationId(),
    namespace,
})

/**
 * Assert that an async function throws an error with a message matching a pattern.
 * Helper to reduce try-catch boilerplate in tests.
 *
 * @sig expectError :: (TAP, Function, RegExp, String?) -> Promise<Error>
 */
const expectError = async (t, fn, pattern, message) => {
    try {
        await fn()
        t.fail(message || 'Expected error to be thrown')
    } catch (error) {
        t.match(error.message, pattern, message)
        return error
    }
}

export {
    buildActionPayload,
    expectError,
    rawHttpRequest,
    submitActionRequest,
    submitAndExpectSuccess,
    submitAndExpectValidationError,
    submitAndExpectDuplicate,
}
