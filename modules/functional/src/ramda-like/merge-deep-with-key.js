import { isNil } from '../../index.js'
import mergeWithKey from './merge-with-key.js'

/*
 * x is an object, but it's NOT a tagged type, because we don't want to mergeDeep WITHIN tagged types
 */
const isObjectButNotTagged = x =>
    !isNil(x) && !x['@@tagName'] && Object.prototype.toString.call(x) === '[object Object]'

/**
 * Creates a new object with the own properties of the two provided objects.
 * If a key exists in both objects:
 * - and both associated values are also objects then the values will be
 *   recursively merged.
 * - otherwise the provided function is applied to the key and associated values
 *   using the resulting value as the new value associated with the key.
 * If a key only exists in one object, the value will be associated with the key
 * of the resulting object.
 *
 * @func
 * @since v0.24.0
 * @category Object
 * @sig ((String, a, a) -> a) -> {a} -> {a} -> {a}
 * @param {Function} fn
 * @param {Object} lObj
 * @param {Object} rObj
 * @return {Object}
 * @see R.mergeWithKey, R.mergeDeepWith
 * @example
 *
 *      let concatValues = (k, l, r) => k == 'values' ? R.concat(l, r) : r
 *      R.mergeDeepWithKey(concatValues,
 *                         { a: true, c: { thing: 'foo', values: [10, 20] }},
 *                         { b: true, c: { thing: 'bar', values: [15, 35] }});
 *      //=> { a: true, b: true, c: { thing: 'bar', values: [10, 20, 15, 35] }}
 */
const mergeDeepWithKey = (fn, lObj, rObj) => {
    const f = (k, lhs, rhs) =>
        isObjectButNotTagged(lhs) && isObjectButNotTagged(rhs) ? mergeDeepWithKey(fn, lhs, rhs) : fn(k, lhs, rhs)

    return mergeWithKey(f, lObj, rObj)
}

export default mergeDeepWithKey
