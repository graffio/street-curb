// ABOUTME: Redux store configuration
// ABOUTME: Hydration happens lazily in reducer via getInitialState()

import { createStore } from 'redux'
import { rootReducer } from './reducer.js'

const store = createStore(
    rootReducer,
    undefined,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
)

export * as Selectors from './selectors'
export { store }
