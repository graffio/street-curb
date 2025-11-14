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
 *  AuthenticationCompleted
 *      email      : FieldTypes.email,
 *      displayName: "String"
 *  LoadAllInitialData
 *      currentUser        : "User",
 *      currentOrganization: "Organization"
 *  CreateBlockface
 *      id        : "String",
 *      geometry  : "Object",
 *      streetName: "String",
 *      cnnId     : "String?"
 *  SelectBlockface
 *      id        : "String",
 *      geometry  : "Object",
 *      streetName: "String",
 *      cnnId     : "String?"
 *  UpdateSegmentUse
 *      index: "Number",
 *      use  : "String"
 *  UpdateSegmentLength
 *      index    : "Number",
 *      newLength: "Number"
 *  AddSegment
 *      targetIndex: "Number"
 *  AddSegmentLeft
 *      index        : "Number",
 *      desiredLength: "Number"
 *  ReplaceSegments
 *      segments: "[Segment]"
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
            constructor === Action.UserUpdated ||
            constructor === Action.AuthenticationCompleted ||
            constructor === Action.LoadAllInitialData ||
            constructor === Action.CreateBlockface ||
            constructor === Action.SelectBlockface ||
            constructor === Action.UpdateSegmentUse ||
            constructor === Action.UpdateSegmentLength ||
            constructor === Action.AddSegment ||
            constructor === Action.AddSegmentLeft ||
            constructor === Action.ReplaceSegments
        )
    },
}

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
        'AuthenticationCompleted',
        'LoadAllInitialData',
        'CreateBlockface',
        'SelectBlockface',
        'UpdateSegmentUse',
        'UpdateSegmentLength',
        'AddSegment',
        'AddSegmentLeft',
        'ReplaceSegments',
    ],
    enumerable: false,
})

// -------------------------------------------------------------------------------------------------------------
//
// Set up Action's prototype as ActionPrototype
//
// -------------------------------------------------------------------------------------------------------------
// Type prototype with match method
const ActionPrototype = {}

Object.defineProperty(ActionPrototype, 'match', {
    value: R.match(Action['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(ActionPrototype, 'constructor', {
    value: Action,
    enumerable: false,
    writable: true,
    configurable: true,
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
OrganizationCreatedConstructor._from = o => Action.OrganizationCreated(o.organizationId, o.projectId, o.name)
OrganizationCreatedConstructor.from = OrganizationCreatedConstructor._from

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
OrganizationDeletedConstructor._from = o => Action.OrganizationDeleted(o.organizationId)
OrganizationDeletedConstructor.from = OrganizationDeletedConstructor._from

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
OrganizationSuspendedConstructor._from = o => Action.OrganizationSuspended(o.organizationId)
OrganizationSuspendedConstructor.from = OrganizationSuspendedConstructor._from

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
OrganizationUpdatedConstructor._from = o => Action.OrganizationUpdated(o.organizationId, o.name, o.status)
OrganizationUpdatedConstructor.from = OrganizationUpdatedConstructor._from

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
MemberAddedConstructor._from = o => Action.MemberAdded(o.userId, o.organizationId, o.displayName, o.role)
MemberAddedConstructor.from = MemberAddedConstructor._from

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
MemberRemovedConstructor._from = o => Action.MemberRemoved(o.userId, o.organizationId)
MemberRemovedConstructor.from = MemberRemovedConstructor._from

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
RoleChangedConstructor._from = o => Action.RoleChanged(o.userId, o.organizationId, o.role)
RoleChangedConstructor.from = RoleChangedConstructor._from

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
UserCreatedConstructor._from = o => Action.UserCreated(o.userId, o.email, o.displayName, o.authUid)
UserCreatedConstructor.from = UserCreatedConstructor._from

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
UserForgottenConstructor._from = o => Action.UserForgotten(o.userId, o.reason)
UserForgottenConstructor.from = UserForgottenConstructor._from

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
UserUpdatedConstructor._from = o => Action.UserUpdated(o.userId, o.displayName)
UserUpdatedConstructor.from = UserUpdatedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.AuthenticationCompleted constructor
//
// -------------------------------------------------------------------------------------------------------------
const AuthenticationCompletedConstructor = function AuthenticationCompleted(email, displayName) {
    const constructorName = 'Action.AuthenticationCompleted(email, displayName)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.email, 'email', false, email)
    R.validateString(constructorName, 'displayName', false, displayName)

    const result = Object.create(AuthenticationCompletedPrototype)
    result.email = email
    result.displayName = displayName
    return result
}

Action.AuthenticationCompleted = AuthenticationCompletedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.AuthenticationCompleted prototype
//
// -------------------------------------------------------------------------------------------------------------

const AuthenticationCompletedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'AuthenticationCompleted', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.AuthenticationCompleted(${R._toString(this.email)}, ${R._toString(this.displayName)})`
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
        value: AuthenticationCompletedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

AuthenticationCompletedConstructor.prototype = AuthenticationCompletedPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.AuthenticationCompleted: static functions:
//
// -------------------------------------------------------------------------------------------------------------
AuthenticationCompletedConstructor.is = val => val && val.constructor === AuthenticationCompletedConstructor
AuthenticationCompletedConstructor.toString = () => 'Action.AuthenticationCompleted'
AuthenticationCompletedConstructor._from = o => Action.AuthenticationCompleted(o.email, o.displayName)
AuthenticationCompletedConstructor.from = AuthenticationCompletedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.LoadAllInitialData constructor
//
// -------------------------------------------------------------------------------------------------------------
const LoadAllInitialDataConstructor = function LoadAllInitialData(currentUser, currentOrganization) {
    const constructorName = 'Action.LoadAllInitialData(currentUser, currentOrganization)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateTag(constructorName, 'User', 'currentUser', false, currentUser)
    R.validateTag(constructorName, 'Organization', 'currentOrganization', false, currentOrganization)

    const result = Object.create(LoadAllInitialDataPrototype)
    result.currentUser = currentUser
    result.currentOrganization = currentOrganization
    return result
}

Action.LoadAllInitialData = LoadAllInitialDataConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.LoadAllInitialData prototype
//
// -------------------------------------------------------------------------------------------------------------

const LoadAllInitialDataPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'LoadAllInitialData', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.LoadAllInitialData(${R._toString(this.currentUser)}, ${R._toString(this.currentOrganization)})`
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
        value: LoadAllInitialDataConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

LoadAllInitialDataConstructor.prototype = LoadAllInitialDataPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.LoadAllInitialData: static functions:
//
// -------------------------------------------------------------------------------------------------------------
LoadAllInitialDataConstructor.is = val => val && val.constructor === LoadAllInitialDataConstructor
LoadAllInitialDataConstructor.toString = () => 'Action.LoadAllInitialData'
LoadAllInitialDataConstructor._from = o => Action.LoadAllInitialData(o.currentUser, o.currentOrganization)
LoadAllInitialDataConstructor.from = LoadAllInitialDataConstructor._from

// -------------------------------------------------------------------------------------------------------------
// Firestore serialization
// -------------------------------------------------------------------------------------------------------------
LoadAllInitialDataConstructor._toFirestore = (o, encodeTimestamps) => ({
    currentUser: User.toFirestore(o.currentUser, encodeTimestamps),
    currentOrganization: Organization.toFirestore(o.currentOrganization, encodeTimestamps),
})

LoadAllInitialDataConstructor._fromFirestore = (doc, decodeTimestamps) =>
    LoadAllInitialDataConstructor._from({
        currentUser: User.fromFirestore
            ? User.fromFirestore(doc.currentUser, decodeTimestamps)
            : User.from(doc.currentUser),
        currentOrganization: Organization.fromFirestore
            ? Organization.fromFirestore(doc.currentOrganization, decodeTimestamps)
            : Organization.from(doc.currentOrganization),
    })

// Public aliases (can be overridden)
LoadAllInitialDataConstructor.toFirestore = LoadAllInitialDataConstructor._toFirestore
LoadAllInitialDataConstructor.fromFirestore = LoadAllInitialDataConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.CreateBlockface constructor
//
// -------------------------------------------------------------------------------------------------------------
const CreateBlockfaceConstructor = function CreateBlockface(id, geometry, streetName, cnnId) {
    const constructorName = 'Action.CreateBlockface(id, geometry, streetName, cnnId)'

    R.validateString(constructorName, 'id', false, id)
    R.validateObject(constructorName, 'geometry', false, geometry)
    R.validateString(constructorName, 'streetName', false, streetName)
    R.validateString(constructorName, 'cnnId', true, cnnId)

    const result = Object.create(CreateBlockfacePrototype)
    result.id = id
    result.geometry = geometry
    result.streetName = streetName
    if (cnnId != null) result.cnnId = cnnId
    return result
}

Action.CreateBlockface = CreateBlockfaceConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.CreateBlockface prototype
//
// -------------------------------------------------------------------------------------------------------------

const CreateBlockfacePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'CreateBlockface', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.CreateBlockface(${R._toString(this.id)}, ${R._toString(this.geometry)}, ${R._toString(this.streetName)}, ${R._toString(this.cnnId)})`
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
        value: CreateBlockfaceConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

CreateBlockfaceConstructor.prototype = CreateBlockfacePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.CreateBlockface: static functions:
//
// -------------------------------------------------------------------------------------------------------------
CreateBlockfaceConstructor.is = val => val && val.constructor === CreateBlockfaceConstructor
CreateBlockfaceConstructor.toString = () => 'Action.CreateBlockface'
CreateBlockfaceConstructor._from = o => Action.CreateBlockface(o.id, o.geometry, o.streetName, o.cnnId)
CreateBlockfaceConstructor.from = CreateBlockfaceConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SelectBlockface constructor
//
// -------------------------------------------------------------------------------------------------------------
const SelectBlockfaceConstructor = function SelectBlockface(id, geometry, streetName, cnnId) {
    const constructorName = 'Action.SelectBlockface(id, geometry, streetName, cnnId)'

    R.validateString(constructorName, 'id', false, id)
    R.validateObject(constructorName, 'geometry', false, geometry)
    R.validateString(constructorName, 'streetName', false, streetName)
    R.validateString(constructorName, 'cnnId', true, cnnId)

    const result = Object.create(SelectBlockfacePrototype)
    result.id = id
    result.geometry = geometry
    result.streetName = streetName
    if (cnnId != null) result.cnnId = cnnId
    return result
}

Action.SelectBlockface = SelectBlockfaceConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.SelectBlockface prototype
//
// -------------------------------------------------------------------------------------------------------------

const SelectBlockfacePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SelectBlockface', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SelectBlockface(${R._toString(this.id)}, ${R._toString(this.geometry)}, ${R._toString(this.streetName)}, ${R._toString(this.cnnId)})`
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
        value: SelectBlockfaceConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SelectBlockfaceConstructor.prototype = SelectBlockfacePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SelectBlockface: static functions:
//
// -------------------------------------------------------------------------------------------------------------
SelectBlockfaceConstructor.is = val => val && val.constructor === SelectBlockfaceConstructor
SelectBlockfaceConstructor.toString = () => 'Action.SelectBlockface'
SelectBlockfaceConstructor._from = o => Action.SelectBlockface(o.id, o.geometry, o.streetName, o.cnnId)
SelectBlockfaceConstructor.from = SelectBlockfaceConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UpdateSegmentUse constructor
//
// -------------------------------------------------------------------------------------------------------------
const UpdateSegmentUseConstructor = function UpdateSegmentUse(index, use) {
    const constructorName = 'Action.UpdateSegmentUse(index, use)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'index', false, index)
    R.validateString(constructorName, 'use', false, use)

    const result = Object.create(UpdateSegmentUsePrototype)
    result.index = index
    result.use = use
    return result
}

Action.UpdateSegmentUse = UpdateSegmentUseConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.UpdateSegmentUse prototype
//
// -------------------------------------------------------------------------------------------------------------

const UpdateSegmentUsePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UpdateSegmentUse', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.UpdateSegmentUse(${R._toString(this.index)}, ${R._toString(this.use)})`
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
        value: UpdateSegmentUseConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

UpdateSegmentUseConstructor.prototype = UpdateSegmentUsePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UpdateSegmentUse: static functions:
//
// -------------------------------------------------------------------------------------------------------------
UpdateSegmentUseConstructor.is = val => val && val.constructor === UpdateSegmentUseConstructor
UpdateSegmentUseConstructor.toString = () => 'Action.UpdateSegmentUse'
UpdateSegmentUseConstructor._from = o => Action.UpdateSegmentUse(o.index, o.use)
UpdateSegmentUseConstructor.from = UpdateSegmentUseConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UpdateSegmentLength constructor
//
// -------------------------------------------------------------------------------------------------------------
const UpdateSegmentLengthConstructor = function UpdateSegmentLength(index, newLength) {
    const constructorName = 'Action.UpdateSegmentLength(index, newLength)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'index', false, index)
    R.validateNumber(constructorName, 'newLength', false, newLength)

    const result = Object.create(UpdateSegmentLengthPrototype)
    result.index = index
    result.newLength = newLength
    return result
}

Action.UpdateSegmentLength = UpdateSegmentLengthConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.UpdateSegmentLength prototype
//
// -------------------------------------------------------------------------------------------------------------

const UpdateSegmentLengthPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UpdateSegmentLength', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.UpdateSegmentLength(${R._toString(this.index)}, ${R._toString(this.newLength)})`
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
        value: UpdateSegmentLengthConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

UpdateSegmentLengthConstructor.prototype = UpdateSegmentLengthPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UpdateSegmentLength: static functions:
//
// -------------------------------------------------------------------------------------------------------------
UpdateSegmentLengthConstructor.is = val => val && val.constructor === UpdateSegmentLengthConstructor
UpdateSegmentLengthConstructor.toString = () => 'Action.UpdateSegmentLength'
UpdateSegmentLengthConstructor._from = o => Action.UpdateSegmentLength(o.index, o.newLength)
UpdateSegmentLengthConstructor.from = UpdateSegmentLengthConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.AddSegment constructor
//
// -------------------------------------------------------------------------------------------------------------
const AddSegmentConstructor = function AddSegment(targetIndex) {
    const constructorName = 'Action.AddSegment(targetIndex)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateNumber(constructorName, 'targetIndex', false, targetIndex)

    const result = Object.create(AddSegmentPrototype)
    result.targetIndex = targetIndex
    return result
}

Action.AddSegment = AddSegmentConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.AddSegment prototype
//
// -------------------------------------------------------------------------------------------------------------

const AddSegmentPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'AddSegment', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.AddSegment(${R._toString(this.targetIndex)})`
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
        value: AddSegmentConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

AddSegmentConstructor.prototype = AddSegmentPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.AddSegment: static functions:
//
// -------------------------------------------------------------------------------------------------------------
AddSegmentConstructor.is = val => val && val.constructor === AddSegmentConstructor
AddSegmentConstructor.toString = () => 'Action.AddSegment'
AddSegmentConstructor._from = o => Action.AddSegment(o.targetIndex)
AddSegmentConstructor.from = AddSegmentConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.AddSegmentLeft constructor
//
// -------------------------------------------------------------------------------------------------------------
const AddSegmentLeftConstructor = function AddSegmentLeft(index, desiredLength) {
    const constructorName = 'Action.AddSegmentLeft(index, desiredLength)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'index', false, index)
    R.validateNumber(constructorName, 'desiredLength', false, desiredLength)

    const result = Object.create(AddSegmentLeftPrototype)
    result.index = index
    result.desiredLength = desiredLength
    return result
}

Action.AddSegmentLeft = AddSegmentLeftConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.AddSegmentLeft prototype
//
// -------------------------------------------------------------------------------------------------------------

const AddSegmentLeftPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'AddSegmentLeft', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.AddSegmentLeft(${R._toString(this.index)}, ${R._toString(this.desiredLength)})`
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
        value: AddSegmentLeftConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

AddSegmentLeftConstructor.prototype = AddSegmentLeftPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.AddSegmentLeft: static functions:
//
// -------------------------------------------------------------------------------------------------------------
AddSegmentLeftConstructor.is = val => val && val.constructor === AddSegmentLeftConstructor
AddSegmentLeftConstructor.toString = () => 'Action.AddSegmentLeft'
AddSegmentLeftConstructor._from = o => Action.AddSegmentLeft(o.index, o.desiredLength)
AddSegmentLeftConstructor.from = AddSegmentLeftConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.ReplaceSegments constructor
//
// -------------------------------------------------------------------------------------------------------------
const ReplaceSegmentsConstructor = function ReplaceSegments(segments) {
    const constructorName = 'Action.ReplaceSegments(segments)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'Segment', 'segments', false, segments)

    const result = Object.create(ReplaceSegmentsPrototype)
    result.segments = segments
    return result
}

Action.ReplaceSegments = ReplaceSegmentsConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.ReplaceSegments prototype
//
// -------------------------------------------------------------------------------------------------------------

const ReplaceSegmentsPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'ReplaceSegments', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.ReplaceSegments(${R._toString(this.segments)})`
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
        value: ReplaceSegmentsConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

ReplaceSegmentsConstructor.prototype = ReplaceSegmentsPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.ReplaceSegments: static functions:
//
// -------------------------------------------------------------------------------------------------------------
ReplaceSegmentsConstructor.is = val => val && val.constructor === ReplaceSegmentsConstructor
ReplaceSegmentsConstructor.toString = () => 'Action.ReplaceSegments'
ReplaceSegmentsConstructor._from = o => Action.ReplaceSegments(o.segments)
ReplaceSegmentsConstructor.from = ReplaceSegmentsConstructor._from

// -------------------------------------------------------------------------------------------------------------
// Firestore serialization
// -------------------------------------------------------------------------------------------------------------
ReplaceSegmentsConstructor._toFirestore = (o, encodeTimestamps) => ({
    segments: o.segments.map(item1 => Segment.toFirestore(item1, encodeTimestamps)),
})

ReplaceSegmentsConstructor._fromFirestore = (doc, decodeTimestamps) =>
    ReplaceSegmentsConstructor._from({
        segments: doc.segments.map(item1 =>
            Segment.fromFirestore ? Segment.fromFirestore(item1, decodeTimestamps) : Segment.from(item1),
        ),
    })

// Public aliases (can be overridden)
ReplaceSegmentsConstructor.toFirestore = ReplaceSegmentsConstructor._toFirestore
ReplaceSegmentsConstructor.fromFirestore = ReplaceSegmentsConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
// Firestore serialization
// -------------------------------------------------------------------------------------------------------------
Action._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = Action[tagName]
    if (variant && variant.toFirestore) {
        return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
    }
    return { ...o, '@@tagName': tagName }
}

Action._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'OrganizationCreated')
        return Action.OrganizationCreated.fromFirestore
            ? Action.OrganizationCreated.fromFirestore(doc, decodeTimestamps)
            : Action.OrganizationCreated.from(doc)
    if (tagName === 'OrganizationDeleted')
        return Action.OrganizationDeleted.fromFirestore
            ? Action.OrganizationDeleted.fromFirestore(doc, decodeTimestamps)
            : Action.OrganizationDeleted.from(doc)
    if (tagName === 'OrganizationSuspended')
        return Action.OrganizationSuspended.fromFirestore
            ? Action.OrganizationSuspended.fromFirestore(doc, decodeTimestamps)
            : Action.OrganizationSuspended.from(doc)
    if (tagName === 'OrganizationUpdated')
        return Action.OrganizationUpdated.fromFirestore
            ? Action.OrganizationUpdated.fromFirestore(doc, decodeTimestamps)
            : Action.OrganizationUpdated.from(doc)
    if (tagName === 'MemberAdded')
        return Action.MemberAdded.fromFirestore
            ? Action.MemberAdded.fromFirestore(doc, decodeTimestamps)
            : Action.MemberAdded.from(doc)
    if (tagName === 'MemberRemoved')
        return Action.MemberRemoved.fromFirestore
            ? Action.MemberRemoved.fromFirestore(doc, decodeTimestamps)
            : Action.MemberRemoved.from(doc)
    if (tagName === 'RoleChanged')
        return Action.RoleChanged.fromFirestore
            ? Action.RoleChanged.fromFirestore(doc, decodeTimestamps)
            : Action.RoleChanged.from(doc)
    if (tagName === 'UserCreated')
        return Action.UserCreated.fromFirestore
            ? Action.UserCreated.fromFirestore(doc, decodeTimestamps)
            : Action.UserCreated.from(doc)
    if (tagName === 'UserForgotten')
        return Action.UserForgotten.fromFirestore
            ? Action.UserForgotten.fromFirestore(doc, decodeTimestamps)
            : Action.UserForgotten.from(doc)
    if (tagName === 'UserUpdated')
        return Action.UserUpdated.fromFirestore
            ? Action.UserUpdated.fromFirestore(doc, decodeTimestamps)
            : Action.UserUpdated.from(doc)
    if (tagName === 'AuthenticationCompleted')
        return Action.AuthenticationCompleted.fromFirestore
            ? Action.AuthenticationCompleted.fromFirestore(doc, decodeTimestamps)
            : Action.AuthenticationCompleted.from(doc)
    if (tagName === 'LoadAllInitialData')
        return Action.LoadAllInitialData.fromFirestore
            ? Action.LoadAllInitialData.fromFirestore(doc, decodeTimestamps)
            : Action.LoadAllInitialData.from(doc)
    if (tagName === 'CreateBlockface')
        return Action.CreateBlockface.fromFirestore
            ? Action.CreateBlockface.fromFirestore(doc, decodeTimestamps)
            : Action.CreateBlockface.from(doc)
    if (tagName === 'SelectBlockface')
        return Action.SelectBlockface.fromFirestore
            ? Action.SelectBlockface.fromFirestore(doc, decodeTimestamps)
            : Action.SelectBlockface.from(doc)
    if (tagName === 'UpdateSegmentUse')
        return Action.UpdateSegmentUse.fromFirestore
            ? Action.UpdateSegmentUse.fromFirestore(doc, decodeTimestamps)
            : Action.UpdateSegmentUse.from(doc)
    if (tagName === 'UpdateSegmentLength')
        return Action.UpdateSegmentLength.fromFirestore
            ? Action.UpdateSegmentLength.fromFirestore(doc, decodeTimestamps)
            : Action.UpdateSegmentLength.from(doc)
    if (tagName === 'AddSegment')
        return Action.AddSegment.fromFirestore
            ? Action.AddSegment.fromFirestore(doc, decodeTimestamps)
            : Action.AddSegment.from(doc)
    if (tagName === 'AddSegmentLeft')
        return Action.AddSegmentLeft.fromFirestore
            ? Action.AddSegmentLeft.fromFirestore(doc, decodeTimestamps)
            : Action.AddSegmentLeft.from(doc)
    if (tagName === 'ReplaceSegments')
        return Action.ReplaceSegments.fromFirestore
            ? Action.ReplaceSegments.fromFirestore(doc, decodeTimestamps)
            : Action.ReplaceSegments.from(doc)
    throw new Error(`Unrecognized Action variant: ${tagName}`)
}

// Public aliases (can be overridden)
Action.toFirestore = Action._toFirestore
Action.fromFirestore = Action._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

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
    if (tagName === 'AuthenticationCompleted') return ['email', 'displayName']
    if (tagName === 'LoadAllInitialData') return []
    if (tagName === 'CreateBlockface') return []
    if (tagName === 'SelectBlockface') return []
    if (tagName === 'UpdateSegmentUse') return []
    if (tagName === 'UpdateSegmentLength') return []
    if (tagName === 'AddSegment') return []
    if (tagName === 'AddSegmentLeft') return []
    if (tagName === 'ReplaceSegments') return []
    return []
}

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
        AuthenticationCompleted: ({ email, displayName }) => ({
            type: 'AuthenticationCompleted',
            email,
            displayName,
        }),
        LoadAllInitialData: () => ({ type: 'LoadAllInitialData' }),
        CreateBlockface: ({ id }) => ({
            type: 'CreateBlockface',
            id,
        }),
        SelectBlockface: ({ id }) => ({
            type: 'SelectBlockface',
            id,
        }),
        UpdateSegmentUse: ({ index, use }) => ({
            type: 'UpdateSegmentUse',
            index,
            use,
        }),
        UpdateSegmentLength: ({ index, newLength }) => ({
            type: 'UpdateSegmentLength',
            index,
            newLength,
        }),
        AddSegment: ({ targetIndex }) => ({
            type: 'AddSegment',
            targetIndex,
        }),
        AddSegmentLeft: ({ index, desiredLength }) => ({
            type: 'AddSegmentLeft',
            index,
            desiredLength,
        }),
        ReplaceSegments: ({ segments }) => ({
            type: 'ReplaceSegments',
            segmentCount: segments.length,
        }),
    })
    Action.piiFields(a).forEach(redactField)
    return result
}

Action.redactPii = rawData => {
    const redactField = field => {
        if (result[field]) result[field] = `${field}: ${result[field].length}`
    }
    const piiFields = () => {
        const tagName = rawData['@@tagName']
        if (tagName === 'UserCreated') return ['email', 'displayName']
        if (tagName === 'UserUpdated') return ['email', 'displayName']
        if (tagName === 'AuthenticationCompleted') return ['email', 'displayName']
        return []
    }
    const result = { ...rawData }
    piiFields().forEach(redactField)
    return result
}

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
        AuthenticationCompleted: a => ({
            id: a.email,
            type: 'user',
        }),
        LoadAllInitialData: a => ({
            id: a.currentUser.id,
            type: 'user',
        }),
        CreateBlockface: a => ({
            id: a.id,
            type: 'blockface',
        }),
        SelectBlockface: a => ({
            id: a.id,
            type: 'blockface',
        }),
        UpdateSegmentUse: () => ({
            id: 'current',
            type: 'blockface',
        }),
        UpdateSegmentLength: () => ({
            id: 'current',
            type: 'blockface',
        }),
        AddSegment: () => ({
            id: 'current',
            type: 'blockface',
        }),
        AddSegmentLeft: () => ({
            id: 'current',
            type: 'blockface',
        }),
        ReplaceSegments: () => ({
            id: 'current',
            type: 'blockface',
        }),
    })

Action.mayI = (action, actorRole, actorId) =>
    action.match({
        MemberAdded: () => ['admin'].includes(actorRole),
        MemberRemoved: () => ['admin'].includes(actorRole),
        OrganizationCreated: () => ['admin'].includes(actorRole),
        OrganizationDeleted: () => ['admin'].includes(actorRole),
        OrganizationSuspended: () => ['admin'].includes(actorRole),
        OrganizationUpdated: () => ['admin'].includes(actorRole),
        RoleChanged: () => ['admin'].includes(actorRole),
        UserCreated: () => ['admin'].includes(actorRole),
        UserForgotten: a => a.userId === actorId,
        UserUpdated: a => a.userId === actorId,
        AuthenticationCompleted: () => true,
        LoadAllInitialData: () => true,
        CreateBlockface: () => true,
        SelectBlockface: () => true,
        UpdateSegmentUse: () => true,
        UpdateSegmentLength: () => true,
        AddSegment: () => true,
        AddSegmentLeft: () => true,
        ReplaceSegments: () => true,
    })

export { Action }
