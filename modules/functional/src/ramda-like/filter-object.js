/*
 * Given an object o, return an object where each key o[key] passes the filter predicate
 * @sig filterValues :: (A -> Boolean, {k: A}) -> {k: A}
 */

const filterObject = (f, o) => {
    const result = {}

    for (const k in o) {
        const value = o[k]
        if (f(value)) result[k] = value
    }

    return result
}

export default filterObject
