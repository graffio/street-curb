// ABOUTME: IndexedDB persistence for application state
// ABOUTME: Domain-specific read/write for table layouts, tab layout, account prefs, and file handle

const DB_NAME = 'quicken-web-app'
const DB_VERSION = 1
const STORE_NAME = 'keyval'
const TABLE_LAYOUTS_KEY = 'tableLayouts'
const TAB_LAYOUT_KEY = 'tabLayout'
const ACCOUNT_LIST_PREFS_KEY = 'accountListPrefs'
const FILE_HANDLE_KEY = 'fileHandle'

// COMPLEXITY: cohesion-structure — internal IndexedDB helpers don't fit P/T/F/V/A groups

// Binds resolve/reject to IDBRequest events
// @sig bindRequestCallbacks :: (IDBRequest, Function, Function) -> ()
const bindRequestCallbacks = (request, resolve, reject) => {
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
}

// Wraps an IDBRequest in a Promise
// @sig promisifyRequest :: IDBRequest -> Promise<any>
const promisifyRequest = request => new Promise((resolve, reject) => bindRequestCallbacks(request, resolve, reject))

// Opens the IndexedDB database, creating the object store on first access
// @sig openDb :: () -> Promise<IDBDatabase>
const openDb = () => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    return promisifyRequest(request)
}

// Retrieves a JSON-serialized value from IndexedDB
// @sig queryJson :: String -> Promise<any>
const queryJson = async key => {
    const db = await openDb()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const result = await promisifyRequest(tx.objectStore(STORE_NAME).get(key))
    db.close()
    return result ? JSON.parse(result) : result
}

// Stores a JSON-serialized value in IndexedDB
// @sig persistJson :: (String, any) -> Promise<void>
const persistJson = async (key, value) => {
    try {
        const db = await openDb()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        await promisifyRequest(tx.objectStore(STORE_NAME).put(JSON.stringify(value), key))
        db.close()
    } catch (e) {
        console.error('IndexedDB persist failed:', key, e)
    }
}

// Retrieves a value using structured cloning (for non-serializable values)
// @sig queryRaw :: String -> Promise<any>
const queryRaw = async key => {
    const db = await openDb()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const result = await promisifyRequest(tx.objectStore(STORE_NAME).get(key))
    db.close()
    return result
}

// Stores a value using structured cloning (for non-serializable values)
// @sig persistRaw :: (String, any) -> Promise<void>
const persistRaw = async (key, value) => {
    try {
        const db = await openDb()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        await promisifyRequest(tx.objectStore(STORE_NAME).put(value, key))
        db.close()
    } catch (e) {
        console.error('IndexedDB persist failed:', key, e)
    }
}

const IndexedDbStorage = {
    queryTableLayouts: () => queryJson(TABLE_LAYOUTS_KEY),
    persistTableLayouts: value => persistJson(TABLE_LAYOUTS_KEY, value),
    queryTabLayout: () => queryJson(TAB_LAYOUT_KEY),
    persistTabLayout: value => persistJson(TAB_LAYOUT_KEY, value),
    queryAccountListPrefs: () => queryJson(ACCOUNT_LIST_PREFS_KEY),
    persistAccountListPrefs: value => persistJson(ACCOUNT_LIST_PREFS_KEY, value),
    queryFileHandle: () => queryRaw(FILE_HANDLE_KEY),
    persistFileHandle: value => persistRaw(FILE_HANDLE_KEY, value),
}

export { IndexedDbStorage }
