# Data Model Architecture

## Core Pattern: Event Sourcing + Materialized Views

```
Client (Online/Offline) → Firestore actionRequests → Giant Function → completedActions → Materialized Views
```

**Benefits**: Offline-first, SOC2-compliant audit trail, scalable multi-tenant architecture

## Event Sourcing Pattern

### Completed Actions (Source of Truth)
Completed actions are immutable and provide the complete audit trail:

```javascript
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

- **UserAdded**: New user registration
- **UserUpdated**: User profile changes
- **UserForgotten**: GDPR/CCPA data deletion
- **RoleAssigned**: Permission changes
- **OrganizationAdded**: New organization setup
- **ProjectAdded**: New project within organization

## Materialized Views (Performance)

### Organizations
```javascript
// Organizations - cached from events
organizations: {
  organizationId: {
    name: "City of San Francisco",
    subscription: {
      tier: "premium",
      annualAmount: 50000,
      startDate: "2025-01-01T00:00:00Z",
      endDate: "2026-01-01T00:00:00Z"
    },
    settings: {
      ssoEnabled: false,
      auditLogRetention: 2555 // 7 years
    }
  }
}
```

### Users
```javascript
// Users - cached from events
users: {
  userId: {
    email: "alice@sf.gov",
    displayName: "Alice Johnson",
    roles: {
      organizationId: {
        role: "admin" | "member",
        permissions: ["read", "write", "admin"],
        lastAccess: "2025-01-15T10:30:00Z"
      }
    },
    lastLogin: "2025-01-15T09:00:00Z",
    failedAttempts: 0
  }
}
```

### Projects
```javascript
// Projects - cached from events
projects: {
  projectId: {
    organizationId: "cuid2",
    name: "Downtown Curb Management",
    status: "active",
    createdBy: "userId"
  }
}
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
