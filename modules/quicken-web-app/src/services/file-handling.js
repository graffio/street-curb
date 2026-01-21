// ABOUTME: File handling service for opening and loading financial files
// ABOUTME: Manages file picker, IndexedDB persistence, and entity loading

import { post } from '../commands/post.js'
import { SqliteService } from './sqlite-service.js'
import { getRaw, setRaw } from './storage.js'
import { Action } from '../types/action.js'
const { loadEntitiesFromFile } = SqliteService

const FILE_HANDLE_KEY = 'fileHandle'

const T = {
    // Stores handle and shows reopen banner if handle exists
    // @sig hydrateFileHandle :: Function -> FileSystemFileHandle? -> void
    hydrateFileHandle: setStoredHandle => handle => {
        if (handle) {
            setStoredHandle(handle)
            post(Action.SetShowReopenBanner(true))
        }
    },
}

const E = {
    // Loads entities from a file handle into Redux store
    // @sig loadFromHandle :: FileSystemFileHandle -> Promise<void>
    loadFromHandle: async handle => {
        try {
            post(Action.SetLoadingStatus('Reading file...'))
            const file = await handle.getFile()
            const entities = await loadEntitiesFromFile(file, status => post(Action.SetLoadingStatus(status)))
            post(Action.SetLoadingStatus('Initializing...'))
            const { accounts, categories, lotAllocations, lots, prices, securities, splits, tags, transactions } =
                entities
            post(
                Action.LoadFile(
                    accounts,
                    categories,
                    securities,
                    tags,
                    splits,
                    transactions,
                    lots,
                    lotAllocations,
                    prices,
                ),
            )
        } finally {
            post(Action.SetLoadingStatus(null))
        }
    },

    // Opens file picker and loads selected file
    // @sig openFile :: Function -> Promise<void>
    openFile: async setStoredHandle => {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{ description: 'Financial files', accept: { 'application/*': ['.sqlite', '.qif'] } }],
            })
            setRaw(FILE_HANDLE_KEY, handle)
            setStoredHandle(handle)
            await E.loadFromHandle(handle)
        } catch (error) {
            if (error.name !== 'AbortError') console.error('Failed to open file:', error.message)
        }
    },

    // Requests permission and reopens previously stored file
    // @sig reopenFile :: FileSystemFileHandle -> Promise<void>
    reopenFile: async storedHandle => {
        try {
            const permission = await storedHandle.requestPermission({ mode: 'read' })
            if (permission === 'granted') {
                post(Action.SetShowReopenBanner(false))
                await E.loadFromHandle(storedHandle)
            }
        } catch (error) {
            console.error('Failed to reopen file:', error.message)
            post(Action.SetShowReopenBanner(false))
        }
    },

    // Loads stored file handle from IndexedDB on startup
    // @sig loadStoredHandle :: Function -> undefined
    loadStoredHandle: setStoredHandle => {
        getRaw(FILE_HANDLE_KEY).then(T.hydrateFileHandle(setStoredHandle))
        return undefined
    },

    // Dismisses banner and opens file picker for new file
    // @sig openNewFile :: Function -> Promise<void>
    openNewFile: async setStoredHandle => {
        post(Action.SetShowReopenBanner(false))
        await E.openFile(setStoredHandle)
    },
}

export { E as FileHandling }
