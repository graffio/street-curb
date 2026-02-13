// ABOUTME: Application entry point
// ABOUTME: Configures Redux, Theme, Router, and layout navigation
// COMPLEXITY: react-redux-separation — curb-map is mothballed; standard React Provider pattern
// COMPLEXITY: sig-documentation — curb-map is mothballed; App component is self-documenting
// COMPLEXITY: single-level-indentation — curb-map is mothballed; JSX Provider nesting is standard React

import '@radix-ui/themes/styles.css'
import { Theme } from '@radix-ui/themes'
import { LoadingSpinner } from './components/LoadingSpinner.jsx'
import { RouterProvider } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider, useSelector } from 'react-redux'
import { post } from './commands/index.js'
import { cleanupListeners, initializeListeners } from './firestore-facade/firestore-listeners.js'
import { router } from './router.jsx'
import { store } from './store/index.js'
import * as S from './store/selectors.js'
import { Action } from './types/index.js'

const AppContent = () => {
    const currentUser = useSelector(S.currentUser)
    const currentOrganization = useSelector(S.currentOrganization)

    // Wait for both user and organization to be loaded before showing routes
    return currentUser && currentOrganization ? <RouterProvider router={router} /> : <LoadingSpinner />
}

const App = () => {
    const flushPendingBlockfaceSave = () => {
        const currentBlockface = S.currentBlockface(store.getState())
        if (currentBlockface) post(Action.BlockfaceSelected(currentBlockface))
    }

    useEffect(() => {
        initializeListeners()

        window.addEventListener('beforeunload', flushPendingBlockfaceSave)
        window.addEventListener('visibilitychange', flushPendingBlockfaceSave)

        return () => {
            window.removeEventListener('beforeunload', flushPendingBlockfaceSave)
            window.removeEventListener('visibilitychange', flushPendingBlockfaceSave)
            cleanupListeners()
        }
    }, [])

    return (
        <React.StrictMode>
            <Provider store={store}>
                <Theme appearance="light" accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
                    <AppContent />
                </Theme>
            </Provider>
        </React.StrictMode>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
