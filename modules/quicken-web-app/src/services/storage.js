// ABOUTME: IndexedDB wrapper providing simple key-value storage API
// ABOUTME: Replaces localStorage for persistence with support for non-serializable values

const DB_NAME = 'quicken-web-app'
const DB_VERSION = 1
const STORE_NAME = 'keyval'

// COMPLEXITY: Internal helper for Promise binding; naming doesn't fit cohesion patterns
// Binds resolve/reject to IDBRequest events
// @sig bindRequestCallbacks :: (IDBRequest, Function, Function) -> ()
const bindRequestCallbacks = (request, resolve, reject) => {
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
}

// COMPLEXITY: "promisifyRequest" describes transformation; doesn't fit to*/get* naturally
// Wraps an IDBRequest in a Promise
// @sig promisifyRequest :: IDBRequest -> Promise<any>
const promisifyRequest = request => new Promise((resolve, reject) => bindRequestCallbacks(request, resolve, reject))

// COMPLEXITY: "openDb" is internal helper; doesn't fit get*/create* pattern naturally
// Opens the IndexedDB database, creating the object store on first access
// @sig openDb :: () -> Promise<IDBDatabase>
const openDb = () => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    return promisifyRequest(request)
}

// COMPLEXITY: "get" is standard key-value API naming; renaming would obscure intent
// Retrieves a value from IndexedDB by key (JSON parsed)
// @sig get :: String -> Promise<any>
const get = async key => {
    const db = await openDb()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const result = await promisifyRequest(tx.objectStore(STORE_NAME).get(key))
    db.close()
    return result ? JSON.parse(result) : result
}

// COMPLEXITY: "set" is standard key-value API naming; renaming would obscure intent
// Stores a value in IndexedDB under the given key (JSON stringified to preserve non-enumerable props)
// @sig set :: (String, any) -> Promise<void>
const set = async (key, value) => {
    try {
        const db = await openDb()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        await promisifyRequest(tx.objectStore(STORE_NAME).put(JSON.stringify(value), key))
        db.close()
    } catch (e) {
        console.error('IndexedDB set failed:', key, e)
    }
}

// COMPLEXITY: "getRaw" is standard key-value API naming; renaming would obscure intent
// Retrieves a value using structured cloning (for FileSystemFileHandle, etc.)
// @sig getRaw :: String -> Promise<any>
const getRaw = async key => {
    const db = await openDb()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const result = await promisifyRequest(tx.objectStore(STORE_NAME).get(key))
    db.close()
    return result
}

// COMPLEXITY: "setRaw" is standard key-value API naming; renaming would obscure intent
// Stores a value using structured cloning (for FileSystemFileHandle, etc.)
// @sig setRaw :: (String, any) -> Promise<void>
const setRaw = async (key, value) => {
    try {
        const db = await openDb()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        await promisifyRequest(tx.objectStore(STORE_NAME).put(value, key))
        db.close()
    } catch (e) {
        console.error('IndexedDB setRaw failed:', key, e)
    }
}

const Storage = { get, getRaw, set, setRaw }

export { Storage }
