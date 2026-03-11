// ABOUTME: Generated type definition for LotAllocation
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/entities/lot-allocation.type.js - do not edit manually

/** {@link module:LotAllocation} */
/*  LotAllocation generated from: modules/quicken-web-app/type-definitions/entities/lot-allocation.type.js
 *
 *  id                : FieldTypes.lotAllocationId,
 *  lotId             : FieldTypes.lotId,
 *  transactionId     : FieldTypes.transactionId,
 *  sharesAllocated   : "Number",
 *  costBasisAllocated: "Number",
 *  date              : "String",
 *  proceedsAllocated : "Number?"
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
 * Construct a LotAllocation instance
 * @sig LotAllocation :: (String, String, String, Number, Number, String, Number?) -> LotAllocation
 */
const LotAllocation = function LotAllocation(
    id,
    lotId,
    transactionId,
    sharesAllocated,
    costBasisAllocated,
    date,
    proceedsAllocated,
) {
    const constructorName =
        'LotAllocation(id, lotId, transactionId, sharesAllocated, costBasisAllocated, date, proceedsAllocated)'

    R.validateRegex(constructorName, FieldTypes.lotAllocationId, 'id', false, id)
    R.validateRegex(constructorName, FieldTypes.lotId, 'lotId', false, lotId)
    R.validateRegex(constructorName, FieldTypes.transactionId, 'transactionId', false, transactionId)
    R.validateNumber(constructorName, 'sharesAllocated', false, sharesAllocated)
    R.validateNumber(constructorName, 'costBasisAllocated', false, costBasisAllocated)
    R.validateString(constructorName, 'date', false, date)
    R.validateNumber(constructorName, 'proceedsAllocated', true, proceedsAllocated)

    const result = Object.create(prototype)
    result.id = id
    result.lotId = lotId
    result.transactionId = transactionId
    result.sharesAllocated = sharesAllocated
    result.costBasisAllocated = costBasisAllocated
    result.date = date
    if (proceedsAllocated !== undefined) result.proceedsAllocated = proceedsAllocated
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig lotallocationToString :: () -> String
 */
const lotallocationToString = function () {
    return `LotAllocation(${R._toString(this.id)},
        ${R._toString(this.lotId)},
        ${R._toString(this.transactionId)},
        ${R._toString(this.sharesAllocated)},
        ${R._toString(this.costBasisAllocated)},
        ${R._toString(this.date)},
        ${R._toString(this.proceedsAllocated)})`
}

/*
 * Convert to JSON representation
 * @sig lotallocationToJSON :: () -> Object
 */
const lotallocationToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'LotAllocation', enumerable: false },
    toString: { value: lotallocationToString, enumerable: false },
    toJSON: { value: lotallocationToJSON, enumerable: false },
    constructor: { value: LotAllocation, enumerable: false, writable: true, configurable: true },
})

LotAllocation.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
LotAllocation.toString = () => 'LotAllocation'
LotAllocation.is = v => v && v['@@typeName'] === 'LotAllocation'

LotAllocation._from = _input => {
    const { id, lotId, transactionId, sharesAllocated, costBasisAllocated, date, proceedsAllocated } = _input
    return LotAllocation(id, lotId, transactionId, sharesAllocated, costBasisAllocated, date, proceedsAllocated)
}
LotAllocation.from = LotAllocation._from

LotAllocation.fromJSON = json => (json == null ? json : LotAllocation._from(json))

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { LotAllocation }
