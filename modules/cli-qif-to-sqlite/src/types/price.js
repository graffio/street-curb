/** {@link module:Price} */
/*  Price generated from: modules/cli-qif-to-sqlite/type-definitions/price.type.js
 *
 *  id        : /^prc_[a-f0-9]{12}$/,
 *  securityId: /^sec_[a-f0-9]{12}$/,
 *  date      : "String",
 *  price     : "Number"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const Price = function Price(id, securityId, date, price) {
    const constructorName = 'Price(id, securityId, date, price)'
    R.validateArgumentLength(constructorName, 4, arguments)
    R.validateRegex(constructorName, /^prc_[a-f0-9]{12}$/, 'id', false, id)
    R.validateRegex(constructorName, /^sec_[a-f0-9]{12}$/, 'securityId', false, securityId)
    R.validateString(constructorName, 'date', false, date)
    R.validateNumber(constructorName, 'price', false, price)

    const result = Object.create(prototype)
    result.id = id
    result.securityId = securityId
    result.date = date
    result.price = price
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Price', enumerable: false },

    toString: {
        value: function () {
            return `Price(${R._toString(this.id)}, ${R._toString(this.securityId)}, ${R._toString(this.date)}, ${R._toString(this.price)})`
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
        value: Price,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

Price.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Price.toString = () => 'Price'
Price.is = v => v && v['@@typeName'] === 'Price'

Price._from = o => Price(o.id, o.securityId, o.date, o.price)
Price.from = Price._from

Price._toFirestore = (o, encodeTimestamps) => ({ ...o })

Price._fromFirestore = (doc, decodeTimestamps) => Price._from(doc)

// Public aliases (override if necessary)
Price.toFirestore = Price._toFirestore
Price.fromFirestore = Price._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Price }
