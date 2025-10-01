# Event Sourcing Architecture

## Core Pattern: Event Sourcing + Queue

```
Client (Online/Offline) → Firestore Queue → Giant Function → Events → Materialized Views
```

**Benefits**: Offline-first, SOC2-compliant audit trail, scalable multi-tenant architecture

## Event Sourcing Principles

### Immutable Events
Events are the source of truth and cannot be modified once created:

```javascript
// Events collection - immutable audit trail
events: {
  eventId: {
    type: "UserCreated" | "UserUpdated" | "UserForgotten" | "RoleAssigned",
    organizationId: "cuid2",
    projectId: "cuid2",
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
    correlationId: "cuid2", // for client→server error tracking
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
```javascript
// Firestore collection: update_queue
{
  queueId: {
    action: "createEvent",
    eventType: "UserCreated",
    data: {
      organizationId: "cuid2",
      projectId: "cuid2",
      subject: { type: "user", id: "cuid2" },
      email: "alice@sf.gov",
      initialRole: "member"
    },
    idempotencyKey: "uuid-v4",
    userId: "firebase-uid",
    timestamp: "serverTimestamp",
    status: "pending" | "completed" | "failed",
    result: { eventId: "cuid2" },
    error: "error message",
    processedAt: "serverTimestamp"
  }
}
```

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
- **Format**: UUID v4
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

- **F107 Implementation**: See `specifications/F107-firebase-soc2-vanilla-app/phase2-events.md`
- **Data Model**: See `docs/architecture/data-model.md`
- **Security**: See `docs/architecture/security.md`
- **Multi-Tenant**: See `docs/architecture/multi-tenant.md`
