/*  Action generated from: modules/curb-map/type-definitions/action.type.js
 *
 *  UserAdded
 *      organizationId: "String",
 *      user          : "Object"
 *  OrganizationAdded
 *      organizationId: "String",
 *      metadata      : "Object"
 *
 */

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
        return constructor === Action.UserAdded || constructor === Action.OrganizationAdded
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
        const requiredVariants = ['UserAdded', 'OrganizationAdded']
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
Object.defineProperty(Action, '@@tagNames', { value: ['UserAdded', 'OrganizationAdded'] })

ActionPrototype.constructor = Action
Action.prototype = ActionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserAdded constructor
//
// -------------------------------------------------------------------------------------------------------------
const UserAddedConstructor = function UserAdded(organizationId, user) {
    const constructorName = 'Action.UserAdded(organizationId, user)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'organizationId', false, organizationId)
    R.validateObject(constructorName, 'user', false, user)

    const result = Object.create(UserAddedPrototype)
    result.organizationId = organizationId
    result.user = user
    return result
}

Action.UserAdded = UserAddedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.UserAdded prototype
//
// -------------------------------------------------------------------------------------------------------------
const UserAddedPrototype = Object.create(ActionPrototype)
Object.defineProperty(UserAddedPrototype, '@@tagName', { value: 'UserAdded' })
Object.defineProperty(UserAddedPrototype, '@@typeName', { value: 'Action' })

UserAddedPrototype.toString = function () {
    return `Action.UserAdded(${R._toString(this.organizationId)}, ${R._toString(this.user)})`
}

UserAddedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

UserAddedConstructor.prototype = UserAddedPrototype
UserAddedPrototype.constructor = UserAddedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.UserAdded: static functions:
//
// -------------------------------------------------------------------------------------------------------------
UserAddedConstructor.is = val => val && val.constructor === UserAddedConstructor
UserAddedConstructor.toString = () => 'Action.UserAdded'
UserAddedConstructor.from = o => Action.UserAdded(o.organizationId, o.user)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationAdded constructor
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationAddedConstructor = function OrganizationAdded(organizationId, metadata) {
    const constructorName = 'Action.OrganizationAdded(organizationId, metadata)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'organizationId', false, organizationId)
    R.validateObject(constructorName, 'metadata', false, metadata)

    const result = Object.create(OrganizationAddedPrototype)
    result.organizationId = organizationId
    result.metadata = metadata
    return result
}

Action.OrganizationAdded = OrganizationAddedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Action.OrganizationAdded prototype
//
// -------------------------------------------------------------------------------------------------------------
const OrganizationAddedPrototype = Object.create(ActionPrototype)
Object.defineProperty(OrganizationAddedPrototype, '@@tagName', { value: 'OrganizationAdded' })
Object.defineProperty(OrganizationAddedPrototype, '@@typeName', { value: 'Action' })

OrganizationAddedPrototype.toString = function () {
    return `Action.OrganizationAdded(${R._toString(this.organizationId)}, ${R._toString(this.metadata)})`
}

OrganizationAddedPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

OrganizationAddedConstructor.prototype = OrganizationAddedPrototype
OrganizationAddedPrototype.constructor = OrganizationAddedConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Action.OrganizationAdded: static functions:
//
// -------------------------------------------------------------------------------------------------------------
OrganizationAddedConstructor.is = val => val && val.constructor === OrganizationAddedConstructor
OrganizationAddedConstructor.toString = () => 'Action.OrganizationAdded'
OrganizationAddedConstructor.from = o => Action.OrganizationAdded(o.organizationId, o.metadata)

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: toFirestore
Action.toFirestore = action => JSON.stringify(action)

// Additional function: fromFirestore
Action.fromFirestore = o => {
    if (o['@@tagName'] === 'UserAdded') return Action.UserAdded.from(o)
    if (o['@@tagName'] === 'OrganizationAdded') return Action.OrganizationAdded.from(o)
    throw new Error(`Unrecognized domain event ${o['@@tagName']}`)
}

export { Action }
