// ABOUTME: Generated type definition for Keymap
// ABOUTME: Auto-generated from modules/keymap/type-definitions/keymap.type.js - do not edit manually

/** {@link module:Keymap} */
/*  Keymap generated from: modules/keymap/type-definitions/keymap.type.js
 *
 *  id        : "String",
 *  priority  : "Number",
 *  blocking  : "Boolean?",
 *  activeWhen: "Any?",
 *  intents   : "{Intent:description}"
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
 * @sig Keymap :: (String, Number, Boolean?, Any?, {Intent}) -> Keymap
 */
const Keymap = function Keymap(id, priority, blocking, activeWhen, intents) {
    const constructorName = 'Keymap(id, priority, blocking, activeWhen, intents)'

    R.validateString(constructorName, 'id', false, id)
    R.validateNumber(constructorName, 'priority', false, priority)
    R.validateBoolean(constructorName, 'blocking', true, blocking)

    R.validateLookupTable(constructorName, 'Intent', 'intents', false, intents)

    const result = Object.create(prototype)
    result.id = id
    result.priority = priority
    if (blocking != null) result.blocking = blocking
    if (activeWhen != null) result.activeWhen = activeWhen
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
        ${R._toString(this.priority)},
        ${R._toString(this.blocking)},
        ${R._toString(this.activeWhen)},
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
    const { id, priority, blocking, activeWhen, intents } = _input
    return Keymap(id, priority, blocking, activeWhen, intents)
}
Keymap.from = Keymap._from

Keymap._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        priority: o.priority,
        intents: R.lookupTableToFirestore(Intent, 'description', encodeTimestamps, o.intents),
    }

    if (o.blocking != null) result.blocking = o.blocking

    if (o.activeWhen != null) result.activeWhen = o.activeWhen

    return result
}

Keymap._fromFirestore = (doc, decodeTimestamps) =>
    Keymap._from({
        id: doc.id,
        priority: doc.priority,
        blocking: doc.blocking,
        activeWhen: doc.activeWhen,
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

Keymap.isActive = (keymap, activeViewId) => !keymap.activeWhen || keymap.activeWhen(activeViewId)

Keymap.findMatchingIntent = (keymap, key) => keymap.intents.find(intent => Intent.hasKey(intent, key))

Keymap.resolveKey = (keymap, key, activeViewId) => {
    if (!Keymap.isActive(keymap, activeViewId)) return null
    const intent = Keymap.findMatchingIntent(keymap, key)
    if (intent)
        return {
            description: intent.description,
            action: intent.action,
        }
    if (keymap.blocking) return { blocked: true }
    return null
}

Keymap.collectIntents = (keymap, activeViewId, seen) => {
    if (!Keymap.isActive(keymap, activeViewId)) return []
    return keymap.intents
        .filter(intent => !seen.has(intent.description))
        .map(intent => {
            seen.add(intent.description)
            return {
                description: intent.description,
                keys: intent.keys,
                from: keymap.id,
            }
        })
}

Keymap.resolve = (key, keymaps, activeId) =>
    keymaps.reduce((found, keymap) => found ?? Keymap.resolveKey(keymap, key, activeId), null)

Keymap.collectAvailable = (keymaps, activeId) => {
    const seen = new Set()
    const accumulate = (acc, keymap) => {
        if (acc.blocked) return acc
        const collected = Keymap.collectIntents(keymap, activeId, seen)
        const isBlocking = keymap.blocking && Keymap.isActive(keymap, activeId)
        return {
            result: acc.result.concat(collected),
            blocked: isBlocking,
        }
    }
    return keymaps.reduce(accumulate, {
        result: [],
        blocked: false,
    }).result
}

export { Keymap }
