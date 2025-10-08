# Event Sourcing Architecture

## Core Pattern: Event Sourcing + Action Requests

```
Client (Online/Offline) → Firestore actionRequests → Giant Function → completedActions → Materialized Views
```

**Benefits**: Offline-first, SOC2-compliant audit trail, scalable multi-tenant architecture

### System Snapshot

- **Action Request Contract**: Each document in `actionRequests` carries
  `{id, eventId, action, idempotencyKey, actor, subject, organizationId, timestamps, status, outcome}`; mutable fields (`status`, `error`,
  `processedAt`) track orchestration state.
- **Processing Node**: A single-region Cloud Function subscribes to queue writes, enforces validation + authorization,
  and records audit metadata alongside results.
- **Audit Store**: Immutable `completedActions` collection partitioned by `{organizationId, projectId}`; append-only semantics
  maintain SOC2 audit guarantees. Each completed ActionRequest is copied verbatim to this collection.
- **Materialized Views**: Organization-scoped read models (Firestore collections or BigQuery exports) consume completed actions
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

### Immutable Audit Trail

Completed actions are the source of truth and cannot be modified once written:

```javascript
// completedActions collection - immutable audit trail
const completedActions = {
    eventId: {
        id: 'acr_<cuid12>',                // request ID
        eventId: 'evt_<cuid12>',           // permanent audit ID
        action: Action,                     // UserAdded | OrganizationAdded (tagged sum)
        organizationId: 'org_CUID2',
        projectId: 'prj_CUID2',
        actor: { id: 'usr_CUID2', type: 'user' | 'system' | 'api', },
        subject: { id: 'usr_CUID2', type: 'user' | 'organization' | 'project', },
        status: 'completed' | 'failed',
        error: 'string'?,
        idempotencyKey: 'idm_<cuid12>',
        correlationId: 'cor_CUID2',             // for client→server error tracking
        createdAt: 'serverTimestamp',       // when request was created
        processedAt: 'serverTimestamp',     // when processing finished
        schemaVersion: 1
    }
}
```

### Action Types

Actions represent domain events that can be requested:

- **UserAdded**: New user registration
- **UserUpdated**: User profile changes
- **UserForgotten**: GDPR/CCPA data deletion
- **RoleAssigned**: Permission changes
- **OrganizationAdded**: New organization setup
- **ProjectAdded**: New project within organization

## Action Request Processing Architecture

### Action Request Structure

```
// Firestore collection: actionRequests
{
  requestId: {
    id: 'acr_<cuid12>',               // request ID
    eventId: 'evt_<cuid12>',          // permanent audit ID (assigned on creation)
    actor: { id: 'usr_<cuid12>', type: 'user' },
    subject: { id: 'usr_<cuid12>', type: 'user' | 'organization' | 'project' },
    action: Action,                    // Action tagged sum (UserAdded | OrganizationAdded)
    organizationId: 'org_<cuid12>',
    projectId: 'prj_<cuid12>'?,
    idempotencyKey: 'idm_<cuid12>',
    status: 'pending' | 'completed' | 'failed',
    error: 'Permission denied'?,
    correlationId: 'cor_<cuid12>',
    createdAt: 'serverTimestamp',
    processedAt: 'serverTimestamp'?,
    schemaVersion: 1
  }
}
```

| Field            | Source Type / Definition                                         | Meaning                                                                            |
|------------------|------------------------------------------------------------------|------------------------------------------------------------------------------------|
| `id`             | `FieldTypes.actionRequestId` (`acr_<12>` )                       | Primary key for the request document                                               |
| `eventId`        | `FieldTypes.eventId` (`evt_<12>`)                                | Permanent audit ID (assigned on creation, used in completedActions)                |
| `actor`          | Written by `ActionRequest.toFirestore` (`{ id, type }`)          | Who initiated the action (currently always `type: 'user'`; service IDs come later) |
| `subject`        | `{ id, type }` object                                            | What entity is being affected by this action (SOC2 requirement)                    |
| `action`         | `Action` tagged sum (`modules/curb-map/type-definitions/action`) | Domain event payload (e.g., `UserAdded`, `OrganizationAdded`)                      |
| `organizationId` | `FieldTypes.organizationId`                                      | Organization scope (multi-tenant isolation)                                        |
| `projectId`      | `FieldTypes.projectId` (optional)                                | Project scope (optional sub-tenant)                                                |
| `idempotencyKey` | `FieldTypes.idempotencyKey` (`idm_<12>`)                         | Prevents duplicate processing                                                      |
| `status`         | pending/completed/failed                                         | Request processing state                                                           |
| `error`          | Optional string                                                  | Error message when processing fails (including authorization failures)             |
| `correlationId`  | `FieldTypes.correlationId` (`cor_<12>`)                          | Request tracing across client→server boundary                                      |
| `createdAt`      | Stored as Firestore `serverTimestamp`                            | When the request was created                                                       |
| `processedAt`    | Stored as Firestore `serverTimestamp`                            | When the processor finished (set on success/failure)                               |
| `schemaVersion`  | Integer                                                          | Schema version for future migrations                                               |

`ActionRequest` in `modules/curb-map/type-definitions/action-request.type.js` mirrors this shape on the client/server. The generated runtime type converts fields into the Firestore representation above. The `Action` tagged sum (created from `modules/curb-map/type-definitions/action.type.js`) defines the domain payload that is embedded in each request.

### Processing Flow

1. **Idempotency Check**: Prevent duplicate processing
2. **Input Validation**: Validate action data structure and business rules
3. **Authorization Check**: Verify user permissions
4. **Domain Processing**: Execute the action (create/update domain entities)
5. **Audit Recording**: Copy ActionRequest to `completedActions` collection (immutable)
6. **Materialized View Updates**: Update cached views
7. **Completion**: Mark request as completed in `actionRequests`

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

### Action-Specific Validation

```javascript
const validateActionData = (action) => {
    const tagName = action['@@tagName'];

    switch (tagName) {
    case 'UserAdded':
        if (!action.user?.email || !isValidEmail(action.user.email)) {
            return { valid: false, error: 'Invalid email address' };
        }
        if (!action.organizationId || typeof action.organizationId !== 'string') {
            return { valid: false, error: 'Valid organization ID required' };
        }
        break;

    case 'UserUpdated':
        if (!action.changes || typeof action.changes !== 'object') {
            return { valid: false, error: 'Changes object required' };
        }
        break;

    case 'UserForgotten':
        if (!action.reason || !['CCPA_request', 'GDPR_request'].includes(action.reason)) {
            return { valid: false, error: 'Valid reason required' };
        }
        break;
    }

    return { valid: true };
};
```

## Authorization Model

### Action Authorization

Actions require authorization before processing:

```javascript
const checkActionAuthorization = async (userId, action, organizationId) => {
    const userRoles = await getUserRoles(userId);
    const tagName = action['@@tagName'];

    switch (tagName) {
    case 'UserAdded':
        return userRoles.some(role =>
            role.organizationId === organizationId &&
            (role.role === 'admin' || role.permissions.includes('manage_users'))
        );

    case 'UserUpdated':
        return userRoles.some(role =>
            role.organizationId === organizationId &&
            (role.role === 'admin' || role.permissions.includes('manage_users'))
        );

    case 'UserForgotten':
        return userRoles.some(role =>
            role.organizationId === organizationId &&
            role.role === 'admin'
        );
    }

    return false;
};
```

## Materialized Views

### Purpose

- **Performance**: Pre-computed views for fast queries
- **Consistency**: Eventually consistent with completed actions
- **Caching**: Avoid replaying action history for common queries
- **UI Metadata**: Store created/updated timestamps and actors for domain entities

### Update Pattern

```javascript
const updateMaterializedViews = async (actionRequest) => {
    const action = actionRequest.action;
    const tagName = action['@@tagName'];

    switch (tagName) {
    case 'UserAdded':
        await createUserView(action, {
            createdBy: actionRequest.actor.id,
            createdAt: actionRequest.processedAt
        });
        break;
    case 'UserUpdated':
        await updateUserView(action, {
            updatedBy: actionRequest.actor.id,
            updatedAt: actionRequest.processedAt
        });
        break;
    case 'UserForgotten':
        await removeUserView(action);
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
const recordCompletedAction = async (actionRequest) => {
    // Copy the ActionRequest verbatim to completedActions (immutable)
    await admin.firestore()
        .collection('completedActions')
        .doc(actionRequest.eventId)
        .set({
            ...actionRequest,
            schemaVersion: 1
        });

    return actionRequest;
};
```

## Performance Considerations

### Event Compaction

- **Archive Old Events**: After creating snapshots
- **Snapshot Events**: Periodic snapshots to avoid replaying from beginning
- **Lazy Loading**: Only calculate from events when cache miss occurs

### Query Optimization

- **Indexes**: Index on organizationId, createdAt, status, action.@@tagName
- **Pagination**: Limit action queries to reasonable page sizes
- **Caching**: Cache frequently accessed materialized views

## Compliance Features

### Audit Trail

- **Complete History**: All changes tracked via completedActions collection
- **Immutable Log**: Completed actions cannot be modified (write-once)
- **User Attribution**: All actions tied to specific actors (users/systems/APIs)
- **Authorization Tracking**: Failed authorization attempts logged for forensics
- **SOC2 Compliance**: Meets enterprise audit requirements with actor, subject, timestamps, and correlation IDs

### Data Retention

- **Completed Actions Retention**: 7 years for compliance
- **Action Requests**: Can be purged after completion (operational data)
- **User Forgotten**: Complete data removal via UserForgotten action
- **Archive Strategy**: Long-term storage for compliance (Cloud Storage/BigQuery)

## References

- [Data Model](./data-model.md)
- [Security](./security.md)
- [Multi-Tenant](docs/architecture/multi-tenant.md)
