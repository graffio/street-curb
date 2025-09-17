import { FieldTypes } from '@graffio/types'

/*
 * AuditRecord represents a SOC2-compliant infrastructure audit log entry
 */
// prettier-ignore
export const AuditRecord = {
    name: 'AuditRecord',
    kind: 'tagged',
    fields: {
        // SOC2 Required Fields (with regex validation)
        timestamp       : FieldTypes.timestamp,
        eventType       : FieldTypes.event,
        userId          : FieldTypes.email,
        resource        : FieldTypes.resourceName,
        action          : FieldTypes.resourceName,
        outcome         : /^(success|failure|pending)$/,  // Fixed outcome values
        sourceIP        : FieldTypes.ipv4Type,
        auditVersion    : FieldTypes.semanticVersion,

        // other fields
        operationDetails: 'OperationDetails',
        errorMessage    : 'String?',                      // Free text error description
        correlationId   : FieldTypes.correlationId,
        environment     : FieldTypes.environment,
    }
}
