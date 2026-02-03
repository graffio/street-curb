// ABOUTME: Split type definition for transaction sub-items
// ABOUTME: Represents individual lines within a split transaction

export const Split = {
    name: 'Split',
    kind: 'tagged',
    fields: {
        id: 'String',
        transactionId: /^txn_[a-f0-9]{12}(-\d+)?$/,
        categoryId: 'String?',
        amount: 'Number',
        memo: 'String?',
        transferAccountId: 'String?', // acc_<hash> or null
    },
}
