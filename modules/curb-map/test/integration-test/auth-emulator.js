import admin from 'firebase-admin'
import { FieldTypes } from '../../src/types/index.js'

/*
 * Helper utilities that drive the Firebase Auth emulator’s email-link and phone sign-in endpoints end-to-end.
 *
 * The Auth emulator has 2 additional REST endpoints the "real" Auth implementation doesn't (because they're dangerous),
 * which validate an email or phone passkey to be validated without a user actually doing anything.
 *
 * Each function returns an ID token and UID that our HTTP integration tests can pass to submitActionRequest,
 * making the spec behave the same way it will in production (real bearer tokens, no actorId bypass).
 */

const ensureProjectId = () => {
    const projectId = process.env.GCLOUD_PROJECT
    if (!projectId) throw new Error('GCLOUD_PROJECT must be set to use Auth emulator helpers')
    return projectId
}

const resolveHost = () => {
    const host = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'
    return host.startsWith('http') ? host : `http://${host}`
}

const API_KEY = 'fake-key'

const envKeys = [
    'GCLOUD_PROJECT',
    'GOOGLE_CLOUD_PROJECT',
    'FIRESTORE_EMULATOR_HOST',
    'FIREBASE_AUTH_EMULATOR_HOST',
    'FIREBASE_TEST_MODE',
    'FUNCTIONS_EMULATOR',
]

const captureEnv = keys => keys.reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {})

const restoreEnv = snapshot =>
    Object.entries(snapshot).forEach(([key, value]) => {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
    })

const headers = { 'Content-Type': 'application/json' }

const buildEndpoints = () => {
    const projectId = process.env.GCLOUD_PROJECT || process.env.TEST_GCLOUD_PROJECT || ensureProjectId()
    const host = resolveHost()
    const authBase = `${host}/identitytoolkit.googleapis.com/v1`
    const emulatorBase = `${host}/emulator/v1/projects/${projectId}`

    // prettier-ignore
    return {
        projectId,
        signInWithPhoneNumberUrl: `${authBase}/accounts:signInWithPhoneNumber?key=${API_KEY}`,
        signInWithEmailUrl      : `${authBase}/accounts:signInWithEmailLink?key=${API_KEY}`,
        signUpUrl               : `${authBase}/accounts:signUp?key=${API_KEY}`,
        signInWithCustomTokenUrl: `${authBase}/accounts:signInWithCustomToken?key=${API_KEY}`,
        verificationCodesUrl    : `${emulatorBase}/verificationCodes`,
    }
}

const ensureAdminInitialized = projectId => {
    if (!admin.apps.length) admin.initializeApp({ projectId })
}

const assignUserClaims = async (uid, userId) => {
    const record = await admin.auth().getUser(uid)
    const claims = { ...(record.customClaims || {}), userId }
    await admin.auth().setCustomUserClaims(uid, claims)
}

const postJson = async (url, payload) => {
    let response
    try {
        response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
    } catch (error) {
        throw new Error(
            `Failed to reach Firebase Auth emulator at ${url}. ` +
                `Ensure the emulator is running (firebase emulators:start). Original error: ${error.message}`,
        )
    }

    const json = await response.json()
    if (!json?.error) return json

    const message = json.error?.message || 'Auth emulator returned an error'
    throw new Error(`${message} (${url})`)
}

/**
 * Request an email sign-in OOB code from the emulator and exchange it for an ID token.
 * @sig signInWithEmailLink :: String -> Promise<{ token: String, uid: String, refreshToken: String }>
 */

const signInWithEmailLink = async email => {
    const { projectId, signUpUrl, signInWithCustomTokenUrl } = buildEndpoints()
    const password = Math.random().toString(36).slice(2, 14)
    const res = await postJson(signUpUrl, { email, password, returnSecureToken: true })
    const userId = FieldTypes.newUserId()
    ensureAdminInitialized(projectId)
    await assignUserClaims(res.localId, userId)
    const customToken = await admin.auth().createCustomToken(res.localId, { userId })
    const signedIn = await postJson(signInWithCustomTokenUrl, { token: customToken, returnSecureToken: true })
    return { token: signedIn.idToken, uid: res.localId, userId, refreshToken: signedIn.refreshToken }
}

/**
 * Request a phone verification code from the emulator and exchange it for an ID token.
 * @sig signInWithPhoneNumber :: (String?) -> Promise<{ token: String, uid: String, refreshToken: String }>
 */
const signInWithPhoneNumber = async (phoneNumber = '+15551234567') => {
    const { projectId, signUpUrl, signInWithCustomTokenUrl } = buildEndpoints()
    const tempEmail = `${FieldTypes.newUserId()}@phone.test`
    const password = Math.random().toString(36).slice(2, 14)
    const res = await postJson(signUpUrl, { email: tempEmail, password, returnSecureToken: true })
    const userId = FieldTypes.newUserId()
    ensureAdminInitialized(projectId)
    await assignUserClaims(res.localId, userId)
    const customToken = await admin.auth().createCustomToken(res.localId, { userId })
    const signedIn = await postJson(signInWithCustomTokenUrl, { token: customToken, returnSecureToken: true })
    return { token: signedIn.idToken, uid: res.localId, userId, refreshToken: signedIn.refreshToken }
}

/**
 * Generate a timestamp-based test email address for unique sign-in attempts.
 * @sig uniqueEmail :: String -> String
 */
const uniqueEmail = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`

/**
 * Temporarily configures emulator env vars and yields a unique namespace for each integration test.
 * @sig withAuthTestEnvironment :: (Context -> Promise<void>, Object?) -> Promise<void>
 * Context = { namespace: String, projectId: String }
 */
const withAuthTestEnvironment = async (effect, overrides = {}) => {
    const snapshot = captureEnv(envKeys)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-').replace('Z', '')
    const namespace = `tests/ns_${timestamp}`

    const projectId =
        overrides.projectId || process.env.GCLOUD_PROJECT || process.env.TEST_GCLOUD_PROJECT || 'local-curb-map-tests'
    const firestoreHost = overrides.firestoreHost || process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'
    const authHost = overrides.authHost || process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'

    restoreEnv({
        GCLOUD_PROJECT: projectId,
        GOOGLE_CLOUD_PROJECT: projectId,
        FIRESTORE_EMULATOR_HOST: firestoreHost,
        FIREBASE_AUTH_EMULATOR_HOST: authHost,
        FIREBASE_TEST_MODE: '1',
        FUNCTIONS_EMULATOR: '1',
    })

    ensureAdminInitialized(projectId)

    try {
        await effect({ namespace, projectId })
    } finally {
        restoreEnv(snapshot)
    }
}

export { signInWithEmailLink, signInWithPhoneNumber, uniqueEmail, withAuthTestEnvironment }
