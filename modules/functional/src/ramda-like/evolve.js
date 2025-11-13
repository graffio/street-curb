/*
 * Given an arbitrarily-nested object o and a transforming function f, return a new value where each
 * (nested) value v in o is replaced with f[o].
 *
 * f has the signature (path, key, value) -> new value
 * where path is an array of strings that indicate the path to get to the current k
 * For instance, in the example below, when f is invoked for num: 3, the path would be ['b', 'c', 'num']
 *
 * Example: f = (path, k, v) => (k === 'timestamp' ? v + 10000 : v)
 *
 *    const o = {                                 const expected1 = {
 *        timestamp: 10000,             ==>           timestamp: 20000,
 *        num: 1,                                     num: 1,
 *        b: {                                        b: {
 *            timestamp: 10001,         ==>               timestamp: 20001,
 *            num: 2,                                     num: 2,
 *            c: {                                        c: {
 *                timestamp: 10002,     ==>                   timestamp: 20002,
 *                num: 3,                                     num: 3,
 *            },                                          },
 *        },                                          },
 *    }                                           }
 *
 * @sig evolve :: (Transform, {k:v}) => {k:v}
 *  Transform = (Path, String, *) => *
 *  Path = [String]
 */

const isObject = x => Object.prototype.toString.call(x) === '[object Object]'

// given an array a and object o, return a new array with all elements of a followed by o
const append = (a, o) => a.concat([o])

const _evolve = (transformFunc, path, o) => {
    if (!isObject(o) && !Array.isArray(o)) return o

    const result = {}

    for (const k in o) {
        const oldValue = o[k]
        const pathForK = append(path, k)
        const newValue = transformFunc(pathForK, k, oldValue)

        const shouldRecurse = newValue && isObject(newValue)
        result[k] = shouldRecurse ? _evolve(transformFunc, pathForK, newValue) : newValue
    }

    return result
}

const evolve = (transformFunc, o) => _evolve(transformFunc, [], o)

export default evolve
