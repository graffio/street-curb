/**
 * Returns a partial copy of an object omitting the keys specified.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @sig [String] -> {String: *} -> {String: *}
 * @param {Array} keys an array of String property keys to omit from the new object
 * @param {Object} o The object to copy from
 * @return {Object} A new object with properties from `keys` not on it.
 * @see R.pick
 * @example
 *
 *      R.omit(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, c: 3}
 */
const omit = (keys, o) => {
    // passed in a single key; convert to array
    if (!Array.isArray(keys)) keys = [keys]

    const result = {}
    const ignore = {}

    // mark the keys to ignore
    for (let i = 0; i < keys.length; i++) ignore[keys[i]] = 1

    // copy everything NOT marked in ignore
    for (const prop in o) {
        if (!Object.prototype.hasOwnProperty.call(ignore, prop)) result[prop] = o[prop]
    }

    return result
}

export default omit
