# Data Model Architecture

## Core Pattern: Event Sourcing + Materialized Views

```
Client (Online/Offline) → Firestore actionRequests → Giant Function → completedActions → Materialized Views
```

**Benefits**: Offline-first, SOC2-compliant audit trail, scalable multi-tenant architecture

## Collection Hierarchy

### Flat Collections (Event Source & Materialized Views)
- **Event Source**: `/actionRequests/{id}`, `/completedActions/{id}` - flat with organizationId fields
- **Materialized Views**: `/organizations/{id}`, `/users/{id}` - flat with organizationId fields
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
    status: "completed" | "failed",
    error: "string"?,                   // error message if failed
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

## Materialized Views (Performance)

### Organizations
```javascript
// Organizations - cached from events
organizations: {
  organizationId: {
    name: "City of San Francisco",
    status: "active" | "suspended",  // initialized to "active"
    defaultProjectId: "prj_abc123",  // links to default project (real CUID2)
    createdAt: timestamp,             // serverTimestamp
    createdBy: "usr_456",             // from actionRequest.actorId
    updatedAt: timestamp,             // serverTimestamp
    updatedBy: "usr_456"              // from actionRequest.actorId

    // Deferred to F112 (Billing):
    // subscription: {tier, annualAmount, startDate, endDate}

    // Deferred to backlog:
    // settings: {ssoEnabled, ssoProvider, auditLogRetention}
  }
}
```

### Users
```
// Users - cached from events
users: {
  userId: {
    email: "alice@sf.gov",
    displayName: "Alice Johnson",
    organizations: {
      "org_123": "admin",  // simple role enum: admin | member | viewer
      "org_456": "member"
    },
    lastLogin: timestamp | null,  // for auth tracking (initialized null)
    failedAttempts: 0,            // for brute force prevention
    createdAt: timestamp,         // serverTimestamp
    createdBy: "usr_456",         // from actionRequest.actorId
    updatedAt: timestamp,         // serverTimestamp
    updatedBy: "usr_456"          // from actionRequest.actorId

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
    organizationId: "org_123",
    name: "Default Project",
    createdAt: timestamp,          // serverTimestamp
    createdBy: "usr_456",          // from actionRequest.actorId
    updatedAt: timestamp,          // serverTimestamp
    updatedBy: "usr_456"           // from actionRequest.actorId
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

## Action Request Processing

### Action Requests Collection
```javascript
// actionRequests collection for offline support (mutable operational data)
actionRequests: {
  id: {
    id: "acr_<cuid12>",                 // action request ID (used as document ID)
    action: Action,                      // Action tagged sum (UserAdded | OrganizationAdded)
    actorId: "usr_<cuid12>",
    subjectId: "usr|org|prj_<cuid12>",
    subjectType: "user" | "organization" | "project",
    organizationId: "org_<cuid12>",
    projectId: "prj_<cuid12>"?,
    idempotencyKey: "idm_<cuid12>",
    correlationId: "cor_<cuid12>",
    status: "pending" | "completed" | "failed",
    resultData: { /* success data like created entity IDs */ }?,
    error: "string"?,
    createdAt: "serverTimestamp",
    processedAt: "serverTimestamp"?,
    schemaVersion: 1
  }
}
```

### Giant Function Processing
- **Action Processing**: Execute requested actions and create immutable audit records
- **Idempotency**: Prevent duplicate processing using idempotencyKey
- **Audit Recording**: Copy completed ActionRequest to completedActions collection (immutable)
- **Materialized View Updates**: Update cached views from completed actions
- **Error Handling**: Mark failed requests with error messages for forensics

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

### Eventual Consistency
- **Action Request Processing**: Asynchronous event processing
- **Materialized Views**: Eventually consistent with events
- **Client Updates**: Optimistic updates with conflict resolution

### Conflict Resolution
- **Last Writer Wins**: For simple conflicts
- **Event Ordering**: Timestamp-based ordering
- **Manual Resolution**: Complex conflicts require human intervention

## Performance Considerations

### Indexing Strategy
- **Event Queries**: Index on organizationId, timestamp, type
- **Materialized Views**: Index on frequently queried fields
- **Action Request Processing**: Index on status, createdAt

### Caching
- **Materialized Views**: Pre-computed for performance
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
- **User Forgotten**: Complete data removal via events
- **Archive Strategy**: Long-term storage for compliance

## References

- **F107 Implementation**: See `specifications/F107-firebase-soc2-vanilla-app/phase2-events.md`
- **Security Model**: See `docs/architecture/security.md`
- **Authentication**: See `docs/architecture/authentication.md`
