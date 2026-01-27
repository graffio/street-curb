// ABOUTME: Application entry point
// ABOUTME: Initializes store from IndexedDB, then renders React app

import { Theme } from '@graffio/design-system'
import { RouterProvider } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { Router } from './router.js'
import { initializeStore } from './store/index.js'

// Root component wrapping providers and router
// @sig App :: Store -> ReactElement
const App = ({ store }) => (
    <React.StrictMode>
        <Provider store={store}>
            <Theme appearance="light" accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
                <RouterProvider router={Router.router} />
            </Theme>
        </Provider>
    </React.StrictMode>
)

initializeStore().then(store => ReactDOM.createRoot(document.getElementById('root')).render(<App store={store} />))
