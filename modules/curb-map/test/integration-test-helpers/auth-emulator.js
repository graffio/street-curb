import admin from 'firebase-admin'
import { Action, FieldTypes } from '../../src/types/index.js'
import { buildNamespace } from './build-namespace.js'
import { submitAndExpectSuccess } from './http-submit-action.js'

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

const firebaseProjectId = ensureProjectId()
process.env.GCLOUD_PROJECT ||= firebaseProjectId
process.env.GOOGLE_CLOUD_PROJECT ||= firebaseProjectId
process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099'
process.env.FIREBASE_TEST_MODE ||= '1'
process.env.FUNCTIONS_EMULATOR ||= '1'

const host = 'http://127.0.0.1:9099'
const API_KEY = 'fake-key'
const headers = { 'Content-Type': 'application/json' }

const buildEndpoints = () => {
    const projectId = ensureProjectId()
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
 * Unified integration test wrapper with authentication
 * Supports both email and phone sign-in methods
 * @sig asSignedInUser :: (String | Object, Function) -> Promise<void>
 */
const asSignedInUser = async (options, effect) => {
    if (!firebaseProjectId) throw new Error('GCLOUD_PROJECT must be set')
    ensureAdminInitialized(firebaseProjectId)

    const { label = 'test', signInMethod = 'email' } = typeof options === 'string' ? { label: options } : options
    const namespace = buildNamespace(label)

    const { token, uid, userId } =
        signInMethod === 'phone' ? await signInWithPhoneNumber() : await signInWithEmailLink(uniqueEmail(label))

    // Create User document for the signed-in actor (mirrors real signup flow)
    const email = uniqueEmail(label)
    const displayName = `Test Actor ${label}`
    const action = Action.UserCreated.from({ userId, email, displayName, authUid: uid })
    await submitAndExpectSuccess({ action, namespace, token })

    return await effect({ namespace, token, uid, actorUserId: userId })
}

export { uniqueEmail, asSignedInUser }
