// ABOUTME: Generated type definition for Organization
// ABOUTME: Auto-generated from modules/curb-map/type-definitions/organization.type.js - do not edit manually

/** {@link module:Organization} */
/*  Organization generated from: modules/curb-map/type-definitions/organization.type.js
 *
 *  id              : FieldTypes.organizationId,
 *  name            : "String",
 *  defaultProjectId: FieldTypes.projectId,
 *  members         : "{Member:userId}",
 *  createdAt       : "Date",
 *  createdBy       : FieldTypes.userId,
 *  updatedAt       : "Date",
 *  updatedBy       : FieldTypes.userId,
 *  deletedAt       : "Date?",
 *  deletedBy       : FieldTypes.userId
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

/*
 * Construct a Organization instance
 * @sig Organization :: (String, String, String, {Member}, Date, String, Date, String, Date?, String?) -> Organization
 */
const Organization = function Organization(
    id,
    name,
    defaultProjectId,
    members,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    deletedAt,
    deletedBy,
) {
    const constructorName =
        'Organization(id, name, defaultProjectId, members, createdAt, createdBy, updatedAt, updatedBy, deletedAt, deletedBy)'

    R.validateRegex(constructorName, FieldTypes.organizationId, 'id', false, id)
    R.validateString(constructorName, 'name', false, name)
    R.validateRegex(constructorName, FieldTypes.projectId, 'defaultProjectId', false, defaultProjectId)
    R.validateLookupTable(constructorName, 'Member', 'members', false, members)
    R.validateDate(constructorName, 'createdAt', false, createdAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'createdBy', false, createdBy)
    R.validateDate(constructorName, 'updatedAt', false, updatedAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'updatedBy', false, updatedBy)
    R.validateDate(constructorName, 'deletedAt', true, deletedAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'deletedBy', true, deletedBy)

    const result = Object.create(prototype)
    result.id = id
    result.name = name
    result.defaultProjectId = defaultProjectId
    result.members = members
    result.createdAt = createdAt
    result.createdBy = createdBy
    result.updatedAt = updatedAt
    result.updatedBy = updatedBy
    if (deletedAt != null) result.deletedAt = deletedAt
    if (deletedBy != null) result.deletedBy = deletedBy
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/** JMG
 * Convert to string representation
 * @sig organizationToString :: () -> String
 */
const organizationToString = function () {
    return `Organization(${R._toString(this.id)},
        ${R._toString(this.name)},
        ${R._toString(this.defaultProjectId)},
        ${R._toString(this.members)},
        ${R._toString(this.createdAt)},
        ${R._toString(this.createdBy)},
        ${R._toString(this.updatedAt)},
        ${R._toString(this.updatedBy)},
        ${R._toString(this.deletedAt)},
        ${R._toString(this.deletedBy)})`
}

/*
 * Convert to JSON representation
 * @sig organizationToJSON :: () -> Object
 */
const organizationToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Organization', enumerable: false },
    toString: { value: organizationToString, enumerable: false },
    toJSON: { value: organizationToJSON, enumerable: false },
    constructor: { value: Organization, enumerable: false, writable: true, configurable: true },
})

Organization.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Organization.toString = () => 'Organization'
Organization.is = v => v && v['@@typeName'] === 'Organization'

Organization._from = _input => {
    const { id, name, defaultProjectId, members, createdAt, createdBy, updatedAt, updatedBy, deletedAt, deletedBy } =
        _input
    return Organization(
        id,
        name,
        defaultProjectId,
        members,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
        deletedAt,
        deletedBy,
    )
}
Organization.from = Organization._from

Organization._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        name: o.name,
        defaultProjectId: o.defaultProjectId,
        members: R.lookupTableToFirestore(Member, 'userId', encodeTimestamps, o.members),
        createdAt: encodeTimestamps(o.createdAt),
        createdBy: o.createdBy,
        updatedAt: encodeTimestamps(o.updatedAt),
        updatedBy: o.updatedBy,
    }

    if (o.deletedAt != null) result.deletedAt = encodeTimestamps(o.deletedAt)

    if (o.deletedBy != null) result.deletedBy = o.deletedBy

    return result
}

Organization._fromFirestore = (doc, decodeTimestamps) =>
    Organization._from({
        id: doc.id,
        name: doc.name,
        defaultProjectId: doc.defaultProjectId,
        members: R.lookupTableFromFirestore(Member, 'userId', decodeTimestamps, doc.members),
        createdAt: decodeTimestamps(doc.createdAt),
        createdBy: doc.createdBy,
        updatedAt: decodeTimestamps(doc.updatedAt),
        updatedBy: doc.updatedBy,
        deletedAt: doc.deletedAt != null ? decodeTimestamps(doc.deletedAt) : undefined,
        deletedBy: doc.deletedBy,
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

Organization.role = (organization, userId) => organization?.members?.[userId]?.role

Organization.isAdmin = (organization, userId) => Organization.role(organization, userId) === 'admin'

export { Organization }
