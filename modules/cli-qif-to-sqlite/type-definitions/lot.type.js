export const Lot = {
    name: 'Lot',
    kind: 'tagged',
    fields: {
        accountId: 'Number',
        costBasis: 'Number',
        createdAt: 'String',
        id: 'Number',
        purchaseDate: 'String',
        quantity: 'Number',
        remainingQuantity: 'Number',
        securityId: 'Number',
        createdByTransactionId: 'Number',
        closedDate: 'String?',
    },
}

// Computed properties
Lot.averageCostPerShare = lot => lot.costBasis / lot.quantity
Lot.isOpen = lot => lot.closedDate === null
Lot.isClosed = lot => lot.closedDate !== null
