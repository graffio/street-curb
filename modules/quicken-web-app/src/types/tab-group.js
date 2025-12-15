// ABOUTME: Generated type definition for TabGroup
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/tab-group.type.js - do not edit manually

/** {@link module:TabGroup} */
/*  TabGroup generated from: modules/quicken-web-app/type-definitions/tab-group.type.js
 *
 *  id          : FieldTypes.tabGroupId,
 *  views       : "{View:id}",
 *  activeViewId: "/^(reg|rpt|rec)_[a-z0-9_]+$/?",
 *  width       : "Number"
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'
import { LookupTable } from '@graffio/functional'
import { View } from './view.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Construct a TabGroup instance
 * @sig TabGroup :: ([Object], {View}, ActiveViewId?, Number) -> TabGroup
 *     ActiveViewId = /^(reg|rpt|rec)_[a-z0-9_]+$/
 */
const TabGroup = function TabGroup(id, views, activeViewId, width) {
    const constructorName = 'TabGroup(id, views, activeViewId, width)'

    R.validateRegex(constructorName, FieldTypes.tabGroupId, 'id', false, id)
    R.validateLookupTable(constructorName, 'View', 'views', false, views)
    R.validateRegex(constructorName, /^(reg|rpt|rec)_[a-z0-9_]+$/, 'activeViewId', true, activeViewId)
    R.validateNumber(constructorName, 'width', false, width)

    const result = Object.create(prototype)
    result.id = id
    result.views = views
    if (activeViewId != null) result.activeViewId = activeViewId
    result.width = width
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Convert to string representation
 * @sig tabgroupToString :: () -> String
 */
const tabgroupToString = function () {
    return `TabGroup(
        ${R._toString(this.id)},
        ${R._toString(this.views)},
        ${R._toString(this.activeViewId)},
        ${R._toString(this.width)},
    )`
}

/**
 * Convert to JSON representation
 * @sig tabgroupToJSON :: () -> Object
 */
const tabgroupToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'TabGroup', enumerable: false },
    toString: { value: tabgroupToString, enumerable: false },
    toJSON: { value: tabgroupToJSON, enumerable: false },
    constructor: { value: TabGroup, enumerable: false, writable: true, configurable: true },
})

TabGroup.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
TabGroup.toString = () => 'TabGroup'
TabGroup.is = v => v && v['@@typeName'] === 'TabGroup'

TabGroup._from = o => {
    const { id, views, activeViewId, width } = o
    return TabGroup(id, views, activeViewId, width)
}
TabGroup.from = TabGroup._from

TabGroup._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        views: R.lookupTableToFirestore(View, 'id', encodeTimestamps, o.views),
        width: o.width,
    }

    if (o.activeViewId != null) result.activeViewId = o.activeViewId

    return result
}

TabGroup._fromFirestore = (doc, decodeTimestamps) =>
    TabGroup._from({
        id: doc.id,
        views: R.lookupTableFromFirestore(View, 'id', decodeTimestamps, doc.views),
        activeViewId: doc.activeViewId,
        width: doc.width,
    })

// Public aliases (override if necessary)
TabGroup.toFirestore = TabGroup._toFirestore
TabGroup.fromFirestore = TabGroup._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { TabGroup }
