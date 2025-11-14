import { createStore } from 'redux'
import { rootReducer } from './reducer.js'

/**
 * Main Redux store configuration using vanilla Redux
 * @sig createStore :: Object -> Store
 */

const store = createStore(
    rootReducer,
    // Enable Redux DevTools Extension
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
)

export { store }
