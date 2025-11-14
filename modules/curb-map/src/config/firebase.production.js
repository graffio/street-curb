// ABOUTME: Firebase configuration for production environment
// ABOUTME: Replace with actual Firebase project values

import { initializeApp } from 'firebase/app'

const app = initializeApp({
    projectId: 'YOUR_PROJECT_ID',
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
})

const possiblyAutoLogin = async () => {}

/**
 * Build URL for Cloud Function in production
 * @sig functionsUrl :: String -> String
 */
const functionsUrl = functionName => {
    const projectId = app.options.projectId
    const region = 'us-central1' // Default region, override if needed
    return `https://${region}-${projectId}.cloudfunctions.net/${functionName}`
}

export { app, possiblyAutoLogin, functionsUrl }
