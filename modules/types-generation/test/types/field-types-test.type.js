// Test type definition using FieldTypes imports
import { FieldTypes } from '@graffio/types'

export const FieldTypesTest = {
    name: 'FieldTypesTest',
    kind: 'tagged',
    fields: {
        correlationId: FieldTypes.correlationId,
        environment: FieldTypes.environment,
        ipAddress: FieldTypes.ipv4Type,
        userEmail: FieldTypes.email,
    },
}
