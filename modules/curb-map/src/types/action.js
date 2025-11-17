/*  Action generated from: modules/curb-map/type-definitions/action.type.js
 *
 *  OrganizationCreated
 *      organizationId: FieldTypes.organizationId,
 *      name          : "String",
 *      projectId     : FieldTypes.projectId
 *  OrganizationUpdated
 *      organizationId: FieldTypes.organizationId,
 *      name          : "String?",
 *      status        : "/^(active|suspended)$/?"
 *  OrganizationDeleted
 *      organizationId: FieldTypes.organizationId
 *  OrganizationSuspended
 *      organizationId: FieldTypes.organizationId
 *  MemberAdded
 *      userId        : FieldTypes.userId,
 *      organizationId: FieldTypes.organizationId,
 *      role          : FieldTypes.role,
 *      displayName   : "String"
 *  RoleChanged
 *      userId        : FieldTypes.userId,
 *      organizationId: FieldTypes.organizationId,
 *      role          : FieldTypes.role
 *  MemberRemoved
 *      userId        : FieldTypes.userId,
 *      organizationId: FieldTypes.organizationId
 *  UserCreated
 *      userId     : FieldTypes.userId,
 *      displayName: "String",
 *      email      : FieldTypes.email,
 *      authUid    : "String"
 *  UserUpdated
 *      userId     : FieldTypes.userId,
 *      displayName: "String?"
 *  UserForgotten
 *      userId: FieldTypes.userId,
 *      reason: "String"
 *  AuthenticationCompleted
 *      email      : FieldTypes.email,
 *      displayName: "String"
 *  LoadAllInitialData
 *      currentUser        : "User",
 *      currentOrganization: "Organization"
 *  CreateBlockface
 *      blockface: "Blockface"
 *  SelectBlockface
 *      blockface: "Blockface"
 *  UpdateSegmentUse
 *      index: "Number",
 *      use  : "String"
 *  UpdateSegmentLength
 *      index    : "Number",
 *      newLength: "Number"
 *  AddSegmentLeft
 *      index        : "Number",
 *      desiredLength: "Number"
 *  AddSegment
 *      targetIndex: "Number"
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
            constructor === Action.OrganizationUpdated ||
            constructor === Action.OrganizationDeleted ||
            constructor === Action.OrganizationSuspended ||
            constructor === Action.MemberAdded ||
            constructor === Action.RoleChanged ||
            constructor === Action.MemberRemoved ||
            constructor === Action.UserCreated ||
            constructor === Action.UserUpdated ||
            constructor === Action.UserForgotten ||
            constructor === Action.AuthenticationCompleted ||
            constructor === Action.LoadAllInitialData ||
            constructor === Action.CreateBlockface ||
            constructor === Action.SelectBlockface ||
            constructor === Action.UpdateSegmentUse ||
            constructor === Action.UpdateSegmentLength ||
            constructor === Action.AddSegmentLeft ||
            constructor === Action.AddSegment ||
            constructor === Action.ReplaceSegments
        )
    },
}

// Add hidden properties
Object.defineProperty(Action, '@@typeName', { value: 'Action', enumerable: false })
Object.defineProperty(Action, '@@tagNames', {
    value: [
        'OrganizationCreated',
        'OrganizationUpdated',
        'OrganizationDeleted',
        'OrganizationSuspended',
        'MemberAdded',
        'RoleChanged',
        'MemberRemoved',
        'UserCreated',
        'UserUpdated',
        'UserForgotten',
        'AuthenticationCompleted',
        'LoadAllInitialData',
        'CreateBlockface',
        'SelectBlockface',
        'UpdateSegmentUse',
        'UpdateSegmentLength',
        'AddSegmentLeft',
        'AddSegment',
        'ReplaceSegments',
    ],
    enumerable: false,
})

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
// Variant Action.OrganizationCreated
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationCreatedConstructor = function OrganizationCreated(organizationId, name, projectId) {
    const constructorName = 'Action.OrganizationCreated(organizationId, name, projectId)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateString(constructorName, 'name', false, name)
    R.validateRegex(constructorName, FieldTypes.projectId, 'projectId', false, projectId)

    const result = Object.create(OrganizationCreatedPrototype)
    result.organizationId = organizationId
    result.name = name
    result.projectId = projectId
    return result
}

Action.OrganizationCreated = OrganizationCreatedConstructor

const OrganizationCreatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationCreated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.OrganizationCreated(${R._toString(this.organizationId)}, ${R._toString(this.name)}, ${R._toString(this.projectId)})`
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
OrganizationCreatedConstructor.is = val => val && val.constructor === OrganizationCreatedConstructor
OrganizationCreatedConstructor.toString = () => 'Action.OrganizationCreated'
OrganizationCreatedConstructor._from = o => Action.OrganizationCreated(o.organizationId, o.name, o.projectId)
OrganizationCreatedConstructor.from = OrganizationCreatedConstructor._from

OrganizationCreatedConstructor.toFirestore = o => ({ ...o })
OrganizationCreatedConstructor.fromFirestore = OrganizationCreatedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationUpdated
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
OrganizationUpdatedConstructor.is = val => val && val.constructor === OrganizationUpdatedConstructor
OrganizationUpdatedConstructor.toString = () => 'Action.OrganizationUpdated'
OrganizationUpdatedConstructor._from = o => Action.OrganizationUpdated(o.organizationId, o.name, o.status)
OrganizationUpdatedConstructor.from = OrganizationUpdatedConstructor._from

OrganizationUpdatedConstructor.toFirestore = o => ({ ...o })
OrganizationUpdatedConstructor.fromFirestore = OrganizationUpdatedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationDeleted
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
OrganizationDeletedConstructor.is = val => val && val.constructor === OrganizationDeletedConstructor
OrganizationDeletedConstructor.toString = () => 'Action.OrganizationDeleted'
OrganizationDeletedConstructor._from = o => Action.OrganizationDeleted(o.organizationId)
OrganizationDeletedConstructor.from = OrganizationDeletedConstructor._from

OrganizationDeletedConstructor.toFirestore = o => ({ ...o })
OrganizationDeletedConstructor.fromFirestore = OrganizationDeletedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationSuspended
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
OrganizationSuspendedConstructor.is = val => val && val.constructor === OrganizationSuspendedConstructor
OrganizationSuspendedConstructor.toString = () => 'Action.OrganizationSuspended'
OrganizationSuspendedConstructor._from = o => Action.OrganizationSuspended(o.organizationId)
OrganizationSuspendedConstructor.from = OrganizationSuspendedConstructor._from

OrganizationSuspendedConstructor.toFirestore = o => ({ ...o })
OrganizationSuspendedConstructor.fromFirestore = OrganizationSuspendedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.MemberAdded
//
// -------------------------------------------------------------------------------------------------------------
const MemberAddedConstructor = function MemberAdded(userId, organizationId, role, displayName) {
    const constructorName = 'Action.MemberAdded(userId, organizationId, role, displayName)'
    R.validateArgumentLength(constructorName, 4, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateRegex(constructorName, FieldTypes.role, 'role', false, role)
    R.validateString(constructorName, 'displayName', false, displayName)

    const result = Object.create(MemberAddedPrototype)
    result.userId = userId
    result.organizationId = organizationId
    result.role = role
    result.displayName = displayName
    return result
}

Action.MemberAdded = MemberAddedConstructor

const MemberAddedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'MemberAdded', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.MemberAdded(${R._toString(this.userId)}, ${R._toString(this.organizationId)}, ${R._toString(this.role)}, ${R._toString(this.displayName)})`
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
MemberAddedConstructor.is = val => val && val.constructor === MemberAddedConstructor
MemberAddedConstructor.toString = () => 'Action.MemberAdded'
MemberAddedConstructor._from = o => Action.MemberAdded(o.userId, o.organizationId, o.role, o.displayName)
MemberAddedConstructor.from = MemberAddedConstructor._from

MemberAddedConstructor.toFirestore = o => ({ ...o })
MemberAddedConstructor.fromFirestore = MemberAddedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.RoleChanged
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
RoleChangedConstructor.is = val => val && val.constructor === RoleChangedConstructor
RoleChangedConstructor.toString = () => 'Action.RoleChanged'
RoleChangedConstructor._from = o => Action.RoleChanged(o.userId, o.organizationId, o.role)
RoleChangedConstructor.from = RoleChangedConstructor._from

RoleChangedConstructor.toFirestore = o => ({ ...o })
RoleChangedConstructor.fromFirestore = RoleChangedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.MemberRemoved
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
MemberRemovedConstructor.is = val => val && val.constructor === MemberRemovedConstructor
MemberRemovedConstructor.toString = () => 'Action.MemberRemoved'
MemberRemovedConstructor._from = o => Action.MemberRemoved(o.userId, o.organizationId)
MemberRemovedConstructor.from = MemberRemovedConstructor._from

MemberRemovedConstructor.toFirestore = o => ({ ...o })
MemberRemovedConstructor.fromFirestore = MemberRemovedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserCreated
//
// -------------------------------------------------------------------------------------------------------------
const UserCreatedConstructor = function UserCreated(userId, displayName, email, authUid) {
    const constructorName = 'Action.UserCreated(userId, displayName, email, authUid)'
    R.validateArgumentLength(constructorName, 4, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateString(constructorName, 'displayName', false, displayName)
    R.validateRegex(constructorName, FieldTypes.email, 'email', false, email)
    R.validateString(constructorName, 'authUid', false, authUid)

    const result = Object.create(UserCreatedPrototype)
    result.userId = userId
    result.displayName = displayName
    result.email = email
    result.authUid = authUid
    return result
}

Action.UserCreated = UserCreatedConstructor

const UserCreatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UserCreated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.UserCreated(${R._toString(this.userId)}, ${R._toString(this.displayName)}, ${R._toString(this.email)}, ${R._toString(this.authUid)})`
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
UserCreatedConstructor.is = val => val && val.constructor === UserCreatedConstructor
UserCreatedConstructor.toString = () => 'Action.UserCreated'
UserCreatedConstructor._from = o => Action.UserCreated(o.userId, o.displayName, o.email, o.authUid)
UserCreatedConstructor.from = UserCreatedConstructor._from

UserCreatedConstructor.toFirestore = o => ({ ...o })
UserCreatedConstructor.fromFirestore = UserCreatedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserUpdated
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
UserUpdatedConstructor.is = val => val && val.constructor === UserUpdatedConstructor
UserUpdatedConstructor.toString = () => 'Action.UserUpdated'
UserUpdatedConstructor._from = o => Action.UserUpdated(o.userId, o.displayName)
UserUpdatedConstructor.from = UserUpdatedConstructor._from

UserUpdatedConstructor.toFirestore = o => ({ ...o })
UserUpdatedConstructor.fromFirestore = UserUpdatedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserForgotten
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
UserForgottenConstructor.is = val => val && val.constructor === UserForgottenConstructor
UserForgottenConstructor.toString = () => 'Action.UserForgotten'
UserForgottenConstructor._from = o => Action.UserForgotten(o.userId, o.reason)
UserForgottenConstructor.from = UserForgottenConstructor._from

UserForgottenConstructor.toFirestore = o => ({ ...o })
UserForgottenConstructor.fromFirestore = UserForgottenConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.AuthenticationCompleted
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
AuthenticationCompletedConstructor.is = val => val && val.constructor === AuthenticationCompletedConstructor
AuthenticationCompletedConstructor.toString = () => 'Action.AuthenticationCompleted'
AuthenticationCompletedConstructor._from = o => Action.AuthenticationCompleted(o.email, o.displayName)
AuthenticationCompletedConstructor.from = AuthenticationCompletedConstructor._from

AuthenticationCompletedConstructor.toFirestore = o => ({ ...o })
AuthenticationCompletedConstructor.fromFirestore = AuthenticationCompletedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.LoadAllInitialData
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
LoadAllInitialDataConstructor.is = val => val && val.constructor === LoadAllInitialDataConstructor
LoadAllInitialDataConstructor.toString = () => 'Action.LoadAllInitialData'
LoadAllInitialDataConstructor._from = o => Action.LoadAllInitialData(o.currentUser, o.currentOrganization)
LoadAllInitialDataConstructor.from = LoadAllInitialDataConstructor._from

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
// Variant Action.CreateBlockface
//
// -------------------------------------------------------------------------------------------------------------
const CreateBlockfaceConstructor = function CreateBlockface(blockface) {
    const constructorName = 'Action.CreateBlockface(blockface)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'Blockface', 'blockface', false, blockface)

    const result = Object.create(CreateBlockfacePrototype)
    result.blockface = blockface
    return result
}

Action.CreateBlockface = CreateBlockfaceConstructor

const CreateBlockfacePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'CreateBlockface', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.CreateBlockface(${R._toString(this.blockface)})`
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
CreateBlockfaceConstructor.is = val => val && val.constructor === CreateBlockfaceConstructor
CreateBlockfaceConstructor.toString = () => 'Action.CreateBlockface'
CreateBlockfaceConstructor._from = o => Action.CreateBlockface(o.blockface)
CreateBlockfaceConstructor.from = CreateBlockfaceConstructor._from

CreateBlockfaceConstructor._toFirestore = (o, encodeTimestamps) => ({
    blockface: Blockface.toFirestore(o.blockface, encodeTimestamps),
})

CreateBlockfaceConstructor._fromFirestore = (doc, decodeTimestamps) =>
    CreateBlockfaceConstructor._from({
        blockface: Blockface.fromFirestore
            ? Blockface.fromFirestore(doc.blockface, decodeTimestamps)
            : Blockface.from(doc.blockface),
    })

// Public aliases (can be overridden)
CreateBlockfaceConstructor.toFirestore = CreateBlockfaceConstructor._toFirestore
CreateBlockfaceConstructor.fromFirestore = CreateBlockfaceConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SelectBlockface
//
// -------------------------------------------------------------------------------------------------------------
const SelectBlockfaceConstructor = function SelectBlockface(blockface) {
    const constructorName = 'Action.SelectBlockface(blockface)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'Blockface', 'blockface', false, blockface)

    const result = Object.create(SelectBlockfacePrototype)
    result.blockface = blockface
    return result
}

Action.SelectBlockface = SelectBlockfaceConstructor

const SelectBlockfacePrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SelectBlockface', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SelectBlockface(${R._toString(this.blockface)})`
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
SelectBlockfaceConstructor.is = val => val && val.constructor === SelectBlockfaceConstructor
SelectBlockfaceConstructor.toString = () => 'Action.SelectBlockface'
SelectBlockfaceConstructor._from = o => Action.SelectBlockface(o.blockface)
SelectBlockfaceConstructor.from = SelectBlockfaceConstructor._from

SelectBlockfaceConstructor._toFirestore = (o, encodeTimestamps) => ({
    blockface: Blockface.toFirestore(o.blockface, encodeTimestamps),
})

SelectBlockfaceConstructor._fromFirestore = (doc, decodeTimestamps) =>
    SelectBlockfaceConstructor._from({
        blockface: Blockface.fromFirestore
            ? Blockface.fromFirestore(doc.blockface, decodeTimestamps)
            : Blockface.from(doc.blockface),
    })

// Public aliases (can be overridden)
SelectBlockfaceConstructor.toFirestore = SelectBlockfaceConstructor._toFirestore
SelectBlockfaceConstructor.fromFirestore = SelectBlockfaceConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UpdateSegmentUse
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
UpdateSegmentUseConstructor.is = val => val && val.constructor === UpdateSegmentUseConstructor
UpdateSegmentUseConstructor.toString = () => 'Action.UpdateSegmentUse'
UpdateSegmentUseConstructor._from = o => Action.UpdateSegmentUse(o.index, o.use)
UpdateSegmentUseConstructor.from = UpdateSegmentUseConstructor._from

UpdateSegmentUseConstructor.toFirestore = o => ({ ...o })
UpdateSegmentUseConstructor.fromFirestore = UpdateSegmentUseConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UpdateSegmentLength
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
UpdateSegmentLengthConstructor.is = val => val && val.constructor === UpdateSegmentLengthConstructor
UpdateSegmentLengthConstructor.toString = () => 'Action.UpdateSegmentLength'
UpdateSegmentLengthConstructor._from = o => Action.UpdateSegmentLength(o.index, o.newLength)
UpdateSegmentLengthConstructor.from = UpdateSegmentLengthConstructor._from

UpdateSegmentLengthConstructor.toFirestore = o => ({ ...o })
UpdateSegmentLengthConstructor.fromFirestore = UpdateSegmentLengthConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.AddSegmentLeft
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
AddSegmentLeftConstructor.is = val => val && val.constructor === AddSegmentLeftConstructor
AddSegmentLeftConstructor.toString = () => 'Action.AddSegmentLeft'
AddSegmentLeftConstructor._from = o => Action.AddSegmentLeft(o.index, o.desiredLength)
AddSegmentLeftConstructor.from = AddSegmentLeftConstructor._from

AddSegmentLeftConstructor.toFirestore = o => ({ ...o })
AddSegmentLeftConstructor.fromFirestore = AddSegmentLeftConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.AddSegment
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
AddSegmentConstructor.is = val => val && val.constructor === AddSegmentConstructor
AddSegmentConstructor.toString = () => 'Action.AddSegment'
AddSegmentConstructor._from = o => Action.AddSegment(o.targetIndex)
AddSegmentConstructor.from = AddSegmentConstructor._from

AddSegmentConstructor.toFirestore = o => ({ ...o })
AddSegmentConstructor.fromFirestore = AddSegmentConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.ReplaceSegments
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
ReplaceSegmentsConstructor.is = val => val && val.constructor === ReplaceSegmentsConstructor
ReplaceSegmentsConstructor.toString = () => 'Action.ReplaceSegments'
ReplaceSegmentsConstructor._from = o => Action.ReplaceSegments(o.segments)
ReplaceSegmentsConstructor.from = ReplaceSegmentsConstructor._from

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

Action._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = Action[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

Action._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'OrganizationCreated') return Action.OrganizationCreated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'OrganizationUpdated') return Action.OrganizationUpdated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'OrganizationDeleted') return Action.OrganizationDeleted.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'OrganizationSuspended') return Action.OrganizationSuspended.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'MemberAdded') return Action.MemberAdded.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'RoleChanged') return Action.RoleChanged.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'MemberRemoved') return Action.MemberRemoved.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'UserCreated') return Action.UserCreated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'UserUpdated') return Action.UserUpdated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'UserForgotten') return Action.UserForgotten.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'AuthenticationCompleted')
        return Action.AuthenticationCompleted.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'LoadAllInitialData') return Action.LoadAllInitialData.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CreateBlockface') return Action.CreateBlockface.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SelectBlockface') return Action.SelectBlockface.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'UpdateSegmentUse') return Action.UpdateSegmentUse.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'UpdateSegmentLength') return Action.UpdateSegmentLength.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'AddSegmentLeft') return Action.AddSegmentLeft.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'AddSegment') return Action.AddSegment.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ReplaceSegments') return Action.ReplaceSegments.fromFirestore(doc, decodeTimestamps)
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
