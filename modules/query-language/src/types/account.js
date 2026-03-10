// ABOUTME: Generated type definition for Account
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/entities/account.type.js - do not edit manually

/** {@link module:Account} */
/*  Account generated from: modules/quicken-web-app/type-definitions/entities/account.type.js
 *
 *  id         : FieldTypes.accountId,
 *  name       : "String",
 *  type       : FieldTypes.accountType,
 *  description: "String?",
 *  creditLimit: "Number?"
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Account instance
 * @sig Account :: (String, String, String, String?, Number?) -> Account
 */
const Account = function Account(id, name, type, description, creditLimit) {
    const constructorName = 'Account(id, name, type, description, creditLimit)'

    R.validateRegex(constructorName, FieldTypes.accountId, 'id', false, id)
    R.validateString(constructorName, 'name', false, name)
    R.validateRegex(constructorName, FieldTypes.accountType, 'type', false, type)
    R.validateString(constructorName, 'description', true, description)
    R.validateNumber(constructorName, 'creditLimit', true, creditLimit)

    const result = Object.create(prototype)
    result.id = id
    result.name = name
    result.type = type
    if (description !== undefined) result.description = description
    if (creditLimit !== undefined) result.creditLimit = creditLimit
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig accountToString :: () -> String
 */
const accountToString = function () {
    return `Account(${R._toString(this.id)},
        ${R._toString(this.name)},
        ${R._toString(this.type)},
        ${R._toString(this.description)},
        ${R._toString(this.creditLimit)})`
}

/*
 * Convert to JSON representation
 * @sig accountToJSON :: () -> Object
 */
const accountToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Account', enumerable: false },
    toString: { value: accountToString, enumerable: false },
    toJSON: { value: accountToJSON, enumerable: false },
    constructor: { value: Account, enumerable: false, writable: true, configurable: true },
})

Account.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Account.toString = () => 'Account'
Account.is = v => v && v['@@typeName'] === 'Account'

Account._from = _input => {
    const { id, name, type, description, creditLimit } = _input
    return Account(id, name, type, description, creditLimit)
}
Account.from = Account._from

Account.fromJSON = json => (json == null ? json : Account._from(json))

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

Account.isInvestment = account => account.type === 'Investment' || account.type === '401(k)/403(b)'

export { Account }
