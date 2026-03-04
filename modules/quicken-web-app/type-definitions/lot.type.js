// ABOUTME: Lot type definition for tax lot tracking
// ABOUTME: Tracks purchase date, cost basis, and remaining quantity per security position

import { FieldTypes } from './field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export const Lot = {
    name: 'Lot',
    kind: 'tagged',
    fields: {
        accountId: FieldTypes.accountId,
        costBasis: 'Number',
        createdAt: 'String',
        id: FieldTypes.lotId,
        purchaseDate: 'String',
        quantity: 'Number',
        remainingQuantity: 'Number',
        securityId: FieldTypes.securityId,
        createdByTransactionId: FieldTypes.transactionId,
        closedDate: 'String?',
    },
}

// Computed properties
Lot.averageCostPerShare = lot => lot.costBasis / lot.quantity
