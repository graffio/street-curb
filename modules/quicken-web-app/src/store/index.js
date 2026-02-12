// ABOUTME: Redux store configuration with async initialization
// ABOUTME: Exports initializeStore() which hydrates from IndexedDB before creating store
// COMPLEXITY: Exports both store access and initialization - both needed by app and commands

import { createStore } from 'redux'
import { Hydration } from './hydration.js'
import { Reducer } from './reducer.js'

const { createEmptyState, rootReducer } = Reducer

let store = null

const P = {
    // Check if running in test mode (skip IndexedDB hydration to start fresh)
    // @sig isTestMode :: () -> Boolean
    isTestMode: () => new URLSearchParams(window.location.search).has('testFile'),
}

const T = {
    // Build promises that resolve to empty state values (for test mode, skipping IndexedDB)
    // @sig toTestModePromises :: () -> [Promise]
    toTestModePromises: () => {
        const { accountListSortMode, collapsedSections, tabLayout, tableLayouts } = createEmptyState()
        return [
            Promise.resolve(tableLayouts),
            Promise.resolve(tabLayout),
            Promise.resolve({ sortMode: accountListSortMode, collapsedSections }),
        ]
    },
}

// Hydrates state from IndexedDB and creates the Redux store
// @sig initializeStore :: () -> Promise<Store>
const initializeStore = async () => {
    const promises = P.isTestMode()
        ? T.toTestModePromises()
        : [Hydration.hydrateTableLayouts(), Hydration.hydrateTabLayout(), Hydration.hydrateAccountListPrefs()]
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
