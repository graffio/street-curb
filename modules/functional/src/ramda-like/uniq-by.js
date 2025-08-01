import _Set from './internal/set.js'

/**
 * Returns a new list containing only one copy of each element in the original
 * list, based upon the value returned by applying the supplied function to
 * each list element. Prefers the first item if the supplied function produces
 * the same value on two items. [`R.equals`](#equals) is used for comparison.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig (a -> b) -> [a] -> [a]
 * @param {Function} fn A function used to produce a value to use during comparisons.
 * @param {Array} list The array to consider.
 * @return {function(*): *[]} The list of unique items.
 * @example
 *
 *      R.uniqBy(Math.abs, [-1, -5, 2, 10, 1, 2]); //=> [-1, -5, 2, 10]
 */
const uniqBy = fn => list => {
    const set = new _Set()
    const result = []
    let idx = 0
    let appliedItem, item

    while (idx < list.length) {
        item = list[idx]
        appliedItem = fn(item)
        if (set.add(appliedItem)) {
            result.push(item)
        }
        idx += 1
    }
    return result
}

export default uniqBy
