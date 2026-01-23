// ABOUTME: Generated type definition for RegisterRow
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/register-row.type.js - do not edit manually

/** {@link module:RegisterRow} */
/*  RegisterRow generated from: modules/quicken-web-app/type-definitions/register-row.type.js
 *
 *  transaction   : "Transaction",
 *  runningBalance: "Number"
 *
 */

import * as R from '@graffio/cli-type-generator'

import { Transaction } from './transaction.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a RegisterRow instance
 * @sig RegisterRow :: (Transaction, Number) -> RegisterRow
 */
const RegisterRow = function RegisterRow(transaction, runningBalance) {
    const constructorName = 'RegisterRow(transaction, runningBalance)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateTag(constructorName, 'Transaction', 'transaction', false, transaction)
    R.validateNumber(constructorName, 'runningBalance', false, runningBalance)

    const result = Object.create(prototype)
    result.transaction = transaction
    result.runningBalance = runningBalance
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig registerrowToString :: () -> String
 */
const registerrowToString = function () {
    return `RegisterRow(${R._toString(this.transaction)}, ${R._toString(this.runningBalance)})`
}

/*
 * Convert to JSON representation
 * @sig registerrowToJSON :: () -> Object
 */
const registerrowToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'RegisterRow', enumerable: false },
    toString: { value: registerrowToString, enumerable: false },
    toJSON: { value: registerrowToJSON, enumerable: false },
    constructor: { value: RegisterRow, enumerable: false, writable: true, configurable: true },
})

RegisterRow.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
RegisterRow.toString = () => 'RegisterRow'
RegisterRow.is = v => v && v['@@typeName'] === 'RegisterRow'

RegisterRow._from = _input => RegisterRow(_input.transaction, _input.runningBalance)
RegisterRow.from = RegisterRow._from

RegisterRow._toFirestore = (o, encodeTimestamps) => {
    const result = {
        transaction: Transaction.toFirestore(o.transaction, encodeTimestamps),
        runningBalance: o.runningBalance,
    }

    return result
}

RegisterRow._fromFirestore = (doc, decodeTimestamps) =>
    RegisterRow._from({
        transaction: Transaction.fromFirestore
            ? Transaction.fromFirestore(doc.transaction, decodeTimestamps)
            : Transaction.from(doc.transaction),
        runningBalance: doc.runningBalance,
    })

// Public aliases (override if necessary)
RegisterRow.toFirestore = RegisterRow._toFirestore
RegisterRow.fromFirestore = RegisterRow._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { RegisterRow }
