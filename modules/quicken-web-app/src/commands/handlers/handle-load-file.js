// ABOUTME: Loads entities from a File and dispatches them to Redux store
// ABOUTME: Manages loading status updates during the async load process

import { Action } from '../../types/action.js'
import { loadEntitiesFromFile } from '../data-sources/load-entities-from-file.js'

// Loads entities from file and dispatches LoadFile action with status updates
// @sig handleLoadFile :: ((Action -> void), File) -> Promise<void>
const handleLoadFile = async (dispatch, file) => {
    try {
        dispatch(Action.SetLoadingStatus('Reading file...'))
        const entities = await loadEntitiesFromFile(file, status => dispatch(Action.SetLoadingStatus(status)))
        dispatch(Action.SetLoadingStatus('Initializing...'))
        const { accounts, categories, lotAllocations, lots, prices, securities, splits, tags, transactions } = entities
        dispatch(
            Action.LoadFile(accounts, categories, securities, tags, splits, transactions, lots, lotAllocations, prices),
        )
    } finally {
        dispatch(Action.SetLoadingStatus(null))
    }
}

export { handleLoadFile }
