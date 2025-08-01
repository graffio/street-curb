import { createStore, combineReducers } from 'redux'
import curbReducer from './curbStore.js'

/**
 * Main Redux store configuration using vanilla Redux
 * @sig createStore :: Object -> Store
 */
const rootReducer = combineReducers({ curb: curbReducer })

const store = createStore(
    rootReducer,
    // Enable Redux DevTools Extension
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
)

export default store
