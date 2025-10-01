# Data Model Architecture

## Core Pattern: Event Sourcing + Materialized Views

```
Client (Online/Offline) → Firestore Queue → Giant Function → Events → Materialized Views
```

**Benefits**: Offline-first, SOC2-compliant audit trail, scalable multi-tenant architecture

## Event Sourcing Pattern

### Events (Source of Truth)
Events are immutable and provide the complete audit trail:

```javascript
// Events collection - immutable audit trail
events: {
  eventId: {
    type: "UserCreated" | "UserUpdated" | "UserForgotten" | "RoleAssigned",
    organizationId: "cuid2",
    projectId: "cuid2", // hidden from UI for now
    actor: { 
      type: "user" | "system" | "api",
      id: "cuid2" 
    },
    subject: { 
      type: "user" | "organization" | "project",
      id: "cuid2" 
    },
    data: { /* event-specific data */ },
    timestamp: "ISO string",
    correlationId: "cuid2" // for client→server error tracking
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

## Queue Processing

### Firestore Queue
```javascript
// Update queue for offline support
update_queue: {
  queueId: {
    action: "create" | "update" | "delete",
    data: { /* action-specific data */ },
    userId: "cuid2",
    organizationId: "cuid2",
    idempotencyKey: "cuid2",
    timestamp: "ISO string",
    retryCount: 0,
    status: "pending" | "processing" | "completed" | "failed"
  }
}
```

### Giant Function Processing
- **Event Processing**: Convert queue items to events
- **Idempotency**: Prevent duplicate processing
- **Materialized View Updates**: Update cached views
- **Error Handling**: Retry failed operations

## Schema Versioning

### Event Versioning
```javascript
// Events include schema version for migrations
{
  eventId: {
    type: "UserCreated",
    schemaVersion: "1.0",
    // ... rest of event
  }
}
```

### Migration Strategy
- **Immutable Events**: Events never change once created
- **New Event Types**: Add new event types for schema changes
- **Backward Compatibility**: Event processors handle multiple versions
- **Migration Events**: Special events for data transformations

## Data Consistency

### Eventual Consistency
- **Queue Processing**: Asynchronous event processing
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
- **Queue Processing**: Index on status, timestamp

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
