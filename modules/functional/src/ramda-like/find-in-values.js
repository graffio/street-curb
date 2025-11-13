/*
 * Given an object o, call Object.values(o).find
 * @sig findInValues :: (A -> Boolean, {k: A}) -> A
 *
 */

const findInValues = (predicate, o) => Object.values(o).find(predicate)

export default findInValues
