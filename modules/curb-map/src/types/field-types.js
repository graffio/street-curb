import cuid2 from '@paralleldrive/cuid2'

// prettier-ignore
const FieldTypes = {
    email          : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // email address format: a@b.com
    environment    : /^(development|test|staging|production)$/,          // our environment names
    event          : /^[a-z]+(\.[a-z]+)*\.[a-z_]+$/,                     // hierarchical event type: infrastructure.shell.execute
    ipv4Type       : /^(\d{1,3}\.){3}\d{1,3}$/,                          // IPv4 address format
    resourceName   : /^[a-z_]+$/,                                        // snake-case identifier
    semanticVersion: /^\d+\.\d+$/,                                       // semantic version format: 2.0
    timestamp      : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,    // ISO 8601 timestamp format

    auditRecordId  : /^aud_[a-z0-9]{12}$/,
    correlationId  : /^cor_[a-z0-9]{12}$/,
}

const cuid12 = cuid2.init({ length: 12 })

FieldTypes.newAuditRecordId = () => 'aud_' + cuid12()
FieldTypes.newCorrelationId = () => 'cor_' + cuid12()

export { FieldTypes }
