/*
 * Given an object o, call Object.values(o).filter
 * @sig filterValues :: (A -> Boolean, {k: A}) -> [A]
 */

const filterValues = (f, o) => Object.values(o).filter(f)

export default filterValues
