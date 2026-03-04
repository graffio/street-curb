// ABOUTME: Generated type definition for AccountSummary
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/account-summary.type.js - do not edit manually

/** {@link module:AccountSummary} */
/*  AccountSummary generated from: modules/quicken-web-app/type-definitions/account-summary.type.js
 *
 *  name: "String",
 *  type: /^(Bank|Cash|Credit Card|Investment|Other Asset|Other Liability|401\(k\)\/403\(b\))$/
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a AccountSummary instance
 * @sig AccountSummary :: (String, Type) -> AccountSummary
 *     Type = /^(Bank|Cash|Credit Card|Investment|Other Asset|Other Liability|401\(k\)\/403\(b\))$/
 */
const AccountSummary = function AccountSummary(name, type) {
    const constructorName = 'AccountSummary(name, type)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'name', false, name)
    R.validateRegex(
        constructorName,
        /^(Bank|Cash|Credit Card|Investment|Other Asset|Other Liability|401\(k\)\/403\(b\))$/,
        'type',
        false,
        type,
    )

    const result = Object.create(prototype)
    result.name = name
    result.type = type
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig accountsummaryToString :: () -> String
 */
const accountsummaryToString = function () {
    return `AccountSummary(${R._toString(this.name)}, ${R._toString(this.type)})`
}

/*
 * Convert to JSON representation
 * @sig accountsummaryToJSON :: () -> Object
 */
const accountsummaryToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'AccountSummary', enumerable: false },
    toString: { value: accountsummaryToString, enumerable: false },
    toJSON: { value: accountsummaryToJSON, enumerable: false },
    constructor: { value: AccountSummary, enumerable: false, writable: true, configurable: true },
})

AccountSummary.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
AccountSummary.toString = () => 'AccountSummary'
AccountSummary.is = v => v && v['@@typeName'] === 'AccountSummary'

AccountSummary._from = _input => AccountSummary(_input.name, _input.type)
AccountSummary.from = AccountSummary._from

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { AccountSummary }
