// ABOUTME: Immutable nested update for structures containing LookupTables and Tagged types
// ABOUTME: Knows how to rebuild LookupTables via addItemWithId and Tagged types via constructor.from

import LookupTable from './lookup-table.js'

/*
 * Recursively update a nested value, rebuilding LookupTables and Tagged types along the way.
 * Throws if any intermediate path segment doesn't exist. Final segment may be undefined (allows setting new keys).
 *
 * Rebuild strategy by container type:
 *   - LookupTable: uses addItemWithId (preserves array + id lookup structure)
 *   - Tagged type: uses constructor.from (preserves type metadata)
 *   - Plain object: uses spread
 *
 * @sig updateLookupTablePath :: (obj, [String], valueOrFn) -> obj
 */
const updateLookupTablePath = (obj, path, valueOrFn) => {
    if (path.length === 0) return typeof valueOrFn === 'function' ? valueOrFn(obj) : valueOrFn

    const [key, ...rest] = path
    const child = obj[key]

    // Intermediate segments must exist; final segment may be undefined (we're setting it)
    if (child === undefined && rest.length > 0)
        throw new Error(`updateLookupTablePath: missing key '${key}' in ${obj['@@typeName'] || 'object'}`)

    const updatedChild = updateLookupTablePath(child, rest, valueOrFn)

    // Rebuild based on container type
    if (LookupTable.is(obj)) return obj.addItemWithId(updatedChild)
    if (obj['@@typeName']) return obj.constructor.from({ ...obj, [key]: updatedChild })
    return { ...obj, [key]: updatedChild }
}

export { updateLookupTablePath }
