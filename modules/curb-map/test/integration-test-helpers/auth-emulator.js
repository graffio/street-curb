import { LookupTable } from '@graffio/functional'
import admin from 'firebase-admin'
import { Action, FieldTypes, OrganizationMember } from '../../src/types/index.js'
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
 * Generate a timestamp-based test email address for unique sign-in attempts.
 * @sig uniqueEmail :: String -> String
 */
const uniqueEmail = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`

/**
 * Unified integration test wrapper with authentication
 * Supports both email and phone sign-in methods
 * @sig asSignedInUser :: (String | Object, Function) -> Promise<void>
 */
const asSignedInUser = async (labelOrOptions, effect) => {
    if (!firebaseProjectId) throw new Error('GCLOUD_PROJECT must be set')
    ensureAdminInitialized(firebaseProjectId)

    const { label, namespace: explicitNamespace } =
        typeof labelOrOptions === 'string' ? { label: labelOrOptions, namespace: undefined } : labelOrOptions

    const namespace = explicitNamespace || buildNamespace(label)

    const userId = FieldTypes.newUserId()
    const email = `${label}-${userId}@example.com`

    await admin.auth().createUser({ uid: userId, email })

    const customToken = await admin.auth().createCustomToken(userId)
    const url = buildEndpoints().signInWithCustomTokenUrl
    const { idToken: token } = await postJson(url, { token: customToken, returnSecureToken: true })

    // Create User document for the signed-in actor (mirrors real signup flow)
    const displayName = `Test Actor ${label}`
    const organizations = LookupTable([], OrganizationMember, 'organizationId')
    const action = Action.UserCreated.from({ userId, email, displayName, organizations })
    await submitAndExpectSuccess({ action, namespace, token })

    return await effect({ namespace, token, actorUserId: userId })
}

export { uniqueEmail, asSignedInUser }
