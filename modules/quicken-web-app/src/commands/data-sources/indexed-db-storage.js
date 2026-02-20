// ABOUTME: IndexedDB persistence for application state
// ABOUTME: Domain-specific read/write for table layouts, tab layout, account prefs, and file handle

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Wraps an IDBRequest in a Promise
    // @sig toPromise :: IDBRequest -> Promise<any>
    toPromise: request =>
        new Promise((resolve, reject) => {
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)
        }),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Opens the IndexedDB database, creating the object store on first access
    // @sig openDb :: () -> Promise<IDBDatabase>
    openDb: () => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION)
        request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
        return T.toPromise(request)
    },

    // Retrieves a JSON-serialized value from IndexedDB
    // @sig queryJson :: String -> Promise<any>
    queryJson: async key => {
        const db = await E.openDb()
        const tx = db.transaction(STORE_NAME, 'readonly')
        const result = await T.toPromise(tx.objectStore(STORE_NAME).get(key))
        db.close()
        return result ? JSON.parse(result) : result
    },

    // Stores a JSON-serialized value in IndexedDB
    // @sig persistJson :: (String, any) -> Promise<void>
    persistJson: async (key, value) => {
        try {
            const db = await E.openDb()
            const tx = db.transaction(STORE_NAME, 'readwrite')
            await T.toPromise(tx.objectStore(STORE_NAME).put(JSON.stringify(value), key))
            db.close()
        } catch (e) {
            console.error('IndexedDB persist failed:', key, e)
        }
    },

    // Retrieves a value using structured cloning (for non-serializable values)
    // @sig queryRaw :: String -> Promise<any>
    queryRaw: async key => {
        const db = await E.openDb()
        const tx = db.transaction(STORE_NAME, 'readonly')
        const result = await T.toPromise(tx.objectStore(STORE_NAME).get(key))
        db.close()
        return result
    },

    // Stores a value using structured cloning (for non-serializable values)
    // @sig persistRaw :: (String, any) -> Promise<void>
    persistRaw: async (key, value) => {
        try {
            const db = await E.openDb()
            const tx = db.transaction(STORE_NAME, 'readwrite')
            await T.toPromise(tx.objectStore(STORE_NAME).put(value, key))
            db.close()
        } catch (e) {
            console.error('IndexedDB persist failed:', key, e)
        }
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const DB_NAME = 'quicken-web-app'
const DB_VERSION = 1
const STORE_NAME = 'keyval'
const TABLE_LAYOUTS_KEY = 'tableLayouts'
const TAB_LAYOUT_KEY = 'tabLayout'
const ACCOUNT_LIST_PREFS_KEY = 'accountListPrefs'
const FILE_HANDLE_KEY = 'fileHandle'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const IndexedDbStorage = {
    queryTableLayouts: () => E.queryJson(TABLE_LAYOUTS_KEY),
    persistTableLayouts: value => E.persistJson(TABLE_LAYOUTS_KEY, value),
    queryTabLayout: () => E.queryJson(TAB_LAYOUT_KEY),
    persistTabLayout: value => E.persistJson(TAB_LAYOUT_KEY, value),
    queryAccountListPrefs: () => E.queryJson(ACCOUNT_LIST_PREFS_KEY),
    persistAccountListPrefs: value => E.persistJson(ACCOUNT_LIST_PREFS_KEY, value),
    queryFileHandle: () => E.queryRaw(FILE_HANDLE_KEY),
    persistFileHandle: value => E.persistRaw(FILE_HANDLE_KEY, value),
}

export { IndexedDbStorage }
