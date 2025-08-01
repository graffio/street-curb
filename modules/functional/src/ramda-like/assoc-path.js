import assoc from './assoc.js'
import has from './internal/has.js'
import isNil from './isNil.js'

/**
 * Makes a shallow clone of an object, setting or overriding the nodes required
 * to create the given path, and placing the specific value at the tail end of
 * that path. Note that this copies and flattens prototype properties onto the
 * new object as well. All non-primitive properties are copied by reference.
 *
 * @func
 * @since v0.8.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> a -> {a} -> {a}
 * @param {Array} path the path to set
 * @param {*} val The new value
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original except along the specified path.
 * @see R.dissocPath
 * @example
 *
 *      R.assocPath(['a', 'b', 'c'], 42, {a: {b: {c: 0}}}); //=> {a: {b: {c: 42}}}
 *
 *      // Any missing or non-object keys in path will be overridden
 *      R.assocPath(['a', 'b', 'c'], 42, {a: 5}); //=> {a: {b: {c: 42}}}
 */
const assocPath = (path, val, obj) => {
    if (path.length === 0) return val

    if (typeof path === 'string') path = path.split(/\./)

    const idx = path[0]
    if (path.length > 1) {
        const nextObj = !isNil(obj) && has(idx, obj) ? obj[idx] : Number.isInteger(path[1]) ? [] : {}
        val = assocPath(Array.prototype.slice.call(path, 1), val, nextObj)
    }

    if (Number.isInteger(idx) && Array.isArray(obj)) {
        const arr = [].concat(obj)
        arr[idx] = val
        return arr
    }

    return assoc(idx, val, obj)
}

export default assocPath
