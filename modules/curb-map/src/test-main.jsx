import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import TestAppComponent from './components/TestAppComponent.jsx'
import store from './store/index.js'
import './index.css'

/**
 * Test harness for Playwright tests
 * Provides isolated test environment with scenario switching
 */
const TestApp = () => (
    <Provider store={store}>
        <TestAppComponent />
    </Provider>
)

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <TestApp />
    </React.StrictMode>,
)
