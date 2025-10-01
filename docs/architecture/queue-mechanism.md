# Queue Mechanism Architecture

## Core Pattern: Offline-First Queue Processing

```
Client (Online/Offline) → Firestore Queue → Giant Function → Events → Materialized Views
```

**Benefits**: Offline-first operations, reliable processing, conflict resolution, real-time status updates

## Queue Architecture Principles

### Offline-First Design
- **Always Available**: Operations work whether online or offline
- **Immediate Feedback**: Users get immediate confirmation of queued operations
- **Automatic Sync**: Operations process automatically when connection is restored
- **Status Tracking**: Real-time status updates for all queued operations

### Queue Structure
```javascript
// Firestore collection: update_queue
{
  queueId: {
    action: "createEvent" | "updateUser" | "deleteProject",
    data: { /* operation-specific data */ },
    idempotencyKey: "uuid-v4",
    userId: "firebase-uid",
    organizationId: "cuid2",
    timestamp: "serverTimestamp",
    status: "pending" | "processing" | "completed" | "failed",
    result: { /* operation result */ },
    error: "error message",
    processedAt: "serverTimestamp",
    retryCount: 0
  }
}
```

## Client-Side Queue Operations

### Queue Service Pattern
```javascript
/**
 * Queue operation for processing
 * @sig queueOperation :: (String, Object) -> Promise<String>
 */
export const queueOperation = async (action, data) => {
  const idempotencyKey = crypto.randomUUID();
  
  const queueItem = {
    action,
    data,
    idempotencyKey,
    userId: auth.currentUser.uid,
    timestamp: serverTimestamp(),
    status: 'pending'
  };
  
  const docRef = await addDoc(collection(db, 'update_queue'), queueItem);
  return docRef.id;
};
```

### Event Queueing
```javascript
/**
 * Queue event creation
 * @sig queueEvent :: (String, Object) -> Promise<String>
 */
export const queueEvent = async (eventType, data) => {
  return queueOperation('createEvent', {
    eventType,
    data
  });
};
```

### Status Monitoring
```javascript
/**
 * Watch queue item status
 * @sig watchQueueStatus :: (String, Function) -> Function
 */
export const watchQueueStatus = (queueId, callback) => {
  return onSnapshot(
    query(
      collection(db, 'update_queue'),
      where('__name__', '==', queueId)
    ),
    (snapshot) => {
      if (!snapshot.empty) {
        const item = snapshot.docs[0].data();
        callback(item.status, item.result, item.error);
      }
    }
  );
};
```

## Offline Detection and Handling

### Connection Monitoring
```javascript
/**
 * Monitor online/offline status
 * @sig monitorConnection :: (Function, Function) -> Function
 */
export const monitorConnection = (onOnline, onOffline) => {
  const handleOnline = () => {
    console.log('Connection restored');
    onOnline();
  };
  
  const handleOffline = () => {
    console.log('Connection lost');
    onOffline();
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
```

### Offline Queue Operations
```javascript
/**
 * Queue operation with offline support
 * @sig queueOperationOffline :: (String, Object) -> Promise<String>
 */
export const queueOperationOffline = async (action, data) => {
  try {
    // Always queue the operation (works offline)
    const queueId = await queueOperation(action, data);
    
    if (isOnline()) {
      return queueId;
    } else {
      await waitForConnection();
      return queueId;
    }
  } catch (error) {
    console.error('Failed to queue operation:', error);
    throw error;
  }
};
```

## Conflict Resolution

### Idempotency Pattern
- **Idempotency Key**: UUID v4 for each operation
- **Duplicate Prevention**: Check for existing operations before processing
- **Result Caching**: Cache results for duplicate operations
- **Retry Safety**: Safe to retry failed operations

### Conflict Detection
```javascript
/**
 * Check for operation conflicts
 * @sig checkConflicts :: (String, Object) -> Promise<Array>
 */
export const checkConflicts = async (action, data) => {
  const conflicts = [];
  
  // Check for duplicate operations
  const duplicates = await checkDuplicates(data.idempotencyKey);
  if (duplicates.length > 0) {
    conflicts.push({ type: 'duplicate', operations: duplicates });
  }
  
  // Check for conflicting data changes
  const dataConflicts = await checkDataConflicts(action, data);
  if (dataConflicts.length > 0) {
    conflicts.push({ type: 'data_conflict', operations: dataConflicts });
  }
  
  return conflicts;
};
```

### Resolution Strategies
- **Last Writer Wins**: For simple conflicts
- **Manual Resolution**: For complex conflicts requiring human intervention
- **Automatic Merge**: For compatible changes
- **Operation Ordering**: Timestamp-based ordering for conflicts

## Error Handling and Retry Logic

### Retry Pattern
```javascript
/**
 * Retry failed operations with exponential backoff
 * @sig retryOperation :: (String, Number) -> Promise<Void>
 */
export const retryOperation = async (queueId, maxRetries = 3) => {
  const operation = await getQueueItem(queueId);
  
  if (operation.retryCount >= maxRetries) {
    await markOperationFailed(queueId, 'Max retries exceeded');
    return;
  }
  
  const delay = Math.pow(2, operation.retryCount) * 1000; // Exponential backoff
  setTimeout(async () => {
    await processOperation(queueId);
  }, delay);
};
```

### Error Classification
- **Transient Errors**: Network issues, temporary service unavailability
- **Validation Errors**: Invalid data, business rule violations
- **Authorization Errors**: Insufficient permissions
- **System Errors**: Unexpected failures requiring investigation

## Real-Time Status Updates

### Status Tracking
```javascript
/**
 * Watch all user's queue items
 * @sig watchUserQueue :: (Function) -> Function
 */
export const watchUserQueue = (callback) => {
  return onSnapshot(
    query(
      collection(db, 'update_queue'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    ),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(items);
    }
  );
};
```

### Status States
- **Pending**: Operation queued, waiting for processing
- **Processing**: Operation currently being processed
- **Completed**: Operation completed successfully
- **Failed**: Operation failed with error
- **Retrying**: Operation failed, retrying

## Performance Optimization

### Batch Processing
- **Batch Operations**: Group related operations for efficiency
- **Batch Size Limits**: Prevent overwhelming the processing system
- **Priority Queuing**: Process high-priority operations first

### Queue Management
- **Queue Cleanup**: Remove completed operations after retention period
- **Dead Letter Queue**: Move failed operations to separate queue
- **Queue Monitoring**: Track queue depth and processing rates

## Security Considerations

### Access Control
- **User Scoping**: Users can only see their own queue items
- **Organization Scoping**: Operations scoped to user's organizations
- **Permission Validation**: Verify permissions before processing

### Data Protection
- **Input Validation**: Validate all queued data
- **Sanitization**: Sanitize data before processing
- **Audit Logging**: Log all queue operations for compliance

## Monitoring and Observability

### Metrics
- **Queue Depth**: Number of pending operations
- **Processing Rate**: Operations processed per minute
- **Error Rate**: Percentage of failed operations
- **Average Processing Time**: Time from queue to completion

### Alerting
- **Queue Backlog**: Alert when queue depth exceeds threshold
- **High Error Rate**: Alert when error rate exceeds threshold
- **Processing Delays**: Alert when processing time exceeds threshold

## References

- **F107 Implementation**: See `specifications/F107-firebase-soc2-vanilla-app/phase5-offline.md`
- **Event Sourcing**: See `docs/architecture/event-sourcing.md`
- **Offline-First**: See `docs/architecture/offline-first.md`
- **Security**: See `docs/architecture/security.md`
