// ABOUTME: Generated type definition for AccountSection
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/account-section.type.js - do not edit manually

/** {@link module:AccountSection} */
/*  AccountSection generated from: modules/quicken-web-app/type-definitions/account-section.type.js
 *
 *  id           : "String",
 *  label        : "String",
 *  isCollapsible: "Boolean",
 *  accounts     : "{EnrichedAccount:id}",
 *  children     : "{AccountSection:id}"
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
 * @sig AccountSection :: (String, String, Boolean, {EnrichedAccount}, {AccountSection}) -> AccountSection
 */
const AccountSection = function AccountSection(id, label, isCollapsible, accounts, children) {
    const constructorName = 'AccountSection(id, label, isCollapsible, accounts, children)'
    R.validateArgumentLength(constructorName, 5, arguments)
    R.validateString(constructorName, 'id', false, id)
    R.validateString(constructorName, 'label', false, label)
    R.validateBoolean(constructorName, 'isCollapsible', false, isCollapsible)
    R.validateLookupTable(constructorName, 'EnrichedAccount', 'accounts', false, accounts)
    R.validateLookupTable(constructorName, 'AccountSection', 'children', false, children)

    const result = Object.create(prototype)
    result.id = id
    result.label = label
    result.isCollapsible = isCollapsible
    result.accounts = accounts
    result.children = children
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
        ${R._toString(this.children)})`
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
    const { id, label, isCollapsible, accounts, children } = _input
    return AccountSection(id, label, isCollapsible, accounts, children)
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

    return result
}

AccountSection._fromFirestore = (doc, decodeTimestamps) =>
    AccountSection._from({
        id: doc.id,
        label: doc.label,
        isCollapsible: doc.isCollapsible,
        accounts: R.lookupTableFromFirestore(EnrichedAccount, 'id', decodeTimestamps, doc.accounts),
        children: R.lookupTableFromFirestore(AccountSection, 'id', decodeTimestamps, doc.children),
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
