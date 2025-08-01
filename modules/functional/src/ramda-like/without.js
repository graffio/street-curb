import { reject } from './list.js'

/**
 * Returns a new list without values in the first argument. Equality is based on IDENTITY (that is: ===)
 *
 * @category List
 * @sig [a] -> [a] -> [a]
 * @param {Array} toBeRemoved The values to be removed from `list2`.
 * @param {Array} list The array to remove values from.
 * @return {Array} The new array without values in `toBeRemoved`.
 * @example
 *
 *      R.without([1, 2], [1, 2, 1, 3, 4]); //=> [3, 4]
 *      R.without(1, [1, 2, 1, 3, 4]); //=> [2, 3, 4]
 */
const without = (toBeRemoved, list) => {
    if (!Array.isArray(toBeRemoved)) toBeRemoved = [toBeRemoved]
    return reject(o => toBeRemoved.includes(o), list)
}

export default without
