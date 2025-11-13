/*
 * Given an object o, return a new object with the same keys as o and values computed by calling f on each value of o
 * Shallow: won't find objects in o's prototype or nested children
 * @sig mapObject :: (* -> *, {k: v}) -> {k: v}
 */

const mapObject = (f, o) => {
    const result = {}

    const f1 = (key, i) => {
        const value = o[key]
        result[key] = f(value, key, i)
    }
    Object.keys(o).map(f1)

    return result
}

export default mapObject
