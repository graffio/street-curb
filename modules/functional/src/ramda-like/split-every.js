/**
 * Splits a collection into slices of the specified length.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig Number -> [a] -> [[a]]
 * @sig Number -> String -> [String]
 * @param {Number} n
 * @param {Array} list
 * @return {Array}
 * @example
 *
 *      R.splitEvery(3, [1, 2, 3, 4, 5, 6, 7]); //=> [[1, 2, 3], [4, 5, 6], [7]]
 *      R.splitEvery(3, 'foobarbaz'); //=> ['foo', 'bar', 'baz']
 */
const splitEvery = function splitEvery(n, list) {
    if (n <= 0) throw new Error('First argument to splitEvery must be a positive integer')

    const result = []
    let i = 0
    while (i < list.length) 
        result.push(list.slice(i, (i += n)))
    
    return result
}

export default splitEvery
