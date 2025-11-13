/*
 * Given array 'a' at the given path in rootObject, if toAdd exists in 'a' replace it, otherwise append it to 'a'
 * Assumes toAdd is "the same" as an existing element iff they have the same 'id'
 * @sig addOrReplaceAtPath :: ([String], {id:String, ...}, {k:v}) -> {k:v}
 */
import assocPath from './assoc-path.js'
import path from './path.js'
import update from './update.js'

const addOrReplaceAtPath = (pathToArray, toAdd, rootObject) => {
    const array = path(pathToArray)(rootObject)
    if (!Array.isArray(array)) {
        console.error(`Path doesn't lead to array`, pathToArray, rootObject)
        return rootObject
    }
    const index = array.findIndex(o => o.id === toAdd.id)
    const newArray = index === -1 ? array.concat(toAdd) : update(index, toAdd, array)
    return assocPath(pathToArray, newArray, rootObject)
}

export default addOrReplaceAtPath
