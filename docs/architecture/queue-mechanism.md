# Action Request Architecture

## Core Pattern: Offline-First Action Request Processing

```
Client (Online/Offline) → Firestore actionRequests → Giant Function → completedActions → Materialized Views
```

**Benefits**: Offline-first operations, reliable processing, conflict resolution, real-time status updates

## Action Request Architecture Principles

### Offline-First Design
- **Always Available**: Operations work whether online or offline
- **Immediate Feedback**: Users get immediate confirmation of action requests
- **Automatic Sync**: Operations process automatically when connection is restored
- **Status Tracking**: Real-time status updates for all action requests

### Action Request Structure
```javascript
// Firestore collection: actionRequests
{
  actionRequestId: {
    id: "acr_<cuid12>",
    eventId: "evt_<cuid12>",
    action: Action,
    actorId: "usr_<cuid12>",
    subjectId: "usr|org|prj_<cuid12>",
    subjectType: "user" | "organization" | "project",
    organizationId: "org_<cuid12>",
    projectId: "prj_<cuid12>"?,
    idempotencyKey: "idm_<cuid12>",
    correlationId: "cor_<cuid12>",
    schemaVersion: 1,
    status: "pending" | "processing" | "completed" | "failed",
    resultData: { /* operation result */ }?,
    error: "error message"?,
    createdAt: "serverTimestamp",
    processedAt: "serverTimestamp"?
  }
}
```

## Client-Side Action Request Operations

### Action Request Service Pattern
```javascript
/**
 * Create action request for processing
 * @sig createActionRequest :: (Action, Object) -> Promise<String>
 */
export const createActionRequest = async (action, actor) => {
  const idempotencyKey = crypto.randomUUID();

  const actionRequest = ActionRequest.from({
    id: newActionRequestId(),
    eventId: newEventId(),
    action,
    actorId: actor.id,
    subjectId: action.subject.id,
    subjectType: action.subject.type,
    organizationId: actor.organizationId,
    projectId: action.projectId,
    idempotencyKey,
    correlationId: newCorrelationId(),
    schemaVersion: 1,
    status: 'pending',
    createdAt: serverTimestamp()
  });

  const docRef = await addDoc(collection(db, 'actionRequests'), ActionRequest.toFirestore(actionRequest));
  return docRef.id;
};
```

### Event Action Request
```javascript
/**
 * Create action request for event creation
 * @sig createActionEvent :: (String, Object, Object) -> Promise<String>
 */
export const createActionEvent = async (eventType, data, actor) => {
  const action = Action.from({ eventType, data });
  return createActionRequest(action, actor);
};
```

### Status Monitoring
```javascript
/**
 * Watch action request status
 * @sig watchActionRequestStatus :: (String, Function) -> Function
 */
export const watchActionRequestStatus = (actionRequestId, callback) => {
  return onSnapshot(
    query(
      collection(db, 'actionRequests'),
      where('__name__', '==', actionRequestId)
    ),
    (snapshot) => {
      if (!snapshot.empty) {
        const item = ActionRequest.fromFirestore(snapshot.docs[0].data());
        callback(item.status, item.resultData, item.error);
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

### Offline Action Request Operations
```javascript
/**
 * Create action request with offline support
 * @sig createActionRequestOffline :: (Action, Object) -> Promise<String>
 */
export const createActionRequestOffline = async (action, actor) => {
  try {
    // Always create the action request (works offline)
    const actionRequestId = await createActionRequest(action, actor);

    if (isOnline()) {
      return actionRequestId;
    } else {
      await waitForConnection();
      return actionRequestId;
    }
  } catch (error) {
    console.error('Failed to create action request:', error);
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
export const retryOperation = async (actionRequestId, maxRetries = 3) => {
  const actionRequest = await getActionRequest(actionRequestId);

  if (actionRequest.retryCount >= maxRetries) {
    await markOperationFailed(actionRequestId, 'Max retries exceeded');
    return;
  }

  const delay = Math.pow(2, actionRequest.retryCount) * 1000; // Exponential backoff
  setTimeout(async () => {
    await processOperation(actionRequestId);
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
 * Watch all user's action requests
 * @sig watchUserActionRequests :: (Function) -> Function
 */
export const watchUserActionRequests = (callback) => {
  return onSnapshot(
    query(
      collection(db, 'actionRequests'),
      where('actorId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    ),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ActionRequest.fromFirestore(doc.data()));
      callback(items);
    }
  );
};
```

### Status States
- **Pending**: Action request created, waiting for processing
- **Processing**: Action request currently being processed
- **Completed**: Action request completed successfully
- **Failed**: Action request failed with error

## Performance Optimization

### Batch Processing
- **Batch Operations**: Group related operations for efficiency
- **Batch Size Limits**: Prevent overwhelming the processing system
- **Priority Processing**: Process high-priority action requests first

### Action Request Management
- **Cleanup**: Archive completed action requests after retention period
- **Failed Requests**: Track failed action requests for debugging
- **Monitoring**: Track processing depth and rates

## Security Considerations

### Access Control
- **User Scoping**: Users can only see their own action requests
- **Organization Scoping**: Action requests scoped to user's organizations
- **Permission Validation**: Verify permissions before processing

### Data Protection
- **Input Validation**: Validate all action request data
- **Sanitization**: Sanitize data before processing
- **Audit Logging**: Log all action requests for compliance

## Monitoring and Observability

### Metrics
- **Pending Requests**: Number of pending action requests
- **Processing Rate**: Action requests processed per minute
- **Error Rate**: Percentage of failed action requests
- **Average Processing Time**: Time from creation to completion

### Alerting
- **Request Backlog**: Alert when pending requests exceeds threshold
- **High Error Rate**: Alert when error rate exceeds threshold
- **Processing Delays**: Alert when processing time exceeds threshold

## References

- **F107 Implementation**: See `specifications/F107-firebase-soc2-vanilla-app/phase5-offline.md`
- **Event Sourcing**: See `docs/architecture/event-sourcing.md`
- **Offline-First**: See `docs/architecture/offline-first.md`
- **Security**: See `docs/architecture/security.md`
