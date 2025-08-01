/**
 * Makes a shallow clone of an object, omitting the property at the given path.
 *
 * @func
 * @sig dissocPath :: [String] -> {k: v} -> {k: v}
 * @param {Array} path The path to the value to omit
 * @param {Object} obj The object to clone
 * @return {Object} A new object without the property at path
 * @example
 *
 *      R.dissocPath(['a', 'b', 'c'], {a: {b: {c: 42}}}); //=> {a: {b: {}}}
 */
const dissocPath = (path, obj) => {
    if (typeof obj !== 'object') return obj
    if (typeof path === 'string') path = path.split(/\./)
    if (path.length === 0) return obj

    const key = path[0]
    const copy = Object.assign({}, obj)

    if (path.length === 1) {
        delete copy[key]
        return copy
    }

    copy[key] = dissocPath(path.slice(1), copy[key])
    return copy
}

export default dissocPath
