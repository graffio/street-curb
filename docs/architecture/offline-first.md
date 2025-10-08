# Offline-First Architecture

## Core Pattern: Always-Available Operations

```
Client (Online/Offline) → Firestore actionRequests → Giant Function → completedActions → Materialized Views
```

**Benefits**: Works offline, automatic sync, conflict resolution, reliable user experience

## Offline-First Principles

### Always Available Operations
- **Immediate Response**: Operations work whether online or offline
- **Request-Based**: All operations create action requests for later processing
- **Transparent Sync**: Users don't need to manage sync manually
- **Conflict Resolution**: Automatic handling of concurrent changes

### Connection-Agnostic Design
- **No Connection Checks**: Operations don't require connection state
- **Graceful Degradation**: App works fully offline
- **Progressive Enhancement**: Additional features when online
- **Seamless Transitions**: Smooth online/offline transitions

## Connection Management

### Connection Detection
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

### Connection State Management
```javascript
/**
 * Check if currently online
 * @sig isOnline :: () -> Boolean
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Wait for connection to be restored
 * @sig waitForConnection :: () -> Promise<Void>
 */
export const waitForConnection = () => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }
    
    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };
    
    window.addEventListener('online', handleOnline);
  });
};
```

## Offline Operations

### Action Request-Based Operations
```javascript
/**
 * Create action request with offline support
 * @sig createActionRequestOffline :: (Action, Actor) -> Promise<String>
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

### Operation Status Tracking
```javascript
/**
 * Create action request with status feedback
 * @sig createActionRequestWithFeedback :: (Action, Actor) -> Promise<Object>
 */
export const createActionRequestWithFeedback = async (action, actor) => {
  const actionRequestId = await createActionRequestOffline(action, actor);

  return new Promise((resolve, reject) => {
    const unsubscribe = watchActionRequestStatus(actionRequestId, (status, result, error) => {
      if (status === 'completed') {
        unsubscribe();
        resolve(result);
      } else if (status === 'failed') {
        unsubscribe();
        reject(new Error(error));
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      unsubscribe();
      reject(new Error('Operation timeout'));
    }, 30000);
  });
};
```

## Sync Management

### Automatic Sync
```javascript
/**
 * Sync pending operations when connection restored
 * @sig syncPendingOperations :: () -> Promise<Void>
 */
export const syncPendingOperations = async () => {
  try {
    console.log('Syncing pending operations...');
    
    // Get all pending operations
    const pendingQuery = query(
      collection(db, 'actionRequests'),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'asc')
    );
    
    const snapshot = await getDocs(pendingQuery);
    
    if (snapshot.empty) {
      console.log('No pending operations to sync');
      return;
    }
    
    console.log(`Found ${snapshot.size} pending operations`);
    
    // Process each pending operation
    for (const doc of snapshot.docs) {
      const operation = doc.data();
      console.log(`Processing operation: ${operation.action}`);
      
      // The operation will be processed by the server function
      await waitForOperationCompletion(doc.id);
    }
    
    console.log('All pending operations synced');
  } catch (error) {
    console.error('Error syncing pending operations:', error);
    throw error;
  }
};
```

### Background Sync Service
```javascript
/**
 * Start background sync service
 * @sig startBackgroundSync :: () -> Function
 */
export const startBackgroundSync = () => {
  let syncInProgress = false;
  
  const performSync = async () => {
    if (syncInProgress || !isOnline()) {
      return;
    }
    
    syncInProgress = true;
    
    try {
      await syncPendingOperations();
    } catch (error) {
      console.error('Background sync failed:', error);
    } finally {
      syncInProgress = false;
    }
  };
  
  // Sync when connection is restored
  const cleanup = monitorConnection(performSync, () => {
    console.log('Connection lost, sync paused');
  });
  
  // Initial sync if online
  if (isOnline()) {
    performSync();
  }
  
  // Periodic sync every 5 minutes
  const syncInterval = setInterval(performSync, 5 * 60 * 1000);
  
  return () => {
    cleanup();
    clearInterval(syncInterval);
  };
};
```

## Conflict Resolution

### Conflict Detection
```javascript
/**
 * Detect conflicts in action requests
 * @sig detectConflicts :: (ActionRequest) -> Promise<Array>
 */
const detectConflicts = async (actionRequest) => {
  const conflicts = [];

  // Check for duplicate operations
  const duplicateQuery = await admin.firestore()
    .collection('actionRequests')
    .where('idempotencyKey', '==', actionRequest.idempotencyKey)
    .where('status', '==', 'pending')
    .get();

  if (duplicateQuery.size > 1) {
    conflicts.push({
      type: 'duplicate',
      message: 'Duplicate action request detected',
      actionRequests: duplicateQuery.docs.map(doc => doc.id)
    });
  }

  // Check for conflicting updates to same resource
  if (Action.is(actionRequest.action, 'UserUpdated')) {
    const conflictingUpdates = await admin.firestore()
      .collection('actionRequests')
      .where('subjectId', '==', actionRequest.subjectId)
      .where('action.type', '==', 'UserUpdated')
      .where('status', '==', 'pending')
      .get();

    if (conflictingUpdates.size > 1) {
      conflicts.push({
        type: 'concurrent_update',
        message: 'Concurrent updates to same user',
        actionRequests: conflictingUpdates.docs.map(doc => doc.id)
      });
    }
  }

  return conflicts;
};
```

### Conflict Resolution Strategies
- **Last Writer Wins**: For simple conflicts, use timestamp
- **Manual Resolution**: For complex conflicts, require user intervention
- **Automatic Merge**: For compatible changes, merge automatically
- **Operation Ordering**: Use idempotency keys for consistent ordering

## Data Synchronization

### Local Data Caching
```javascript
/**
 * Cache data locally for offline access
 * @sig cacheData :: (String, Object) -> Promise<Void>
 */
export const cacheData = async (key, data) => {
  try {
    await localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to cache data:', error);
  }
};

/**
 * Retrieve cached data
 * @sig getCachedData :: (String) -> Promise<Object|null>
 */
export const getCachedData = async (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to retrieve cached data:', error);
    return null;
  }
};
```

### Incremental Sync
```javascript
/**
 * Sync only changed data since last sync
 * @sig incrementalSync :: (String) -> Promise<Void>
 */
export const incrementalSync = async (lastSyncTimestamp) => {
  const changesQuery = query(
    collection(db, 'completedActions'),
    where('timestamp', '>', lastSyncTimestamp),
    orderBy('timestamp', 'asc')
  );

  const snapshot = await getDocs(changesQuery);

  for (const doc of snapshot.docs) {
    const completedAction = doc.data();
    await processEvent(completedAction);
  }
  
  // Update last sync timestamp
  await cacheData('lastSyncTimestamp', new Date().toISOString());
};
```

## User Experience Patterns

### Offline Indicators
```javascript
/**
 * Show offline status to user
 * @sig showOfflineStatus :: () -> Void
 */
export const showOfflineStatus = () => {
  const indicator = document.createElement('div');
  indicator.className = 'offline-indicator';
  indicator.textContent = 'You are offline. Changes will sync when connection is restored.';
  document.body.appendChild(indicator);
};

/**
 * Hide offline status when online
 * @sig hideOfflineStatus :: () -> Void
 */
export const hideOfflineStatus = () => {
  const indicator = document.querySelector('.offline-indicator');
  if (indicator) {
    indicator.remove();
  }
};
```

### Progress Indicators
```javascript
/**
 * Show sync progress
 * @sig showSyncProgress :: (Number, Number) -> Void
 */
export const showSyncProgress = (completed, total) => {
  const progress = (completed / total) * 100;
  console.log(`Sync progress: ${progress.toFixed(1)}% (${completed}/${total})`);
};
```

## Performance Optimization

### Batch Operations
```javascript
/**
 * Batch multiple operations for efficiency
 * @sig batchOperations :: (Array) -> Promise<Array>
 */
export const batchOperations = async (operations) => {
  const batch = writeBatch(db);

  operations.forEach(operation => {
    const docRef = doc(collection(db, 'actionRequests'));
    batch.set(docRef, ActionRequest.toFirestore(operation));
  });

  await batch.commit();
};
```

### Smart Sync
```javascript
/**
 * Sync only when necessary
 * @sig smartSync :: () -> Promise<Void>
 */
export const smartSync = async () => {
  // Only sync if there are pending operations
  const pendingCount = await getPendingOperationCount();
  
  if (pendingCount > 0) {
    await syncPendingOperations();
  }
};
```

## Error Handling

### Retry Logic
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

### Error Recovery
```javascript
/**
 * Recover from sync errors
 * @sig recoverFromSyncError :: (Error) -> Promise<Void>
 */
export const recoverFromSyncError = async (error) => {
  console.error('Sync error:', error);
  
  // Reset sync state
  await clearSyncState();
  
  // Retry sync after delay
  setTimeout(() => {
    syncPendingOperations();
  }, 5000);
};
```

## Testing Offline-First

### Offline Testing
```javascript
/**
 * Simulate offline conditions for testing
 * @sig simulateOffline :: () -> Void
 */
export const simulateOffline = () => {
  // Override navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false
  });
  
  // Trigger offline event
  window.dispatchEvent(new Event('offline'));
};
```

### Sync Testing
```javascript
/**
 * Test sync functionality
 * @sig testSync :: () -> Promise<Void>
 */
export const testSync = async () => {
  // Create test action request
  const action = Action.TestAction.from({ data: 'test' });
  const actor = { id: 'usr_test', organizationId: 'org_test' };
  await createActionRequest(action, actor);

  // Simulate offline
  simulateOffline();

  // Simulate online
  simulateOnline();

  // Verify sync
  const pendingCount = await getPendingActionRequestCount();
  console.assert(pendingCount === 0, 'Sync failed');
};
```

## References

- **F107 Implementation**: See `specifications/F107-firebase-soc2-vanilla-app/phase5-offline.md`
- **Action Request Architecture**: See `docs/architecture/queue-mechanism.md`
- **Event Sourcing**: See `docs/architecture/event-sourcing.md`
- **Multi-Tenant**: See `docs/architecture/multi-tenant.md`
