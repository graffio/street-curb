/*
 * Move array item from X position to Y position (insert it in the new place).
 * @sig moveArrayItem :: ([a], Number, Number) -> [b]
 * Note: operates on a shallow copy of the provided array.
 *
 * Example:
 *      // move item from index 3 to index 0
 *      moveArrayItem([1, 2, 3, 4], 3, 0) -> [4, 1, 2, 3]
 */

const moveArrayItem = (arr, fromIndex, toIndex) => {
    const arrayCopy = [...arr]
    const element = arrayCopy[fromIndex]
    arrayCopy.splice(fromIndex, 1)
    arrayCopy.splice(toIndex, 0, element)

    return arrayCopy
}

export default moveArrayItem
