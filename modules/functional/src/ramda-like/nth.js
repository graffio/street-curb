/**
 * Returns the nth element of the given listOrString or string. If n is negative the
 * element at index length + n is returned.
 *
 * @func
 * @since v0.1.0
 * @category List
 * @sig Number -> [a] -> a | Undefined
 * @sig Number -> String -> String
 * @param {Number} offset
 * @param {*} listOrString
 * @return {*}
 * @example
 *
 *      const listOrString = ['foo', 'bar', 'baz', 'quux'];
 *      R.nth(1, listOrString); //=> 'bar'
 *      R.nth(-1, listOrString); //=> 'quux'
 *      R.nth(-99, listOrString); //=> undefined
 *
 *      R.nth(2, 'abc'); //=> 'c'
 *      R.nth(3, 'abc'); //=> ''
 * @symb R.nth(-1, [a, b, c]) = c
 * @symb R.nth(0, [a, b, c]) = a
 * @symb R.nth(1, [a, b, c]) = b
 */
const nth = function nth(offset, listOrString) {
    const index = offset < 0 ? listOrString.length + offset : offset
    return typeof listOrString === 'string' ? listOrString.charAt(index) : listOrString[index]
}

export default nth
