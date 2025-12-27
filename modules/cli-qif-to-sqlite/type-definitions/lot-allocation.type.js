export const LotAllocation = {
    name: 'LotAllocation',
    kind: 'tagged',
    fields: {
        id: /^la_[a-f0-9]{12}$/,
        lotId: /^lot_[a-f0-9]{12}$/,
        transactionId: /^txn_[a-f0-9]{12}(-\d+)?$/,
        sharesAllocated: 'Number',
        costBasisAllocated: 'Number',
        date: 'String',
    },
}
