// ABOUTME: Immutable append to array at object key, creating array if needed
// ABOUTME: Useful in reducers that accumulate items into groups

// Appends item to the array at obj[key], creating the array if it doesn't exist
// Returns a new object (immutable)
// @sig pushToKey :: (Object, String, a) -> Object
const pushToKey = (obj, key, item) => ({ ...obj, [key]: [...(obj[key] || []), item] })

export default pushToKey
