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
import { Action, Organization, User } from './types/index.js'

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

            const usersFacade = FirestoreClientFacade(User)
            const organizationsFacade = FirestoreClientFacade(Organization)

            // Get userId from authenticated user's uid
            const { currentUser: authUser } = getAuth()
            if (!authUser) throw new Error('No authenticated user')

            const userId = authUser.uid // userId is the same as the auth user's uid
            const currentUser = await usersFacade.read(userId)
            const organizationId = currentUser.organizations?.[0].organizationId // load 1st organization for now
            if (!organizationId) throw new Error('No organization ID')

            const currentOrganization = await organizationsFacade.read(organizationId)

            post(Action.AllInitialDataLoaded(currentUser, currentOrganization))
            setDataLoaded(true)
        }

        loadData()

        window.addEventListener('beforeunload', flushPendingSave)
        window.addEventListener('visibilitychange', flushPendingSave)

        return () => {
            window.removeEventListener('beforeunload', flushPendingSave)
            window.removeEventListener('visibilitychange', flushPendingSave)
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
