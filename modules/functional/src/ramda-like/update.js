/**
 * Returns a new copy of the array with the element at the provided index replaced with the given value.
 * Not curried
 *
 * @func
 * @since v0.14.0
 * @category List
 * @sig Number -> a -> [a] -> [a]
 * @param {Number} i The index to update.
 * @param {*} x The value to exist at the given index of the returned array.
 * @param {Array} list The source array-like object to be updated.
 * @return {Array} A copy of `list` with the value at index `i` replaced with `x`.
 *
 *
 * @example
 *
 *      R.update(1, '_', ['a', 'b', 'c']);      //=> ['a', '_', 'c']
 *      R.update(-1, '_', ['a', 'b', 'c']);     //=> ['a', 'b', '_']
 * @symb R.update(-1, a, [b, c]) = [b, a]
 * @symb R.update(0, a, [b, c]) = [a, c]
 * @symb R.update(1, a, [b, c]) = [b, a]
 */
const update = function update(i, x, list) {
    const result = [...list]
    result[i] = x
    return result
}

export default update
