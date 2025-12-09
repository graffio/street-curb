// ABOUTME: Application entry point
// ABOUTME: Configures Redux, Theme, and Router

import { Theme } from '@radix-ui/themes'
import { RouterProvider } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { post } from './commands/post.js'
import { router } from './router.jsx'
import { store } from './store/index.js'
import { Action } from './types/action.js'
import { generateRealisticTransactions } from './utils/mock-transaction-generator.js'

/*
 * Simulate loading a QIF file after 500ms delay
 * In production, this will be replaced with actual file loading from localStorage or file picker
 */
const useMockFileLoader = () =>
    useEffect(() => {
        const timer = setTimeout(() => {
            const transactions = generateRealisticTransactions(10000)
            post(Action.LoadFile(transactions))
        }, 500)
        return () => clearTimeout(timer)
    }, [])

const App = () => {
    useMockFileLoader()

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
