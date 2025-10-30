/** {@link module:Member} */
/*  Member generated from: modules/curb-map/type-definitions/member.type.js
 *
 *  userId     : FieldTypes.userId,
 *  displayName: "String",
 *  role       : FieldTypes.role,
 *  addedAt    : "Date",
 *  addedBy    : FieldTypes.userId,
 *  removedAt  : "Date?",
 *  removedBy  : "^usr_[a-z0-9]{12,}$/?"
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const Member = function Member(userId, displayName, role, addedAt, addedBy, removedAt, removedBy) {
    const constructorName = 'Member(userId, displayName, role, addedAt, addedBy, removedAt, removedBy)'

    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateString(constructorName, 'displayName', false, displayName)
    R.validateRegex(constructorName, FieldTypes.role, 'role', false, role)
    R.validateDate(constructorName, 'addedAt', false, addedAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'addedBy', false, addedBy)
    R.validateDate(constructorName, 'removedAt', true, removedAt)
    R.validateString(constructorName, 'removedBy', true, removedBy)

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
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Member', enumerable: false },

    toString: {
        value: function () {
            return `Member(${R._toString(this.userId)}, ${R._toString(this.displayName)}, ${R._toString(this.role)}, ${R._toString(this.addedAt)}, ${R._toString(this.addedBy)}, ${R._toString(this.removedAt)}, ${R._toString(this.removedBy)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return this
        },
        enumerable: false,
    },

    constructor: {
        value: Member,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

Member.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Member.toString = () => 'Member'
Member.is = v => v && v['@@typeName'] === 'Member'
Member.from = o => Member(o.userId, o.displayName, o.role, o.addedAt, o.addedBy, o.removedAt, o.removedBy)

// -------------------------------------------------------------------------------------------------------------
// timestamp fields
// -------------------------------------------------------------------------------------------------------------
Member.timestampFields = ['addedAt', 'removedAt']

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: fromFirestore
Member.fromFirestore = data => Member.from(data)

// Additional function: toFirestore
Member.toFirestore = data => ({ ...data })

export { Member }
