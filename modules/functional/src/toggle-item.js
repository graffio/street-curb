// ABOUTME: Data-last toggle for arrays and LookupTables — add if absent, remove if present
// ABOUTME: Supports curried (1-arg), flat (2-arg item+collection), and path (3-arg path+item+obj) usage

import LookupTable from './lookup-table.js'
import assoc from './ramda-like/assoc.js'

const T = {
    // Produces a new collection with item toggled (added if absent, removed if present)
    // @sig toToggledCollection :: (a, [a]|LookupTable) -> [a]|LookupTable
    toToggledCollection: (item, collection) => {
        if (LookupTable.is(collection)) return collection.toggleItem(item)
        return collection.includes(item) ? collection.filter(x => x !== item) : [...collection, item]
    },
}

// Toggle item in a collection (add if absent, remove if present)
// @sig toggleItem :: (a, [a]) -> [a]
// @sig toggleItem :: (a, LookupTable) -> LookupTable
// @sig toggleItem :: (String, a, {k: [a]}) -> {k: [a]}
// @sig toggleItem :: a -> [a] -> [a]   (curried)
const toggleItem = (itemOrPath, collectionOrItem, obj) => {
    // Curried: toggleItem(item) -> (collection) -> collection
    if (collectionOrItem === undefined) return collection => T.toToggledCollection(itemOrPath, collection)

    // Flat: toggleItem(item, collection)
    if (obj === undefined) return T.toToggledCollection(itemOrPath, collectionOrItem)

    // Path variant: toggleItem(path, item, obj)
    const collection = obj[itemOrPath]
    if (collection === undefined) throw new Error(`toggleItem: no collection at path '${itemOrPath}'`)
    return assoc(itemOrPath, T.toToggledCollection(collectionOrItem, collection), obj)
}

export { toggleItem }
