/*  Action generated from: modules/curb-map/type-definitions/action.type.js
 *
 *  OrganizationCreated
 *      organizationId: FieldTypes.organizationId,
 *      projectId     : FieldTypes.projectId,
 *      name          : "String"
 *  OrganizationDeleted
 *      organizationId: FieldTypes.organizationId
 *  OrganizationSuspended
 *      organizationId: FieldTypes.organizationId
 *  OrganizationUpdated
 *      organizationId: FieldTypes.organizationId,
 *      name          : "String?",
 *      status        : "/^(active|suspended)$/?"
 *  MemberAdded
 *      userId        : FieldTypes.userId,
 *      organizationId: FieldTypes.organizationId,
 *      displayName   : "String",
 *      role          : FieldTypes.role
 *  MemberRemoved
 *      userId        : FieldTypes.userId,
 *      organizationId: FieldTypes.organizationId
 *  RoleChanged
 *      userId        : FieldTypes.userId,
 *      organizationId: FieldTypes.organizationId,
 *      role          : FieldTypes.role
 *  UserCreated
 *      userId        : FieldTypes.userId,
 *      organizationId: FieldTypes.organizationId,
 *      email         : FieldTypes.email,
 *      displayName   : "String",
 *      role          : FieldTypes.role
 *  UserForgotten
 *      userId: FieldTypes.userId,
 *      reason: "String"
 *  UserUpdated
 *      userId     : FieldTypes.userId,
 *      email      : "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/?",
 *      displayName: "String?"
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
            constructor === Action.OrganizationDeleted ||
            constructor === Action.OrganizationSuspended ||
            constructor === Action.OrganizationUpdated ||
            constructor === Action.MemberAdded ||
            constructor === Action.MemberRemoved ||
            constructor === Action.RoleChanged ||
            constructor === Action.UserCreated ||
            constructor === Action.UserForgotten ||
            constructor === Action.UserUpdated
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
            'OrganizationDeleted',
            'OrganizationSuspended',
            'OrganizationUpdated',
            'MemberAdded',
            'MemberRemoved',
            'RoleChanged',
            'UserCreated',
            'UserForgotten',
            'UserUpdated',
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
        'OrganizationDeleted',
        'OrganizationSuspended',
        'OrganizationUpdated',
        'MemberAdded',
        'MemberRemoved',
        'RoleChanged',
        'UserCreated',
        'UserForgotten',
        'UserUpdated',
    ],
})

ActionPrototype.constructor = Action
Action.prototype = ActionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationCreated constructor
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationCreatedConstructor = function OrganizationCreated(organizationId, projectId, name) {
    const constructorName = 'Action.OrganizationCreated(organizationId, projectId, name)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateRegex(constructorName, FieldTypes.projectId, 'projectId', false, projectId)
    R.validateString(constructorName, 'name', false, name)

    const result = Object.create(OrganizationCreatedPrototype)
    result.organizationId = organizationId
    result.projectId = projectId
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
    return `Action.OrganizationCreated(${R._toString(this.organizationId)}, ${R._toString(this.projectId)}, ${R._toString(this.name)})`
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
OrganizationCreatedConstructor.from = o => Action.OrganizationCreated(o.organizationId, o.projectId, o.name)

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
// Variant Action.MemberAdded constructor
//
// -------------------------------------------------------------------------------------------------------------
const MemberAddedConstructor = function MemberAdded(userId, organizationId, displayName, role) {
    const constructorName = 'Action.MemberAdded(userId, organizationId, displayName, role)'
    R.validateArgumentLength(constructorName, 4, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateString(constructorName, 'displayName', false, displayName)
    R.validateRegex(constructorName, FieldTypes.role, 'role', false, role)

    const result = Object.create(MemberAddedPrototype)
    result.userId = userId
    result.organizationId = organizationId
    result.displayName = displayName
    result.role = role
    return result
}

Action.MemberAdded = MemberAddedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.MemberAdded prototype
//
// -------------------------------------------------------------------------------------------------------------
const MemberAddedPrototype = Object.create(ActionPrototype)
Object.defineProperty(MemberAddedPrototype, '@@tagName', { value: 'MemberAdded' })
Object.defineProperty(MemberAddedPrototype, '@@typeName', { value: 'Action' })

MemberAddedPrototype.toString = function () {
    return `Action.MemberAdded(${R._toString(this.userId)}, ${R._toString(this.organizationId)}, ${R._toString(this.displayName)}, ${R._toString(this.role)})`
}

MemberAddedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

MemberAddedConstructor.prototype = MemberAddedPrototype
MemberAddedPrototype.constructor = MemberAddedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.MemberAdded: static functions:
//
// -------------------------------------------------------------------------------------------------------------
MemberAddedConstructor.is = val => val && val.constructor === MemberAddedConstructor
MemberAddedConstructor.toString = () => 'Action.MemberAdded'
MemberAddedConstructor.from = o => Action.MemberAdded(o.userId, o.organizationId, o.displayName, o.role)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.MemberRemoved constructor
//
// -------------------------------------------------------------------------------------------------------------
const MemberRemovedConstructor = function MemberRemoved(userId, organizationId) {
    const constructorName = 'Action.MemberRemoved(userId, organizationId)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)

    const result = Object.create(MemberRemovedPrototype)
    result.userId = userId
    result.organizationId = organizationId
    return result
}

Action.MemberRemoved = MemberRemovedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.MemberRemoved prototype
//
// -------------------------------------------------------------------------------------------------------------
const MemberRemovedPrototype = Object.create(ActionPrototype)
Object.defineProperty(MemberRemovedPrototype, '@@tagName', { value: 'MemberRemoved' })
Object.defineProperty(MemberRemovedPrototype, '@@typeName', { value: 'Action' })

MemberRemovedPrototype.toString = function () {
    return `Action.MemberRemoved(${R._toString(this.userId)}, ${R._toString(this.organizationId)})`
}

MemberRemovedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

MemberRemovedConstructor.prototype = MemberRemovedPrototype
MemberRemovedPrototype.constructor = MemberRemovedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.MemberRemoved: static functions:
//
// -------------------------------------------------------------------------------------------------------------
MemberRemovedConstructor.is = val => val && val.constructor === MemberRemovedConstructor
MemberRemovedConstructor.toString = () => 'Action.MemberRemoved'
MemberRemovedConstructor.from = o => Action.MemberRemoved(o.userId, o.organizationId)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.RoleChanged constructor
//
// -------------------------------------------------------------------------------------------------------------
const RoleChangedConstructor = function RoleChanged(userId, organizationId, role) {
    const constructorName = 'Action.RoleChanged(userId, organizationId, role)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateRegex(constructorName, FieldTypes.role, 'role', false, role)

    const result = Object.create(RoleChangedPrototype)
    result.userId = userId
    result.organizationId = organizationId
    result.role = role
    return result
}

Action.RoleChanged = RoleChangedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.RoleChanged prototype
//
// -------------------------------------------------------------------------------------------------------------
const RoleChangedPrototype = Object.create(ActionPrototype)
Object.defineProperty(RoleChangedPrototype, '@@tagName', { value: 'RoleChanged' })
Object.defineProperty(RoleChangedPrototype, '@@typeName', { value: 'Action' })

RoleChangedPrototype.toString = function () {
    return `Action.RoleChanged(${R._toString(this.userId)}, ${R._toString(this.organizationId)}, ${R._toString(this.role)})`
}

RoleChangedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

RoleChangedConstructor.prototype = RoleChangedPrototype
RoleChangedPrototype.constructor = RoleChangedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.RoleChanged: static functions:
//
// -------------------------------------------------------------------------------------------------------------
RoleChangedConstructor.is = val => val && val.constructor === RoleChangedConstructor
RoleChangedConstructor.toString = () => 'Action.RoleChanged'
RoleChangedConstructor.from = o => Action.RoleChanged(o.userId, o.organizationId, o.role)

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
    R.validateRegex(constructorName, FieldTypes.role, 'role', false, role)

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
    if (tagName === 'MemberAdded') return Action.MemberAdded.from(o)
    if (tagName === 'MemberRemoved') return Action.MemberRemoved.from(o)
    if (tagName === 'RoleChanged') return Action.RoleChanged.from(o)
    if (tagName === 'UserCreated') return Action.UserCreated.from(o)
    if (tagName === 'UserForgotten') return Action.UserForgotten.from(o)
    if (tagName === 'UserUpdated') return Action.UserUpdated.from(o)
    throw new Error(`Unrecognized domain event ${tagName}`)
}

// Additional function: piiFields
Action.piiFields = rawData => {
    const tagName = rawData['@@tagName']
    if (tagName === 'OrganizationCreated') return []
    if (tagName === 'OrganizationDeleted') return []
    if (tagName === 'OrganizationSuspended') return []
    if (tagName === 'OrganizationUpdated') return []
    if (tagName === 'MemberAdded') return ['displayName']
    if (tagName === 'MemberRemoved') return []
    if (tagName === 'RoleChanged') return []
    if (tagName === 'UserCreated') return ['email', 'displayName']
    if (tagName === 'UserForgotten') return []
    if (tagName === 'UserUpdated') return ['email', 'displayName']
    return []
}

// Additional function: toLog
Action.toLog = a => {
    const redactField = field => {
        if (result[field]) result[field] = `${field}: ${result[field].length}`
    }
    const result = a.match({
        OrganizationCreated: ({ name }) => ({
            type: 'OrganizationCreated',
            name,
        }),
        OrganizationDeleted: () => ({ type: 'OrganizationDeleted' }),
        OrganizationSuspended: () => ({ type: 'OrganizationSuspended' }),
        OrganizationUpdated: ({ name, status }) => ({
            type: 'OrganizationUpdated',
            name,
            status,
        }),
        MemberAdded: ({ displayName, role }) => ({
            type: 'MemberAdded',
            displayName,
            role,
        }),
        MemberRemoved: () => ({ type: 'MemberRemoved' }),
        RoleChanged: ({ role }) => ({
            type: 'RoleChanged',
            role,
        }),
        UserCreated: ({ email, displayName, role }) => ({
            type: 'UserCreated',
            email,
            displayName,
            role,
        }),
        UserForgotten: ({ reason }) => ({
            type: 'UserForgotten',
            reason,
        }),
        UserUpdated: ({ email, displayName, role }) => ({
            type: 'UserUpdated',
            email,
            displayName,
            role,
        }),
    })
    Action.piiFields(a).forEach(redactField)
    return result
}

// Additional function: redactPii
Action.redactPii = rawData => {
    const redactField = field => {
        if (result[field]) result[field] = `${field}: ${result[field].length}`
    }
    const piiFields = () => {
        const tagName = rawData['@@tagName']
        if (tagName === 'UserCreated') return ['email', 'displayName']
        if (tagName === 'UserUpdated') return ['email', 'displayName']
        return []
    }
    const result = { ...rawData }
    piiFields().forEach(redactField)
    return result
}

// Additional function: getSubject
Action.getSubject = action =>
    action.match({
        OrganizationCreated: a => ({
            id: a.organizationId,
            type: 'organization',
        }),
        OrganizationDeleted: a => ({
            id: a.organizationId,
            type: 'organization',
        }),
        OrganizationSuspended: a => ({
            id: a.organizationId,
            type: 'organization',
        }),
        OrganizationUpdated: a => ({
            id: a.organizationId,
            type: 'organization',
        }),
        MemberAdded: a => ({
            id: a.userId,
            type: 'user',
        }),
        MemberRemoved: a => ({
            id: a.userId,
            type: 'user',
        }),
        RoleChanged: a => ({
            id: a.userId,
            type: 'user',
        }),
        UserCreated: a => ({
            id: a.userId,
            type: 'user',
        }),
        UserForgotten: a => ({
            id: a.userId,
            type: 'user',
        }),
        UserUpdated: a => ({
            id: a.userId,
            type: 'user',
        }),
    })

export { Action }
