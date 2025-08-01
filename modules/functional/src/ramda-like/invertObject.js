import keys from './keys.js'

const _has = (prop, obj) => Object.prototype.hasOwnProperty.call(obj, prop)

/**
 * Same as R.invertObj, however this accounts for objects with duplicate values
 * by putting the values into an array.
 *
 * @func
 * @sig {s: x} -> {x: [ s, ... ]}
 * @param {Object} obj The object or array to invert
 * @return {Object} out A new object with keys
 * in an array.
 * @example
 *
 *      var raceResultsByFirstName = {
 *        first: 'alice',
 *        second: 'jake',
 *        third: 'alice',
 *      };
 *      R.invert(raceResultsByFirstName);
 *      //=> { 'alice': ['first', 'third'], 'jake':['second'] }
 */
const invertObj = obj => {
    const props = keys(obj)
    const len = props.length
    let i = 0
    const out = {}

    while (i < len) {
        const key = props[i]
        const val = obj[key]
        const list = _has(val, out) ? out[val] : (out[val] = [])
        list[list.length] = key
        i += 1
    }
    return out
}

export default invertObj
