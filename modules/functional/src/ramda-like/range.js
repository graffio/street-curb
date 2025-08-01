import isNumber from './internal/is-number.js'

/**
 * Returns a list of numbers from `from` (inclusive) to `to` (exclusive).
 *
 * @func
 * @since v0.1.0
 * @category List
 * @sig (Number, Number) -> [Number]
 * @param {Number} from The first number in the list.
 * @param {Number} to One more than the last number in the list.
 * @return {Array} The list of numbers in the set `[a, b)`.
 * @example
 *
 *      R.range(1, 5);    //=> [1, 2, 3, 4]
 *      R.range(50, 53);  //=> [50, 51, 52]
 */
const range = function range(from, to) {
    if (!(isNumber(from) && isNumber(to))) throw new TypeError('Both arguments to range must be numbers')

    const result = []
    let n = from
    while (n < to) {
        result.push(n)
        n += 1
    }
    return result
}

export default range
