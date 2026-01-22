// ABOUTME: Generated type definition for Keymap
// ABOUTME: Auto-generated from modules/keymap/type-definitions/keymap.type.js - do not edit manually

/** {@link module:Keymap} */
/*  Keymap generated from: modules/keymap/type-definitions/keymap.type.js
 *
 *  id             : "String",
 *  name           : "String",
 *  priority       : "Number",
 *  blocking       : "Boolean?",
 *  activeForViewId: "String?",
 *  intents        : "{Intent:description}"
 *
 */

import { Intent } from './intent.js'

import * as R from '@graffio/cli-type-generator'
import { LookupTable } from '@graffio/functional'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Keymap instance
 * @sig Keymap :: (String, String, Number, Boolean?, String?, {Intent}) -> Keymap
 */
const Keymap = function Keymap(id, name, priority, blocking, activeForViewId, intents) {
    const constructorName = 'Keymap(id, name, priority, blocking, activeForViewId, intents)'

    R.validateString(constructorName, 'id', false, id)
    R.validateString(constructorName, 'name', false, name)
    R.validateNumber(constructorName, 'priority', false, priority)
    R.validateBoolean(constructorName, 'blocking', true, blocking)
    R.validateString(constructorName, 'activeForViewId', true, activeForViewId)
    R.validateLookupTable(constructorName, 'Intent', 'intents', false, intents)

    const result = Object.create(prototype)
    result.id = id
    result.name = name
    result.priority = priority
    if (blocking != null) result.blocking = blocking
    if (activeForViewId != null) result.activeForViewId = activeForViewId
    result.intents = intents
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig keymapToString :: () -> String
 */
const keymapToString = function () {
    return `Keymap(${R._toString(this.id)},
        ${R._toString(this.name)},
        ${R._toString(this.priority)},
        ${R._toString(this.blocking)},
        ${R._toString(this.activeForViewId)},
        ${R._toString(this.intents)})`
}

/*
 * Convert to JSON representation
 * @sig keymapToJSON :: () -> Object
 */
const keymapToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Keymap', enumerable: false },
    toString: { value: keymapToString, enumerable: false },
    toJSON: { value: keymapToJSON, enumerable: false },
    constructor: { value: Keymap, enumerable: false, writable: true, configurable: true },
})

Keymap.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Keymap.toString = () => 'Keymap'
Keymap.is = v => v && v['@@typeName'] === 'Keymap'

Keymap._from = _input => {
    const { id, name, priority, blocking, activeForViewId, intents } = _input
    return Keymap(id, name, priority, blocking, activeForViewId, intents)
}
Keymap.from = Keymap._from

Keymap._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        name: o.name,
        priority: o.priority,
        intents: R.lookupTableToFirestore(Intent, 'description', encodeTimestamps, o.intents),
    }

    if (o.blocking != null) result.blocking = o.blocking

    if (o.activeForViewId != null) result.activeForViewId = o.activeForViewId

    return result
}

Keymap._fromFirestore = (doc, decodeTimestamps) =>
    Keymap._from({
        id: doc.id,
        name: doc.name,
        priority: doc.priority,
        blocking: doc.blocking,
        activeForViewId: doc.activeForViewId,
        intents: R.lookupTableFromFirestore(Intent, 'description', decodeTimestamps, doc.intents),
    })

// Public aliases (override if necessary)
Keymap.toFirestore = Keymap._toFirestore
Keymap.fromFirestore = Keymap._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

Keymap.isActive = (keymap, activeViewId) => !keymap.activeForViewId || keymap.activeForViewId === activeViewId

Keymap.findMatchingIntent = (keymap, key) => keymap.intents.find(intent => Intent.hasKey(intent, key))

Keymap.resolveKey = (keymap, key, activeViewId) => {
    if (!Keymap.isActive(keymap, activeViewId)) return null
    const intent = Keymap.findMatchingIntent(keymap, key)
    if (intent)
        return {
            description: intent.description,
            action: intent.action,
        }
    return keymap.blocking ? { blocked: true } : null
}

Keymap.resolve = (key, keymaps, activeId) =>
    keymaps.reduce((found, keymap) => found ?? Keymap.resolveKey(keymap, key, activeId), null)

Keymap.collectAvailable = (keymaps, activeId) => {
    const activeKeymaps = keymaps.filter(km => Keymap.isActive(km, activeId))
    const blockingIndex = activeKeymaps.findIndex(km => km.blocking)
    const relevantKeymaps = blockingIndex === -1 ? activeKeymaps : activeKeymaps.slice(0, blockingIndex + 1)
    const allIntents = relevantKeymaps.flatMap(keymap =>
        keymap.intents.map(intent => ({
            description: intent.description,
            keys: intent.keys,
            from: keymap.name,
        })),
    )
    return allIntents.reduce((acc, intent) => {
        const existing = acc.find(i => i.description === intent.description)
        if (existing) existing.keys = [...existing.keys, ...intent.keys]
        else acc.push({ ...intent })
        return acc
    }, [])
}

export { Keymap }
