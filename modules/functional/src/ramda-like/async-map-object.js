import { zipObject } from '../../index.js'

/*
 * Given an object o, return a new object with the same keys as o and values computed by calling async f on each value of o
 * Shallow: won't find objects in o's prototype or nested children
 * @sig asyncMapObject :: (Func, {k: A}) -> Promise {k: B}
 *  Func = async (A, String, Number) -> Promise B
 */
const asyncMapObject = async (f, o) => {
    const f1 = (key, i) => f(o[key], key, i)

    const promises = Object.keys(o).map(f1)
    const keys = Object.keys(o)
    const values = await Promise.all(promises)

    return zipObject(keys, values)
}

export default asyncMapObject
