import compact from './compact.js'

/*
 * Call f on each value, but drop any nil value. The resulting array may be shorter than the input array.
 * @sig (F, [A]) -> [B]
 *  F = A -> B
 */
const compactMap = (f, values) => compact(values.map(f))

export default compactMap
