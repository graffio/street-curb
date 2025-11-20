// ABOUTME: Application entry point
// ABOUTME: Configures Redux, Theme, Router, and layout navigation

import { LoadingSpinner } from '@graffio/design-system'
import { Theme } from '@radix-ui/themes'
import { RouterProvider } from '@tanstack/react-router'
import { getAuth } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { post } from './commands/index.js'
import { possiblyAutoLogin } from './config/index.js'
import { FirestoreClientFacade } from './firestore-facade/firestore-client-facade.js'
import { router } from './router.jsx'
import { store } from './store/index.js'
import * as S from './store/selectors.js'
import { Action, Blockface, Organization, User } from './types/index.js'

// Hard-coded IDs from seed data

const App = () => {
    const flushPendingSave = () => {
        const currentBlockface = S.currentBlockface(store.getState())
        if (currentBlockface) post(Action.BlockfaceSelected(currentBlockface))
    }

    const [dataLoaded, setDataLoaded] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            await possiblyAutoLogin()

            const { currentUser: authUser } = getAuth()
            if (!authUser) throw new Error('No authenticated user')

            const userId = authUser.uid

            // 1. Read user document (one-time - rarely changes)
            const usersFacade = FirestoreClientFacade(User)
            const currentUser = await usersFacade.read(userId)

            const organizationId = Object.keys(currentUser.organizations || {})[0]
            if (!organizationId) throw new Error('User has no organizations')

            // 2. Set up Organization listener (real-time)
            const organizationsFacade = FirestoreClientFacade(Organization)
            const orgUnsubscribe = organizationsFacade.listenToDocument(organizationId, (organization, error) => {
                if (error) {
                    console.error('Organization listener error:', error)
                    return
                }
                if (organization) 
                    post(Action.OrganizationUpdatedFromListener(organization))
                
            })

            // 3. Set up Blockfaces listener (real-time)
            const projectId = currentUser.organizations[organizationId].defaultProjectId
            const blockfacesPath = `organizations/${organizationId}/projects/${projectId}`
            const blockfacesFacade = FirestoreClientFacade(Blockface, blockfacesPath)

            const blockfacesUnsubscribe = blockfacesFacade.listenToCollection([], (blockfaces, error) => {
                if (error) {
                    console.error('Blockfaces listener error:', error)
                    return
                }
                // Silent update - no toast notification
                post(Action.BlockfacesLoadedFromListener(blockfaces))
            })

            // Store unsubscribe functions for cleanup
            window.firestoreUnsubscribers = { organization: orgUnsubscribe, blockfaces: blockfacesUnsubscribe }

            // 4. Show app immediately (don't wait for listeners)
            post(Action.AllInitialDataLoaded(currentUser, null))
            setDataLoaded(true)
        }

        loadData()

        window.addEventListener('beforeunload', flushPendingSave)
        window.addEventListener('visibilitychange', flushPendingSave)

        return () => {
            window.removeEventListener('beforeunload', flushPendingSave)
            window.removeEventListener('visibilitychange', flushPendingSave)

            // Cleanup Firestore listeners
            if (window.firestoreUnsubscribers) 
                Object.values(window.firestoreUnsubscribers).forEach(unsubscribe => {
                    if (typeof unsubscribe === 'function') unsubscribe()
                })
            
        }
    }, [])

    if (!dataLoaded) return <LoadingSpinner />

    return (
        <React.StrictMode>
            <Provider store={store}>
                <Theme appearance="light" accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
                    <RouterProvider router={router} />
                </Theme>
            </Provider>
        </React.StrictMode>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
