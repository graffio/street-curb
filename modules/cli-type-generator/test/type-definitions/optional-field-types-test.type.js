// ABOUTME: Test type definition for optional FieldTypes syntax
// ABOUTME: Tests { pattern: FieldTypes.X, optional: true } wrapper

import { FieldTypes } from '@graffio/curb-map/type-definitions/index.js'

export const OptionalFieldTypesTest = {
    name: 'OptionalFieldTypesTest',
    kind: 'tagged',
    fields: {
        requiredEmail: FieldTypes.email,
        optionalEmail: { pattern: FieldTypes.email, optional: true },
        requiredCorrelationId: FieldTypes.correlationId,
        optionalCorrelationId: { pattern: FieldTypes.correlationId, optional: true },
    },
}
