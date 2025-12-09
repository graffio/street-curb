export const Lot = {
    name: 'Lot',
    kind: 'tagged',
    fields: {
        accountId: /^acc_[a-f0-9]{12}$/,
        costBasis: 'Number',
        createdAt: 'String',
        id: /^lot_[a-f0-9]{12}$/,
        purchaseDate: 'String',
        quantity: 'Number',
        remainingQuantity: 'Number',
        securityId: /^sec_[a-f0-9]{12}$/,
        createdByTransactionId: /^txn_[a-f0-9]{12}(-\d+)?$/,
        closedDate: 'String?',
    },
}

// Computed properties
Lot.averageCostPerShare = lot => lot.costBasis / lot.quantity
Lot.isOpen = lot => lot.closedDate === null
Lot.isClosed = lot => lot.closedDate !== null
