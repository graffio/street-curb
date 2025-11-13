// ABOUTME: Application entry point
// ABOUTME: Configures Redux, Theme, Router, and layout navigation

import { layoutChannel } from '@graffio/design-system'
import { Theme } from '@radix-ui/themes'
import { RouterProvider } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { router } from './router.jsx'
import store from './store/index.js'

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

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <Theme appearance="light" accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
                <RouterProvider router={router} />
            </Theme>
        </Provider>
    </React.StrictMode>,
)
