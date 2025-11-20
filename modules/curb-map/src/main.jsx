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
import { Action, Blockface, Organization, Project, User } from './types/index.js'

// Hard-coded IDs from seed data

const App = () => {
    const flushPendingBlockfaceSave = () => {
        const currentBlockface = S.currentBlockface(store.getState())
        if (currentBlockface) post(Action.BlockfaceSelected(currentBlockface))
    }

    const blockfacesArrived = (blockfaces, error) =>
        error ? console.error('Blockfaces listener error:', error) : post(Action.BlockfacesSynced(blockfaces))

    const organizationArrived = (organization, error) => {
        if (error) return console.error('Organization listener error:', error)

        post(Action.OrganizationSynced(organization))

        // read blockfaces and listen for changes
        projectId = organization.defaultProjectId
        blockfaceFacade = organizationsFacade.descendant(organizationId, Project).descendant(projectId, Blockface)
        const blockfacesUnsubscribe = blockfaceFacade.listenToCollection([], blockfacesArrived)

        // Store unsubscribe functions for cleanup
        window.firestoreUnsubscribers = { organization: orgUnsubscribe, blockfaces: blockfacesUnsubscribe }
    }

    const setUpFirestoreListeners = async () => {
        await possiblyAutoLogin()

        const { currentUser: authUser } = getAuth()
        if (!authUser) throw new Error('No authenticated user')

        currentUser = await usersFacade.read(authUser.uid)

        // read current organization and listen for changes
        organizationId = currentUser.organizations?.[0].organizationId
        if (!organizationId) throw new Error('User has no organizations')
        orgUnsubscribe = organizationsFacade.listenToDocument(organizationId, organizationArrived)
    }

    const usersFacade = FirestoreClientFacade(User)
    const organizationsFacade = FirestoreClientFacade(Organization)
    let orgUnsubscribe // set up *after* we have the organization
    let organizationId
    let projectId
    let currentUser
    let blockfaceFacade // set up *after* we have an organization and project!

    const [dataLoaded, setDataLoaded] = useState(false)

    useEffect(() => {
        setUpFirestoreListeners() // no need to await

        window.addEventListener('beforeunload', flushPendingBlockfaceSave)
        window.addEventListener('visibilitychange', flushPendingBlockfaceSave)

        return () => {
            window.removeEventListener('beforeunload', flushPendingBlockfaceSave)
            window.removeEventListener('visibilitychange', flushPendingBlockfaceSave)

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
