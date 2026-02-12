// ABOUTME: Generated type definition for AccountSection
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/account-section.type.js - do not edit manually

/** {@link module:AccountSection} */
/*  AccountSection generated from: modules/quicken-web-app/type-definitions/account-section.type.js
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

import * as R from '@graffio/cli-type-generator'
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
    if (totalBalance != null) result.totalBalance = totalBalance
    if (totalCount != null) result.totalCount = totalCount
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

AccountSection._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        label: o.label,
        isCollapsible: o.isCollapsible,
        accounts: R.lookupTableToFirestore(EnrichedAccount, 'id', encodeTimestamps, o.accounts),
        children: R.lookupTableToFirestore(AccountSection, 'id', encodeTimestamps, o.children),
    }

    if (o.totalBalance != null) result.totalBalance = o.totalBalance

    if (o.totalCount != null) result.totalCount = o.totalCount

    return result
}

AccountSection._fromFirestore = (doc, decodeTimestamps) =>
    AccountSection._from({
        id: doc.id,
        label: doc.label,
        isCollapsible: doc.isCollapsible,
        accounts: R.lookupTableFromFirestore(EnrichedAccount, 'id', decodeTimestamps, doc.accounts),
        children: R.lookupTableFromFirestore(AccountSection, 'id', decodeTimestamps, doc.children),
        totalBalance: doc.totalBalance,
        totalCount: doc.totalCount,
    })

// Public aliases (override if necessary)
AccountSection.toFirestore = AccountSection._toFirestore
AccountSection.fromFirestore = AccountSection._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { AccountSection }
