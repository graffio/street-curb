/*  Action generated from: modules/curb-map/type-definitions/action.type.js
 *
 *  OrganizationCreated
 *      name     : "String",
 *      projectId: FieldTypes.projectId
 *  OrganizationUpdated
 *      name  : "String?",
 *      status: "/^(active|suspended)$/?"
 *  OrganizationDeleted
 *  OrganizationSuspended
 *  MemberAdded
 *      userId     : FieldTypes.userId,
 *      role       : FieldTypes.role,
 *      displayName: "String"
 *  RoleChanged
 *      userId: FieldTypes.userId,
 *      role  : FieldTypes.role
 *  MemberRemoved
 *      userId: FieldTypes.userId
 *  UserCreated
 *      userId     : FieldTypes.userId,
 *      displayName: "String",
 *      email      : FieldTypes.email
 *  UserUpdated
 *      userId     : FieldTypes.userId,
 *      displayName: "String?"
 *  UserForgotten
 *      userId: FieldTypes.userId,
 *      reason: "String"
 *  AuthenticationCompleted
 *      email      : FieldTypes.email,
 *      displayName: "String"
 *  UserLoaded
 *      user: "User"
 *  OrganizationSynced
 *      organization: "Organization"
 *  BlockfacesSynced
 *      blockfaces: "[Blockface]"
 *  BlockfaceCreated
 *      blockface: "Blockface"
 *  BlockfaceSelected
 *      blockface: "Blockface"
 *  BlockfaceSaved
 *      blockface: "Blockface"
 *  SegmentUseUpdated
 *      index: "Number",
 *      use  : "String"
 *  SegmentLengthUpdated
 *      index    : "Number",
 *      newLength: "Number"
 *  SegmentAddedLeft
 *      index        : "Number",
 *      desiredLength: "Number"
 *  SegmentAdded
 *      targetIndex: "Number"
 *  SegmentsReplaced
 *      segments: "[Segment]"
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'
import { User } from './user.js'
import { Organization } from './organization.js'
import { Blockface } from './blockface.js'
import { Segment } from './segment.js'

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
            constructor === Action.UserLoaded ||
            constructor === Action.OrganizationSynced ||
            constructor === Action.BlockfacesSynced ||
            constructor === Action.BlockfaceCreated ||
            constructor === Action.BlockfaceSelected ||
            constructor === Action.BlockfaceSaved ||
            constructor === Action.SegmentUseUpdated ||
            constructor === Action.SegmentLengthUpdated ||
            constructor === Action.SegmentAddedLeft ||
            constructor === Action.SegmentAdded ||
            constructor === Action.SegmentsReplaced
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
        'UserLoaded',
        'OrganizationSynced',
        'BlockfacesSynced',
        'BlockfaceCreated',
        'BlockfaceSelected',
        'BlockfaceSaved',
        'SegmentUseUpdated',
        'SegmentLengthUpdated',
        'SegmentAddedLeft',
        'SegmentAdded',
        'SegmentsReplaced',
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
const OrganizationCreatedConstructor = function OrganizationCreated(name, projectId) {
    const constructorName = 'Action.OrganizationCreated(name, projectId)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'name', false, name)
    R.validateRegex(constructorName, FieldTypes.projectId, 'projectId', false, projectId)

    const result = Object.create(OrganizationCreatedPrototype)
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
            return `Action.OrganizationCreated(${R._toString(this.name)}, ${R._toString(this.projectId)})`
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
OrganizationCreatedConstructor._from = o => Action.OrganizationCreated(o.name, o.projectId)
OrganizationCreatedConstructor.from = OrganizationCreatedConstructor._from

OrganizationCreatedConstructor.toFirestore = o => ({ ...o })
OrganizationCreatedConstructor.fromFirestore = OrganizationCreatedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationUpdated
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationUpdatedConstructor = function OrganizationUpdated(name, status) {
    const constructorName = 'Action.OrganizationUpdated(name, status)'

    R.validateString(constructorName, 'name', true, name)
    R.validateRegex(constructorName, /^(active|suspended)$/, 'status', true, status)

    const result = Object.create(OrganizationUpdatedPrototype)
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
            return `Action.OrganizationUpdated(${R._toString(this.name)}, ${R._toString(this.status)})`
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
OrganizationUpdatedConstructor._from = o => Action.OrganizationUpdated(o.name, o.status)
OrganizationUpdatedConstructor.from = OrganizationUpdatedConstructor._from

OrganizationUpdatedConstructor.toFirestore = o => ({ ...o })
OrganizationUpdatedConstructor.fromFirestore = OrganizationUpdatedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationDeleted
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationDeletedConstructor = function OrganizationDeleted() {
    const constructorName = 'Action.OrganizationDeleted()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(OrganizationDeletedPrototype)

    return result
}

Action.OrganizationDeleted = OrganizationDeletedConstructor

const OrganizationDeletedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationDeleted', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.OrganizationDeleted()`
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
OrganizationDeletedConstructor._from = o => Action.OrganizationDeleted()
OrganizationDeletedConstructor.from = OrganizationDeletedConstructor._from

OrganizationDeletedConstructor.toFirestore = o => ({ ...o })
OrganizationDeletedConstructor.fromFirestore = OrganizationDeletedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationSuspended
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationSuspendedConstructor = function OrganizationSuspended() {
    const constructorName = 'Action.OrganizationSuspended()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(OrganizationSuspendedPrototype)

    return result
}

Action.OrganizationSuspended = OrganizationSuspendedConstructor

const OrganizationSuspendedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationSuspended', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.OrganizationSuspended()`
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
OrganizationSuspendedConstructor._from = o => Action.OrganizationSuspended()
OrganizationSuspendedConstructor.from = OrganizationSuspendedConstructor._from

OrganizationSuspendedConstructor.toFirestore = o => ({ ...o })
OrganizationSuspendedConstructor.fromFirestore = OrganizationSuspendedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.MemberAdded
//
// -------------------------------------------------------------------------------------------------------------
const MemberAddedConstructor = function MemberAdded(userId, role, displayName) {
    const constructorName = 'Action.MemberAdded(userId, role, displayName)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateRegex(constructorName, FieldTypes.role, 'role', false, role)
    R.validateString(constructorName, 'displayName', false, displayName)

    const result = Object.create(MemberAddedPrototype)
    result.userId = userId
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
            return `Action.MemberAdded(${R._toString(this.userId)}, ${R._toString(this.role)}, ${R._toString(this.displayName)})`
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
MemberAddedConstructor._from = o => Action.MemberAdded(o.userId, o.role, o.displayName)
MemberAddedConstructor.from = MemberAddedConstructor._from

MemberAddedConstructor.toFirestore = o => ({ ...o })
MemberAddedConstructor.fromFirestore = MemberAddedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.RoleChanged
//
// -------------------------------------------------------------------------------------------------------------
const RoleChangedConstructor = function RoleChanged(userId, role) {
    const constructorName = 'Action.RoleChanged(userId, role)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateRegex(constructorName, FieldTypes.role, 'role', false, role)

    const result = Object.create(RoleChangedPrototype)
    result.userId = userId
    result.role = role
    return result
}

Action.RoleChanged = RoleChangedConstructor

const RoleChangedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'RoleChanged', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.RoleChanged(${R._toString(this.userId)}, ${R._toString(this.role)})`
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
RoleChangedConstructor._from = o => Action.RoleChanged(o.userId, o.role)
RoleChangedConstructor.from = RoleChangedConstructor._from

RoleChangedConstructor.toFirestore = o => ({ ...o })
RoleChangedConstructor.fromFirestore = RoleChangedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.MemberRemoved
//
// -------------------------------------------------------------------------------------------------------------
const MemberRemovedConstructor = function MemberRemoved(userId) {
    const constructorName = 'Action.MemberRemoved(userId)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)

    const result = Object.create(MemberRemovedPrototype)
    result.userId = userId
    return result
}

Action.MemberRemoved = MemberRemovedConstructor

const MemberRemovedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'MemberRemoved', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.MemberRemoved(${R._toString(this.userId)})`
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
MemberRemovedConstructor._from = o => Action.MemberRemoved(o.userId)
MemberRemovedConstructor.from = MemberRemovedConstructor._from

MemberRemovedConstructor.toFirestore = o => ({ ...o })
MemberRemovedConstructor.fromFirestore = MemberRemovedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserCreated
//
// -------------------------------------------------------------------------------------------------------------
const UserCreatedConstructor = function UserCreated(userId, displayName, email) {
    const constructorName = 'Action.UserCreated(userId, displayName, email)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)
    R.validateString(constructorName, 'displayName', false, displayName)
    R.validateRegex(constructorName, FieldTypes.email, 'email', false, email)

    const result = Object.create(UserCreatedPrototype)
    result.userId = userId
    result.displayName = displayName
    result.email = email
    return result
}

Action.UserCreated = UserCreatedConstructor

const UserCreatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UserCreated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.UserCreated(${R._toString(this.userId)}, ${R._toString(this.displayName)}, ${R._toString(this.email)})`
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
UserCreatedConstructor._from = o => Action.UserCreated(o.userId, o.displayName, o.email)
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
// Variant Action.UserLoaded
//
// -------------------------------------------------------------------------------------------------------------
const UserLoadedConstructor = function UserLoaded(user) {
    const constructorName = 'Action.UserLoaded(user)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'User', 'user', false, user)

    const result = Object.create(UserLoadedPrototype)
    result.user = user
    return result
}

Action.UserLoaded = UserLoadedConstructor

const UserLoadedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UserLoaded', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.UserLoaded(${R._toString(this.user)})`
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
        value: UserLoadedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

UserLoadedConstructor.prototype = UserLoadedPrototype
UserLoadedConstructor.is = val => val && val.constructor === UserLoadedConstructor
UserLoadedConstructor.toString = () => 'Action.UserLoaded'
UserLoadedConstructor._from = o => Action.UserLoaded(o.user)
UserLoadedConstructor.from = UserLoadedConstructor._from

UserLoadedConstructor._toFirestore = (o, encodeTimestamps) => ({
    user: User.toFirestore(o.user, encodeTimestamps),
})

UserLoadedConstructor._fromFirestore = (doc, decodeTimestamps) =>
    UserLoadedConstructor._from({
        user: User.fromFirestore ? User.fromFirestore(doc.user, decodeTimestamps) : User.from(doc.user),
    })

// Public aliases (can be overridden)
UserLoadedConstructor.toFirestore = UserLoadedConstructor._toFirestore
UserLoadedConstructor.fromFirestore = UserLoadedConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationSynced
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationSyncedConstructor = function OrganizationSynced(organization) {
    const constructorName = 'Action.OrganizationSynced(organization)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'Organization', 'organization', false, organization)

    const result = Object.create(OrganizationSyncedPrototype)
    result.organization = organization
    return result
}

Action.OrganizationSynced = OrganizationSyncedConstructor

const OrganizationSyncedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationSynced', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.OrganizationSynced(${R._toString(this.organization)})`
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
        value: OrganizationSyncedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

OrganizationSyncedConstructor.prototype = OrganizationSyncedPrototype
OrganizationSyncedConstructor.is = val => val && val.constructor === OrganizationSyncedConstructor
OrganizationSyncedConstructor.toString = () => 'Action.OrganizationSynced'
OrganizationSyncedConstructor._from = o => Action.OrganizationSynced(o.organization)
OrganizationSyncedConstructor.from = OrganizationSyncedConstructor._from

OrganizationSyncedConstructor._toFirestore = (o, encodeTimestamps) => ({
    organization: Organization.toFirestore(o.organization, encodeTimestamps),
})

OrganizationSyncedConstructor._fromFirestore = (doc, decodeTimestamps) =>
    OrganizationSyncedConstructor._from({
        organization: Organization.fromFirestore
            ? Organization.fromFirestore(doc.organization, decodeTimestamps)
            : Organization.from(doc.organization),
    })

// Public aliases (can be overridden)
OrganizationSyncedConstructor.toFirestore = OrganizationSyncedConstructor._toFirestore
OrganizationSyncedConstructor.fromFirestore = OrganizationSyncedConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.BlockfacesSynced
//
// -------------------------------------------------------------------------------------------------------------
const BlockfacesSyncedConstructor = function BlockfacesSynced(blockfaces) {
    const constructorName = 'Action.BlockfacesSynced(blockfaces)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'Blockface', 'blockfaces', false, blockfaces)

    const result = Object.create(BlockfacesSyncedPrototype)
    result.blockfaces = blockfaces
    return result
}

Action.BlockfacesSynced = BlockfacesSyncedConstructor

const BlockfacesSyncedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'BlockfacesSynced', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.BlockfacesSynced(${R._toString(this.blockfaces)})`
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
        value: BlockfacesSyncedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

BlockfacesSyncedConstructor.prototype = BlockfacesSyncedPrototype
BlockfacesSyncedConstructor.is = val => val && val.constructor === BlockfacesSyncedConstructor
BlockfacesSyncedConstructor.toString = () => 'Action.BlockfacesSynced'
BlockfacesSyncedConstructor._from = o => Action.BlockfacesSynced(o.blockfaces)
BlockfacesSyncedConstructor.from = BlockfacesSyncedConstructor._from

BlockfacesSyncedConstructor._toFirestore = (o, encodeTimestamps) => ({
    blockfaces: o.blockfaces.map(item1 => Blockface.toFirestore(item1, encodeTimestamps)),
})

BlockfacesSyncedConstructor._fromFirestore = (doc, decodeTimestamps) =>
    BlockfacesSyncedConstructor._from({
        blockfaces: doc.blockfaces.map(item1 =>
            Blockface.fromFirestore ? Blockface.fromFirestore(item1, decodeTimestamps) : Blockface.from(item1),
        ),
    })

// Public aliases (can be overridden)
BlockfacesSyncedConstructor.toFirestore = BlockfacesSyncedConstructor._toFirestore
BlockfacesSyncedConstructor.fromFirestore = BlockfacesSyncedConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.BlockfaceCreated
//
// -------------------------------------------------------------------------------------------------------------
const BlockfaceCreatedConstructor = function BlockfaceCreated(blockface) {
    const constructorName = 'Action.BlockfaceCreated(blockface)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'Blockface', 'blockface', false, blockface)

    const result = Object.create(BlockfaceCreatedPrototype)
    result.blockface = blockface
    return result
}

Action.BlockfaceCreated = BlockfaceCreatedConstructor

const BlockfaceCreatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'BlockfaceCreated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.BlockfaceCreated(${R._toString(this.blockface)})`
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
        value: BlockfaceCreatedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

BlockfaceCreatedConstructor.prototype = BlockfaceCreatedPrototype
BlockfaceCreatedConstructor.is = val => val && val.constructor === BlockfaceCreatedConstructor
BlockfaceCreatedConstructor.toString = () => 'Action.BlockfaceCreated'
BlockfaceCreatedConstructor._from = o => Action.BlockfaceCreated(o.blockface)
BlockfaceCreatedConstructor.from = BlockfaceCreatedConstructor._from

BlockfaceCreatedConstructor._toFirestore = (o, encodeTimestamps) => ({
    blockface: Blockface.toFirestore(o.blockface, encodeTimestamps),
})

BlockfaceCreatedConstructor._fromFirestore = (doc, decodeTimestamps) =>
    BlockfaceCreatedConstructor._from({
        blockface: Blockface.fromFirestore
            ? Blockface.fromFirestore(doc.blockface, decodeTimestamps)
            : Blockface.from(doc.blockface),
    })

// Public aliases (can be overridden)
BlockfaceCreatedConstructor.toFirestore = BlockfaceCreatedConstructor._toFirestore
BlockfaceCreatedConstructor.fromFirestore = BlockfaceCreatedConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.BlockfaceSelected
//
// -------------------------------------------------------------------------------------------------------------
const BlockfaceSelectedConstructor = function BlockfaceSelected(blockface) {
    const constructorName = 'Action.BlockfaceSelected(blockface)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'Blockface', 'blockface', false, blockface)

    const result = Object.create(BlockfaceSelectedPrototype)
    result.blockface = blockface
    return result
}

Action.BlockfaceSelected = BlockfaceSelectedConstructor

const BlockfaceSelectedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'BlockfaceSelected', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.BlockfaceSelected(${R._toString(this.blockface)})`
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
        value: BlockfaceSelectedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

BlockfaceSelectedConstructor.prototype = BlockfaceSelectedPrototype
BlockfaceSelectedConstructor.is = val => val && val.constructor === BlockfaceSelectedConstructor
BlockfaceSelectedConstructor.toString = () => 'Action.BlockfaceSelected'
BlockfaceSelectedConstructor._from = o => Action.BlockfaceSelected(o.blockface)
BlockfaceSelectedConstructor.from = BlockfaceSelectedConstructor._from

BlockfaceSelectedConstructor._toFirestore = (o, encodeTimestamps) => ({
    blockface: Blockface.toFirestore(o.blockface, encodeTimestamps),
})

BlockfaceSelectedConstructor._fromFirestore = (doc, decodeTimestamps) =>
    BlockfaceSelectedConstructor._from({
        blockface: Blockface.fromFirestore
            ? Blockface.fromFirestore(doc.blockface, decodeTimestamps)
            : Blockface.from(doc.blockface),
    })

// Public aliases (can be overridden)
BlockfaceSelectedConstructor.toFirestore = BlockfaceSelectedConstructor._toFirestore
BlockfaceSelectedConstructor.fromFirestore = BlockfaceSelectedConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.BlockfaceSaved
//
// -------------------------------------------------------------------------------------------------------------
const BlockfaceSavedConstructor = function BlockfaceSaved(blockface) {
    const constructorName = 'Action.BlockfaceSaved(blockface)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'Blockface', 'blockface', false, blockface)

    const result = Object.create(BlockfaceSavedPrototype)
    result.blockface = blockface
    return result
}

Action.BlockfaceSaved = BlockfaceSavedConstructor

const BlockfaceSavedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'BlockfaceSaved', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.BlockfaceSaved(${R._toString(this.blockface)})`
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
        value: BlockfaceSavedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

BlockfaceSavedConstructor.prototype = BlockfaceSavedPrototype
BlockfaceSavedConstructor.is = val => val && val.constructor === BlockfaceSavedConstructor
BlockfaceSavedConstructor.toString = () => 'Action.BlockfaceSaved'
BlockfaceSavedConstructor._from = o => Action.BlockfaceSaved(o.blockface)
BlockfaceSavedConstructor.from = BlockfaceSavedConstructor._from

BlockfaceSavedConstructor._toFirestore = (o, encodeTimestamps) => ({
    blockface: Blockface.toFirestore(o.blockface, encodeTimestamps),
})

BlockfaceSavedConstructor._fromFirestore = (doc, decodeTimestamps) =>
    BlockfaceSavedConstructor._from({
        blockface: Blockface.fromFirestore
            ? Blockface.fromFirestore(doc.blockface, decodeTimestamps)
            : Blockface.from(doc.blockface),
    })

// Public aliases (can be overridden)
BlockfaceSavedConstructor.toFirestore = BlockfaceSavedConstructor._toFirestore
BlockfaceSavedConstructor.fromFirestore = BlockfaceSavedConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SegmentUseUpdated
//
// -------------------------------------------------------------------------------------------------------------
const SegmentUseUpdatedConstructor = function SegmentUseUpdated(index, use) {
    const constructorName = 'Action.SegmentUseUpdated(index, use)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'index', false, index)
    R.validateString(constructorName, 'use', false, use)

    const result = Object.create(SegmentUseUpdatedPrototype)
    result.index = index
    result.use = use
    return result
}

Action.SegmentUseUpdated = SegmentUseUpdatedConstructor

const SegmentUseUpdatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SegmentUseUpdated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SegmentUseUpdated(${R._toString(this.index)}, ${R._toString(this.use)})`
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
        value: SegmentUseUpdatedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SegmentUseUpdatedConstructor.prototype = SegmentUseUpdatedPrototype
SegmentUseUpdatedConstructor.is = val => val && val.constructor === SegmentUseUpdatedConstructor
SegmentUseUpdatedConstructor.toString = () => 'Action.SegmentUseUpdated'
SegmentUseUpdatedConstructor._from = o => Action.SegmentUseUpdated(o.index, o.use)
SegmentUseUpdatedConstructor.from = SegmentUseUpdatedConstructor._from

SegmentUseUpdatedConstructor.toFirestore = o => ({ ...o })
SegmentUseUpdatedConstructor.fromFirestore = SegmentUseUpdatedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SegmentLengthUpdated
//
// -------------------------------------------------------------------------------------------------------------
const SegmentLengthUpdatedConstructor = function SegmentLengthUpdated(index, newLength) {
    const constructorName = 'Action.SegmentLengthUpdated(index, newLength)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'index', false, index)
    R.validateNumber(constructorName, 'newLength', false, newLength)

    const result = Object.create(SegmentLengthUpdatedPrototype)
    result.index = index
    result.newLength = newLength
    return result
}

Action.SegmentLengthUpdated = SegmentLengthUpdatedConstructor

const SegmentLengthUpdatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SegmentLengthUpdated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SegmentLengthUpdated(${R._toString(this.index)}, ${R._toString(this.newLength)})`
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
        value: SegmentLengthUpdatedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SegmentLengthUpdatedConstructor.prototype = SegmentLengthUpdatedPrototype
SegmentLengthUpdatedConstructor.is = val => val && val.constructor === SegmentLengthUpdatedConstructor
SegmentLengthUpdatedConstructor.toString = () => 'Action.SegmentLengthUpdated'
SegmentLengthUpdatedConstructor._from = o => Action.SegmentLengthUpdated(o.index, o.newLength)
SegmentLengthUpdatedConstructor.from = SegmentLengthUpdatedConstructor._from

SegmentLengthUpdatedConstructor.toFirestore = o => ({ ...o })
SegmentLengthUpdatedConstructor.fromFirestore = SegmentLengthUpdatedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SegmentAddedLeft
//
// -------------------------------------------------------------------------------------------------------------
const SegmentAddedLeftConstructor = function SegmentAddedLeft(index, desiredLength) {
    const constructorName = 'Action.SegmentAddedLeft(index, desiredLength)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'index', false, index)
    R.validateNumber(constructorName, 'desiredLength', false, desiredLength)

    const result = Object.create(SegmentAddedLeftPrototype)
    result.index = index
    result.desiredLength = desiredLength
    return result
}

Action.SegmentAddedLeft = SegmentAddedLeftConstructor

const SegmentAddedLeftPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SegmentAddedLeft', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SegmentAddedLeft(${R._toString(this.index)}, ${R._toString(this.desiredLength)})`
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
        value: SegmentAddedLeftConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SegmentAddedLeftConstructor.prototype = SegmentAddedLeftPrototype
SegmentAddedLeftConstructor.is = val => val && val.constructor === SegmentAddedLeftConstructor
SegmentAddedLeftConstructor.toString = () => 'Action.SegmentAddedLeft'
SegmentAddedLeftConstructor._from = o => Action.SegmentAddedLeft(o.index, o.desiredLength)
SegmentAddedLeftConstructor.from = SegmentAddedLeftConstructor._from

SegmentAddedLeftConstructor.toFirestore = o => ({ ...o })
SegmentAddedLeftConstructor.fromFirestore = SegmentAddedLeftConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SegmentAdded
//
// -------------------------------------------------------------------------------------------------------------
const SegmentAddedConstructor = function SegmentAdded(targetIndex) {
    const constructorName = 'Action.SegmentAdded(targetIndex)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateNumber(constructorName, 'targetIndex', false, targetIndex)

    const result = Object.create(SegmentAddedPrototype)
    result.targetIndex = targetIndex
    return result
}

Action.SegmentAdded = SegmentAddedConstructor

const SegmentAddedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SegmentAdded', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SegmentAdded(${R._toString(this.targetIndex)})`
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
        value: SegmentAddedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SegmentAddedConstructor.prototype = SegmentAddedPrototype
SegmentAddedConstructor.is = val => val && val.constructor === SegmentAddedConstructor
SegmentAddedConstructor.toString = () => 'Action.SegmentAdded'
SegmentAddedConstructor._from = o => Action.SegmentAdded(o.targetIndex)
SegmentAddedConstructor.from = SegmentAddedConstructor._from

SegmentAddedConstructor.toFirestore = o => ({ ...o })
SegmentAddedConstructor.fromFirestore = SegmentAddedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.SegmentsReplaced
//
// -------------------------------------------------------------------------------------------------------------
const SegmentsReplacedConstructor = function SegmentsReplaced(segments) {
    const constructorName = 'Action.SegmentsReplaced(segments)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'Segment', 'segments', false, segments)

    const result = Object.create(SegmentsReplacedPrototype)
    result.segments = segments
    return result
}

Action.SegmentsReplaced = SegmentsReplacedConstructor

const SegmentsReplacedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SegmentsReplaced', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },

    toString: {
        value: function () {
            return `Action.SegmentsReplaced(${R._toString(this.segments)})`
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
        value: SegmentsReplacedConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SegmentsReplacedConstructor.prototype = SegmentsReplacedPrototype
SegmentsReplacedConstructor.is = val => val && val.constructor === SegmentsReplacedConstructor
SegmentsReplacedConstructor.toString = () => 'Action.SegmentsReplaced'
SegmentsReplacedConstructor._from = o => Action.SegmentsReplaced(o.segments)
SegmentsReplacedConstructor.from = SegmentsReplacedConstructor._from

SegmentsReplacedConstructor._toFirestore = (o, encodeTimestamps) => ({
    segments: o.segments.map(item1 => Segment.toFirestore(item1, encodeTimestamps)),
})

SegmentsReplacedConstructor._fromFirestore = (doc, decodeTimestamps) =>
    SegmentsReplacedConstructor._from({
        segments: doc.segments.map(item1 =>
            Segment.fromFirestore ? Segment.fromFirestore(item1, decodeTimestamps) : Segment.from(item1),
        ),
    })

// Public aliases (can be overridden)
SegmentsReplacedConstructor.toFirestore = SegmentsReplacedConstructor._toFirestore
SegmentsReplacedConstructor.fromFirestore = SegmentsReplacedConstructor._fromFirestore

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
    if (tagName === 'UserLoaded') return Action.UserLoaded.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'OrganizationSynced') return Action.OrganizationSynced.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'BlockfacesSynced') return Action.BlockfacesSynced.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'BlockfaceCreated') return Action.BlockfaceCreated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'BlockfaceSelected') return Action.BlockfaceSelected.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'BlockfaceSaved') return Action.BlockfaceSaved.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SegmentUseUpdated') return Action.SegmentUseUpdated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SegmentLengthUpdated') return Action.SegmentLengthUpdated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SegmentAddedLeft') return Action.SegmentAddedLeft.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SegmentAdded') return Action.SegmentAdded.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SegmentsReplaced') return Action.SegmentsReplaced.fromFirestore(doc, decodeTimestamps)
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
    if (tagName === 'UserLoaded') return []
    if (tagName === 'OrganizationSynced') return []
    if (tagName === 'BlockfacesSynced') return []
    if (tagName === 'BlockfaceCreated') return []
    if (tagName === 'BlockfaceSelected') return []
    if (tagName === 'BlockfaceSaved') return []
    if (tagName === 'SegmentUseUpdated') return []
    if (tagName === 'SegmentLengthUpdated') return []
    if (tagName === 'SegmentAdded') return []
    if (tagName === 'SegmentAddedLeft') return []
    if (tagName === 'SegmentsReplaced') return []
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
        UserLoaded: () => ({ type: 'UserLoaded' }),
        OrganizationSynced: ({ organization }) => ({
            type: 'OrganizationSynced',
            organizationId: organization.id,
        }),
        BlockfacesSynced: ({ blockfaces }) => ({
            type: 'BlockfacesSynced',
            count: blockfaces.length,
        }),
        BlockfaceCreated: ({ blockface }) => ({
            type: 'BlockfaceCreated',
            blockfaceId: blockface.id,
        }),
        BlockfaceSelected: ({ blockface }) => ({
            type: 'BlockfaceSelected',
            blockfaceId: blockface.id,
        }),
        BlockfaceSaved: ({ blockface }) => ({
            type: 'BlockfaceSaved',
            blockfaceId: blockface.id,
        }),
        SegmentUseUpdated: ({ index, use }) => ({
            type: 'SegmentUseUpdated',
            index,
            use,
        }),
        SegmentLengthUpdated: ({ index, newLength }) => ({
            type: 'SegmentLengthUpdated',
            index,
            newLength,
        }),
        SegmentAdded: ({ targetIndex }) => ({
            type: 'SegmentAdded',
            targetIndex,
        }),
        SegmentAddedLeft: ({ index, desiredLength }) => ({
            type: 'SegmentAddedLeft',
            index,
            desiredLength,
        }),
        SegmentsReplaced: ({ segments }) => ({
            type: 'SegmentsReplaced',
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

Action.getSubject = (action, organizationId) =>
    action.match({
        OrganizationCreated: () => ({
            id: organizationId,
            type: 'organization',
        }),
        OrganizationDeleted: () => ({
            id: organizationId,
            type: 'organization',
        }),
        OrganizationSuspended: () => ({
            id: organizationId,
            type: 'organization',
        }),
        OrganizationUpdated: () => ({
            id: organizationId,
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
        UserLoaded: a => ({
            id: a.user.id,
            type: 'user',
        }),
        OrganizationSynced: a => ({
            id: a.organization.id,
            type: 'organization',
        }),
        BlockfacesSynced: () => ({
            id: 'collection',
            type: 'blockfaces',
        }),
        BlockfaceCreated: a => ({
            id: a.blockface.id,
            type: 'blockface',
        }),
        BlockfaceSelected: a => ({
            id: a.blockface.id,
            type: 'blockface',
        }),
        BlockfaceSaved: a => ({
            id: a.blockface.id,
            type: 'blockface',
        }),
        SegmentUseUpdated: () => ({
            id: 'current',
            type: 'blockface',
        }),
        SegmentLengthUpdated: () => ({
            id: 'current',
            type: 'blockface',
        }),
        SegmentAdded: () => ({
            id: 'current',
            type: 'blockface',
        }),
        SegmentAddedLeft: () => ({
            id: 'current',
            type: 'blockface',
        }),
        SegmentsReplaced: () => ({
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
        UserLoaded: () => true,
        OrganizationSynced: () => true,
        BlockfacesSynced: () => true,
        BlockfaceCreated: () => ['admin', 'editor'].includes(actorRole),
        BlockfaceSelected: () => true,
        BlockfaceSaved: () => ['admin', 'editor'].includes(actorRole),
        SegmentUseUpdated: () => true,
        SegmentLengthUpdated: () => true,
        SegmentAdded: () => true,
        SegmentAddedLeft: () => true,
        SegmentsReplaced: () => true,
    })

export { Action }
