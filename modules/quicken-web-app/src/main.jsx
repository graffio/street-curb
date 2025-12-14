// ABOUTME: Application entry point
// ABOUTME: Configures Redux, Theme, and Router

import { Theme } from '@graffio/design-system'
import { RouterProvider } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { router } from './router.jsx'
import { store } from './store/index.js'

// @sig App :: () -> ReactElement
const App = () => (
    <React.StrictMode>
        <Provider store={store}>
            <Theme appearance="light" accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
                <RouterProvider router={router} />
            </Theme>
        </Provider>
    </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
