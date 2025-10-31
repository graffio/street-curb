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
 *      userId     : FieldTypes.userId,
 *      email      : FieldTypes.email,
 *      displayName: "String",
 *      authUid    : "String"
 *  UserForgotten
 *      userId: FieldTypes.userId,
 *      reason: "String"
 *  UserUpdated
 *      userId     : FieldTypes.userId,
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
const ActionPrototype = {}

Object.defineProperty(ActionPrototype, 'match', {
    value: function (variants) {
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
    enumerable: false,
})

Object.defineProperty(ActionPrototype, 'constructor', {
    value: Action,
    enumerable: false,
    writable: true,
    configurable: true,
})

// Add hidden properties
Object.defineProperty(Action, '@@typeName', { value: 'Action', enumerable: false })
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
    enumerable: false,
})

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

const OrganizationCreatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationCreated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.OrganizationCreated(${R._toString(this.organizationId)}, ${R._toString(this.projectId)}, ${R._toString(this.name)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: OrganizationCreatedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

OrganizationCreatedConstructor.prototype = OrganizationCreatedPrototype

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

const OrganizationDeletedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationDeleted', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.OrganizationDeleted(${R._toString(this.organizationId)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: OrganizationDeletedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

OrganizationDeletedConstructor.prototype = OrganizationDeletedPrototype

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

const OrganizationSuspendedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationSuspended', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.OrganizationSuspended(${R._toString(this.organizationId)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: OrganizationSuspendedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

OrganizationSuspendedConstructor.prototype = OrganizationSuspendedPrototype

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

const OrganizationUpdatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationUpdated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.OrganizationUpdated(${R._toString(this.organizationId)}, ${R._toString(this.name)}, ${R._toString(this.status)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: OrganizationUpdatedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

OrganizationUpdatedConstructor.prototype = OrganizationUpdatedPrototype

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

const MemberAddedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'MemberAdded', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.MemberAdded(${R._toString(this.userId)}, ${R._toString(this.organizationId)}, ${R._toString(this.displayName)}, ${R._toString(this.role)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: MemberAddedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

MemberAddedConstructor.prototype = MemberAddedPrototype

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

const MemberRemovedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'MemberRemoved', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.MemberRemoved(${R._toString(this.userId)}, ${R._toString(this.organizationId)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: MemberRemovedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

MemberRemovedConstructor.prototype = MemberRemovedPrototype

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

const RoleChangedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'RoleChanged', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.RoleChanged(${R._toString(this.userId)}, ${R._toString(this.organizationId)}, ${R._toString(this.role)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: RoleChangedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

RoleChangedConstructor.prototype = RoleChangedPrototype

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
const UserCreatedConstructor = function UserCreated(userId, email, displayName, authUid) {
    const constructorName = 'Action.UserCreated(userId, email, displayName, authUid)'
    R.validateArgumentLength(constructorName, 4, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateRegex(constructorName, FieldTypes.email, 'email', false, email)
    R.validateString(constructorName, 'displayName', false, displayName)
    R.validateString(constructorName, 'authUid', false, authUid)

    const result = Object.create(UserCreatedPrototype)
    result.userId = userId
    result.email = email
    result.displayName = displayName
    result.authUid = authUid
    return result
}

Action.UserCreated = UserCreatedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.UserCreated prototype
//
// -------------------------------------------------------------------------------------------------------------

const UserCreatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UserCreated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.UserCreated(${R._toString(this.userId)}, ${R._toString(this.email)}, ${R._toString(this.displayName)}, ${R._toString(this.authUid)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: UserCreatedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

UserCreatedConstructor.prototype = UserCreatedPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserCreated: static functions:
//
// -------------------------------------------------------------------------------------------------------------
UserCreatedConstructor.is = val => val && val.constructor === UserCreatedConstructor
UserCreatedConstructor.toString = () => 'Action.UserCreated'
UserCreatedConstructor.from = o => Action.UserCreated(o.userId, o.email, o.displayName, o.authUid)

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

const UserForgottenPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UserForgotten', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.UserForgotten(${R._toString(this.userId)}, ${R._toString(this.reason)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: UserForgottenConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

UserForgottenConstructor.prototype = UserForgottenPrototype

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
const UserUpdatedConstructor = function UserUpdated(userId, displayName) {
    const constructorName = 'Action.UserUpdated(userId, displayName)'

    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateString(constructorName, 'displayName', true, displayName)

    const result = Object.create(UserUpdatedPrototype)
    result.userId = userId
    if (displayName != null) result.displayName = displayName
    return result
}

Action.UserUpdated = UserUpdatedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.UserUpdated prototype
//
// -------------------------------------------------------------------------------------------------------------

const UserUpdatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UserUpdated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.UserUpdated(${R._toString(this.userId)}, ${R._toString(this.displayName)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: UserUpdatedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

UserUpdatedConstructor.prototype = UserUpdatedPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserUpdated: static functions:
//
// -------------------------------------------------------------------------------------------------------------
UserUpdatedConstructor.is = val => val && val.constructor === UserUpdatedConstructor
UserUpdatedConstructor.toString = () => 'Action.UserUpdated'
UserUpdatedConstructor.from = o => Action.UserUpdated(o.userId, o.displayName)

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
    if (tagName === 'UserUpdated') return ['displayName']
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
        UserCreated: ({ email, displayName }) => ({
            type: 'UserCreated',
            email,
            displayName,
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

// Additional function: mayI
Action.mayI = (action, actorRole) =>
    action.match({
        MemberAdded: () => ['admin'].includes(actorRole),
        MemberRemoved: () => ['admin'].includes(actorRole),
        OrganizationCreated: () => ['admin'].includes(actorRole),
        OrganizationDeleted: () => ['admin'].includes(actorRole),
        OrganizationSuspended: () => ['admin'].includes(actorRole),
        OrganizationUpdated: () => ['admin'].includes(actorRole),
        RoleChanged: () => ['admin'].includes(actorRole),
        UserCreated: () => ['admin'].includes(actorRole),
        UserForgotten: () => ['admin'].includes(actorRole),
        UserUpdated: () => ['admin'].includes(actorRole),
    })

export { Action }
