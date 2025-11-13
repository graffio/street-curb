/*
 * Move the first item that returns true when sent to predicate to the end of the array
 *
 * @sig moveItemToEnd = (A, [A], Predicate) -> [A]
 *  Predicate = A -> Boolean
 */
import without from './without.js'

const moveItemToEnd = (item, items, predicate) => {
    const foundItem = items.find(predicate)

    // remove the item if it's already in the list, so we don't duplicate it
    if (foundItem) items = without(foundItem, items)

    // append the item to the list
    return items.concat(item)
}

export default moveItemToEnd
