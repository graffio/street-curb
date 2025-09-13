/**
 * AuditRecord represents a SOC2-compliant infrastructure audit log entry
 * @sig AuditRecord :: {
 *   timestamp: String,
 *   eventType: String,
 *   userId: String,
 *   resource: String,
 *   action: String,
 *   outcome: String,
 *   sourceIP: String,
 *
 *   operationDetails: OperationDetails?,
 *   errorMessage: String?,
 *   sessionId: String?,
 *   environment: String?,
 *   migrationId: String?,
 *   auditVersion: String
 * }
 */

export const AuditRecord = {
    name: 'AuditRecord',
    kind: 'tagged',
    fields: {
        // SOC2 Required Fields (always flat strings for compliance queries)
        timestamp: 'String',
        eventType: 'String',
        userId: 'String',
        resource: 'String',
        action: 'String',
        outcome: 'String', // "success" | "failure" | "pending"
        sourceIP: 'String',

        // Operation Details (structured, stored as JSON)
        operationDetails: 'OperationDetails?',
        errorMessage: 'String?', // If outcome = "failure"

        // Correlation Context
        sessionId: 'String?',
        environment: 'String?', // "dev" | "staging" | "prod"
        migrationId: 'String?', // Migration that triggered this operation
        auditVersion: 'String', // Schema version for evolution
    },
}
