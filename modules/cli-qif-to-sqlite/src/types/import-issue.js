// ABOUTME: Generated type definition for ImportIssue
// ABOUTME: Auto-generated from modules/cli-qif-to-sqlite/type-definitions/import-issue.type.js - do not edit manually

/*  ImportIssue generated from: modules/cli-qif-to-sqlite/type-definitions/import-issue.type.js
 *
 *  SingleAccount
 *      accounts: "[String]"
 *  MissingAccounts
 *      missing: "[String]"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// ImportIssue constructor
//
// -------------------------------------------------------------------------------------------------------------
const ImportIssue = {
    toString: () => 'ImportIssue',
}

// Add hidden properties
Object.defineProperty(ImportIssue, '@@typeName', { value: 'ImportIssue', enumerable: false })
Object.defineProperty(ImportIssue, '@@tagNames', { value: ['SingleAccount', 'MissingAccounts'], enumerable: false })

// Type prototype with match method
const ImportIssuePrototype = {}

Object.defineProperty(ImportIssuePrototype, 'match', {
    value: R.match(ImportIssue['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(ImportIssuePrototype, 'constructor', {
    value: ImportIssue,
    enumerable: false,
    writable: true,
    configurable: true,
})

ImportIssue.prototype = ImportIssuePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    singleAccount  : function () { return `ImportIssue.SingleAccount(${R._toString(this.accounts)})` },
    missingAccounts: function () { return `ImportIssue.MissingAccounts(${R._toString(this.missing)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    singleAccount  : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    missingAccounts: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a ImportIssue.SingleAccount instance
 * @sig SingleAccount :: ([String]) -> ImportIssue.SingleAccount
 */
const SingleAccountConstructor = function SingleAccount(accounts) {
    const constructorName = 'ImportIssue.SingleAccount(accounts)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'String', undefined, 'accounts', false, accounts)

    const result = Object.create(SingleAccountPrototype)
    result.accounts = accounts
    return result
}

ImportIssue.SingleAccount = SingleAccountConstructor

/*
 * Construct a ImportIssue.MissingAccounts instance
 * @sig MissingAccounts :: ([String]) -> ImportIssue.MissingAccounts
 */
const MissingAccountsConstructor = function MissingAccounts(missing) {
    const constructorName = 'ImportIssue.MissingAccounts(missing)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'String', undefined, 'missing', false, missing)

    const result = Object.create(MissingAccountsPrototype)
    result.missing = missing
    return result
}

ImportIssue.MissingAccounts = MissingAccountsConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const SingleAccountPrototype = Object.create(ImportIssuePrototype, {
    '@@tagName': { value: 'SingleAccount', enumerable: false },
    '@@typeName': { value: 'ImportIssue', enumerable: false },
    toString: { value: toString.singleAccount, enumerable: false },
    toJSON: { value: toJSON.singleAccount, enumerable: false },
    constructor: { value: SingleAccountConstructor, enumerable: false, writable: true, configurable: true },
})

const MissingAccountsPrototype = Object.create(ImportIssuePrototype, {
    '@@tagName': { value: 'MissingAccounts', enumerable: false },
    '@@typeName': { value: 'ImportIssue', enumerable: false },
    toString: { value: toString.missingAccounts, enumerable: false },
    toJSON: { value: toJSON.missingAccounts, enumerable: false },
    constructor: { value: MissingAccountsConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
SingleAccountConstructor.prototype = SingleAccountPrototype
MissingAccountsConstructor.prototype = MissingAccountsPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
SingleAccountConstructor.is = val => val && val.constructor === SingleAccountConstructor
MissingAccountsConstructor.is = val => val && val.constructor === MissingAccountsConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
SingleAccountConstructor.toString = () => 'ImportIssue.SingleAccount'
MissingAccountsConstructor.toString = () => 'ImportIssue.MissingAccounts'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
SingleAccountConstructor._from = _input => ImportIssue.SingleAccount(_input.accounts)
MissingAccountsConstructor._from = _input => ImportIssue.MissingAccounts(_input.missing)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
SingleAccountConstructor.from = SingleAccountConstructor._from
MissingAccountsConstructor.from = MissingAccountsConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

SingleAccountConstructor.toFirestore = o => ({ ...o })
SingleAccountConstructor.fromFirestore = SingleAccountConstructor._from

MissingAccountsConstructor.toFirestore = o => ({ ...o })
MissingAccountsConstructor.fromFirestore = MissingAccountsConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a ImportIssue instance
 * @sig is :: Any -> Boolean
 */
ImportIssue.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === ImportIssue.SingleAccount || constructor === ImportIssue.MissingAccounts
}

/**
 * Serialize ImportIssue to Firestore format
 * @sig _toFirestore :: (ImportIssue, Function) -> Object
 */
ImportIssue._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = ImportIssue[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize ImportIssue from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ImportIssue
 */
ImportIssue._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'SingleAccount') return ImportIssue.SingleAccount.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'MissingAccounts') return ImportIssue.MissingAccounts.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized ImportIssue variant: ${tagName}`)
}

// Public aliases (can be overridden)
ImportIssue.toFirestore = ImportIssue._toFirestore
ImportIssue.fromFirestore = ImportIssue._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ImportIssue }
