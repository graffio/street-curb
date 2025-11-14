// ABOUTME: Firebase configuration for emulator environment
// ABOUTME: Uses environment variables for emulator hosts

import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const authEmulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST
const [host, port] = authEmulatorHost.split(':')
const projectId = import.meta.env.VITE_GCLOUD_PROJECT
const appId = `${projectId}-app`
const apiKey = 'local-development'

const app = initializeApp({ projectId, apiKey, appId })
connectAuthEmulator(getAuth(app), `http://${host}:${port}`, { disableWarnings: true })

// Auto-login for development (runs once)
let loginPromise = null
const possiblyAutoLogin = async ({ email = 'usr_alice0000000@example.com', password = 'password123' } = {}) => {
    if (!loginPromise)
        loginPromise = (async () => {
            const auth = getAuth(app)
            await signInWithEmailAndPassword(auth, email, password)
            console.log(`Auto-logged in as ${email} (emulator mode)`)
        })()

    // Only login once, even if called multiple times
    await loginPromise
}

/**
 * Build URL for Cloud Function in emulator
 * @sig functionsUrl :: String -> String
 */
const functionsUrl = functionName => {
    const origin = import.meta.env.VITE_FUNCTIONS_EMULATOR_ORIGIN || 'http://127.0.0.1:5001'
    const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1'
    return `${origin}/${projectId}/${region}/${functionName}`
}

export { app, possiblyAutoLogin, functionsUrl }
