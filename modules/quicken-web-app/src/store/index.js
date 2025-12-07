// ABOUTME: Redux store configuration
// ABOUTME: Provides minimal bootstrap store for application state

import { createStore } from 'redux'
import { rootReducer } from './reducer.js'

const store = createStore(
    rootReducer,
    // Enable Redux DevTools Extension
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
)

export { store }
