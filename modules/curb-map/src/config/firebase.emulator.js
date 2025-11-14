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

export { app, possiblyAutoLogin }
