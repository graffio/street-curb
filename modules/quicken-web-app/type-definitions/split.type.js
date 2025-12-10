export const Split = {
    name: 'Split',
    kind: 'tagged',
    fields: {
        id: 'String',
        transactionId: /^txn_[a-f0-9]{12}(-\d+)?$/,
        categoryId: 'String?',
        amount: 'Number',
        memo: 'String?',
    },
}
