// ABOUTME: Handles system initialization at app startup
// ABOUTME: Hydrates stored file handle from IndexedDB and loads test fixtures

import { Action } from '../../types/action.js'
import { IndexedDbStorage } from '../data-sources/indexed-db-storage.js'
import { StoredFileHandle } from '../data-sources/stored-file-handle.js'
import { handleLoadFile } from './handle-load-file.js'

const TEST_FILE_PARAM = 'testFile'

const E = {
    // Sets stored handle and shows reopen banner if handle exists
    // @sig handleHydratedHandle :: ((Action -> void), FileSystemFileHandle?) -> void
    handleHydratedHandle: (dispatch, handle) => {
        if (handle) {
            StoredFileHandle.set(handle)
            dispatch(Action.SetShowReopenBanner(true))
        }
    },

    // Fetches test fixture from URL and loads into store (fire-and-forget)
    // @sig handleTestFixtureLoad :: ((Action -> void), String) -> Promise<void>
    handleTestFixtureLoad: async (dispatch, url) => {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
        const blob = await response.blob()
        const file = new File([blob], url.split('/').pop(), { type: 'application/x-sqlite3' })
        await handleLoadFile(dispatch, file)
    },
}

// Reads stored file handle from IndexedDB, loads test fixture if URL param present (fire-and-forget)
// @sig handleInitializeSystem :: (Action -> void) -> void
const handleInitializeSystem = dispatch => {
    IndexedDbStorage.queryFileHandle().then(handle => E.handleHydratedHandle(dispatch, handle))
    const params = new URLSearchParams(window.location.search)
    if (!params.has(TEST_FILE_PARAM)) return
    const fileName = params.get(TEST_FILE_PARAM)
    if (!fileName) return
    const name = fileName.endsWith('.sqlite') ? fileName : `${fileName}.sqlite`
    const url = `/test-fixtures/${name}`
    console.log(`[Test Mode] Loading fixture: ${url}`)
    E.handleTestFixtureLoad(dispatch, url)
}

export { handleInitializeSystem }
