// ABOUTME: Generated type definition for Member
// ABOUTME: Auto-generated from modules/curb-map/type-definitions/member.type.js - do not edit manually

/** {@link module:Member} */
/*  Member generated from: modules/curb-map/type-definitions/member.type.js
 *
 *  userId     : FieldTypes.userId,
 *  displayName: "String",
 *  role       : FieldTypes.role,
 *  addedAt    : "Date",
 *  addedBy    : FieldTypes.userId,
 *  removedAt  : "Date?",
 *  removedBy  : FieldTypes.userId
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Member instance
 * @sig Member :: (String, String, String, Date, String, Date?, String?) -> Member
 */
const Member = function Member(userId, displayName, role, addedAt, addedBy, removedAt, removedBy) {
    const constructorName = 'Member(userId, displayName, role, addedAt, addedBy, removedAt, removedBy)'

    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateString(constructorName, 'displayName', false, displayName)
    R.validateRegex(constructorName, FieldTypes.role, 'role', false, role)
    R.validateDate(constructorName, 'addedAt', false, addedAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'addedBy', false, addedBy)
    R.validateDate(constructorName, 'removedAt', true, removedAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'removedBy', true, removedBy)

    const result = Object.create(prototype)
    result.userId = userId
    result.displayName = displayName
    result.role = role
    result.addedAt = addedAt
    result.addedBy = addedBy
    if (removedAt != null) result.removedAt = removedAt
    if (removedBy != null) result.removedBy = removedBy
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig memberToString :: () -> String
 */
const memberToString = function () {
    return `Member(${R._toString(this.userId)},
        ${R._toString(this.displayName)},
        ${R._toString(this.role)},
        ${R._toString(this.addedAt)},
        ${R._toString(this.addedBy)},
        ${R._toString(this.removedAt)},
        ${R._toString(this.removedBy)})`
}

/*
 * Convert to JSON representation
 * @sig memberToJSON :: () -> Object
 */
const memberToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Member', enumerable: false },
    toString: { value: memberToString, enumerable: false },
    toJSON: { value: memberToJSON, enumerable: false },
    constructor: { value: Member, enumerable: false, writable: true, configurable: true },
})

Member.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Member.toString = () => 'Member'
Member.is = v => v && v['@@typeName'] === 'Member'

Member._from = _input => {
    const { userId, displayName, role, addedAt, addedBy, removedAt, removedBy } = _input
    return Member(userId, displayName, role, addedAt, addedBy, removedAt, removedBy)
}
Member.from = Member._from

Member._toFirestore = (o, encodeTimestamps) => {
    const result = {
        userId: o.userId,
        displayName: o.displayName,
        role: o.role,
        addedAt: encodeTimestamps(o.addedAt),
        addedBy: o.addedBy,
    }

    if (o.removedAt != null) result.removedAt = encodeTimestamps(o.removedAt)

    if (o.removedBy != null) result.removedBy = o.removedBy

    return result
}

Member._fromFirestore = (doc, decodeTimestamps) =>
    Member._from({
        userId: doc.userId,
        displayName: doc.displayName,
        role: doc.role,
        addedAt: decodeTimestamps(doc.addedAt),
        addedBy: doc.addedBy,
        removedAt: doc.removedAt != null ? decodeTimestamps(doc.removedAt) : undefined,
        removedBy: doc.removedBy,
    })

// Public aliases (override if necessary)
Member.toFirestore = Member._toFirestore
Member.fromFirestore = Member._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Member }
