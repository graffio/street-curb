// ABOUTME: Generated type definition for TabLayout
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/tab-layout.type.js - do not edit manually

/** {@link module:TabLayout} */
/*  TabLayout generated from: modules/quicken-web-app/type-definitions/tab-layout.type.js
 *
 *  id              : FieldTypes.tabLayoutId,
 *  tabGroups       : "{TabGroup:id}",
 *  activeTabGroupId: FieldTypes.tabGroupId,
 *  nextTabGroupId  : "Number"
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'
import { LookupTable } from '@graffio/functional'
import { TabGroup } from './tab-group.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Construct a TabLayout instance
 * @sig TabLayout :: ([Object], {TabGroup}, [Object], Number) -> TabLayout
 */
const TabLayout = function TabLayout(id, tabGroups, activeTabGroupId, nextTabGroupId) {
    const constructorName = 'TabLayout(id, tabGroups, activeTabGroupId, nextTabGroupId)'
    R.validateArgumentLength(constructorName, 4, arguments)
    R.validateRegex(constructorName, FieldTypes.tabLayoutId, 'id', false, id)
    R.validateLookupTable(constructorName, 'TabGroup', 'tabGroups', false, tabGroups)
    R.validateRegex(constructorName, FieldTypes.tabGroupId, 'activeTabGroupId', false, activeTabGroupId)
    R.validateNumber(constructorName, 'nextTabGroupId', false, nextTabGroupId)

    const result = Object.create(prototype)
    result.id = id
    result.tabGroups = tabGroups
    result.activeTabGroupId = activeTabGroupId
    result.nextTabGroupId = nextTabGroupId
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Convert to string representation
 * @sig tablayoutToString :: () -> String
 */
const tablayoutToString = function () {
    return `TabLayout(
        ${R._toString(this.id)},
        ${R._toString(this.tabGroups)},
        ${R._toString(this.activeTabGroupId)},
        ${R._toString(this.nextTabGroupId)},
    )`
}

/**
 * Convert to JSON representation
 * @sig tablayoutToJSON :: () -> Object
 */
const tablayoutToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'TabLayout', enumerable: false },
    toString: { value: tablayoutToString, enumerable: false },
    toJSON: { value: tablayoutToJSON, enumerable: false },
    constructor: { value: TabLayout, enumerable: false, writable: true, configurable: true },
})

TabLayout.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
TabLayout.toString = () => 'TabLayout'
TabLayout.is = v => v && v['@@typeName'] === 'TabLayout'

TabLayout._from = _input => {
    const { id, tabGroups, activeTabGroupId, nextTabGroupId } = _input
    return TabLayout(id, tabGroups, activeTabGroupId, nextTabGroupId)
}
TabLayout.from = TabLayout._from

TabLayout._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        tabGroups: R.lookupTableToFirestore(TabGroup, 'id', encodeTimestamps, o.tabGroups),
        activeTabGroupId: o.activeTabGroupId,
        nextTabGroupId: o.nextTabGroupId,
    }

    return result
}

TabLayout._fromFirestore = (doc, decodeTimestamps) =>
    TabLayout._from({
        id: doc.id,
        tabGroups: R.lookupTableFromFirestore(TabGroup, 'id', decodeTimestamps, doc.tabGroups),
        activeTabGroupId: doc.activeTabGroupId,
        nextTabGroupId: doc.nextTabGroupId,
    })

// Public aliases (override if necessary)
TabLayout.toFirestore = TabLayout._toFirestore
TabLayout.fromFirestore = TabLayout._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { TabLayout }
