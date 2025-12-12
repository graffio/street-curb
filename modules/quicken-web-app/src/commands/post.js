// ABOUTME: Command execution layer for domain Actions
// ABOUTME: Dispatches Tagged actions to Redux as plain objects
// ABOUTME: Handles localStorage persistence for table layouts

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Selectors as S, store } from '../store/index.js'
import { Action } from '../types/action.js'
import { ColumnDescriptor, TableLayout } from '../types/index.js'

const TABLE_LAYOUTS_KEY = 'tableLayouts'

/**
 * Dispatch action to Redux store
 * @sig dispatch :: Action -> ()
 */
const dispatch = action => store.dispatch({ type: action.constructor.toString(), payload: action })

/** @sig handleSetTableLayout :: Action.SetTableLayout -> () */
const handleSetTableLayout = action => {
    dispatch(action)

    try {
        window.localStorage.setItem(TABLE_LAYOUTS_KEY, JSON.stringify(S.tableLayouts(store.getState())))
    } catch {
        console.warn('Failed to write tableLayouts to localStorage')
    }
}

/** @sig handleHydrateFromLocalStorage :: () -> () */
const handleHydrateFromLocalStorage = () => {
    // @sig hydrateTableLayout :: Object -> TableLayout
    const hydrateTableLayout = fromLocalStorage => {
        const { id, columns, columnDescriptors, sortOrder } = fromLocalStorage
        const rawColumns = columnDescriptors || columns // support old localStorage format
        const items = Object.values(rawColumns).map(c => ColumnDescriptor.from(c))
        return TableLayout.from({ id, columnDescriptors: LookupTable(items, ColumnDescriptor, 'id'), sortOrder })
    }

    try {
        const stored = window.localStorage.getItem(TABLE_LAYOUTS_KEY)
        if (!stored) return

        const tableLayouts = Object.values(JSON.parse(stored)).map(hydrateTableLayout)
        store.dispatch({ type: 'HydrateFromLocalStorage', payload: LookupTable(tableLayouts, TableLayout, 'id') })
    } catch {
        console.warn('Failed to read tableLayouts from localStorage')
    }
}

/**
 * Post a domain Action to Redux
 * Routes to appropriate handler based on action type
 *
 * @sig post :: Action -> void
 */
const post = action => {
    if (!Action.is(action)) throw new Error('post requires an Action; found: ' + action)

    // prettier-ignore
    action.match({
        LoadFile               : () => dispatch(action),
        SetTransactionFilter   : () => dispatch(action),
        ResetTransactionFilters: () => dispatch(action),
        SetTableLayout         : () => handleSetTableLayout(action),
        HydrateFromLocalStorage: () => handleHydrateFromLocalStorage(),
    })
}

export { post }
