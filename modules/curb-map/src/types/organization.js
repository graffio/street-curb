/** {@link module:Organization} */
/*  Organization generated from: modules/curb-map/type-definitions/organization.type.js
 *
 *  id              : FieldTypes.organizationId,
 *  name            : "String",
 *  status          : /active|suspended/,
 *  defaultProjectId: FieldTypes.projectId,
 *  members         : "Object?",
 *  createdAt       : "Object",
 *  createdBy       : FieldTypes.userId,
 *  updatedAt       : "Object",
 *  updatedBy       : FieldTypes.userId
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

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

    R.validateRegex(constructorName, FieldTypes.organizationId, 'id', false, id)
    R.validateString(constructorName, 'name', false, name)
    R.validateRegex(constructorName, /active|suspended/, 'status', false, status)
    R.validateRegex(constructorName, FieldTypes.projectId, 'defaultProjectId', false, defaultProjectId)
    R.validateObject(constructorName, 'members', true, members)
    R.validateObject(constructorName, 'createdAt', false, createdAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'createdBy', false, createdBy)
    R.validateObject(constructorName, 'updatedAt', false, updatedAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'updatedBy', false, updatedBy)

    const result = Object.create(prototype)
    result.id = id
    result.name = name
    result.status = status
    result.defaultProjectId = defaultProjectId
    if (members != null) result.members = members
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
const prototype = {
    toString: function () {
        return `Organization(${R._toString(this.id)}, ${R._toString(this.name)}, ${R._toString(this.status)}, ${R._toString(this.defaultProjectId)}, ${R._toString(this.members)}, ${R._toString(this.createdAt)}, ${R._toString(this.createdBy)}, ${R._toString(this.updatedAt)}, ${R._toString(this.updatedBy)})`
    },
    toJSON() {
        return this
    },
}

Organization.prototype = prototype
prototype.constructor = Organization

Object.defineProperty(prototype, '@@typeName', { value: 'Organization' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Organization.toString = () => 'Organization'
Organization.is = v => v && v['@@typeName'] === 'Organization'
Organization.from = o =>
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

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: timestampFields
Organization.timestampFields = ['createdAt', 'updatedAt']

// Additional function: fromFirestore
Organization.fromFirestore = Organization.from

// Additional function: toFirestore
Organization.toFirestore = o => ({ ...o })

export { Organization }
