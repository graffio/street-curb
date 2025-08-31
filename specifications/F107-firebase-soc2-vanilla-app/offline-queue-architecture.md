# Firestore Queue + Giant Function Architecture

**Date:** 2025.08.29  
**Purpose:** LLM-friendly specification for offline-first update architecture  
**Context:** SOC2-compliant user management system with reliable offline capabilities

## Architecture Overview

**Problem**: Need offline-capable updates that maintain security, validation, and audit compliance.

**Solution**: Hybrid architecture combining Firestore's built-in offline mechanism with centralized server-side validation.

```
Client (Online/Offline) → Firestore Queue → Firebase Function → Business Logic → Audit Log
                              ↑                                        ↓
                      Built-in offline sync              PostgreSQL + Firestore sync
```

## Core Pattern - Event Sourcing + Queue Integration

### Client Side: Queue Events for Processing

```javascript
// Client queues event creation (works offline automatically)  
const updateUser = async (userData) => {
  await addDoc(collection(db, 'update_queue'), {
    action: 'createEvent',
    eventType: 'UserUpdated',
    data: {
      org_id: userData.org_id,
      project_id: userData.project_id || 'default', 
      subject: { type: 'user', id: userData.user_id },
      changes: userData.changes, // { email: { from: 'old@sf.gov', to: 'new@sf.gov' } }
    },
    idempotencyKey: crypto.randomUUID(),  // Prevents duplicate processing
    userId: auth.currentUser.uid,
    timestamp: serverTimestamp()
  })
  // Queued! Firestore handles offline/online sync automatically
}

// All operations create events via queue
const createUser = async (orgId, projectId, userData) => {
  return queueEvent('UserCreated', {
    org_id: orgId,
    project_id: projectId || 'default',
    subject: { type: 'user', id: userData.firebase_uid },
    email: userData.email,
    initial_role: userData.role || 'user'
  })
}

const assignRole = async (orgId, projectId, userId, newRole) => {
  return queueEvent('RoleAssigned', {
    org_id: orgId,
    project_id: projectId || 'default', 
    subject: { type: 'user', id: userId },
    new_role: newRole
  })
}

const forgetUser = async (orgId, projectId, userId, reason) => {
  return queueEvent('UserForgotten', {
    org_id: orgId,
    project_id: projectId || 'default',
    subject: { type: 'user', id: userId },
    reason: reason // 'CCPA_request' | 'GDPR_request' 
  })
}
```

### Server Side: Event Creation via Queue Processing

```javascript
// Single Firebase Function processes all queue items and creates events
exports.processUpdateQueue = functions.firestore
  .document('update_queue/{queueId}')
  .onCreate(async (snap, context) => {
    const queueItem = snap.data()
    
    try {
      // Route to event creation logic
      const event = await processQueuedEvent(queueItem)
      
      // Update queue item with success
      await snap.ref.update({
        status: 'completed',
        result: { event_id: event.event_id },
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    } catch (error) {
      // Update queue item with failure
      await snap.ref.update({
        status: 'failed', 
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    }
  })

// Giant function: Creates validated events
const processQueuedEvent = async (queueItem) => {
  const { action, eventType, data: eventData, idempotencyKey, userId } = queueItem
  
  // 1. Idempotency check - prevent duplicate event creation
  const existing = await checkIdempotencyKey(idempotencyKey)
  if (existing) return existing
  
  // 2. Input validation - validate event data structure
  const validation = validateEventData(eventType, eventData)
  if (!validation.valid) {
    throw new Error(`Invalid event data: ${validation.error}`)
  }
  
  // 3. Authorization check - verify user can create this event
  const authorized = await checkEventAuthorization(userId, eventType, eventData)
  if (!authorized) {
    throw new Error('Insufficient permissions for event creation')
  }
  
  // 4. Create the event - this IS the business logic
  const event = await createEvent({
    type: eventType,
    org_id: eventData.org_id,
    project_id: eventData.project_id || 'default',
    actor: { type: 'user', id: userId },
    subject: eventData.subject,
    data: eventData,
    correlation_id: idempotencyKey // Use idempotency key for correlation
  })
  
  // 5. Store idempotency result (the event IS the audit log)
  await storeIdempotencyResult(idempotencyKey, { event_id: event.event_id })
  
  return event
}

// Event creation function - writes to events collection
const createEvent = async (eventData) => {
  const event = {
    event_id: crypto.randomUUID(),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ...eventData
  }
  
  // Write to events collection (immutable)
  await admin.firestore()
    .collection('events')
    .doc(event.event_id)
    .set(event)
  
  return event
}
```

## Security Model

### Firestore Rules: Structure Validation Only

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /update_queue/{queueId} {
      // Allow authenticated users to queue updates
      allow create: if 
        request.auth != null &&
        request.resource.data.keys().hasAll(['action', 'data', 'idempotencyKey', 'userId']) &&
        request.resource.data.action is string &&
        request.resource.data.data is map &&
        request.resource.data.idempotencyKey is string &&
        request.resource.data.userId == request.auth.uid;
      
      // Users can read their own queue items (for status tracking)
      allow read: if 
        request.auth != null && 
        resource.data.userId == request.auth.uid;
      
      // Only server functions can update status
      allow update: if false;
    }
  }
}
```

**Key principle**: Firestore rules only validate structure. All business logic, authorization, and malicious data filtering happens server-side.

### Server-Side Validation

```javascript
// Three-layer validation approach
const validateAction = (action, payload) => {
  // 1. Structure validation
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload structure' }
  }
  
  // 2. Action-specific validation
  switch (action) {
    case 'createUser':
      if (!payload.email || !isValidEmail(payload.email)) {
        return { valid: false, error: 'Invalid email address' }
      }
      if (!payload.cityId || typeof payload.cityId !== 'string') {
        return { valid: false, error: 'Valid city ID required' }
      }
      if (!payload.role || !isValidRole(payload.role)) {
        return { valid: false, error: 'Valid role required' }
      }
      break
      
    case 'updateUser':
      if (!payload.userId) {
        return { valid: false, error: 'User ID required for update' }
      }
      // Additional field validation...
      break
      
    // More action validations...
  }
  
  // 3. Business rule validation
  if (action === 'assignRole' && payload.role === 'admin' && !payload.justification) {
    return { valid: false, error: 'Admin role assignment requires justification' }
  }
  
  return { valid: true, payload }
}

// Authorization check
const checkAuthorization = async (userId, action, payload) => {
  const userRoles = await getUserRoles(userId)
  
  switch (action) {
    case 'createUser':
      return userRoles.some(role => 
        role.cityId === payload.cityId && 
        (role.role === 'admin' || role.permissions.includes('manage_users'))
      )
      
    case 'assignRole':
      return userRoles.some(role =>
        role.cityId === payload.cityId && 
        role.role === 'admin'
      )
      
    // More authorization rules...
  }
  
  return false
}
```

## Idempotency with UUIDs

```javascript
// Client generates UUID for each operation
const queueUpdate = async (action, data) => {
  const idempotencyKey = crypto.randomUUID()  // e.g., "123e4567-e89b-12d3-a456-426614174000"
  
  const queueItem = await addDoc(collection(db, 'update_queue'), {
    action,
    data,
    idempotencyKey,
    userId: auth.currentUser.uid,
    timestamp: serverTimestamp()
  })
  
  return queueItem.id  // Return queue ID for status tracking
}

// Server idempotency implementation
const checkIdempotencyKey = async (key) => {
  const doc = await admin.firestore()
    .collection('processed_operations')
    .doc(key)
    .get()
    
  return doc.exists ? doc.data().result : null
}

const storeIdempotencyResult = async (key, result) => {
  await admin.firestore()
    .collection('processed_operations')
    .doc(key)
    .set({ 
      result, 
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    })
}
```

## Client Status Tracking (Optional)

```javascript
// Client can optionally watch for operation completion
const watchUpdate = (queueId, callback) => {
  return onSnapshot(doc(db, 'update_queue', queueId), (doc) => {
    const item = doc.data()
    
    if (item.status === 'completed') {
      callback(null, item.result)
    } else if (item.status === 'failed') {
      callback(new Error(item.error))
    }
    // 'pending' status - still processing
  })
}

// Usage example
const createUserWithFeedback = async (userData) => {
  const queueId = await queueUpdate('createUser', userData)
  
  return new Promise((resolve, reject) => {
    const unsubscribe = watchUpdate(queueId, (error, result) => {
      unsubscribe()
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}
```

## Data Flow Examples

### Successful Operation Flow

1. **Client** (online/offline): `addDoc(update_queue, {action: 'createUser', data: userData, idempotencyKey})`
2. **Firestore**: Queues operation, syncs when online
3. **Firebase Function**: Triggered on document creation
4. **Validation**: Structure → Business rules → Authorization
5. **Execution**: Create user in database
6. **Audit**: Log operation with idempotency key
7. **Update**: Mark queue item as 'completed'
8. **Client** (optional): Receives real-time status update

### Failed Operation Flow

1. **Client**: Same as above
2. **Firestore**: Same as above  
3. **Firebase Function**: Triggered on document creation
4. **Validation**: Fails at any validation step
5. **Error Handling**: Mark queue item as 'failed' with error message
6. **Client** (optional): Receives failure notification

### Offline → Online Flow

1. **Client offline**: `addDoc()` queues locally in Firestore
2. **Client comes online**: Firestore automatically syncs queued operations
3. **Server processing**: Each queued item triggers Firebase Function
4. **Idempotency**: UUID prevents duplicate processing if sync retries

## Benefits

### For Development
- **Simple client code**: Always same pattern regardless of connectivity
- **Centralized logic**: All validation, authorization in one place
- **Easy testing**: Mock Firestore queue for unit tests
- **Clear separation**: Client queues, server processes

### For Operations
- **Automatic retry**: Firestore handles connection failures
- **Built-in queuing**: No custom queue implementation needed
- **Real-time feedback**: Optional status updates via Firestore subscriptions
- **Audit compliance**: Every operation logged with context

### For Security
- **Server-side validation**: Impossible to bypass business rules
- **Malicious data filtering**: All input sanitized on server
- **Authorization centralization**: Consistent permission checking
- **Idempotency protection**: UUIDs prevent replay attacks

## SOC2 Compliance Features with Event Sourcing

### Access Controls
- **Authentication required**: All queue writes require valid Firebase Auth
- **Authorization verification**: Server checks user permissions before event creation
- **Principle of least privilege**: Users can only create events they're authorized for
- **Multi-project isolation**: Events scoped to specific org_id/project_id combinations

### Audit Logging (Events ARE the Audit Log)
- **Complete audit trail**: Every event is an immutable audit record
- **Perfect chronological order**: Events timestamped and ordered
- **Actor tracking**: Every event records who performed the action (user/system/api)
- **Idempotency tracking**: Duplicate event creation prevented and logged
- **Data lineage**: Full history of changes from event stream
- **CCPA/GDPR compliance**: UserForgotten events provide "right to be forgotten"

### Data Integrity
- **Input validation**: Event data validated before event creation
- **Business rule enforcement**: Event validation ensures data consistency
- **Immutable events**: Once created, events cannot be changed
- **Conflict resolution**: Idempotency prevents duplicate event processing
- **Time travel capability**: Reconstruct state at any point in time

### Change Management
- **Event-driven architecture**: All changes represented as events
- **Version control**: Event schema changes backward compatible
- **Rollback capability**: Calculate previous state from events
- **Testing framework**: Event sourcing enables comprehensive testing
- **Migration simplicity**: New event types added without breaking existing data

## Implementation Notes

### Queue Cleanup
```javascript
// Optional: Clean up completed queue items after 30 days
exports.cleanupQueue = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    
    const batch = admin.firestore().batch()
    const oldItems = await admin.firestore()
      .collection('update_queue')
      .where('processedAt', '<', cutoff)
      .where('status', 'in', ['completed', 'failed'])
      .get()
    
    oldItems.forEach(doc => batch.delete(doc.ref))
    await batch.commit()
  })
```

### Error Recovery
```javascript
// Optional: Retry failed operations
exports.retryFailedOperations = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const failedItems = await admin.firestore()
      .collection('update_queue')
      .where('status', '==', 'failed')
      .where('retryCount', '<', 3)
      .get()
    
    for (const doc of failedItems.docs) {
      // Retry processing logic
      await processUpdate(doc.data())
    }
  })
```

This architecture provides a robust, offline-first foundation for SOC2-compliant systems while maintaining simplicity and security.
