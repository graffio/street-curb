// ABOUTME: Opens file picker and loads selected file into Redux store
// ABOUTME: Persists file handle to IndexedDB for reopen-on-launch

import { IndexedDbStorage } from '../data-sources/indexed-db-storage.js'
import { StoredFileHandle } from '../data-sources/stored-file-handle.js'
import { handleLoadFile } from './handle-load-file.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Opens file picker, persists handle, and loads entities (fire-and-forget)
// @sig handleOpenFile :: (Action -> void) -> Promise<void>
const handleOpenFile = async dispatch => {
    try {
        const [handle] = await window.showOpenFilePicker({
            types: [{ description: 'Financial files', accept: { 'application/*': ['.sqlite', '.qif'] } }],
        })
        StoredFileHandle.set(handle)
        IndexedDbStorage.persistFileHandle(handle)
        const file = await handle.getFile()
        await handleLoadFile(dispatch, file)
    } catch (error) {
        if (error.name !== 'AbortError') console.error('Failed to open file:', error.message)
    }
}

export { handleOpenFile }
