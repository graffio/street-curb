// ABOUTME: Generated type definition for OrganizationMember
// ABOUTME: Auto-generated from modules/curb-map/type-definitions/organization-member.type.js - do not edit manually

/** {@link module:OrganizationMember} */
/*  OrganizationMember generated from: modules/curb-map/type-definitions/organization-member.type.js
 *
 *  organizationId: FieldTypes.organizationId,
 *  role          : FieldTypes.role
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
 * Construct a OrganizationMember instance
 * @sig OrganizationMember :: (String, String) -> OrganizationMember
 */
const OrganizationMember = function OrganizationMember(organizationId, role) {
    const constructorName = 'OrganizationMember(organizationId, role)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateRegex(constructorName, FieldTypes.role, 'role', false, role)

    const result = Object.create(prototype)
    result.organizationId = organizationId
    result.role = role
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig organizationmemberToString :: () -> String
 */
const organizationmemberToString = function () {
    return `OrganizationMember(${R._toString(this.organizationId)}, ${R._toString(this.role)})`
}

/*
 * Convert to JSON representation
 * @sig organizationmemberToJSON :: () -> Object
 */
const organizationmemberToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'OrganizationMember', enumerable: false },
    toString: { value: organizationmemberToString, enumerable: false },
    toJSON: { value: organizationmemberToJSON, enumerable: false },
    constructor: { value: OrganizationMember, enumerable: false, writable: true, configurable: true },
})

OrganizationMember.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
OrganizationMember.toString = () => 'OrganizationMember'
OrganizationMember.is = v => v && v['@@typeName'] === 'OrganizationMember'

OrganizationMember._from = _input => OrganizationMember(_input.organizationId, _input.role)
OrganizationMember.from = OrganizationMember._from

OrganizationMember._toFirestore = (o, encodeTimestamps) => ({ ...o })

OrganizationMember._fromFirestore = (doc, decodeTimestamps) => OrganizationMember._from(doc)

// Public aliases (override if necessary)
OrganizationMember.toFirestore = OrganizationMember._toFirestore
OrganizationMember.fromFirestore = OrganizationMember._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { OrganizationMember }
