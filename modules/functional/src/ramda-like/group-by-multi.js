// ABOUTME: Group items where each item can belong to multiple groups
// ABOUTME: Key function returns array of keys instead of single key

import pushToKey from './push-to-key.js'

// Groups items by multiple keys - keysFn returns array of keys for each item
// Unlike groupBy where each item goes to one group, here an item can appear in many groups
// @sig groupByMulti :: (a -> [String], [a]) -> { [key]: [a] }
const groupByMulti = (keysFn, items) => {
    // Adds item to all its target groups
    // @sig addToGroups :: (Object, a) -> Object
    const addToGroups = (acc, item) => keysFn(item).reduce((obj, key) => pushToKey(obj, key, item), acc)

    return items.reduce(addToGroups, {})
}

export default groupByMulti
