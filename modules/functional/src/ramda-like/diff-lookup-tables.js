import equals from './equals.js'

/*
 * Given LookupTables before and after, return the KEYS that have been added, changed or removed
 * Uses equals to determine if values are equal, (that is, not simply identity using ===)
 *
 * @sig diffLookupTables :: (LookupTable, LookupTable) -> AnswerKey
 *  AnswerKey = { added: [Id], removed: [Id], changed: [Id] }
 *
 * Example
 *
 *      const a = {      const b = {
 *          12: o1,                        =>     removed
 *                          13: o2,        =>     added (even though o2 was already used at key 14)
 *          14: o2,         14: o2,        =>     <unchanged>
 *                          15: o4,        =>     added
 *          16: o3,         16: o33,       =>     changed
 *      }               }
 *
 *      => { added: [13, 15], changed: [16], removed: [12] }
 *
 */

const diffLookupTables = (before, after) => {
    const findRemovedOrChanged = k => {
        if (!after[k]) return removed.push(k)
        if (!equals(before[k], after[k])) return changed.push(k)
    }

    const findAdded = k => {
        if (!before[k]) return added.push(k)
    }

    const added = []
    const removed = []
    const changed = []

    Object.keys(before).forEach(findRemovedOrChanged)
    Object.keys(after).forEach(findAdded)

    return { added, removed, changed }
}

export default diffLookupTables
