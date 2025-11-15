/** {@link module:User} */
/*  User generated from: modules/curb-map/type-definitions/user.type.js
 *
 *  id           : FieldTypes.userId,
 *  email        : FieldTypes.email,
 *  displayName  : "String",
 *  organizations: "{OrganizationMember:organizationId}",
 *  createdAt    : "Date",
 *  createdBy    : FieldTypes.userId,
 *  updatedAt    : "Date",
 *  updatedBy    : FieldTypes.userId
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'
import { LookupTable } from '@graffio/functional'
import { OrganizationMember } from './organization-member.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const User = function User(id, email, displayName, organizations, createdAt, createdBy, updatedAt, updatedBy) {
    const constructorName = 'User(id, email, displayName, organizations, createdAt, createdBy, updatedAt, updatedBy)'
    R.validateArgumentLength(constructorName, 8, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'id', false, id)
    R.validateRegex(constructorName, FieldTypes.email, 'email', false, email)
    R.validateString(constructorName, 'displayName', false, displayName)
    R.validateLookupTable(constructorName, 'OrganizationMember', 'organizations', false, organizations)
    R.validateDate(constructorName, 'createdAt', false, createdAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'createdBy', false, createdBy)
    R.validateDate(constructorName, 'updatedAt', false, updatedAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'updatedBy', false, updatedBy)

    const result = Object.create(prototype)
    result.id = id
    result.email = email
    result.displayName = displayName
    result.organizations = organizations
    result.createdAt = createdAt
    result.createdBy = createdBy
    result.updatedAt = updatedAt
    result.updatedBy = updatedBy
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'User', enumerable: false },

    toString: {
        value: function () {
            return `User(${R._toString(this.id)}, ${R._toString(this.email)}, ${R._toString(this.displayName)}, ${R._toString(this.organizations)}, ${R._toString(this.createdAt)}, ${R._toString(this.createdBy)}, ${R._toString(this.updatedAt)}, ${R._toString(this.updatedBy)})`
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
        value: User,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

User.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
User.toString = () => 'User'
User.is = v => v && v['@@typeName'] === 'User'

User._from = o =>
    User(o.id, o.email, o.displayName, o.organizations, o.createdAt, o.createdBy, o.updatedAt, o.updatedBy)
User.from = User._from

User._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        email: o.email,
        displayName: o.displayName,
        organizations: R.lookupTableToFirestore(
            OrganizationMember,
            'organizationId',
            encodeTimestamps,
            o.organizations,
        ),
        createdAt: encodeTimestamps(o.createdAt),
        createdBy: o.createdBy,
        updatedAt: encodeTimestamps(o.updatedAt),
        updatedBy: o.updatedBy,
    }

    return result
}

User._fromFirestore = (doc, decodeTimestamps) =>
    User._from({
        id: doc.id,
        email: doc.email,
        displayName: doc.displayName,
        organizations: R.lookupTableFromFirestore(
            OrganizationMember,
            'organizationId',
            decodeTimestamps,
            doc.organizations,
        ),
        createdAt: decodeTimestamps(doc.createdAt),
        createdBy: doc.createdBy,
        updatedAt: decodeTimestamps(doc.updatedAt),
        updatedBy: doc.updatedBy,
    })

// Public aliases (override if necessary)
User.toFirestore = User._toFirestore
User.fromFirestore = User._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { User }
