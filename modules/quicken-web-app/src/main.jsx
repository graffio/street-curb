// ABOUTME: Application entry point — bootstrap, then render
// ABOUTME: Initializes store, registers global actions and keyboard listener, then mounts React

import '@radix-ui/themes/styles.css'
import { KeymapModule } from '@graffio/keymap'
import { Theme } from '@radix-ui/themes'
import { RouterProvider } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { post } from './commands/post.js'
import { KeymapConfig } from './keymap-config.js'
import { Router } from './router.js'
import { currentStore, initializeStore } from './store/index.js'
import * as S from './store/selectors.js'
import { Action } from './types/action.js'

const { ActionRegistry, handleKeydown } = KeymapModule
const { DEFAULT_BINDINGS } = KeymapConfig
const keydownHandler = handleKeydown(DEFAULT_BINDINGS)

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Bootstraps the app after store hydration: registers global actions, keyboard listener, init, then renders React
    // @sig bootstrap :: Store -> void
    bootstrap: store => {
        post(Action.InitializeSystem())
        window.addEventListener('keydown', e => keydownHandler(S.tabLayout(currentStore().getState()), e))
        ActionRegistry.register(undefined, [
            { id: 'toggle-shortcuts', description: 'Toggle shortcuts', execute: () => post(Action.ToggleDrawer()) },
        ])
        ReactDOM.createRoot(document.getElementById('root')).render(<App store={store} />)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

initializeStore().then(E.bootstrap)
