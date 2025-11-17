import cuid2 from '@paralleldrive/cuid2'

const cuid12 = cuid2.init({ length: 12 })

// prettier-ignore
const FieldTypes = {
    email            : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // email address format: a@b.com
    environment      : /^(development|test|staging|production)$/, // Our environment names
    event            : /^[a-z]+(\.[a-z]+)*\.[a-z_]+$/, // Hierarchical event type: infrastructure.shell.execute
    ipv4Type         : /^(\d{1,3}\.){3}\d{1,3}$/, // IPv4 address format
    resourceName     : /^[a-z_]+$/, // snake-case identifier
    role             : /^(admin|member|viewer)$/, // Organization member role
    semanticVersion  : /^\d+\.\d+$/, // Semantic version format: 2.0
    timestamp        : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, // ISO 8601 timestamp format
    
    
    actionRequestId  : /^acr_[a-z0-9]{12,}$/,
    actorId          : /^usr_[a-z0-9]{12,}$/, // an actor is a user; some day it might some automated back-end processor
    auditRecordId    : /^aud_[a-z0-9]{12,}$/,
    correlationId    : /^cor_[a-z0-9]{12,}$/,
    eventId          : /^evt_[a-z0-9]{12,}$/, // permanent audit event ID
    idempotencyKey   : /^idm_[a-z0-9]{12,}$/,
    organizationId   : /^org_[a-z0-9]{12,}$/,
    projectId        : /^prj_[a-z0-9]{12,}$/,
    subjectId        : /^(usr|org|prj)_[a-z0-9]{12,}$/, // subject can be user, organization, or project
    userId           : /^usr_[a-z0-9]{12,}$/,

    newActionRequestId: () => `acr_${cuid12()}`,
    newAuditRecordId  : () => `aud_${cuid12()}`,
    newBlockfaceId    : () => `blk_${cuid12()}`,
    newCorrelationId  : () => `cor_${cuid12()}`,
    newEventId        : () => `evt_${cuid12()}`,
    newIdempotencyKey : () => `idm_${cuid12()}`,
    newOrganizationId : () => `org_${cuid12()}`,
    newProjectId      : () => `prj_${cuid12()}`,
    newUserId         : () => `usr_${cuid12()}`,
}

export { FieldTypes }
