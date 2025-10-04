# Event Sourcing Architecture

## Core Pattern: Event Sourcing + Queue

```
Client (Online/Offline) → Firestore Queue → Giant Function → Events → Materialized Views
```

**Benefits**: Offline-first, SOC2-compliant audit trail, scalable multi-tenant architecture

### System Snapshot

- **Queue Contract**: Each document in `update_queue` carries
  `{queueItemId, eventType, payload, idempotencyKey, actor, timestamps, status}`; mutable fields (`status`, `error`,
  `processedAt`) track orchestration only.
- **Processing Node**: A single-region Cloud Function subscribes to queue writes, enforces validation + authorization,
  and records audit metadata alongside results.
- **Event Store**: Immutable `events` collection partitioned by `{organizationId, projectId}`; append-only semantics
  maintain SOC2 audit guarantees.
- **Materialized Views**: Organization-scoped read models (Firestore collections or BigQuery exports) consume events
  idempotently and log last processed `eventId`.
- **Idempotency**: CUID2-based keys persisted in `processed_operations` avoid duplicate processing even under
  at-least-once delivery.

### Decision Log

| Decision                                     | Status   | Rationale                                                                            | Trade-offs                                                              |
|----------------------------------------------|----------|--------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| Single giant function vs per-event functions | Accepted | Centralizes throttling, simplifies logging/metrics, one deployment surface           | Larger blast radius; mitigated via TAP + emulator regression suite      |
| Firestore queue over Pub/Sub                 | Accepted | Keeps local dev simple, shares security model with app data, supports offline writes | Lacks managed dead-letter queue; compensated with retry/status tracking |
| Event sourcing pattern                       | Accepted | Immutable audit trail, rebuildable views, aligns with SOC2 controls                  | Higher complexity than CRUD; requires strong tooling + docs             |
| Idempotency via per-actor keys               | Accepted | Prevents accidental duplicate events, audit friendly                                 | Requires read-before-write and extra index costs                        |
| Materialized views in Firestore (phase 1)    | Accepted | Fast app reads, minimal ops overhead initially                                       | May hit limits; plan migration to BigQuery for heavy analytics          |

## Event Sourcing Principles

### Immutable Events

Events are the source of truth and cannot be modified once created:

```javascript
// Events collection - immutable audit trail
const events = {
    eventId: {
        type: 'UserCreated' | 'UserUpdated' | 'UserForgotten' | 'RoleAssigned',
        organizationId: 'CUID2',
        projectId: 'CUID2',
        actor: { id: 'CUID2', type: 'user' | 'system' | 'api', },
        subject: { id: 'CUID2', type: 'user' | 'organization' | 'project', },
        data: { /* event-specific data */ },
        timestamp: 'ISO string',
        correlationId: 'CUID2', // for client→server error tracking
        schemaVersion: 1
    }
}
```

### Event Types

- **UserCreated**: New user registration
- **UserUpdated**: User profile changes
- **UserForgotten**: GDPR/CCPA data deletion
- **RoleAssigned**: Permission changes
- **OrganizationCreated**: New organization setup
- **ProjectCreated**: New project within organization

## Queue Processing Architecture

### Queue Structure

```
// Firestore collection: update_queue
{
  queueId: {
    id: 'que_<cuid12>',
    actor: { id: 'usr_<cuid12>', type: 'user' },
    action: '{...}',                  // JSON stringified Action tagged sum
    idempotencyKey: 'idm_<cuid12>',
    status: 'pending' | 'completed' | 'failed',
    resultData: { eventId: 'evt_<…>' }?,
    error: 'Permission denied'?,
    createdAt: 'serverTimestamp',
    processedAt: 'serverTimestamp'?
  }
}
```

| Field            | Source Type / Definition                                         | Meaning                                                                            |
|------------------|------------------------------------------------------------------|------------------------------------------------------------------------------------|
| `id`             | `FieldTypes.queueItemId` (`que_<12>` )                           | Primary key for the queue document                                                 |
| `actor`          | Written by `QueueItem.toFirestore` (`{ id, type }`)              | Who initiated the action (currently always `type: 'user'`; service IDs come later) |
| `action`         | `Action` tagged sum (`modules/curb-map/type-definitions/action`) | Domain event payload (e.g., `UserAdded`, `OrganizationAdded`)                      |
| `idempotencyKey` | `FieldTypes.idempotencyKey` (`idm_<12>`)                         | Prevents duplicate processing                                                      |
| `status`         | pending/completed/failed                                         | Queue orchestration state                                                          |
| `resultData`     | Optional object                                                  | Data returned by the processor (e.g., `{ eventId }`)                               |
| `error`          | Optional string                                                  | Error message when processing fails                                                |
| `createdAt`      | Stored as Firestore `serverTimestamp`                            | When the item was enqueued                                                         |
| `processedAt`    | Stored as Firestore `serverTimestamp`                            | When the processor finished (set on success/failure)                               |

`QueueItem` in `modules/curb-map/type-definitions/queue-item.type.js` mirrors this shape on the client/server. The generated runtime type converts `actorId`, `action`, `createdAt`, etc. into the Firestore representation above. The `Action` tagged sum (created from `modules/curb-map/type-definitions/action.type.js`) defines the event payload that ultimately lands in the immutable `events/` collection.

### Processing Flow

1. **Idempotency Check**: Prevent duplicate processing
2. **Input Validation**: Validate event data structure and business rules
3. **Authorization Check**: Verify user permissions
4. **Event Creation**: Create immutable event
5. **Materialized View Updates**: Update cached views
6. **Completion**: Mark queue item as completed

## Idempotency Pattern

### Idempotency Key

- **Purpose**: Prevent duplicate event processing
- **Format**: CUID2
- **Storage**: `processed_operations` collection
- **Lifetime**: Permanent (for audit trail)

### Implementation

```javascript
// Check if operation already processed
const checkIdempotencyKey = async (key) => {
    const doc = await admin.firestore()
        .collection('processed_operations')
        .doc(key)
        .get();
    
    return doc.exists ? doc.data().result : null;
};

// Store idempotency result
const storeIdempotencyResult = async (key, result) => {
    await admin.firestore()
        .collection('processed_operations')
        .doc(key)
        .set({
            result,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
};
```

## Event Validation

### Structure Validation

- **Required Fields**: Validate all required fields are present
- **Type Validation**: Ensure correct data types
- **Format Validation**: Validate email addresses, IDs, etc.

### Business Rule Validation

- **Role Assignment**: Admin roles require justification
- **Organization Scoping**: Events must be scoped to valid organization
- **Permission Checks**: User must have permission to create event type

### Event-Specific Validation

```javascript
const validateEventData = (eventType, data) => {
    switch (eventType) {
    case 'UserCreated':
        if (!data.email || !isValidEmail(data.email)) {
            return { valid: false, error: 'Invalid email address' };
        }
        if (!data.organizationId || typeof data.organizationId !== 'string') {
            return { valid: false, error: 'Valid organization ID required' };
        }
        break;
    
    case 'UserUpdated':
        if (!data.changes || typeof data.changes !== 'object') {
            return { valid: false, error: 'Changes object required' };
        }
        break;
    
    case 'UserForgotten':
        if (!data.reason || !['CCPA_request', 'GDPR_request'].includes(data.reason)) {
            return { valid: false, error: 'Valid reason required' };
        }
        break;
    }
    
    return { valid: true, data };
};
```

## Authorization Model

### Event Authorization

Events require authorization before creation:

```javascript
const checkEventAuthorization = async (userId, eventType, data) => {
    const userRoles = await getUserRoles(userId);
    
    switch (eventType) {
    case 'UserCreated':
        return userRoles.some(role =>
            role.organizationId === data.organizationId &&
            (role.role === 'admin' || role.permissions.includes('manage_users'))
        );
    
    case 'UserUpdated':
        return userRoles.some(role =>
            role.organizationId === data.organizationId &&
            (role.role === 'admin' || role.permissions.includes('manage_users'))
        );
    
    case 'UserForgotten':
        return userRoles.some(role =>
            role.organizationId === data.organizationId &&
            role.role === 'admin'
        );
    }
    
    return false;
};
```

## Materialized Views

### Purpose

- **Performance**: Pre-computed views for fast queries
- **Consistency**: Eventually consistent with events
- **Caching**: Avoid replaying event history for common queries

### Update Pattern

```javascript
const updateMaterializedViews = async (event) => {
    switch (event.type) {
    case 'UserCreated':
        await updateUserView(event);
        break;
    case 'UserUpdated':
        await updateUserView(event);
        break;
    case 'UserForgotten':
        await removeUserView(event);
        break;
    }
};
```

## Schema Versioning

### Version Management

- **Schema Version**: Add `schemaVersion` field to events
- **Backward Compatibility**: Event processors handle multiple versions
- **Migration Events**: Special events for data transformations
- **Deprecation**: Mark old versions deprecated, remove support after reasonable period

### Implementation

```javascript
const createEvent = async (eventData) => {
    const event = {
        eventId: createId(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        schemaVersion: 1,
        ...eventData
    };
    
    await admin.firestore()
        .collection('events')
        .doc(event.eventId)
        .set(event);
    
    return event;
};
```

## Performance Considerations

### Event Compaction

- **Archive Old Events**: After creating snapshots
- **Snapshot Events**: Periodic snapshots to avoid replaying from beginning
- **Lazy Loading**: Only calculate from events when cache miss occurs

### Query Optimization

- **Indexes**: Index on organizationId, timestamp, type
- **Pagination**: Limit event queries to reasonable page sizes
- **Caching**: Cache frequently accessed materialized views

## Compliance Features

### Audit Trail

- **Complete History**: All changes tracked via events
- **Immutable Log**: Events cannot be modified
- **User Attribution**: All actions tied to specific users
- **SOC2 Compliance**: Meets enterprise audit requirements

### Data Retention

- **Event Retention**: 7 years for compliance
- **User Forgotten**: Complete data removal via events
- **Archive Strategy**: Long-term storage for compliance

## References

- [Data Model](./data-model.md)
- [Security](./security.md)
- [Multi-Tenant](docs/architecture/multi-tenant.md)
