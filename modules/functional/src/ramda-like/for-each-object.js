/*
 * Given an object o and function f, call f on each value of o
 * Shallow: won't find objects in o's prototype or nested children
 * @sig forEachObject :: (* -> *, {k: v}) -> void
 */

const forEachObject = (f, o) => {
    const f1 = (key, i) => {
        const value = o[key]
        f(value, key, i)
    }
    Object.keys(o).forEach(f1)
}

export default forEachObject
