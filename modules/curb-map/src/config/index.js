// ABOUTME: Firebase configuration selector
// ABOUTME: Selects config based on environment

// Use emulator config if VITE_GCLOUD_PROJECT is set, otherwise production
const isEmulator = !!import.meta.env.VITE_GCLOUD_PROJECT

export const { app, possiblyAutoLogin, functionsUrl } = isEmulator
    ? await import('./firebase.emulator.js')
    : await import('./firebase.production.js')
