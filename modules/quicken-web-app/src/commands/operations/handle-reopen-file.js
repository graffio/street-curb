// ABOUTME: Requests permission on stored file handle and reopens file
// ABOUTME: Dismisses reopen banner on success or failure

import { Action } from '../../types/action.js'
import { StoredFileHandle } from '../data-sources/stored-file-handle.js'
import { handleLoadFile } from './handle-load-file.js'

// Requests permission on stored handle, loads file if granted (fire-and-forget)
// @sig handleReopenFile :: (Action -> void) -> Promise<void>
const handleReopenFile = async dispatch => {
    try {
        const handle = StoredFileHandle.get()
        const permission = await handle.requestPermission({ mode: 'read' })
        if (permission === 'granted') {
            dispatch(Action.SetShowReopenBanner(false))
            const file = await handle.getFile()
            await handleLoadFile(dispatch, file)
        }
    } catch (error) {
        console.error('Failed to reopen file:', error.message)
        dispatch(Action.SetShowReopenBanner(false))
    }
}

export { handleReopenFile }
