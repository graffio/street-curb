// ABOUTME: Security type definition for stocks, bonds, and funds
// ABOUTME: Identifies tradeable securities by symbol and name

import { FieldTypes } from './field-types.js'

export const Security = {
    name: 'Security',
    kind: 'tagged',
    fields: { id: FieldTypes.securityId, name: 'String', symbol: 'String?', type: 'String?', goal: 'String?' },
}
