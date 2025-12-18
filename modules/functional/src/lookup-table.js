// ABOUTME: Array with id-based lookup - items accessible by index or by id field value
// ABOUTME: Methods: get, filter, sort, pick, addItem, removeItem, toggleItem, moveElement, updateAll, updateWhere

/*
 * Extend Array filled with objects that each have some id field, by adding non-enumerable
 * elements to the array. Given:
 *
 * const l = LookupTable([
 *     Foo.from({ id: '9ea3067b', value: 5 }),
 *     Foo.from({ id: 'ed08242f', value: 4 })
 * ], Foo, 'id')
 *
 * Then:
 *
 *     l[0]                                            --> { id: '9ea3067b', value: 5 }
 *     l['9ea3067b-e92b-4d03-afab-6fcaec2c0015']       --> { id: '9ea3067b', value: 5 }
 *     l.get('9ea3067b-e92b-4d03-afab-6fcaec2c0015')   --> { id: '9ea3067b', value: 5 }
 *
 *     l[1]                                            --> { id: 'ed08242f', value: 4 }
 *     l['ed08242f-e935-4017-b411-58441ae0c4a5']       --> { id: 'ed08242f', value: 4 }
 *     l.get('ed08242f-e935-4017-b411-58441ae0c4a5')   --> { id: 'ed08242f', value: 4 }
 *
 *
 * l.map, l.filter, etc. will operate ONLY on 0 and 1 and not the elements with id keys
 *
 * Types
 *
 *  Item     = { id: Id, ... }  (actually, the key doesn't have to be 'id' but it usually is)
 *  SortFunc = (a, b) -> -1|0|1
 */

import { equals, without } from '../index.js'

// ---------------------------------------------------------------------------------------------------------------------
// LookupTable
// ---------------------------------------------------------------------------------------------------------------------

/*
 * @sig LookupTable :: ([A]|{k:A}, TaggedType, idField = 'id') -> LookupTable
 */
const LookupTable = (items, ItemType, idField = 'id') => {
    const addNonEnumerable = (target, key, value) => Object.defineProperty(target, key, { value, enumerable: false })

    // Warn if items aren't all of ItemType (doesn't throw, just logs)
    // @sig validateTypes :: () -> ()
    const validateTypes = () => {
        if (!ItemType || !ItemType.is) {
            console.error(`You must pass a tagged Type when creating a LookupTable`)
            return
        }

        if (items.every(item => ItemType.is(item))) return // each item is an ItemType

        const found = JSON.stringify(items)
        const w = `Expected each item passed to LookupTable to be a(n) '${ItemType.toString()}'; found ${found}.`

        // for now: just yell, don't throw an error
        console.error(w)
    }

    // if items is not an array, assume it's an object whose values we should use as the array
    if (!Array.isArray(items)) items = Object.values(items)

    // validate types
    validateTypes()

    // Copy the items into a new array
    const array = Array.from(items)

    // add each item to the array a 2nd time, using the item's id as the key
    items.forEach(o => addNonEnumerable(array, o[idField], o))

    // Add type metadata
    addNonEnumerable(array, 'ItemType', ItemType)
    addNonEnumerable(array, 'idField', idField)

    // Link the prototype to LookupTablePrototype
    Object.setPrototypeOf(array, LookupTablePrototype)
    return array
}

/*
 * Is o a LookupTable?
 * @sig LookupTable.is :: {k:v} -> Boolean
 */
LookupTable.is = o => !!o?.idField

// ---------------------------------------------------------------------------------------------------------------------
// LookupTablePrototype (extends Array.prototype)
// ---------------------------------------------------------------------------------------------------------------------

const LookupTablePrototype = Object.create(Array.prototype)

/*
 * Return the item with the given id -- which is simply added non-enumerably to `this` array
 * Note: a.get(id) === a.getById(id) === a[id]
 * @sig LookupTablePrototype.get :: String -> Item
 */
LookupTablePrototype.get = function (key) {
    return this[key]
}
LookupTablePrototype.getById = function (key) {
    return this[key]
}

/*
 * Get the element of `this` that has the same id as `item` -- or undefined if there is no such element
 * @sig LookupTablePrototype.elementHavingSameIdAsItem :: Item -> Item|undefined
 */
LookupTablePrototype.elementHavingSameIdAsItem = function (item) {
    const id = item[this.idField]
    return this[id]
}

/*
 * Does the LookupTable have an item `equals` to `item`?
 * @sig LookupTablePrototype.hasItemEqualTo :: Item -> Boolean
 */
LookupTablePrototype.hasItemEqualTo = function (item) {
    return equals(this.elementHavingSameIdAsItem(item), item)
}

/*
 * Does the LookupTable have an item with the given id
 * @sig LookupTablePrototype.includesWithId :: Id -> Boolean
 */
LookupTablePrototype.includesWithId = function (id) {
    return this.some(item => item.id === id)
}

/*
 * Return a new LookupTable that includes only the elements that pass the filtering predicate
 * @sig LookupTablePrototype.filter :: Predicate -> LookupTable
 */
LookupTablePrototype.filter = function (predicate) {
    return LookupTable(Array.prototype.filter.call(this, predicate), this.ItemType, this.idField)
}

/*
 * Return a new LookupTable that sorts the elements of an existing one
 * @sig LookupTablePrototype.sort :: SortFunc -> LookupTable
 */
LookupTablePrototype.sort = function (sortFunc) {
    // Array.from because `sort` works in place, and we don't want to change `this`
    return LookupTable(Array.prototype.sort.call(Array.from(this), sortFunc), this.ItemType, this.idField)
}

/*
 * Return a new LookupTable that prepends o to an existing one
 * @sig LookupTablePrototype.prepend :: Item -> LookupTable
 */
LookupTablePrototype.prepend = function (o) {
    return LookupTable([o, ...this], this.ItemType, this.idField)
}

/*
 * Return a new LookupTable with item added at the end and then (possibly) sorted
 * If there is already an item `equals` to the item in the current LookupTable, return the existing one instead
 * @sig LookupTablePrototype.addItem :: (Item, SortFunc) -> LookupTable
 */
LookupTablePrototype.addItem = function (item, sort) {
    if (this.hasItemEqualTo(item)) return this

    const newItems = [...this, item]
    if (sort) Array.prototype.sort.call(newItems, sort)
    return LookupTable(newItems, this.ItemType, this.idField)
}

/*
 * Same as addItem, except that if there is already an item with the same id as `item` replace it with `item`
 * If there is already an item `equals` to the item in the current LookupTable, return the existing one instead
 * @sig LookupTablePrototype.addItemWithId :: (Item, SortFunc) -> LookupTable
 */
LookupTablePrototype.addItemWithId = function (item, sort) {
    if (this.hasItemEqualTo(item)) return this

    const oldItem = this.elementHavingSameIdAsItem(item)

    // If an existing element has the same id, replace it wth `item` in the same spot, otherwise add `item` to the end
    let newItems
    if (oldItem) newItems = this.map(existingItem => (existingItem === oldItem ? item : existingItem))
    else newItems = [...this, item]

    if (sort) Array.prototype.sort.call(newItems, sort)
    return LookupTable(newItems, this.ItemType, this.idField)
}

/*
 * Return a new LookupTable without `item`; if `item` was NOT in the LookupTable, return the original LookupTable
 * @sig LookupTablePrototype.removeItem :: Item -> LookupTable
 */
LookupTablePrototype.removeItem = function (item) {
    if (!this.elementHavingSameIdAsItem(item)) return this
    return LookupTable(without(item, this), this.ItemType, this.idField)
}

/*
 * Return a new LookupTable without the element having the `id`; if there was none, return the original LookupTable
 * @sig LookupTablePrototype.removeItemWithId :: Id -> LookupTable
 */
LookupTablePrototype.removeItemWithId = function (id) {
    const item = this[id]
    if (!item) return this
    return LookupTable(without(item, this), this.ItemType, this.idField)
}

/*
 * Return a new LookupTable adding `item` it's not in the current LookupTable or removing it otherwise
 * @sig LookupTablePrototype.toggleItem :: (Item, SortFunc) -> LookupTable
 */
LookupTablePrototype.toggleItem = function (item, sort) {
    const hasItem = this.elementHavingSameIdAsItem(item) === item

    return hasItem ? this.removeItem(item) : this.addItem(item, sort)
}

/*
 * Return a new LookupTable that includes only a subset of elements in `this` with the given ids
 * @sig LookupTablePrototype.pick :: [Id] -> LookupTable
 */
LookupTablePrototype.pick = function (ids) {
    const subset = ids.map(id => this[id])
    return LookupTable(subset, this.ItemType, this.idField)
}

/*
 * Return a new LookupTable that moves the element at fromIndex to now be at toIndex
 * @sig LookupTablePrototype.moveElement :: (Number, Number) -> LookupTable
 */
LookupTablePrototype.moveElement = function (fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.length || toIndex < 0 || toIndex >= this.length) return this

    const newArray = [...this]
    const [item] = newArray.splice(fromIndex, 1) // remove from the old position, saving the item
    newArray.splice(toIndex, 0, item) // add in at the new position
    return LookupTable(newArray, this.ItemType, this.idField)
}

/*
 * Return a new LookupTable with fn applied to every item (endomorphism - same type in and out)
 * @sig LookupTablePrototype.updateAll :: (Item -> Item) -> LookupTable
 */
LookupTablePrototype.updateAll = function (fn) {
    return LookupTable(Array.prototype.map.call(this, fn), this.ItemType, this.idField)
}

/*
 * Return a new LookupTable with fn applied only to items matching predicate
 * @sig LookupTablePrototype.updateWhere :: (Item -> Boolean, Item -> Item) -> LookupTable
 */
LookupTablePrototype.updateWhere = function (predicate, fn) {
    const updated = Array.prototype.map.call(this, item => (predicate(item) ? fn(item) : item))
    return LookupTable(updated, this.ItemType, this.idField)
}

LookupTablePrototype.idForItem = function (item) {
    return item[this.idField]
}

export default LookupTable
