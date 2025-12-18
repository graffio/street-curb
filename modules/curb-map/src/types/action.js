// ABOUTME: Generated type definition for Action
// ABOUTME: Auto-generated from modules/curb-map/type-definitions/action.type.js - do not edit manually

/*  Action generated from: modules/curb-map/type-definitions/action.type.js
 *
 *  OrganizationCreated
 *      name     : "String",
 *      projectId: FieldTypes.projectId
 *  OrganizationUpdated
 *      name: "String?"
 *  OrganizationDeleted
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
}

// Add hidden properties
Object.defineProperty(Action, '@@typeName', { value: 'Action', enumerable: false })
Object.defineProperty(Action, '@@tagNames', {
    value: [
        'OrganizationCreated',
        'OrganizationUpdated',
        'OrganizationDeleted',
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
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    organizationCreated    : function () { return `Action.OrganizationCreated(${R._toString(this.name)}, ${R._toString(this.projectId)})` },
    organizationUpdated    : function () { return `Action.OrganizationUpdated(${R._toString(this.name)})` },
    organizationDeleted    : function () { return `Action.OrganizationDeleted()` },
    memberAdded            : function () { return `Action.MemberAdded(${R._toString(this.userId)}, ${R._toString(this.role)}, ${R._toString(this.displayName)})` },
    roleChanged            : function () { return `Action.RoleChanged(${R._toString(this.userId)}, ${R._toString(this.role)})` },
    memberRemoved          : function () { return `Action.MemberRemoved(${R._toString(this.userId)})` },
    userCreated            : function () { return `Action.UserCreated(${R._toString(this.userId)}, ${R._toString(this.displayName)}, ${R._toString(this.email)})` },
    userUpdated            : function () { return `Action.UserUpdated(${R._toString(this.userId)}, ${R._toString(this.displayName)})` },
    userForgotten          : function () { return `Action.UserForgotten(${R._toString(this.userId)}, ${R._toString(this.reason)})` },
    authenticationCompleted: function () { return `Action.AuthenticationCompleted(${R._toString(this.email)}, ${R._toString(this.displayName)})` },
    userLoaded             : function () { return `Action.UserLoaded(${R._toString(this.user)})` },
    organizationSynced     : function () { return `Action.OrganizationSynced(${R._toString(this.organization)})` },
    blockfacesSynced       : function () { return `Action.BlockfacesSynced(${R._toString(this.blockfaces)})` },
    blockfaceCreated       : function () { return `Action.BlockfaceCreated(${R._toString(this.blockface)})` },
    blockfaceSelected      : function () { return `Action.BlockfaceSelected(${R._toString(this.blockface)})` },
    blockfaceSaved         : function () { return `Action.BlockfaceSaved(${R._toString(this.blockface)})` },
    segmentUseUpdated      : function () { return `Action.SegmentUseUpdated(${R._toString(this.index)}, ${R._toString(this.use)})` },
    segmentLengthUpdated   : function () { return `Action.SegmentLengthUpdated(${R._toString(this.index)}, ${R._toString(this.newLength)})` },
    segmentAddedLeft       : function () { return `Action.SegmentAddedLeft(${R._toString(this.index)}, ${R._toString(this.desiredLength)})` },
    segmentAdded           : function () { return `Action.SegmentAdded(${R._toString(this.targetIndex)})` },
    segmentsReplaced       : function () { return `Action.SegmentsReplaced(${R._toString(this.segments)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    organizationCreated    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    organizationUpdated    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    organizationDeleted    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    memberAdded            : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    roleChanged            : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    memberRemoved          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    userCreated            : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    userUpdated            : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    userForgotten          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    authenticationCompleted: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    userLoaded             : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    organizationSynced     : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    blockfacesSynced       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    blockfaceCreated       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    blockfaceSelected      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    blockfaceSaved         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    segmentUseUpdated      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    segmentLengthUpdated   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    segmentAddedLeft       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    segmentAdded           : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    segmentsReplaced       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Action.OrganizationCreated instance
 * @sig OrganizationCreated :: (String, String) -> Action.OrganizationCreated
 */
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

/*
 * Construct a Action.OrganizationUpdated instance
 * @sig OrganizationUpdated :: (String?) -> Action.OrganizationUpdated
 */
const OrganizationUpdatedConstructor = function OrganizationUpdated(name) {
    const constructorName = 'Action.OrganizationUpdated(name)'

    R.validateString(constructorName, 'name', true, name)

    const result = Object.create(OrganizationUpdatedPrototype)
    if (name != null) result.name = name
    return result
}

Action.OrganizationUpdated = OrganizationUpdatedConstructor

/*
 * Construct a Action.OrganizationDeleted instance
 * @sig OrganizationDeleted :: () -> Action.OrganizationDeleted
 */
const OrganizationDeletedConstructor = function OrganizationDeleted() {
    const constructorName = 'Action.OrganizationDeleted()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(OrganizationDeletedPrototype)

    return result
}

Action.OrganizationDeleted = OrganizationDeletedConstructor

/*
 * Construct a Action.MemberAdded instance
 * @sig MemberAdded :: (String, String, String) -> Action.MemberAdded
 */
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

/*
 * Construct a Action.RoleChanged instance
 * @sig RoleChanged :: (String, String) -> Action.RoleChanged
 */
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

/*
 * Construct a Action.MemberRemoved instance
 * @sig MemberRemoved :: (String) -> Action.MemberRemoved
 */
const MemberRemovedConstructor = function MemberRemoved(userId) {
    const constructorName = 'Action.MemberRemoved(userId)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateRegex(constructorName, FieldTypes.userId, 'userId', false, userId)

    const result = Object.create(MemberRemovedPrototype)
    result.userId = userId
    return result
}

Action.MemberRemoved = MemberRemovedConstructor

/*
 * Construct a Action.UserCreated instance
 * @sig UserCreated :: (String, String, String) -> Action.UserCreated
 */
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

/*
 * Construct a Action.UserUpdated instance
 * @sig UserUpdated :: (String, String?) -> Action.UserUpdated
 */
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

/*
 * Construct a Action.UserForgotten instance
 * @sig UserForgotten :: (String, String) -> Action.UserForgotten
 */
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

/*
 * Construct a Action.AuthenticationCompleted instance
 * @sig AuthenticationCompleted :: (String, String) -> Action.AuthenticationCompleted
 */
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

/*
 * Construct a Action.UserLoaded instance
 * @sig UserLoaded :: (User) -> Action.UserLoaded
 */
const UserLoadedConstructor = function UserLoaded(user) {
    const constructorName = 'Action.UserLoaded(user)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'User', 'user', false, user)

    const result = Object.create(UserLoadedPrototype)
    result.user = user
    return result
}

Action.UserLoaded = UserLoadedConstructor

/*
 * Construct a Action.OrganizationSynced instance
 * @sig OrganizationSynced :: (Organization) -> Action.OrganizationSynced
 */
const OrganizationSyncedConstructor = function OrganizationSynced(organization) {
    const constructorName = 'Action.OrganizationSynced(organization)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'Organization', 'organization', false, organization)

    const result = Object.create(OrganizationSyncedPrototype)
    result.organization = organization
    return result
}

Action.OrganizationSynced = OrganizationSyncedConstructor

/*
 * Construct a Action.BlockfacesSynced instance
 * @sig BlockfacesSynced :: ([Blockface]) -> Action.BlockfacesSynced
 */
const BlockfacesSyncedConstructor = function BlockfacesSynced(blockfaces) {
    const constructorName = 'Action.BlockfacesSynced(blockfaces)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'Blockface', 'blockfaces', false, blockfaces)

    const result = Object.create(BlockfacesSyncedPrototype)
    result.blockfaces = blockfaces
    return result
}

Action.BlockfacesSynced = BlockfacesSyncedConstructor

/*
 * Construct a Action.BlockfaceCreated instance
 * @sig BlockfaceCreated :: (Blockface) -> Action.BlockfaceCreated
 */
const BlockfaceCreatedConstructor = function BlockfaceCreated(blockface) {
    const constructorName = 'Action.BlockfaceCreated(blockface)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'Blockface', 'blockface', false, blockface)

    const result = Object.create(BlockfaceCreatedPrototype)
    result.blockface = blockface
    return result
}

Action.BlockfaceCreated = BlockfaceCreatedConstructor

/*
 * Construct a Action.BlockfaceSelected instance
 * @sig BlockfaceSelected :: (Blockface) -> Action.BlockfaceSelected
 */
const BlockfaceSelectedConstructor = function BlockfaceSelected(blockface) {
    const constructorName = 'Action.BlockfaceSelected(blockface)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'Blockface', 'blockface', false, blockface)

    const result = Object.create(BlockfaceSelectedPrototype)
    result.blockface = blockface
    return result
}

Action.BlockfaceSelected = BlockfaceSelectedConstructor

/*
 * Construct a Action.BlockfaceSaved instance
 * @sig BlockfaceSaved :: (Blockface) -> Action.BlockfaceSaved
 */
const BlockfaceSavedConstructor = function BlockfaceSaved(blockface) {
    const constructorName = 'Action.BlockfaceSaved(blockface)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'Blockface', 'blockface', false, blockface)

    const result = Object.create(BlockfaceSavedPrototype)
    result.blockface = blockface
    return result
}

Action.BlockfaceSaved = BlockfaceSavedConstructor

/*
 * Construct a Action.SegmentUseUpdated instance
 * @sig SegmentUseUpdated :: (Number, String) -> Action.SegmentUseUpdated
 */
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

/*
 * Construct a Action.SegmentLengthUpdated instance
 * @sig SegmentLengthUpdated :: (Number, Number) -> Action.SegmentLengthUpdated
 */
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

/*
 * Construct a Action.SegmentAddedLeft instance
 * @sig SegmentAddedLeft :: (Number, Number) -> Action.SegmentAddedLeft
 */
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

/*
 * Construct a Action.SegmentAdded instance
 * @sig SegmentAdded :: (Number) -> Action.SegmentAdded
 */
const SegmentAddedConstructor = function SegmentAdded(targetIndex) {
    const constructorName = 'Action.SegmentAdded(targetIndex)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateNumber(constructorName, 'targetIndex', false, targetIndex)

    const result = Object.create(SegmentAddedPrototype)
    result.targetIndex = targetIndex
    return result
}

Action.SegmentAdded = SegmentAddedConstructor

/*
 * Construct a Action.SegmentsReplaced instance
 * @sig SegmentsReplaced :: ([Segment]) -> Action.SegmentsReplaced
 */
const SegmentsReplacedConstructor = function SegmentsReplaced(segments) {
    const constructorName = 'Action.SegmentsReplaced(segments)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'Segment', 'segments', false, segments)

    const result = Object.create(SegmentsReplacedPrototype)
    result.segments = segments
    return result
}

Action.SegmentsReplaced = SegmentsReplacedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationCreatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationCreated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.organizationCreated, enumerable: false },
    toJSON: { value: toJSON.organizationCreated, enumerable: false },
    constructor: { value: OrganizationCreatedConstructor, enumerable: false, writable: true, configurable: true },
})

const OrganizationUpdatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationUpdated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.organizationUpdated, enumerable: false },
    toJSON: { value: toJSON.organizationUpdated, enumerable: false },
    constructor: { value: OrganizationUpdatedConstructor, enumerable: false, writable: true, configurable: true },
})

const OrganizationDeletedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationDeleted', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.organizationDeleted, enumerable: false },
    toJSON: { value: toJSON.organizationDeleted, enumerable: false },
    constructor: { value: OrganizationDeletedConstructor, enumerable: false, writable: true, configurable: true },
})

const MemberAddedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'MemberAdded', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.memberAdded, enumerable: false },
    toJSON: { value: toJSON.memberAdded, enumerable: false },
    constructor: { value: MemberAddedConstructor, enumerable: false, writable: true, configurable: true },
})

const RoleChangedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'RoleChanged', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.roleChanged, enumerable: false },
    toJSON: { value: toJSON.roleChanged, enumerable: false },
    constructor: { value: RoleChangedConstructor, enumerable: false, writable: true, configurable: true },
})

const MemberRemovedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'MemberRemoved', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.memberRemoved, enumerable: false },
    toJSON: { value: toJSON.memberRemoved, enumerable: false },
    constructor: { value: MemberRemovedConstructor, enumerable: false, writable: true, configurable: true },
})

const UserCreatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UserCreated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.userCreated, enumerable: false },
    toJSON: { value: toJSON.userCreated, enumerable: false },
    constructor: { value: UserCreatedConstructor, enumerable: false, writable: true, configurable: true },
})

const UserUpdatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UserUpdated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.userUpdated, enumerable: false },
    toJSON: { value: toJSON.userUpdated, enumerable: false },
    constructor: { value: UserUpdatedConstructor, enumerable: false, writable: true, configurable: true },
})

const UserForgottenPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UserForgotten', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.userForgotten, enumerable: false },
    toJSON: { value: toJSON.userForgotten, enumerable: false },
    constructor: { value: UserForgottenConstructor, enumerable: false, writable: true, configurable: true },
})

const AuthenticationCompletedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'AuthenticationCompleted', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.authenticationCompleted, enumerable: false },
    toJSON: { value: toJSON.authenticationCompleted, enumerable: false },
    constructor: { value: AuthenticationCompletedConstructor, enumerable: false, writable: true, configurable: true },
})

const UserLoadedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'UserLoaded', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.userLoaded, enumerable: false },
    toJSON: { value: toJSON.userLoaded, enumerable: false },
    constructor: { value: UserLoadedConstructor, enumerable: false, writable: true, configurable: true },
})

const OrganizationSyncedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'OrganizationSynced', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.organizationSynced, enumerable: false },
    toJSON: { value: toJSON.organizationSynced, enumerable: false },
    constructor: { value: OrganizationSyncedConstructor, enumerable: false, writable: true, configurable: true },
})

const BlockfacesSyncedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'BlockfacesSynced', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.blockfacesSynced, enumerable: false },
    toJSON: { value: toJSON.blockfacesSynced, enumerable: false },
    constructor: { value: BlockfacesSyncedConstructor, enumerable: false, writable: true, configurable: true },
})

const BlockfaceCreatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'BlockfaceCreated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.blockfaceCreated, enumerable: false },
    toJSON: { value: toJSON.blockfaceCreated, enumerable: false },
    constructor: { value: BlockfaceCreatedConstructor, enumerable: false, writable: true, configurable: true },
})

const BlockfaceSelectedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'BlockfaceSelected', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.blockfaceSelected, enumerable: false },
    toJSON: { value: toJSON.blockfaceSelected, enumerable: false },
    constructor: { value: BlockfaceSelectedConstructor, enumerable: false, writable: true, configurable: true },
})

const BlockfaceSavedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'BlockfaceSaved', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.blockfaceSaved, enumerable: false },
    toJSON: { value: toJSON.blockfaceSaved, enumerable: false },
    constructor: { value: BlockfaceSavedConstructor, enumerable: false, writable: true, configurable: true },
})

const SegmentUseUpdatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SegmentUseUpdated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.segmentUseUpdated, enumerable: false },
    toJSON: { value: toJSON.segmentUseUpdated, enumerable: false },
    constructor: { value: SegmentUseUpdatedConstructor, enumerable: false, writable: true, configurable: true },
})

const SegmentLengthUpdatedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SegmentLengthUpdated', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.segmentLengthUpdated, enumerable: false },
    toJSON: { value: toJSON.segmentLengthUpdated, enumerable: false },
    constructor: { value: SegmentLengthUpdatedConstructor, enumerable: false, writable: true, configurable: true },
})

const SegmentAddedLeftPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SegmentAddedLeft', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.segmentAddedLeft, enumerable: false },
    toJSON: { value: toJSON.segmentAddedLeft, enumerable: false },
    constructor: { value: SegmentAddedLeftConstructor, enumerable: false, writable: true, configurable: true },
})

const SegmentAddedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SegmentAdded', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.segmentAdded, enumerable: false },
    toJSON: { value: toJSON.segmentAdded, enumerable: false },
    constructor: { value: SegmentAddedConstructor, enumerable: false, writable: true, configurable: true },
})

const SegmentsReplacedPrototype = Object.create(ActionPrototype, {
    '@@tagName': { value: 'SegmentsReplaced', enumerable: false },
    '@@typeName': { value: 'Action', enumerable: false },
    toString: { value: toString.segmentsReplaced, enumerable: false },
    toJSON: { value: toJSON.segmentsReplaced, enumerable: false },
    constructor: { value: SegmentsReplacedConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
//
// Variant static methods
//
// -------------------------------------------------------------------------------------------------------------
OrganizationCreatedConstructor.prototype = OrganizationCreatedPrototype
OrganizationUpdatedConstructor.prototype = OrganizationUpdatedPrototype
OrganizationDeletedConstructor.prototype = OrganizationDeletedPrototype
MemberAddedConstructor.prototype = MemberAddedPrototype
RoleChangedConstructor.prototype = RoleChangedPrototype
MemberRemovedConstructor.prototype = MemberRemovedPrototype
UserCreatedConstructor.prototype = UserCreatedPrototype
UserUpdatedConstructor.prototype = UserUpdatedPrototype
UserForgottenConstructor.prototype = UserForgottenPrototype
AuthenticationCompletedConstructor.prototype = AuthenticationCompletedPrototype
UserLoadedConstructor.prototype = UserLoadedPrototype
OrganizationSyncedConstructor.prototype = OrganizationSyncedPrototype
BlockfacesSyncedConstructor.prototype = BlockfacesSyncedPrototype
BlockfaceCreatedConstructor.prototype = BlockfaceCreatedPrototype
BlockfaceSelectedConstructor.prototype = BlockfaceSelectedPrototype
BlockfaceSavedConstructor.prototype = BlockfaceSavedPrototype
SegmentUseUpdatedConstructor.prototype = SegmentUseUpdatedPrototype
SegmentLengthUpdatedConstructor.prototype = SegmentLengthUpdatedPrototype
SegmentAddedLeftConstructor.prototype = SegmentAddedLeftPrototype
SegmentAddedConstructor.prototype = SegmentAddedPrototype
SegmentsReplacedConstructor.prototype = SegmentsReplacedPrototype

OrganizationCreatedConstructor.is = val => val && val.constructor === OrganizationCreatedConstructor
OrganizationUpdatedConstructor.is = val => val && val.constructor === OrganizationUpdatedConstructor
OrganizationDeletedConstructor.is = val => val && val.constructor === OrganizationDeletedConstructor
MemberAddedConstructor.is = val => val && val.constructor === MemberAddedConstructor
RoleChangedConstructor.is = val => val && val.constructor === RoleChangedConstructor
MemberRemovedConstructor.is = val => val && val.constructor === MemberRemovedConstructor
UserCreatedConstructor.is = val => val && val.constructor === UserCreatedConstructor
UserUpdatedConstructor.is = val => val && val.constructor === UserUpdatedConstructor
UserForgottenConstructor.is = val => val && val.constructor === UserForgottenConstructor
AuthenticationCompletedConstructor.is = val => val && val.constructor === AuthenticationCompletedConstructor
UserLoadedConstructor.is = val => val && val.constructor === UserLoadedConstructor
OrganizationSyncedConstructor.is = val => val && val.constructor === OrganizationSyncedConstructor
BlockfacesSyncedConstructor.is = val => val && val.constructor === BlockfacesSyncedConstructor
BlockfaceCreatedConstructor.is = val => val && val.constructor === BlockfaceCreatedConstructor
BlockfaceSelectedConstructor.is = val => val && val.constructor === BlockfaceSelectedConstructor
BlockfaceSavedConstructor.is = val => val && val.constructor === BlockfaceSavedConstructor
SegmentUseUpdatedConstructor.is = val => val && val.constructor === SegmentUseUpdatedConstructor
SegmentLengthUpdatedConstructor.is = val => val && val.constructor === SegmentLengthUpdatedConstructor
SegmentAddedLeftConstructor.is = val => val && val.constructor === SegmentAddedLeftConstructor
SegmentAddedConstructor.is = val => val && val.constructor === SegmentAddedConstructor
SegmentsReplacedConstructor.is = val => val && val.constructor === SegmentsReplacedConstructor

OrganizationCreatedConstructor.toString = () => 'Action.OrganizationCreated'
OrganizationUpdatedConstructor.toString = () => 'Action.OrganizationUpdated'
OrganizationDeletedConstructor.toString = () => 'Action.OrganizationDeleted'
MemberAddedConstructor.toString = () => 'Action.MemberAdded'
RoleChangedConstructor.toString = () => 'Action.RoleChanged'
MemberRemovedConstructor.toString = () => 'Action.MemberRemoved'
UserCreatedConstructor.toString = () => 'Action.UserCreated'
UserUpdatedConstructor.toString = () => 'Action.UserUpdated'
UserForgottenConstructor.toString = () => 'Action.UserForgotten'
AuthenticationCompletedConstructor.toString = () => 'Action.AuthenticationCompleted'
UserLoadedConstructor.toString = () => 'Action.UserLoaded'
OrganizationSyncedConstructor.toString = () => 'Action.OrganizationSynced'
BlockfacesSyncedConstructor.toString = () => 'Action.BlockfacesSynced'
BlockfaceCreatedConstructor.toString = () => 'Action.BlockfaceCreated'
BlockfaceSelectedConstructor.toString = () => 'Action.BlockfaceSelected'
BlockfaceSavedConstructor.toString = () => 'Action.BlockfaceSaved'
SegmentUseUpdatedConstructor.toString = () => 'Action.SegmentUseUpdated'
SegmentLengthUpdatedConstructor.toString = () => 'Action.SegmentLengthUpdated'
SegmentAddedLeftConstructor.toString = () => 'Action.SegmentAddedLeft'
SegmentAddedConstructor.toString = () => 'Action.SegmentAdded'
SegmentsReplacedConstructor.toString = () => 'Action.SegmentsReplaced'

OrganizationCreatedConstructor._from = _input => Action.OrganizationCreated(_input.name, _input.projectId)
OrganizationUpdatedConstructor._from = _input => Action.OrganizationUpdated(_input.name)
OrganizationDeletedConstructor._from = _input => Action.OrganizationDeleted()
MemberAddedConstructor._from = _input => {
    const { userId, role, displayName } = _input
    return Action.MemberAdded(userId, role, displayName)
}
RoleChangedConstructor._from = _input => Action.RoleChanged(_input.userId, _input.role)
MemberRemovedConstructor._from = _input => Action.MemberRemoved(_input.userId)
UserCreatedConstructor._from = _input => {
    const { userId, displayName, email } = _input
    return Action.UserCreated(userId, displayName, email)
}
UserUpdatedConstructor._from = _input => Action.UserUpdated(_input.userId, _input.displayName)
UserForgottenConstructor._from = _input => Action.UserForgotten(_input.userId, _input.reason)
AuthenticationCompletedConstructor._from = _input => Action.AuthenticationCompleted(_input.email, _input.displayName)
UserLoadedConstructor._from = _input => Action.UserLoaded(_input.user)
OrganizationSyncedConstructor._from = _input => Action.OrganizationSynced(_input.organization)
BlockfacesSyncedConstructor._from = _input => Action.BlockfacesSynced(_input.blockfaces)
BlockfaceCreatedConstructor._from = _input => Action.BlockfaceCreated(_input.blockface)
BlockfaceSelectedConstructor._from = _input => Action.BlockfaceSelected(_input.blockface)
BlockfaceSavedConstructor._from = _input => Action.BlockfaceSaved(_input.blockface)
SegmentUseUpdatedConstructor._from = _input => Action.SegmentUseUpdated(_input.index, _input.use)
SegmentLengthUpdatedConstructor._from = _input => Action.SegmentLengthUpdated(_input.index, _input.newLength)
SegmentAddedLeftConstructor._from = _input => Action.SegmentAddedLeft(_input.index, _input.desiredLength)
SegmentAddedConstructor._from = _input => Action.SegmentAdded(_input.targetIndex)
SegmentsReplacedConstructor._from = _input => Action.SegmentsReplaced(_input.segments)

OrganizationCreatedConstructor.from = OrganizationCreatedConstructor._from
OrganizationUpdatedConstructor.from = OrganizationUpdatedConstructor._from
OrganizationDeletedConstructor.from = OrganizationDeletedConstructor._from
MemberAddedConstructor.from = MemberAddedConstructor._from
RoleChangedConstructor.from = RoleChangedConstructor._from
MemberRemovedConstructor.from = MemberRemovedConstructor._from
UserCreatedConstructor.from = UserCreatedConstructor._from
UserUpdatedConstructor.from = UserUpdatedConstructor._from
UserForgottenConstructor.from = UserForgottenConstructor._from
AuthenticationCompletedConstructor.from = AuthenticationCompletedConstructor._from
UserLoadedConstructor.from = UserLoadedConstructor._from
OrganizationSyncedConstructor.from = OrganizationSyncedConstructor._from
BlockfacesSyncedConstructor.from = BlockfacesSyncedConstructor._from
BlockfaceCreatedConstructor.from = BlockfaceCreatedConstructor._from
BlockfaceSelectedConstructor.from = BlockfaceSelectedConstructor._from
BlockfaceSavedConstructor.from = BlockfaceSavedConstructor._from
SegmentUseUpdatedConstructor.from = SegmentUseUpdatedConstructor._from
SegmentLengthUpdatedConstructor.from = SegmentLengthUpdatedConstructor._from
SegmentAddedLeftConstructor.from = SegmentAddedLeftConstructor._from
SegmentAddedConstructor.from = SegmentAddedConstructor._from
SegmentsReplacedConstructor.from = SegmentsReplacedConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

OrganizationCreatedConstructor.toFirestore = o => ({ ...o })
OrganizationCreatedConstructor.fromFirestore = OrganizationCreatedConstructor._from

OrganizationUpdatedConstructor.toFirestore = o => ({ ...o })
OrganizationUpdatedConstructor.fromFirestore = OrganizationUpdatedConstructor._from

OrganizationDeletedConstructor.toFirestore = o => ({ ...o })
OrganizationDeletedConstructor.fromFirestore = OrganizationDeletedConstructor._from

MemberAddedConstructor.toFirestore = o => ({ ...o })
MemberAddedConstructor.fromFirestore = MemberAddedConstructor._from

RoleChangedConstructor.toFirestore = o => ({ ...o })
RoleChangedConstructor.fromFirestore = RoleChangedConstructor._from

MemberRemovedConstructor.toFirestore = o => ({ ...o })
MemberRemovedConstructor.fromFirestore = MemberRemovedConstructor._from

UserCreatedConstructor.toFirestore = o => ({ ...o })
UserCreatedConstructor.fromFirestore = UserCreatedConstructor._from

UserUpdatedConstructor.toFirestore = o => ({ ...o })
UserUpdatedConstructor.fromFirestore = UserUpdatedConstructor._from

UserForgottenConstructor.toFirestore = o => ({ ...o })
UserForgottenConstructor.fromFirestore = UserForgottenConstructor._from

AuthenticationCompletedConstructor.toFirestore = o => ({ ...o })
AuthenticationCompletedConstructor.fromFirestore = AuthenticationCompletedConstructor._from

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

SegmentUseUpdatedConstructor.toFirestore = o => ({ ...o })
SegmentUseUpdatedConstructor.fromFirestore = SegmentUseUpdatedConstructor._from

SegmentLengthUpdatedConstructor.toFirestore = o => ({ ...o })
SegmentLengthUpdatedConstructor.fromFirestore = SegmentLengthUpdatedConstructor._from

SegmentAddedLeftConstructor.toFirestore = o => ({ ...o })
SegmentAddedLeftConstructor.fromFirestore = SegmentAddedLeftConstructor._from

SegmentAddedConstructor.toFirestore = o => ({ ...o })
SegmentAddedConstructor.fromFirestore = SegmentAddedConstructor._from

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

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a Action instance
 * @sig is :: Any -> Boolean
 */
Action.is = v => {
    const {
        OrganizationCreated,
        OrganizationUpdated,
        OrganizationDeleted,
        MemberAdded,
        RoleChanged,
        MemberRemoved,
        UserCreated,
        UserUpdated,
        UserForgotten,
        AuthenticationCompleted,
        UserLoaded,
        OrganizationSynced,
        BlockfacesSynced,
        BlockfaceCreated,
        BlockfaceSelected,
        BlockfaceSaved,
        SegmentUseUpdated,
        SegmentLengthUpdated,
        SegmentAddedLeft,
        SegmentAdded,
        SegmentsReplaced,
    } = Action
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === OrganizationCreated ||
        constructor === OrganizationUpdated ||
        constructor === OrganizationDeleted ||
        constructor === MemberAdded ||
        constructor === RoleChanged ||
        constructor === MemberRemoved ||
        constructor === UserCreated ||
        constructor === UserUpdated ||
        constructor === UserForgotten ||
        constructor === AuthenticationCompleted ||
        constructor === UserLoaded ||
        constructor === OrganizationSynced ||
        constructor === BlockfacesSynced ||
        constructor === BlockfaceCreated ||
        constructor === BlockfaceSelected ||
        constructor === BlockfaceSaved ||
        constructor === SegmentUseUpdated ||
        constructor === SegmentLengthUpdated ||
        constructor === SegmentAddedLeft ||
        constructor === SegmentAdded ||
        constructor === SegmentsReplaced
    )
}

/**
 * Serialize Action to Firestore format
 * @sig _toFirestore :: (Action, Function) -> Object
 */
Action._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = Action[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize Action from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Action
 */
Action._fromFirestore = (doc, decodeTimestamps) => {
    const {
        OrganizationCreated,
        OrganizationUpdated,
        OrganizationDeleted,
        MemberAdded,
        RoleChanged,
        MemberRemoved,
        UserCreated,
        UserUpdated,
        UserForgotten,
        AuthenticationCompleted,
        UserLoaded,
        OrganizationSynced,
        BlockfacesSynced,
        BlockfaceCreated,
        BlockfaceSelected,
        BlockfaceSaved,
        SegmentUseUpdated,
        SegmentLengthUpdated,
        SegmentAddedLeft,
        SegmentAdded,
        SegmentsReplaced,
    } = Action
    const tagName = doc['@@tagName']
    if (tagName === 'OrganizationCreated') return OrganizationCreated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'OrganizationUpdated') return OrganizationUpdated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'OrganizationDeleted') return OrganizationDeleted.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'MemberAdded') return MemberAdded.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'RoleChanged') return RoleChanged.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'MemberRemoved') return MemberRemoved.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'UserCreated') return UserCreated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'UserUpdated') return UserUpdated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'UserForgotten') return UserForgotten.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'AuthenticationCompleted') return AuthenticationCompleted.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'UserLoaded') return UserLoaded.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'OrganizationSynced') return OrganizationSynced.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'BlockfacesSynced') return BlockfacesSynced.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'BlockfaceCreated') return BlockfaceCreated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'BlockfaceSelected') return BlockfaceSelected.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'BlockfaceSaved') return BlockfaceSaved.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SegmentUseUpdated') return SegmentUseUpdated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SegmentLengthUpdated') return SegmentLengthUpdated.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SegmentAddedLeft') return SegmentAddedLeft.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SegmentAdded') return SegmentAdded.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'SegmentsReplaced') return SegmentsReplaced.fromFirestore(doc, decodeTimestamps)
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

Action.toLog = a =>
    a.match({
        OrganizationCreated: ({ name }) => ({
            type: 'OrganizationCreated',
            name,
        }),
        OrganizationDeleted: () => ({ type: 'OrganizationDeleted' }),
        OrganizationUpdated: ({ name }) => ({
            type: 'OrganizationUpdated',
            name,
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
            blockface,
        }),
        BlockfaceSelected: ({ blockface }) => ({
            type: 'BlockfaceSelected',
            blockface,
        }),
        BlockfaceSaved: ({ blockface }) => ({
            type: 'BlockfaceSaved',
            blockface,
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

Action.metadata = action => {
    const f = (
        requiresUser,
        requiresOrganization,
        requiresProject,
        authStrategy,
        writesTo = [],
        validateInput = null,
    ) => ({
        requiresUser,
        requiresOrganization,
        requiresProject,
        authStrategy,
        writesTo,
        validateInput,
    })
    return action.match({
        AuthenticationCompleted: () => f(false, false, false, 'allowAll'),
        OrganizationCreated: () => f(true, false, false, 'requireOrganizationLimit'),
        UserCreated: () => f(false, false, false, 'requireSystem'),
        UserForgotten: () => f(true, false, false, 'requireSelfOnly'),
        UserUpdated: () => f(true, false, false, 'requireSelfOnly'),
        MemberAdded: () => f(true, true, false, 'requireActorIsOrganizationMember'),
        MemberRemoved: () => f(true, true, false, 'requireActorIsOrganizationMember'),
        OrganizationDeleted: () => f(true, true, false, 'requireActorIsOrganizationMember'),
        OrganizationUpdated: () => f(true, true, false, 'requireActorIsOrganizationMember'),
        RoleChanged: () => f(true, true, false, 'requireActorIsOrganizationMember'),
        BlockfaceSaved: () =>
            f(
                true,
                true,
                true,
                'requireActorIsOrganizationMember',
                [
                    {
                        collection: 'blockfaces',
                        path: 'action.blockface.id',
                    },
                ],
                (action, actionRequest, existingDocs) => {
                    const { blockface } = action
                    if (blockface.organizationId !== actionRequest.organizationId)
                        throw new Error(`Organization ids in blockface and ActionRequest cannot differ`)
                    if (blockface.projectId !== actionRequest.projectId)
                        throw new Error(`Project ids in blockface and ActionRequest cannot differ`)
                },
            ),
        BlockfaceCreated: () => {
            throw new Error('BlockfaceCreated is local-only')
        },
        BlockfaceSelected: () => {
            throw new Error('BlockfaceSelected is local-only')
        },
        BlockfacesSynced: () => {
            throw new Error('BlockfacesSynced is local-only')
        },
        OrganizationSynced: () => {
            throw new Error('OrganizationSynced is local-only')
        },
        SegmentAdded: () => {
            throw new Error('SegmentAdded is local-only')
        },
        SegmentAddedLeft: () => {
            throw new Error('SegmentAddedLeft is local-only')
        },
        SegmentLengthUpdated: () => {
            throw new Error('SegmentLengthUpdated is local-only')
        },
        SegmentUseUpdated: () => {
            throw new Error('SegmentUseUpdated is local-only')
        },
        SegmentsReplaced: () => {
            throw new Error('SegmentsReplaced is local-only')
        },
        UserLoaded: () => {
            throw new Error('UserLoaded is local-only')
        },
    })
}

export { Action }
