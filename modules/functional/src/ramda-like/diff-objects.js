/*
 * Compare two objects and return the differences between them as an object:
 *
 *   {
 *     added: [Path],
 *     deleted: [Path],
 *     changed: [Path],
 *   }
 * with Path is a string in the form a.b.c that defines a path into the object where they differ
 *
 * example:
 *
 * const o1 = { a: 1, b: { c: 5, d: [1, 2, 3], e: { f: 6        } }              }
 * const o2 = { a: 1, b: {       d: [1, 2, 3], e: { f: 8, f1: 8 } }, x: { g: 5 } }
 *
 * diffObject(o1, o2) --> { deleted: ['b.c'], changed: ['b.e.f'], added: ['b.e.f1', 'x'] }
 */

import assoc from './assoc.js'

const isObject = value => typeof value === 'object' && value !== null
const hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key) // Using it from prototype
const addKeyToPath = (path, key) => [...path, key].join('.')

// Return keys present in 'a' but not 'b' and vice versa
const getAddedKeys = (a, b) => Object.keys(b).filter(key => !hasProperty(a, key))
const getDeletedKeys = (a, b) => Object.keys(a).filter(key => !hasProperty(b, key))

const addAddedPath = (acc, key, path) => assoc('added', acc.added.concat(path), acc)
const addDeletedPath = (acc, key, path) => assoc('deleted', acc.deleted.concat(path), acc)
const addChangedPath = (acc, path) => assoc('changed', acc.changed.concat(path), acc)

// Handle nested objects by performing a recursive diff and accumulating the results
const recurse = (acc, a, b, key, path) => {
    const deepDiff = diffObjects(a[key], b[key], path)

    return {
        added: acc.added.concat(...deepDiff.added),
        deleted: acc.deleted.concat(...deepDiff.deleted),
        changed: acc.changed.concat(...deepDiff.changed),
    }
}

// Recursive reducer to accumulate differences between objects 'a' and 'b'
const deepDiffReducer = (a, b, path) => (acc, key) => {
    const newPath = addKeyToPath(path, key)

    if (!hasProperty(a, key)) return addAddedPath(acc, key, newPath)
    if (!hasProperty(b, key)) return addDeletedPath(acc, key, newPath)
    if (isObject(a[key]) && isObject(b[key])) return recurse(acc, a, b, key, newPath)
    if (a[key] !== b[key]) return addChangedPath(acc, newPath)

    return acc
}

// Main function that compares objects 'a' and 'b' and returns their differences
const getDeepDiffs = (a, b, path) => {
    const combinedKeys = new Set([...Object.keys(a), ...Object.keys(b)])
    return Array.from(combinedKeys).reduce(deepDiffReducer(a, b, path), { added: [], deleted: [], changed: [] })
}

// Main function that initiates the diffing process
const diffObjects = (a, b, path = '') => {
    const basePath = path ? [path] : []
    return {
        added: getAddedKeys(a, b).map(key => addKeyToPath(basePath, key)),
        deleted: getDeletedKeys(a, b).map(key => addKeyToPath(basePath, key)),
        ...getDeepDiffs(a, b, basePath),
    }
}

export default diffObjects
