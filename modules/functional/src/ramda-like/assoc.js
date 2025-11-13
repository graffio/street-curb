/**
 * Makes a shallow clone of an object, setting or overriding the specified
 * property with the given value. Note that this copies and flattens prototype
 * properties onto the new object as well. All non-primitive properties are
 * copied by reference.
 *
 * @func
 * @category Object
 * @sig (String, a, {k: v}) -> {k: v}
 * @param {String} key The property name to set
 * @param {*} value The new value
 * @param {Object} o The object to clone
 * @return {Object} A new object equivalent to the original except for the changed property.
 * @sig assoc :: (String, a, Object) -> Object
 * @example
 *
 *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
 */
const assoc = (key, value, o) => {
    if (typeof o === 'undefined') throw new Error('Not expecting undefined in assoc')

    return Object.assign({}, o, { [key]: value })
}

export default assoc
