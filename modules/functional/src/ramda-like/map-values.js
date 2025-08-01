/*
 * Given an object o, call Object.values(o).map
 * @sig mapValues :: (A -> B, {k: A}) -> [B]
 */

const mapValues = (f, o) => Object.values(o).map(f)

export default mapValues
