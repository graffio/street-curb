// ABOUTME: Redux store configuration with async initialization
// ABOUTME: Exports initializeStore() which hydrates from IndexedDB before creating store
// COMPLEXITY: Exports both store access and initialization - both needed by app and commands

import { createStore } from 'redux'
import { hydrateAccountListPrefs, hydrateTabLayout, hydrateTableLayouts } from './hydration.js'
import { Reducer } from './reducer.js'

const { createEmptyState, rootReducer } = Reducer

let store = null

// Hydrates state from IndexedDB and creates the Redux store
// @sig initializeStore :: () -> Promise<Store>
const initializeStore = async () => {
    const promises = [hydrateTableLayouts(), hydrateTabLayout(), hydrateAccountListPrefs()]
    const [tableLayouts, tabLayout, accountListPrefs] = await Promise.all(promises)

    const preloadedState = {
        ...createEmptyState(),
        initialized: true,
        tableLayouts,
        tabLayout,
        accountListSortMode: accountListPrefs.sortMode,
        collapsedSections: accountListPrefs.collapsedSections,
    }

    store = createStore(
        rootReducer,
        preloadedState,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    )

    return store
}

// Returns the store (available after initializeStore completes)
// @sig currentStore :: () -> Store
const currentStore = () => store

export * as Selectors from './selectors.js'
export { currentStore, initializeStore }
