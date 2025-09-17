// prettier-ignore
const FieldTypes = {
    correlationId  : /^\d{3}-[a-z-]+:[a-z0-9]{6}$/,                       // Migration format: 003-configure-auth:<CUID2>
    email          : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,  // email address format: a@b.com
    environment    : /^(development|test|staging|production)$/,           // Our environment names
    event          : /^[a-z]+(\.[a-z]+)*\.[a-z_]+$/,                      // Hierarchical event type: infrastructure.shell.execute
    ipv4Type       : /^(\d{1,3}\.){3}\d{1,3}$/,                           // IPv4 address format
    resourceName   : /^[a-z_]+$/,                                         // snake-case identifier
    semanticVersion: /^\d+\.\d+$/,                                        // Semantic version format: 2.0
    timestamp      : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,     // ISO 8601 timestamp format
}

export { FieldTypes }
