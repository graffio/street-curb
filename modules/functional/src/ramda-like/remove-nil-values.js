import isNil from './isNil.js'

/*
 * Remove any entry of o whose value isNil
 * @sig nonNilValues :: {k:*} -> [*]
 */
const removeNilValues = o => {
    const result = {}
    for (const k in o) if (!isNil(o[k])) result[k] = o[k]
    return result
}

export default removeNilValues
