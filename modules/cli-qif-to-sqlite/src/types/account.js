/** {@link module:Account} */
/*  Account generated from: modules/cli-qif-to-sqlite/type-definitions/account.type.js
 *
 *  id         : "Number",
 *  name       : "String",
 *  type       : /^(Bank|Cash|Credit Card|Investment|Other Asset|Other Liability)$/,
 *  description: "String?",
 *  creditLimit: "Number?"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const Account = function Account(id, name, type, description, creditLimit) {
    const constructorName = 'Account(id, name, type, description, creditLimit)'

    R.validateNumber(constructorName, 'id', false, id)
    R.validateString(constructorName, 'name', false, name)
    R.validateRegex(
        constructorName,
        /^(Bank|Cash|Credit Card|Investment|Other Asset|Other Liability)$/,
        'type',
        false,
        type,
    )
    R.validateString(constructorName, 'description', true, description)
    R.validateNumber(constructorName, 'creditLimit', true, creditLimit)

    const result = Object.create(prototype)
    result.id = id
    result.name = name
    result.type = type
    if (description != null) result.description = description
    if (creditLimit != null) result.creditLimit = creditLimit
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Account', enumerable: false },

    toString: {
        value: function () {
            return `Account(${R._toString(this.id)}, ${R._toString(this.name)}, ${R._toString(this.type)}, ${R._toString(this.description)}, ${R._toString(this.creditLimit)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return this
        },
        enumerable: false,
    },

    constructor: {
        value: Account,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

Account.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Account.toString = () => 'Account'
Account.is = v => v && v['@@typeName'] === 'Account'

Account._from = o => Account(o.id, o.name, o.type, o.description, o.creditLimit)
Account.from = Account._from

Account._toFirestore = (o, encodeTimestamps) => ({ ...o })

Account._fromFirestore = (doc, decodeTimestamps) => Account._from(doc)

// Public aliases (override if necessary)
Account.toFirestore = Account._toFirestore
Account.fromFirestore = Account._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Account }
