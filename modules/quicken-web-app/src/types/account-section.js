// ABOUTME: Generated type definition for AccountSection
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/derived/account-section.type.js - do not edit manually

/** {@link module:AccountSection} */
/*  AccountSection generated from: modules/quicken-web-app/type-definitions/derived/account-section.type.js
 *
 *  id           : "String",
 *  label        : "String",
 *  isCollapsible: "Boolean",
 *  accounts     : "{EnrichedAccount:id}",
 *  children     : "{AccountSection:id}",
 *  totalBalance : "Number?",
 *  totalCount   : "Number?"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { LookupTable } from '@graffio/functional'
import { EnrichedAccount } from './enriched-account.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a AccountSection instance
 * @sig AccountSection :: (String, String, Boolean, {EnrichedAccount}, {AccountSection}, Number?, Number?) -> AccountSection
 */
const AccountSection = function AccountSection(id, label, isCollapsible, accounts, children, totalBalance, totalCount) {
    const constructorName = 'AccountSection(id, label, isCollapsible, accounts, children, totalBalance, totalCount)'

    R.validateString(constructorName, 'id', false, id)
    R.validateString(constructorName, 'label', false, label)
    R.validateBoolean(constructorName, 'isCollapsible', false, isCollapsible)
    R.validateLookupTable(constructorName, 'EnrichedAccount', 'accounts', false, accounts)
    R.validateLookupTable(constructorName, 'AccountSection', 'children', false, children)
    R.validateNumber(constructorName, 'totalBalance', true, totalBalance)
    R.validateNumber(constructorName, 'totalCount', true, totalCount)

    const result = Object.create(prototype)
    result.id = id
    result.label = label
    result.isCollapsible = isCollapsible
    result.accounts = accounts
    result.children = children
    if (totalBalance !== undefined) result.totalBalance = totalBalance
    if (totalCount !== undefined) result.totalCount = totalCount
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig accountsectionToString :: () -> String
 */
const accountsectionToString = function () {
    return `AccountSection(${R._toString(this.id)},
        ${R._toString(this.label)},
        ${R._toString(this.isCollapsible)},
        ${R._toString(this.accounts)},
        ${R._toString(this.children)},
        ${R._toString(this.totalBalance)},
        ${R._toString(this.totalCount)})`
}

/*
 * Convert to JSON representation
 * @sig accountsectionToJSON :: () -> Object
 */
const accountsectionToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'AccountSection', enumerable: false },
    toString: { value: accountsectionToString, enumerable: false },
    toJSON: { value: accountsectionToJSON, enumerable: false },
    constructor: { value: AccountSection, enumerable: false, writable: true, configurable: true },
})

AccountSection.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
AccountSection.toString = () => 'AccountSection'
AccountSection.is = v => v && v['@@typeName'] === 'AccountSection'

AccountSection._from = _input => {
    const { id, label, isCollapsible, accounts, children, totalBalance, totalCount } = _input
    return AccountSection(id, label, isCollapsible, accounts, children, totalBalance, totalCount)
}
AccountSection.from = AccountSection._from

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { AccountSection }
