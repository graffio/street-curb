// ABOUTME: In-memory state for FileSystemFileHandle (non-serializable, can't go in Redux)
// ABOUTME: Shared across effect handlers; persisted separately via Storage

let handle = null

const StoredFileHandle = { get: () => handle, set: h => (handle = h) }

export { StoredFileHandle }
