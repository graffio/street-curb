/**
 * Returns a new list by plucking the same named property off all objects in the list supplied.
 *
 * @since v0.1.0
 * @category List
 * @sig [{k:v}] -> [v]
 * @param {Number|String} key The key name to pluck off of each object.
 * @param {Array} list The array
 * @return {Array} The list of values for the given key.
 * @example
 */
const pluck = (key, list) => list.map(o => o[key])
export default pluck
