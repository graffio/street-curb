/*  Action generated from: modules/curb-map/type-definitions/action.type.js
 *
 *  OrganizationCreated
 *      organizationId: FieldTypes.organizationId,
 *      name          : "String"
 *  OrganizationUpdated
 *      organizationId: FieldTypes.organizationId,
 *      name          : "String?",
 *      status        : "/^(active|suspended)$/?"
 *  OrganizationSuspended
 *      organizationId: FieldTypes.organizationId
 *  OrganizationDeleted
 *      organizationId: FieldTypes.organizationId
 *  UserCreated
 *      userId        : FieldTypes.userId,
 *      organizationId: FieldTypes.organizationId,
 *      email         : FieldTypes.email,
 *      displayName   : "String",
 *      role          : /^(admin|member|viewer)$/
 *  UserUpdated
 *      userId     : FieldTypes.userId,
 *      email      : "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/?",
 *      displayName: "String?"
 *  UserDeleted
 *      userId        : FieldTypes.userId,
 *      organizationId: FieldTypes.organizationId
 *  UserForgotten
 *      userId: FieldTypes.userId,
 *      reason: "String"
 *  RoleAssigned
 *      userId        : FieldTypes.userId,
 *      organizationId: FieldTypes.organizationId,
 *      role          : /^(admin|member|viewer)$/
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// Action constructor
//
// -------------------------------------------------------------------------------------------------------------
const Action = {
    toString: () => 'Action',
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return (
            constructor === Action.OrganizationCreated ||
            constructor === Action.OrganizationUpdated ||
            constructor === Action.OrganizationSuspended ||
            constructor === Action.OrganizationDeleted ||
            constructor === Action.UserCreated ||
            constructor === Action.UserUpdated ||
            constructor === Action.UserDeleted ||
            constructor === Action.UserForgotten ||
            constructor === Action.RoleAssigned
        )
    },
}

// -------------------------------------------------------------------------------------------------------------
//
// Set up Action's prototype as ActionPrototype
//
// -------------------------------------------------------------------------------------------------------------
// Type prototype with match method
const ActionPrototype = {
    match(variants) {
        // Validate all variants are handled
        const requiredVariants = [
            'OrganizationCreated',
            'OrganizationUpdated',
            'OrganizationSuspended',
            'OrganizationDeleted',
            'UserCreated',
            'UserUpdated',
            'UserDeleted',
            'UserForgotten',
            'RoleAssigned',
        ]
        requiredVariants.map(variant => {
            if (!variants[variant]) throw new TypeError("Constructors given to match didn't include: " + variant)
            return variant
        })

        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    },
}

// Add hidden properties
Object.defineProperty(Action, '@@typeName', { value: 'Action' })
Object.defineProperty(Action, '@@tagNames', {
    value: [
        'OrganizationCreated',
        'OrganizationUpdated',
        'OrganizationSuspended',
        'OrganizationDeleted',
        'UserCreated',
        'UserUpdated',
        'UserDeleted',
        'UserForgotten',
        'RoleAssigned',
    ],
})

ActionPrototype.constructor = Action
Action.prototype = ActionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationCreated constructor
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationCreatedConstructor = function OrganizationCreated(organizationId, name) {
    const constructorName = 'Action.OrganizationCreated(organizationId, name)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateString(constructorName, 'name', false, name)

    const result = Object.create(OrganizationCreatedPrototype)
    result.organizationId = organizationId
    result.name = name
    return result
}

Action.OrganizationCreated = OrganizationCreatedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.OrganizationCreated prototype
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationCreatedPrototype = Object.create(ActionPrototype)
Object.defineProperty(OrganizationCreatedPrototype, '@@tagName', { value: 'OrganizationCreated' })
Object.defineProperty(OrganizationCreatedPrototype, '@@typeName', { value: 'Action' })

OrganizationCreatedPrototype.toString = function () {
    return `Action.OrganizationCreated(${R._toString(this.organizationId)}, ${R._toString(this.name)})`
}

OrganizationCreatedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

OrganizationCreatedConstructor.prototype = OrganizationCreatedPrototype
OrganizationCreatedPrototype.constructor = OrganizationCreatedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationCreated: static functions:
//
// -------------------------------------------------------------------------------------------------------------
OrganizationCreatedConstructor.is = val => val && val.constructor === OrganizationCreatedConstructor
OrganizationCreatedConstructor.toString = () => 'Action.OrganizationCreated'
OrganizationCreatedConstructor.from = o => Action.OrganizationCreated(o.organizationId, o.name)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationUpdated constructor
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationUpdatedConstructor = function OrganizationUpdated(organizationId, name, status) {
    const constructorName = 'Action.OrganizationUpdated(organizationId, name, status)'

    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateString(constructorName, 'name', true, name)
    R.validateRegex(constructorName, /^(active|suspended)$/, 'status', true, status)

    const result = Object.create(OrganizationUpdatedPrototype)
    result.organizationId = organizationId
    if (name != null) result.name = name
    if (status != null) result.status = status
    return result
}

Action.OrganizationUpdated = OrganizationUpdatedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.OrganizationUpdated prototype
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationUpdatedPrototype = Object.create(ActionPrototype)
Object.defineProperty(OrganizationUpdatedPrototype, '@@tagName', { value: 'OrganizationUpdated' })
Object.defineProperty(OrganizationUpdatedPrototype, '@@typeName', { value: 'Action' })

OrganizationUpdatedPrototype.toString = function () {
    return `Action.OrganizationUpdated(${R._toString(this.organizationId)}, ${R._toString(this.name)}, ${R._toString(this.status)})`
}

OrganizationUpdatedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

OrganizationUpdatedConstructor.prototype = OrganizationUpdatedPrototype
OrganizationUpdatedPrototype.constructor = OrganizationUpdatedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationUpdated: static functions:
//
// -------------------------------------------------------------------------------------------------------------
OrganizationUpdatedConstructor.is = val => val && val.constructor === OrganizationUpdatedConstructor
OrganizationUpdatedConstructor.toString = () => 'Action.OrganizationUpdated'
OrganizationUpdatedConstructor.from = o => Action.OrganizationUpdated(o.organizationId, o.name, o.status)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationSuspended constructor
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationSuspendedConstructor = function OrganizationSuspended(organizationId) {
    const constructorName = 'Action.OrganizationSuspended(organizationId)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)

    const result = Object.create(OrganizationSuspendedPrototype)
    result.organizationId = organizationId
    return result
}

Action.OrganizationSuspended = OrganizationSuspendedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.OrganizationSuspended prototype
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationSuspendedPrototype = Object.create(ActionPrototype)
Object.defineProperty(OrganizationSuspendedPrototype, '@@tagName', { value: 'OrganizationSuspended' })
Object.defineProperty(OrganizationSuspendedPrototype, '@@typeName', { value: 'Action' })

OrganizationSuspendedPrototype.toString = function () {
    return `Action.OrganizationSuspended(${R._toString(this.organizationId)})`
}

OrganizationSuspendedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

OrganizationSuspendedConstructor.prototype = OrganizationSuspendedPrototype
OrganizationSuspendedPrototype.constructor = OrganizationSuspendedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationSuspended: static functions:
//
// -------------------------------------------------------------------------------------------------------------
OrganizationSuspendedConstructor.is = val => val && val.constructor === OrganizationSuspendedConstructor
OrganizationSuspendedConstructor.toString = () => 'Action.OrganizationSuspended'
OrganizationSuspendedConstructor.from = o => Action.OrganizationSuspended(o.organizationId)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationDeleted constructor
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationDeletedConstructor = function OrganizationDeleted(organizationId) {
    const constructorName = 'Action.OrganizationDeleted(organizationId)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)

    const result = Object.create(OrganizationDeletedPrototype)
    result.organizationId = organizationId
    return result
}

Action.OrganizationDeleted = OrganizationDeletedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.OrganizationDeleted prototype
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationDeletedPrototype = Object.create(ActionPrototype)
Object.defineProperty(OrganizationDeletedPrototype, '@@tagName', { value: 'OrganizationDeleted' })
Object.defineProperty(OrganizationDeletedPrototype, '@@typeName', { value: 'Action' })

OrganizationDeletedPrototype.toString = function () {
    return `Action.OrganizationDeleted(${R._toString(this.organizationId)})`
}

OrganizationDeletedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

OrganizationDeletedConstructor.prototype = OrganizationDeletedPrototype
OrganizationDeletedPrototype.constructor = OrganizationDeletedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationDeleted: static functions:
//
// -------------------------------------------------------------------------------------------------------------
OrganizationDeletedConstructor.is = val => val && val.constructor === OrganizationDeletedConstructor
OrganizationDeletedConstructor.toString = () => 'Action.OrganizationDeleted'
OrganizationDeletedConstructor.from = o => Action.OrganizationDeleted(o.organizationId)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserCreated constructor
//
// -------------------------------------------------------------------------------------------------------------
const UserCreatedConstructor = function UserCreated(userId, organizationId, email, displayName, role) {
    const constructorName = 'Action.UserCreated(userId, organizationId, email, displayName, role)'
    R.validateArgumentLength(constructorName, 5, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateRegex(constructorName, FieldTypes.email, 'email', false, email)
    R.validateString(constructorName, 'displayName', false, displayName)
    R.validateRegex(constructorName, /^(admin|member|viewer)$/, 'role', false, role)

    const result = Object.create(UserCreatedPrototype)
    result.userId = userId
    result.organizationId = organizationId
    result.email = email
    result.displayName = displayName
    result.role = role
    return result
}

Action.UserCreated = UserCreatedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.UserCreated prototype
//
// -------------------------------------------------------------------------------------------------------------
const UserCreatedPrototype = Object.create(ActionPrototype)
Object.defineProperty(UserCreatedPrototype, '@@tagName', { value: 'UserCreated' })
Object.defineProperty(UserCreatedPrototype, '@@typeName', { value: 'Action' })

UserCreatedPrototype.toString = function () {
    return `Action.UserCreated(${R._toString(this.userId)}, ${R._toString(this.organizationId)}, ${R._toString(this.email)}, ${R._toString(this.displayName)}, ${R._toString(this.role)})`
}

UserCreatedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

UserCreatedConstructor.prototype = UserCreatedPrototype
UserCreatedPrototype.constructor = UserCreatedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserCreated: static functions:
//
// -------------------------------------------------------------------------------------------------------------
UserCreatedConstructor.is = val => val && val.constructor === UserCreatedConstructor
UserCreatedConstructor.toString = () => 'Action.UserCreated'
UserCreatedConstructor.from = o => Action.UserCreated(o.userId, o.organizationId, o.email, o.displayName, o.role)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserUpdated constructor
//
// -------------------------------------------------------------------------------------------------------------
const UserUpdatedConstructor = function UserUpdated(userId, email, displayName) {
    const constructorName = 'Action.UserUpdated(userId, email, displayName)'

    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateRegex(constructorName, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/, 'email', true, email)
    R.validateString(constructorName, 'displayName', true, displayName)

    const result = Object.create(UserUpdatedPrototype)
    result.userId = userId
    if (email != null) result.email = email
    if (displayName != null) result.displayName = displayName
    return result
}

Action.UserUpdated = UserUpdatedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.UserUpdated prototype
//
// -------------------------------------------------------------------------------------------------------------
const UserUpdatedPrototype = Object.create(ActionPrototype)
Object.defineProperty(UserUpdatedPrototype, '@@tagName', { value: 'UserUpdated' })
Object.defineProperty(UserUpdatedPrototype, '@@typeName', { value: 'Action' })

UserUpdatedPrototype.toString = function () {
    return `Action.UserUpdated(${R._toString(this.userId)}, ${R._toString(this.email)}, ${R._toString(this.displayName)})`
}

UserUpdatedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

UserUpdatedConstructor.prototype = UserUpdatedPrototype
UserUpdatedPrototype.constructor = UserUpdatedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserUpdated: static functions:
//
// -------------------------------------------------------------------------------------------------------------
UserUpdatedConstructor.is = val => val && val.constructor === UserUpdatedConstructor
UserUpdatedConstructor.toString = () => 'Action.UserUpdated'
UserUpdatedConstructor.from = o => Action.UserUpdated(o.userId, o.email, o.displayName)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserDeleted constructor
//
// -------------------------------------------------------------------------------------------------------------
const UserDeletedConstructor = function UserDeleted(userId, organizationId) {
    const constructorName = 'Action.UserDeleted(userId, organizationId)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)

    const result = Object.create(UserDeletedPrototype)
    result.userId = userId
    result.organizationId = organizationId
    return result
}

Action.UserDeleted = UserDeletedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.UserDeleted prototype
//
// -------------------------------------------------------------------------------------------------------------
const UserDeletedPrototype = Object.create(ActionPrototype)
Object.defineProperty(UserDeletedPrototype, '@@tagName', { value: 'UserDeleted' })
Object.defineProperty(UserDeletedPrototype, '@@typeName', { value: 'Action' })

UserDeletedPrototype.toString = function () {
    return `Action.UserDeleted(${R._toString(this.userId)}, ${R._toString(this.organizationId)})`
}

UserDeletedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

UserDeletedConstructor.prototype = UserDeletedPrototype
UserDeletedPrototype.constructor = UserDeletedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserDeleted: static functions:
//
// -------------------------------------------------------------------------------------------------------------
UserDeletedConstructor.is = val => val && val.constructor === UserDeletedConstructor
UserDeletedConstructor.toString = () => 'Action.UserDeleted'
UserDeletedConstructor.from = o => Action.UserDeleted(o.userId, o.organizationId)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserForgotten constructor
//
// -------------------------------------------------------------------------------------------------------------
const UserForgottenConstructor = function UserForgotten(userId, reason) {
    const constructorName = 'Action.UserForgotten(userId, reason)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateString(constructorName, 'reason', false, reason)

    const result = Object.create(UserForgottenPrototype)
    result.userId = userId
    result.reason = reason
    return result
}

Action.UserForgotten = UserForgottenConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.UserForgotten prototype
//
// -------------------------------------------------------------------------------------------------------------
const UserForgottenPrototype = Object.create(ActionPrototype)
Object.defineProperty(UserForgottenPrototype, '@@tagName', { value: 'UserForgotten' })
Object.defineProperty(UserForgottenPrototype, '@@typeName', { value: 'Action' })

UserForgottenPrototype.toString = function () {
    return `Action.UserForgotten(${R._toString(this.userId)}, ${R._toString(this.reason)})`
}

UserForgottenPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

UserForgottenConstructor.prototype = UserForgottenPrototype
UserForgottenPrototype.constructor = UserForgottenConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserForgotten: static functions:
//
// -------------------------------------------------------------------------------------------------------------
UserForgottenConstructor.is = val => val && val.constructor === UserForgottenConstructor
UserForgottenConstructor.toString = () => 'Action.UserForgotten'
UserForgottenConstructor.from = o => Action.UserForgotten(o.userId, o.reason)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.RoleAssigned constructor
//
// -------------------------------------------------------------------------------------------------------------
const RoleAssignedConstructor = function RoleAssigned(userId, organizationId, role) {
    const constructorName = 'Action.RoleAssigned(userId, organizationId, role)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateRegex(constructorName, /^(admin|member|viewer)$/, 'role', false, role)

    const result = Object.create(RoleAssignedPrototype)
    result.userId = userId
    result.organizationId = organizationId
    result.role = role
    return result
}

Action.RoleAssigned = RoleAssignedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.RoleAssigned prototype
//
// -------------------------------------------------------------------------------------------------------------
const RoleAssignedPrototype = Object.create(ActionPrototype)
Object.defineProperty(RoleAssignedPrototype, '@@tagName', { value: 'RoleAssigned' })
Object.defineProperty(RoleAssignedPrototype, '@@typeName', { value: 'Action' })

RoleAssignedPrototype.toString = function () {
    return `Action.RoleAssigned(${R._toString(this.userId)}, ${R._toString(this.organizationId)}, ${R._toString(this.role)})`
}

RoleAssignedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

RoleAssignedConstructor.prototype = RoleAssignedPrototype
RoleAssignedPrototype.constructor = RoleAssignedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.RoleAssigned: static functions:
//
// -------------------------------------------------------------------------------------------------------------
RoleAssignedConstructor.is = val => val && val.constructor === RoleAssignedConstructor
RoleAssignedConstructor.toString = () => 'Action.RoleAssigned'
RoleAssignedConstructor.from = o => Action.RoleAssigned(o.userId, o.organizationId, o.role)

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: toFirestore
Action.toFirestore = action => ({
    ...action,
    '@@tagName': action['@@tagName'],
})

// Additional function: fromFirestore
Action.fromFirestore = o => {
    const tagName = o['@@tagName']
    if (tagName === 'OrganizationCreated') return Action.OrganizationCreated.from(o)
    if (tagName === 'OrganizationDeleted') return Action.OrganizationDeleted.from(o)
    if (tagName === 'OrganizationSuspended') return Action.OrganizationSuspended.from(o)
    if (tagName === 'OrganizationUpdated') return Action.OrganizationUpdated.from(o)
    if (tagName === 'RoleAssigned') return Action.RoleAssigned.from(o)
    if (tagName === 'UserCreated') return Action.UserCreated.from(o)
    if (tagName === 'UserDeleted') return Action.UserDeleted.from(o)
    if (tagName === 'UserForgotten') return Action.UserForgotten.from(o)
    if (tagName === 'UserUpdated') return Action.UserUpdated.from(o)
    throw new Error(`Unrecognized domain event ${tagName}`)
}

export { Action }
