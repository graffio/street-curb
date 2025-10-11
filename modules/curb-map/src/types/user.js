/** {@link module:User} */
/*  User generated from: modules/curb-map/type-definitions/user.type.js
 *
 *  id           : FieldTypes.userId,
 *  email        : FieldTypes.email,
 *  displayName  : "String",
 *  organizations: "Object",
 *  createdAt    : "Object",
 *  createdBy    : FieldTypes.userId,
 *  updatedAt    : "Object",
 *  updatedBy    : FieldTypes.userId
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

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
    R.validateObject(constructorName, 'organizations', false, organizations)
    R.validateObject(constructorName, 'createdAt', false, createdAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'createdBy', false, createdBy)
    R.validateObject(constructorName, 'updatedAt', false, updatedAt)
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
const prototype = {
    toString: function () {
        return `User(${R._toString(this.id)}, ${R._toString(this.email)}, ${R._toString(this.displayName)}, ${R._toString(this.organizations)}, ${R._toString(this.createdAt)}, ${R._toString(this.createdBy)}, ${R._toString(this.updatedAt)}, ${R._toString(this.updatedBy)})`
    },
    toJSON() {
        return this
    },
}

User.prototype = prototype
prototype.constructor = User

Object.defineProperty(prototype, '@@typeName', { value: 'User' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
User.toString = () => 'User'
User.is = v => v && v['@@typeName'] === 'User'
User.from = o => User(o.id, o.email, o.displayName, o.organizations, o.createdAt, o.createdBy, o.updatedAt, o.updatedBy)

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: timestampFields
User.timestampFields = ['createdAt', 'updatedAt']

// Additional function: fromFirestore
User.fromFirestore = User.from

// Additional function: toFirestore
User.toFirestore = o => ({ ...o })

export { User }
