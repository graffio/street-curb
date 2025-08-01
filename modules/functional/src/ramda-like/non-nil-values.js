import isNil from './isNil.js'

/*
 * Similar to Object.values, except nil values (as defined by isNil) are not included
 * @sig nonNilValues :: {k:*} -> [*]
 */
const nonNilValues = o => {
    const result = []
    for (const p in o) if (!isNil(o[p])) result.push(o[p])
    return result
}

export default nonNilValues
