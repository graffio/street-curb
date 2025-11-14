// ABOUTME: Application entry point
// ABOUTME: Configures Redux, Theme, Router, and layout navigation

import { layoutChannel, LoadingSpinner } from '@graffio/design-system'
import { Theme } from '@radix-ui/themes'
import { RouterProvider } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { FirestoreClientFacade } from './firestore-facade/firestore-client-facade.js'
import { router } from './router.jsx'
import { loadAllInitialData } from './store/actions.js'
import store from './store/index.js'
import { Organization, User } from './types/index.js'

// Configure sidebar navigation
// prettier-ignore
layoutChannel.setState({
    sidebarItems: [
        {
            title: 'Navigation',
            items: [
                { label: 'Map',        href: '/map' },
            ],
        },
        {
            title: 'Admin',
            items: [
                { label: 'User Admin', href: '/admin/users' },
            ],
        },
    ],
})

// Hard-coded IDs from seed data
const ALICE_ID = 'usr_alice0000000'

const App = () => {
    const [dataLoaded, setDataLoaded] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            const usersFacade = FirestoreClientFacade(User)
            const organizationsFacade = FirestoreClientFacade(Organization)

            const currentUser = await usersFacade.read(ALICE_ID)
            const organizationId = currentUser.organizations?.[0].organizationId // load 1st organization for now
            if (!organizationId) setDataLoaded(true)

            const currentOrganization = await organizationsFacade.read(organizationId)
            const members = currentOrganization.members

            store.dispatch(loadAllInitialData(currentUser, currentOrganization, members))
            setDataLoaded(true)
        }

        loadData()
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
