/** {@link module:Organization} */
/*  Organization generated from: modules/curb-map/type-definitions/organization.type.js
 *
 *  id              : FieldTypes.organizationId,
 *  name            : "String",
 *  status          : /active|suspended/,
 *  defaultProjectId: FieldTypes.projectId,
 *  members         : "{Member:userId}",
 *  createdAt       : "Date",
 *  createdBy       : FieldTypes.userId,
 *  updatedAt       : "Date",
 *  updatedBy       : FieldTypes.userId
 *
 */

import { FieldTypes } from './field-types.js'
import { Member } from './member.js'

import * as R from '@graffio/cli-type-generator'
import { LookupTable } from '@graffio/functional'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const Organization = function Organization(
    id,
    name,
    status,
    defaultProjectId,
    members,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
) {
    const constructorName =
        'Organization(id, name, status, defaultProjectId, members, createdAt, createdBy, updatedAt, updatedBy)'
    R.validateArgumentLength(constructorName, 9, arguments)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'id', false, id)
    R.validateString(constructorName, 'name', false, name)
    R.validateRegex(constructorName, /active|suspended/, 'status', false, status)
    R.validateRegex(constructorName, FieldTypes.projectId, 'defaultProjectId', false, defaultProjectId)
    R.validateLookupTable(constructorName, 'Member', 'members', false, members)
    R.validateDate(constructorName, 'createdAt', false, createdAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'createdBy', false, createdBy)
    R.validateDate(constructorName, 'updatedAt', false, updatedAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'updatedBy', false, updatedBy)

    const result = Object.create(prototype)
    result.id = id
    result.name = name
    result.status = status
    result.defaultProjectId = defaultProjectId
    result.members = members
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
    '@@typeName': { value: 'Organization', enumerable: false },

    toString: {
        value: function () {
            return `Organization(${R._toString(this.id)}, ${R._toString(this.name)}, ${R._toString(this.status)}, ${R._toString(this.defaultProjectId)}, ${R._toString(this.members)}, ${R._toString(this.createdAt)}, ${R._toString(this.createdBy)}, ${R._toString(this.updatedAt)}, ${R._toString(this.updatedBy)})`
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
        value: Organization,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

Organization.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Organization.toString = () => 'Organization'
Organization.is = v => v && v['@@typeName'] === 'Organization'

Organization._from = o =>
    Organization(
        o.id,
        o.name,
        o.status,
        o.defaultProjectId,
        o.members,
        o.createdAt,
        o.createdBy,
        o.updatedAt,
        o.updatedBy,
    )
Organization.from = Organization._from

// -------------------------------------------------------------------------------------------------------------
//
// Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------
Organization._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        name: o.name,
        status: o.status,
        defaultProjectId: o.defaultProjectId,
        members: R.lookupTableToFirestore(Member, 'userId', encodeTimestamps, o.members),
        createdAt: encodeTimestamps(o.createdAt),
        createdBy: o.createdBy,
        updatedAt: encodeTimestamps(o.updatedAt),
        updatedBy: o.updatedBy,
    }

    return result
}

Organization._fromFirestore = (doc, decodeTimestamps) =>
    Organization._from({
        id: doc.id,
        name: doc.name,
        status: doc.status,
        defaultProjectId: doc.defaultProjectId,
        members: R.lookupTableFromFirestore(Member, 'userId', decodeTimestamps, doc.members),
        createdAt: decodeTimestamps(doc.createdAt),
        createdBy: doc.createdBy,
        updatedAt: decodeTimestamps(doc.updatedAt),
        updatedBy: doc.updatedBy,
    })

// Public aliases (override if necessary)
Organization.toFirestore = Organization._toFirestore
Organization.fromFirestore = Organization._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

Organization.roleChanged = (organization, action) => {
    const { userId, role } = action
    const oldMember = organization.members[userId]
    const newMember = Member.from({
        ...oldMember,
        role,
    })
    const members = organization.members.addItemWithId(newMember)
    return Organization.from({
        ...organization,
        members,
    })
}

Organization.isAdmin = (organization, userId) => organization?.members?.[userId]?.role === 'admin'

export { Organization }
