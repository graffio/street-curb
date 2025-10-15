# Event Sourcing Architecture

## Core Pattern: Event Sourcing + HTTP Action Submission

```
Client (Online) → HTTP Function → Validates → completedActions + Domain Collections
```

**Benefits**: Server-side validation, synchronous error feedback, SOC2-compliant audit trail, scalable multi-tenant architecture

**Note**: Offline queue for mobile apps deferred to backlog (see `specifications/backlog.md`)

### System Snapshot

- **HTTP Action Submission**: Clients call HTTP function with `{id, action, idempotencyKey, correlationId, projectId}` payload
- **Server-Side Validation**: HTTP function validates before any database write; rejects malformed requests with HTTP 400
- **Server-Side Enrichment**: HTTP function adds authoritative fields: `actorId` (from auth token), `subjectId`, `timestamps`
- **Processing**: Synchronous processing - validates → dispatches to handler → writes to domain collections
- **Audit Store**: Immutable `completedActions` collection with SOC2 audit trail; append-only semantics
- **Domain Collections**: Handlers write directly to `/organizations/{id}`, `/users/{id}`, `/organizations/{orgId}/projects/{id}`
- **No actionRequests Collection**: Removed - HTTP validates before write, cleaner audit trail
- **Idempotency**: Check `completedActions` for duplicate `idempotencyKey` before processing

### Decision Log

| Decision                                     | Status   | Rationale                                                                            | Trade-offs                                                              |
|----------------------------------------------|----------|--------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| HTTP functions over Firestore triggers       | Accepted | Validation before write, synchronous errors, cleaner audit trail, better security    | Requires offline queue for mobile (deferred); web app online-only      |
| Single handler dispatcher vs per-event functions | Accepted | Centralizes validation/auth, simplifies logging, one deployment surface           | Larger blast radius; mitigated via TAP + emulator regression suite      |
| Event sourcing pattern                       | Accepted | Immutable audit trail, rebuildable views, aligns with SOC2 controls                  | Higher complexity than CRUD; requires strong tooling + docs             |
| Transaction-based idempotency                | Accepted | Atomic duplicate detection, immutable audit trail, SOC2 compliance                  | Requires Firestore transactions; more complex than simple check-then-write |
| Handlers write to domain collections         | Accepted | Fast reads, no view-building lag, simpler architecture                               | Collections serve dual purpose (model + views); less separation         |
| Server-authoritative timestamps              | Accepted | Audit integrity, SOC2 compliance, prevents client clock manipulation                | Requires server timestamp calls; more complex than client timestamps    |
| HTTP 409 for duplicates                      | Accepted | Standard HTTP semantics, clear duplicate indication                                   | Breaking change from 200 + duplicate flag                              |
| Status field removal                          | Accepted | Simplified architecture, immutable completedActions only                             | Breaking change; requires migration of existing code                     |

## Event Sourcing Principles

### Immutable Audit Trail

**SOC2 Compliance Requirement**: Completed actions are the source of truth and **cannot be modified once written**. This immutability is critical for:
- Audit log integrity (no tampering)
- Regulatory compliance (SOC2 Type II)
- Forensic investigation
- Timestamp reliability

```javascript
// completedActions collection - immutable audit trail (write once)
const completedActions = {
    id: {
        id: 'acr_<cuid12>',                // action request ID (used as document ID)
        action: Action,                     // UserAdded | OrganizationAdded (tagged sum)
        organizationId: 'org_CUID2',
        projectId: 'prj_CUID2',
        actor: { id: 'usr_CUID2', type: 'user' | 'system' | 'api', },
        subject: { id: 'usr_CUID2', type: 'user' | 'organization' | 'project', },
        idempotencyKey: 'idm_<cuid12>',
        error: 'string'?,
        correlationId: 'cor_CUID2',             // for client→server error tracking
        createdAt: 'serverTimestamp',       // when request was created (server-authoritative)
        processedAt: 'serverTimestamp',     // when processing finished (server-authoritative)
        schemaVersion: 1
    }
}
```

**Implementation**: Transaction-based processing ensures atomic duplicate detection and single write (see "Transaction-Based Idempotency" section below).

### Action Types

Actions represent domain events that can be requested:

**Organization Actions (4)**:
- **OrganizationCreated**: New organization setup (renamed from OrganizationAdded)
- **OrganizationUpdated**: Organization name or status changes
- **OrganizationSuspended**: Suspend organization (shorthand for status change)
- **OrganizationDeleted**: Permanently delete organization

**User Actions (5)**:
- **UserCreated**: New user registration
- **UserUpdated**: User profile changes
- **UserDeleted**: Remove user from organization
- **UserForgotten**: GDPR/CCPA data deletion
- **RoleAssigned**: Assign/change user role in organization

**Projects**: Each organization gets a default project with real CUID2 ID (CRUD actions deferred to backlog)

## HTTP Action Submission Architecture

### HTTP Request/Response

**Client sends minimal payload**:
```javascript
POST /submitActionRequest
{
  id: 'acr_<cuid12>',              // Client-generated
  action: {
    '@@tagName': 'OrganizationCreated',
    organizationId: 'org_xyz',
    projectId: 'prj_abc',
    name: 'City of San Francisco'
  },
  idempotencyKey: 'idm_<cuid12>',  // Client-generated
  correlationId: 'cor_<cuid12>',   // Client-generated
  projectId: 'prj_abc'             // For context creation
}
```

**Server enriches with authoritative fields**:
```javascript
{
  id,
  action,
  actorId: auth.uid,                    // From Firebase Auth token
  subjectId: action.organizationId,     // Derived from action
  subjectType: 'organization',          // Derived from action type
  organizationId: action.organizationId,
  projectId,
  idempotencyKey,
  correlationId,
  schemaVersion: 1,
  createdAt: serverTimestamp(),        // Server-authoritative timestamp
  processedAt: serverTimestamp()       // Server-authoritative timestamp
}
```

**Success response (HTTP 200)**:
```javascript
{
  status: 'completed',
  id: 'acr_xyz',
  processedAt: '2025-01-15T10:30:00Z'
}
```

**Duplicate response (HTTP 409)**:
```javascript
{
  status: 'duplicate',
  message: 'Already processed',
  processedAt: '2025-01-15T10:30:00Z'
}
```

**Error response (HTTP 400)**:
```javascript
{
  status: 'validation-failed',
  error: 'Invalid status: must be "active" or "suspended"',
  field: 'action.status'
}
```

**Handler error response (HTTP 500)**:
```javascript
{
  status: 'error',
  message: 'Action processing failed',
  error: 'Simulated handler failure',
  handler: 'handleOrganizationCreated'
}
```

### Processing Flow

1. **HTTP Request**: Client calls submitActionRequest HTTP function
2. **Authentication**: Validate Firebase Auth token (F110.5) or use emulator bypass
3. **Validation**: Validate action data structure using `ActionRequest.from()`
4. **Transaction-Based Processing**: Use Firestore transaction for atomic duplicate detection and processing
5. **Authorization Check**: Verify user permissions (F110.5)
6. **Domain Processing**: Dispatch to handler → handler writes to domain collections
7. **Audit Recording**: Write to `completedActions` (immutable) with server timestamps
8. **HTTP Response**: Return success/failure synchronously

## Idempotency Pattern

### Idempotency Key

- **Purpose**: Prevent duplicate event processing
- **Format**: CUID2 (`idm_<12 chars>`)
- **Storage**: `completedActions` collection (no separate collection needed)
- **Lifetime**: Permanent (for audit trail)

### Transaction-Based Idempotency

**Problem**: Simple check-then-write has race conditions. Writing "pending" then updating to "completed" violates immutability.

**Solution**: Use Firestore transactions for atomic duplicate detection and single write as "completed".

```javascript
// Transaction-based idempotency with single write
// actionRequest.id is used as document ID (converted from idempotencyKey: idm_xxx → acr_xxx)
const result = await db.runTransaction(async (tx) => {
  // Create transaction-aware context (scoped to this transaction)
  const txContext = createFirestoreContext(namespace, orgId, projectId, tx)

  // Check for duplicate within transaction (atomic)
  // Use readOrNull() which returns null instead of throwing when document doesn't exist
  const existing = await txContext.completedActions.readOrNull(actionRequest.id)
  if (existing) {
    // Duplicate path: return processedAt from existing record (Timestamp → Date → ISO string)
    return {
      duplicate: true,
      processedAt: existing.processedAt.toISOString()
    }
  }

  // Process action with transaction-aware facades
  await handler(logger, txContext, actionRequest)

  // Single write as completed action (immutable) with server-authoritative timestamps
  const serverTimestamp = FirestoreAdminFacade.serverTimestamp
  await txContext.completedActions.create({
    ...actionRequest,
    createdAt: serverTimestamp(),
    processedAt: serverTimestamp()
  })

  // Success path: return nothing (processedAt must be read after transaction commits)
  return { duplicate: false }
})

// Return appropriate HTTP response (AFTER transaction completes)
if (result.duplicate) {
  // HTTP 409 Conflict - duplicate idempotency key
  // Breaking change: Previously returned 200 + duplicate: true
  return res.status(409).json({
    status: 'duplicate',
    message: 'Already processed',
    processedAt: result.processedAt  // ISO string from duplicate branch
  })
}

// HTTP 200 Success - read completed action to get actual processedAt timestamp
// Must create new non-transactional context (txContext is out of scope)
const fsContext = createFirestoreContext(namespace, orgId, projectId)
const completed = await fsContext.completedActions.read(actionRequest.id)
return res.status(200).json({
  status: 'completed',
  processedAt: completed.processedAt.toISOString()  // Firestore Timestamp → Date → ISO string
})
```

**Benefits**:
- **Atomic**: Duplicate detection and write happen atomically
- **Immutable**: Single write as completed action - no mutations
- **SOC2 Compliant**: Audit trail never modified after write
- **Crash-Safe**: All or nothing - no partial states
- **Server Timestamps**: All timestamps are server-authoritative for audit integrity

### Firestore Admin Facade Transaction Support

The `firestore-admin-facade.js` accepts an optional transaction parameter, allowing handlers to work in both regular and transaction modes transparently:

```javascript
const FirestoreAdminFacade = (Type, prefix, db, collectionOverride, tx = null) => {
  const write = async record => {
    // Tagged type pattern: always instantiate from raw data
    if (!Type.is(record)) record = Type.from(record)
    const firestoreData = encodeTimestamps(Type.toFirestore(record))

    if (tx) {
      // Transaction mode - synchronous set
      tx.set(_docRef(record.id), firestoreData)
    } else {
      // Regular mode - async set
      await _docRef(record.id).set(firestoreData)
    }
  }

  const read = async id => {
    const docSnap = tx
      ? await tx.get(_docRef(id))     // Transaction mode
      : await _docRef(id).get()        // Regular mode

    if (!docSnap.exists) throw new Error(`${Type.toString()} not found: ${id}`)

    const rawData = docSnap.data()
    const decoded = decodeTimestamps(rawData, Type.timestampFields)
    return Type.fromFirestore(decoded)  // Tagged type pattern
  }

  const readOrNull = async id => {
    const docSnap = tx
      ? await tx.get(_docRef(id))     // Transaction mode
      : await _docRef(id).get()        // Regular mode

    if (!docSnap.exists) return null   // Return null instead of throwing

    const rawData = docSnap.data()
    const decoded = decodeTimestamps(rawData, Type.timestampFields)
    return Type.fromFirestore(decoded)  // Tagged type pattern
  }

  // create, update, delete follow same pattern
  return { write, read, create, update, delete, ... }
}
```

**Tagged Type Pattern**: Always instantiate tagged types from raw data before use - never reuse raw data. This ensures validation runs consistently.

### Context Creation

```javascript
const createFirestoreContext = (namespace, orgId, projectId, tx = null) => {
  return {
    completedActions: FirestoreAdminFacade(ActionRequest, namespace, db, 'completedActions', tx),
    organizations: FirestoreAdminFacade(Organization, namespace, db, null, tx),
    users: FirestoreAdminFacade(User, namespace, db, null, tx),
    projects: FirestoreAdminFacade(Project, namespace, db, null, tx),
  }
}
```

Handlers receive the same interface regardless of transaction mode - no code changes needed.

**Note**: Idempotency check uses `completedActions` collection instead of maintaining separate `processed_operations` collection. This simplifies architecture and reuses existing audit trail.

## Event Validation

### Structure Validation

- **Required Fields**: Validate all required fields are present
- **Type Validation**: Ensure correct data types
- **Format Validation**: Validate email addresses, IDs, etc.

### Business Rule Validation (Simplified for MVP)

- **Required Fields**: name (organizations), email/displayName (users)
- **Enum Validation**: status ("active" | "suspended"), role ("admin" | "member" | "viewer")
- **Email Format**: Basic regex validation for user emails
- **Organization Scoping**: Events must be scoped to valid organization
- **Permission Checks**: Deferred to F110.5 (authorization logic in HTTP function code; Admin SDK bypasses Firestore security rules)

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

## Domain Collections (Materialized Views)

### Purpose

Handlers write directly to domain collections, which serve dual purpose:
1. **Domain Model Storage**: Source of truth for organizations, users, projects
2. **Queryable Views**: UI can query these collections immediately

### Collections

- `/organizations/{id}` - Written by Organization handlers
- `/users/{id}` - Written by User handlers
- `/organizations/{orgId}/projects/{id}` - Written by Organization handlers (default project)

### Handler Pattern

```javascript
const handleOrganizationCreated = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest;
    const { organizationId, projectId, name } = action;

    // Add metadata from actionRequest
    const metadata = {
        createdAt: fsContext.serverTimestamp(),
        createdBy: actionRequest.actorId,
        updatedAt: fsContext.serverTimestamp(),
        updatedBy: actionRequest.actorId
    };

    // Write to domain collection
    const organization = {
        id: organizationId,
        name,
        status: 'active',
        defaultProjectId: projectId,
        ...metadata
    };

    await fsContext.organizations.write(organization);
};
```

**Benefits**:
- No lag between action completion and view availability
- Simpler architecture (no separate view-building trigger)
- Metadata included (createdAt, createdBy, updatedAt, updatedBy)
- Immediately queryable

**Note**: F110.6 (Materialized Views) specification is obsolete - this functionality is already built into F110 handlers.

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
        .doc(actionRequest.id)
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

- **Completed Actions Retention**: 7 years for SOC2 compliance
- **Domain Collections**: Retain as long as entity exists (organizations, users, projects)
- **User Forgotten**: Complete data removal via UserForgotten action (GDPR/CCPA)
- **Archive Strategy**: Long-term storage for compliance (Cloud Storage/BigQuery)

**Note**: No actionRequests collection to purge - HTTP validates before write.

## References

- [Data Model](./data-model.md)
- [Security](./security.md)
- [Multi-Tenant](docs/architecture/multi-tenant.md)
