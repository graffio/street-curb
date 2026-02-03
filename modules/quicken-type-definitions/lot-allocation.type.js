// ABOUTME: LotAllocation type definition for lot-to-transaction mappings
// ABOUTME: Records shares and cost basis allocated from a lot to a sell transaction

import { FieldTypes } from './field-types.js'

export const LotAllocation = {
    name: 'LotAllocation',
    kind: 'tagged',
    fields: {
        id: FieldTypes.lotAllocationId,
        lotId: FieldTypes.lotId,
        transactionId: FieldTypes.transactionId,
        sharesAllocated: 'Number',
        costBasisAllocated: 'Number',
        date: 'String',
    },
}
