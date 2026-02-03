// ABOUTME: Split type definition for transaction sub-items
// ABOUTME: Represents individual lines within a split transaction

import { FieldTypes } from './field-types.js'

export const Split = {
    name: 'Split',
    kind: 'tagged',
    fields: {
        id: 'String',
        transactionId: FieldTypes.transactionId,
        categoryId: 'String?',
        amount: 'Number',
        memo: 'String?',
        transferAccountId: { pattern: FieldTypes.accountId, optional: true },
    },
}
