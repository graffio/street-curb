# CurbMap Architecture

## Core Pattern: Event Sourcing + Queue

```
Client (Online/Offline) → Firestore Queue → Giant Function → Events → Materialized Views
```

**Benefits**: Offline-first, SOC2-compliant audit trail, scalable multi-tenant architecture

## Data Model

### Events (Source of Truth)
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

### Materialized Views (Performance)
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

## Security Model

### Firestore Rules: Structure Validation Only
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /update_queue/{queueId} {
      allow create: if 
        request.auth != null &&
        request.resource.data.keys().hasAll(['action', 'data', 'idempotencyKey', 'userId']) &&
        request.resource.data.userId == request.auth.uid;
      
      allow read: if 
        request.auth != null && 
        resource.data.userId == request.auth.uid;
      
      allow update: if false; // Only server functions can update
    }
  }
}
```

### Server-Side: All Business Logic
- **Authorization**: Check user permissions before event creation
- **Validation**: Validate event data structure and business rules
- **Malicious Data Filtering**: Sanitize all input on server
- **Idempotency**: Prevent duplicate event processing

## Multi-Tenant Architecture

### Data Isolation
- **Organization Level**: Complete data isolation between organizations
- **Project Level**: Multiple projects per organization (future expansion)
- **Event Scoping**: All events scoped to `organizationId` + `projectId`

### Permission Model
```javascript
// Role-based permissions
const permissions = {
  admin: ["read", "write", "admin", "impersonate"],
  member: ["read", "write"],
  viewer: ["read"]
}

// Resource + Action authorization
const checkPermission = (userId, action, resource) => {
  const userRoles = getUserRoles(userId)
  return userRoles.some(role => 
    role.organizationId === resource.organizationId && 
    role.permissions.includes(getRequiredPermission(action))
  )
}
```

## Offline Queue Architecture

### Client Operations
```javascript
// All operations create events via queue
const createUser = async (organizationId, projectId, userData) => {
  return queueEvent('UserCreated', {
    organizationId,
    projectId: projectId || 'default',
    subject: { type: 'user', id: userData.firebaseUid },
    email: userData.email,
    initialRole: userData.role || 'member'
  })
}

const updateUser = async (organizationId, projectId, userId, changes) => {
  return queueEvent('UserUpdated', {
    organizationId,
    projectId: projectId || 'default',
    subject: { type: 'user', id: userId },
    changes: { email: { from: 'old@sf.gov', to: 'new@sf.gov' } }
  })
}
```

### Server Processing
```javascript
// Giant function processes all queue items
exports.processUpdateQueue = functions.firestore
  .document('update_queue/{queueId}')
  .onCreate(async (snap, context) => {
    const queueItem = snap.data()
    
    try {
      // 1. Idempotency check
      const existing = await checkIdempotencyKey(queueItem.idempotencyKey)
      if (existing) return existing
      
      // 2. Input validation
      const validation = validateEventData(queueItem.eventType, queueItem.data)
      if (!validation.valid) throw new Error(`Invalid event data: ${validation.error}`)
      
      // 3. Authorization check
      const authorized = await checkEventAuthorization(queueItem.userId, queueItem.eventType, queueItem.data)
      if (!authorized) throw new Error('Insufficient permissions')
      
      // 4. Create event
      const event = await createEvent({
        type: queueItem.eventType,
        organizationId: queueItem.data.organizationId,
        projectId: queueItem.data.projectId || 'default',
        actor: { type: 'user', id: queueItem.userId },
        subject: queueItem.data.subject,
        data: queueItem.data,
        correlationId: queueItem.idempotencyKey
      })
      
      // 5. Update materialized views
      await updateMaterializedViews(event)
      
      // 6. Mark queue item complete
      await snap.ref.update({
        status: 'completed',
        result: { eventId: event.eventId },
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      
    } catch (error) {
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    }
  })
```

## SOC2 Compliance Features

### Access Controls
- **Authentication required**: All operations require valid Firebase Auth
- **Authorization verification**: Server checks permissions before event creation
- **Principle of least privilege**: Users can only create events they're authorized for
- **Multi-project isolation**: Events scoped to specific organizationId/projectId

### Audit Logging (Events ARE the Audit Log)
- **Complete audit trail**: Every event is an immutable audit record
- **Perfect chronological order**: Events timestamped and ordered
- **Actor tracking**: Every event records who performed the action
- **Idempotency tracking**: Duplicate event creation prevented and logged
- **Data lineage**: Full history of changes from event stream
- **CCPA/GDPR compliance**: UserForgotten events provide "right to be forgotten"

### Data Integrity
- **Input validation**: Event data validated before event creation
- **Business rule enforcement**: Event validation ensures data consistency
- **Immutable events**: Once created, events cannot be changed
- **Conflict resolution**: Idempotency prevents duplicate event processing
- **Time travel capability**: Reconstruct state at any point in time

## Performance Optimization

### Materialized Views
- **Current state cached**: Most queries hit cached state, not event history
- **Periodic refresh**: Views updated from events periodically
- **Lazy loading**: Only calculate from events when cache miss occurs
- **Event snapshots**: Periodic snapshot events to avoid replaying from beginning

### Event Compaction
- **Archive old events**: After creating snapshots
- **Schema versioning**: Add `schemaVersion` field for clean migrations
- **Backward compatibility**: Event processors handle multiple versions
- **Deprecation timeline**: Mark old versions deprecated, remove support after reasonable period

## Environment Configuration

### Development
- **Emulator usage**: Local development with Firebase emulators
- **Minimal test data**: Small dataset for development
- **Relaxed security**: Faster iteration capabilities

### Staging
- **Synthetic data**: Generated test data, no real customer data
- **Production mirror**: Same schema as production
- **Impersonation feature**: Debug customer issues in production
- **SOC2 excluded**: No real customer data, no audit burden

### Production
- **Real customer data**: SOC2-compliant environment
- **Comprehensive audit logging**: Every action recorded
- **Restricted access**: Admin approval required for changes
- **MFA enforced**: Multi-factor authentication mandatory
- **Backup verification**: Automated backup testing
