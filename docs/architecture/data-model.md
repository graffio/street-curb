# Data Model Architecture

## Core Pattern: Event Sourcing + HTTP Action Submission

```
Client → HTTP Function → Validates → completedActions + Domain Collections
```

**Benefits**: Server-side validation, synchronous error feedback, SOC2-compliant audit trail, scalable multi-tenant architecture

## Collection Hierarchy

### Flat Collections (Event Source & Domain Collections)
- **Event Source**: `/completedActions/{id}` - flat with organizationId fields
- **Domain Collections**: `/organizations/{id}`, `/users/{id}` - flat with organizationId fields
- **Rationale**: SOC2 audit trail, cross-org queries, performance

### Hierarchical Collections (Projects & Domain Data)
- **Projects**: `/organizations/{orgId}/projects/{projId}` - hierarchical under organizations
- **Domain Data**: `/organizations/{orgId}/projects/{projId}/surveys/{id}`, etc.
- **Rationale**: Data isolation, cascade deletes, clearer ownership, simpler security rules

## Event Sourcing Pattern

### Completed Actions (Source of Truth)
Completed actions are immutable and provide the complete audit trail:

```
// completedActions collection - immutable audit trail
completedActions: {
  id: {
    id: "acr_<cuid12>",                // action request ID (used as document ID)
    action: Action,                     // UserAdded | OrganizationAdded (tagged sum)
    organizationId: "org_<cuid12>",
    projectId: "prj_<cuid12>",         // optional
    actor: {
      type: "user" | "system" | "api",
      id: "usr_<cuid12>"
    },
    subject: {
      type: "user" | "organization" | "project",
      id: "usr|org|prj_<cuid12>"
    },
    // No status field - all completedActions are completed
    idempotencyKey: "idm_<cuid12>",
    correlationId: "cor_<cuid12>",     // for client→server error tracking
    createdAt: "serverTimestamp",       // when request was created
    processedAt: "serverTimestamp",     // when processing finished
    schemaVersion: 1
  }
}
```

### Action Types
Actions represent domain events that can be requested:

**Organization Actions (4)**:
- **OrganizationCreated**: New organization setup
- **OrganizationUpdated**: Organization name or status changes
- **OrganizationSuspended**: Suspend organization (shorthand for status change)
- **OrganizationDeleted**: Permanently delete organization

**User Actions (5)**:
- **UserCreated**: New user registration
- **UserUpdated**: User profile changes
- **UserDeleted**: Remove user from organization
- **UserForgotten**: GDPR/CCPA data deletion
- **RoleAssigned**: Assign/change user role

**Projects**: Each organization gets a default project with real CUID2 ID (CRUD actions deferred to backlog)

## Domain Collections (Current State)

### Organizations
```javascript
// Organizations - written directly by handlers
organizations: {
  organizationId: {
    id: "org_xyz",                       // FieldTypes.newOrganizationId()
    name: "City of San Francisco",
    status: "active" | "suspended",      // initialized to "active"
    defaultProjectId: "prj_abc123",      // links to default project (real CUID2)
    createdAt: timestamp,                // serverTimestamp
    createdBy: "usr_abc",                // from actionRequest.actorId
    updatedAt: timestamp,                // serverTimestamp
    updatedBy: "usr_abc"                 // from actionRequest.actorId

    // Deferred to F112 (Billing):
    // subscription: {tier, annualAmount, startDate, endDate}

    // Deferred to backlog:
    // settings: {ssoEnabled, ssoProvider, auditLogRetention}
  }
}
```

### Users
```javascript
// Users - written directly by handlers
users: {
  userId: {
    id: "usr_abc",                       // FieldTypes.newUserId()
    email: "alice@sf.gov",
    displayName: "Alice Johnson",
    organizations: {
      "org_xyz": "admin"                 // simple role enum: admin | member | viewer
    },
    lastLogin: timestamp | null,         // for F110.5 auth tracking (initialized null)
    failedAttempts: 0,                   // for F110.5 brute force prevention
    createdAt: timestamp,                // serverTimestamp
    createdBy: "usr_abc",                // from actionRequest.actorId
    updatedAt: timestamp,                // serverTimestamp
    updatedBy: "usr_abc"                 // from actionRequest.actorId

    // Deferred to F110.5+ (granular permissions):
    // permissions: ["organizations:read", "projects:write", "users:manage"]

    // Deferred to backlog (analytics):
    // lastAccess: {orgId: timestamp}
  }
}
```

### Projects
```javascript
// Projects - default project per organization
// Hierarchical structure: /organizations/{orgId}/projects/{projectId}/
// Project CRUD actions deferred to backlog

projects: {
  "prj_abc123": {                  // Real CUID2 ID (not "default" magic string)
    id: "prj_abc123",              // FieldTypes.newProjectId() - real CUID2
    organizationId: "org_xyz",
    name: "Default Project",
    createdAt: timestamp,          // serverTimestamp
    createdBy: "usr_abc",          // from actionRequest.actorId
    updatedAt: timestamp,          // serverTimestamp
    updatedBy: "usr_abc"           // from actionRequest.actorId
  }
}

// Found via: organization.defaultProjectId

// When projects are added (backlog):
// ProjectCreated, ProjectUpdated, ProjectArchived, ProjectDeleted actions
// No migration needed - hierarchical structure already in place
```

## Multi-Tenant Data Model

### Organization Hierarchy
```
Organization
├── Members (Users)
├── Projects
│   ├── Data Collections
│   └── Reports
└── Settings
```

### Data Isolation
- **Complete Isolation**: Organizations cannot access each other's data
- **Event Scoping**: All events scoped to organization
- **Materialized View Scoping**: Views filtered by organization
- **Security Rules**: Firestore rules enforce isolation

## HTTP Action Processing

### Processing Flow
1. **HTTP Request**: Client calls submitActionRequest HTTP function
2. **Authentication**: Validate Firebase Auth token (F110.5) or use emulator bypass
3. **Validation**: Validate action data structure using `ActionRequest.from()`
4. **Transaction-Based Processing**: Use Firestore transaction for atomic duplicate detection and processing
5. **Authorization Check**: Verify user permissions (F110.5)
6. **Domain Processing**: Dispatch to handler → handler writes to domain collections
7. **Audit Recording**: Write to `completedActions` (immutable) with server timestamps
8. **HTTP Response**: Return success/failure synchronously

### Idempotency
- **Duplicate Detection**: Check `completedActions` for existing `idempotencyKey` before processing
- **Atomic Processing**: Use Firestore transactions to prevent race conditions
- **HTTP 409 Response**: Return HTTP 409 for duplicate requests (breaking change from HTTP 200 + duplicate flag)

## Schema Versioning

### Event Versioning
```javascript
// Completed actions include schema version for migrations
{
  id: {
    action: { '@@tagName': "UserAdded", /* ... */ },
    schemaVersion: 1,
    // ... rest of action request
  }
}
```

### Migration Strategy
- **Immutable Completed Actions**: Completed actions never change once created
- **New Event Types**: Add new event types for schema changes
- **Backward Compatibility**: Event processors handle multiple versions
- **Migration Events**: Special events for data transformations

## Data Consistency

## Performance Considerations

### Indexing Strategy
- **Event Queries**: Index on organizationId, timestamp, type
- **Domain Collections**: Index on frequently queried fields
- **Completed Actions**: Index on idempotencyKey, organizationId, createdAt

### Caching
- **Domain Collections**: Written directly by handlers for immediate availability
- **User Sessions**: Cached authentication state
- **Organization Data**: Cached for quick access

## Compliance

### Audit Trail
- **Complete History**: All changes tracked via events
- **Immutable Log**: Events cannot be modified
- **User Attribution**: All actions tied to specific users
- **SOC2 Compliance**: Meets enterprise audit requirements

### Data Retention
- **Event Retention**: 7 years for compliance
- **User Forgotten**: Complete data removal via UserForgotten action (GDPR/CCPA)
- **Archive Strategy**: Long-term storage for compliance

**Note**: No actionRequests collection to purge - HTTP validates before write.

## References

- **F107 Implementation**: See `specifications/F107-firebase-soc2-vanilla-app/phase2-events.md`
- **Security Model**: See `docs/architecture/security.md`
- **Authentication**: See `docs/architecture/authentication.md`
