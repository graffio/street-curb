# Phase 5: Offline Queue Architecture

**Goal**: Implement offline-capable client operations with sync

## Deliverables
- [ ] Client-side queue operations
- [ ] Offline sync handling
- [ ] Conflict resolution mechanisms
- [ ] Real-time status updates
- [ ] Error handling and retry logic

## Step 1: Client-Side Queue Operations

### 1.1 Queue Service
```javascript
// src/services/queueService.js
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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

### 1.2 Offline Detection
```javascript
// src/services/offlineService.js
import { onDisconnect, onConnect } from 'firebase/database';

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
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

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

### 1.3 Queue Operations with Offline Support
```javascript
// src/services/offlineQueue.js
import { queueOperation, watchQueueStatus } from './queueService';
import { isOnline, waitForConnection } from './offlineService';

/**
 * Queue operation with offline support
 * @sig queueOperationOffline :: (String, Object) -> Promise<String>
 */
export const queueOperationOffline = async (action, data) => {
  try {
    // Always queue the operation (works offline)
    const queueId = await queueOperation(action, data);
    
    if (isOnline()) {
      // If online, return immediately
      return queueId;
    } else {
      // If offline, wait for connection and then return
      await waitForConnection();
      return queueId;
    }
  } catch (error) {
    console.error('Failed to queue operation:', error);
    throw error;
  }
};

/**
 * Queue operation with status feedback
 * @sig queueOperationWithFeedback :: (String, Object) -> Promise<Object>
 */
export const queueOperationWithFeedback = async (action, data) => {
  const queueId = await queueOperationOffline(action, data);
  
  return new Promise((resolve, reject) => {
    const unsubscribe = watchQueueStatus(queueId, (status, result, error) => {
      if (status === 'completed') {
        unsubscribe();
        resolve(result);
      } else if (status === 'failed') {
        unsubscribe();
        reject(new Error(error));
      }
      // 'pending' status - still processing
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      unsubscribe();
      reject(new Error('Operation timeout'));
    }, 30000);
  });
};
```

## Step 2: Offline Sync Handling

### 2.1 Sync Manager
```javascript
// src/services/syncManager.js
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Sync pending operations when connection restored
 * @sig syncPendingOperations :: () -> Promise<Void>
 */
export const syncPendingOperations = async () => {
  try {
    console.log('Syncing pending operations...');
    
    // Get all pending operations
    const pendingQuery = query(
      collection(db, 'update_queue'),
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
      // We just need to wait for it to complete
      await waitForOperationCompletion(doc.id);
    }
    
    console.log('All pending operations synced');
  } catch (error) {
    console.error('Error syncing pending operations:', error);
    throw error;
  }
};

/**
 * Wait for operation to complete
 * @sig waitForOperationCompletion :: (String) -> Promise<Void>
 */
const waitForOperationCompletion = async (queueId) => {
  return new Promise((resolve, reject) => {
    const unsubscribe = watchQueueStatus(queueId, (status, result, error) => {
      if (status === 'completed') {
        unsubscribe();
        resolve(result);
      } else if (status === 'failed') {
        unsubscribe();
        reject(new Error(error));
      }
    });
    
    // Timeout after 60 seconds
    setTimeout(() => {
      unsubscribe();
      reject(new Error('Operation sync timeout'));
    }, 60000);
  });
};
```

### 2.2 Background Sync
```javascript
// src/services/backgroundSync.js
import { syncPendingOperations } from './syncManager';
import { isOnline, monitorConnection } from './offlineService';

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
  
  // Return cleanup function
  return () => {
    cleanup();
    clearInterval(syncInterval);
  };
};
```

## Step 3: Conflict Resolution

### 3.1 Conflict Detection
```javascript
// functions/src/events/conflictResolution.js
/**
 * Detect conflicts in queued operations
 * @sig detectConflicts :: (Object) -> Promise<Array>
 */
const detectConflicts = async (queueItem) => {
  const conflicts = [];
  
  // Check for duplicate operations
  const duplicateQuery = await admin.firestore()
    .collection('update_queue')
    .where('idempotencyKey', '==', queueItem.idempotencyKey)
    .where('status', '==', 'pending')
    .get();
  
  if (duplicateQuery.size > 1) {
    conflicts.push({
      type: 'duplicate',
      message: 'Duplicate operation detected',
      queueItems: duplicateQuery.docs.map(doc => doc.id)
    });
  }
  
  // Check for conflicting updates to same resource
  if (queueItem.action === 'createEvent' && queueItem.data.eventType === 'UserUpdated') {
    const conflictingUpdates = await admin.firestore()
      .collection('update_queue')
      .where('data.subject.id', '==', queueItem.data.data.subject.id)
      .where('data.eventType', '==', 'UserUpdated')
      .where('status', '==', 'pending')
      .get();
    
    if (conflictingUpdates.size > 1) {
      conflicts.push({
        type: 'concurrent_update',
        message: 'Concurrent updates to same user',
        queueItems: conflictingUpdates.docs.map(doc => doc.id)
      });
    }
  }
  
  return conflicts;
};

/**
 * Resolve conflicts automatically
 * @sig resolveConflicts :: (Array) -> Promise<Void>
 */
const resolveConflicts = async (conflicts) => {
  for (const conflict of conflicts) {
    switch (conflict.type) {
      case 'duplicate':
        // Keep the first operation, cancel the rest
        const [first, ...rest] = conflict.queueItems;
        for (const queueId of rest) {
          await admin.firestore()
            .collection('update_queue')
            .doc(queueId)
            .update({
              status: 'cancelled',
              error: 'Duplicate operation cancelled',
              processedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        break;
        
      case 'concurrent_update':
        // Merge updates or keep the latest
        await mergeConcurrentUpdates(conflict.queueItems);
        break;
    }
  }
};

/**
 * Merge concurrent updates to same resource
 * @sig mergeConcurrentUpdates :: (Array) -> Promise<Void>
 */
const mergeConcurrentUpdates = async (queueItems) => {
  // Get all the updates
  const updates = [];
  for (const queueId of queueItems) {
    const doc = await admin.firestore()
      .collection('update_queue')
      .doc(queueId)
      .get();
    
    if (doc.exists) {
      updates.push({
        id: queueId,
        data: doc.data(),
        timestamp: doc.data().timestamp
      });
    }
  }
  
  // Sort by timestamp
  updates.sort((a, b) => a.timestamp - b.timestamp);
  
  // Merge changes from all updates
  const mergedChanges = {};
  for (const update of updates) {
    const changes = update.data.data.data.changes;
    Object.assign(mergedChanges, changes);
  }
  
  // Update the first operation with merged changes
  const firstUpdate = updates[0];
  await admin.firestore()
    .collection('update_queue')
    .doc(firstUpdate.id)
    .update({
      'data.data.changes': mergedChanges
    });
  
  // Cancel the rest
  for (let i = 1; i < updates.length; i++) {
    await admin.firestore()
      .collection('update_queue')
      .doc(updates[i].id)
      .update({
        status: 'cancelled',
        error: 'Merged with concurrent update',
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
  }
};

module.exports = { detectConflicts, resolveConflicts };
```

### 3.2 Conflict Resolution in Queue Processing
```javascript
// functions/src/events/processUpdateQueue.js (updated)
const { detectConflicts, resolveConflicts } = require('./conflictResolution');

exports.processUpdateQueue = functions.firestore
  .document('update_queue/{queueId}')
  .onCreate(async (snap, context) => {
    const queueItem = snap.data();
    const queueId = context.params.queueId;
    
    try {
      console.log(`Processing queue item: ${queueId}`);
      
      // 1. Detect conflicts
      const conflicts = await detectConflicts(queueItem);
      if (conflicts.length > 0) {
        console.log(`Conflicts detected: ${conflicts.length}`);
        await resolveConflicts(conflicts);
      }
      
      // 2. Idempotency check
      const existing = await checkIdempotencyKey(queueItem.idempotencyKey);
      if (existing) {
        await snap.ref.update({
          status: 'completed',
          result: existing,
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return;
      }
      
      // 3. Input validation
      const validation = validateEventData(queueItem.eventType, queueItem.data);
      if (!validation.valid) {
        throw new Error(`Invalid event data: ${validation.error}`);
      }
      
      // 4. Authorization check
      const authorized = await checkEventAuthorization(
        queueItem.userId, 
        queueItem.eventType, 
        queueItem.data
      );
      if (!authorized) {
        throw new Error('Insufficient permissions for event creation');
      }
      
      // 5. Create event
      const event = await createEvent({
        type: queueItem.eventType,
        organizationId: queueItem.data.organizationId,
        projectId: queueItem.data.projectId || 'default',
        actor: { type: 'user', id: queueItem.userId },
        subject: queueItem.data.subject,
        data: queueItem.data,
        correlationId: queueItem.idempotencyKey
      });
      
      // 6. Update materialized views
      await updateMaterializedViews(event);
      
      // 7. Store idempotency result
      await storeIdempotencyResult(queueItem.idempotencyKey, { eventId: event.eventId });
      
      // 8. Mark queue item complete
      await snap.ref.update({
        status: 'completed',
        result: { eventId: event.eventId },
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Queue item ${queueId} processed successfully`);
      
    } catch (error) {
      console.error(`Queue item ${queueId} failed:`, error);
      
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
```

## Step 4: Real-Time Status Updates

### 4.1 Queue Status Component
```javascript
// src/components/QueueStatus.jsx
import React, { useState, useEffect } from 'react';
import { watchUserQueue } from '../services/queueService';

const QueueStatus = () => {
  const [queueItems, setQueueItems] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const unsubscribe = watchUserQueue((items) => {
      setQueueItems(items);
      setIsVisible(items.some(item => item.status === 'pending'));
    });
    
    return unsubscribe;
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="queue-status">
      <div className="queue-status-header">
        <span className="queue-status-title">Processing Operations</span>
        <span className="queue-status-count">{queueItems.filter(item => item.status === 'pending').length}</span>
      </div>
      
      <div className="queue-status-items">
        {queueItems.map(item => (
          <div key={item.id} className={`queue-status-item ${item.status}`}>
            <div className="queue-status-item-header">
              <span className="queue-status-item-action">{item.action}</span>
              <span className="queue-status-item-status">{item.status}</span>
            </div>
            
            {item.status === 'pending' && (
              <div className="queue-status-item-progress">
                <div className="queue-status-item-spinner"></div>
                <span>Processing...</span>
              </div>
            )}
            
            {item.status === 'failed' && (
              <div className="queue-status-item-error">
                <span>Error: {item.error}</span>
              </div>
            )}
            
            {item.status === 'completed' && (
              <div className="queue-status-item-success">
                <span>✓ Completed</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueueStatus;
```

### 4.2 Operation Feedback Hook
```javascript
// src/hooks/useOperationFeedback.js
import { useState, useCallback } from 'react';
import { queueOperationWithFeedback } from '../services/offlineQueue';

export const useOperationFeedback = () => {
  const [operations, setOperations] = useState([]);
  
  const executeOperation = useCallback(async (action, data) => {
    const operationId = Date.now().toString();
    
    // Add to operations list
    setOperations(prev => [...prev, {
      id: operationId,
      action,
      status: 'pending',
      timestamp: new Date()
    }]);
    
    try {
      const result = await queueOperationWithFeedback(action, data);
      
      // Update operation status
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'completed', result }
          : op
      ));
      
      return result;
    } catch (error) {
      // Update operation status
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'failed', error: error.message }
          : op
      ));
      
      throw error;
    }
  }, []);
  
  const clearOperations = useCallback(() => {
    setOperations([]);
  }, []);
  
  return {
    operations,
    executeOperation,
    clearOperations
  };
};
```

## Step 5: Error Handling and Retry Logic

### 5.1 Retry Service
```javascript
// functions/src/events/retryService.js
/**
 * Retry failed operations
 * @sig retryFailedOperations :: () -> Promise<Void>
 */
const retryFailedOperations = async () => {
  const failedQuery = await admin.firestore()
    .collection('update_queue')
    .where('status', '==', 'failed')
    .where('retryCount', '<', 3)
    .get();
  
  for (const doc of failedQuery.docs) {
    const operation = doc.data();
    
    // Increment retry count
    await doc.ref.update({
      retryCount: (operation.retryCount || 0) + 1,
      status: 'pending',
      lastRetryAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Retrying operation ${doc.id}, attempt ${(operation.retryCount || 0) + 1}`);
  }
};

/**
 * Schedule retry of failed operations
 * @sig scheduleRetry :: () -> Void
 */
exports.scheduleRetry = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    try {
      await retryFailedOperations();
    } catch (error) {
      console.error('Error retrying failed operations:', error);
    }
  });

module.exports = { retryFailedOperations };
```

### 5.2 Error Recovery
```javascript
// src/services/errorRecovery.js
import { queueOperation } from './queueService';

/**
 * Recover from failed operations
 * @sig recoverFromError :: (String, Object) -> Promise<String>
 */
export const recoverFromError = async (action, data) => {
  try {
    // Add retry metadata
    const retryData = {
      ...data,
      retryAttempt: true,
      originalTimestamp: new Date().toISOString()
    };
    
    return await queueOperation(action, retryData);
  } catch (error) {
    console.error('Error recovery failed:', error);
    throw error;
  }
};

/**
 * Handle operation errors with user feedback
 * @sig handleOperationError :: (Error, Function) -> Void
 */
export const handleOperationError = (error, onRetry) => {
  console.error('Operation error:', error);
  
  // Show user-friendly error message
  const errorMessage = getErrorMessage(error);
  
  // Offer retry option for certain errors
  if (isRetryableError(error)) {
    onRetry(errorMessage);
  } else {
    // Show error without retry option
    showError(errorMessage);
  }
};

/**
 * Get user-friendly error message
 * @sig getErrorMessage :: (Error) -> String
 */
const getErrorMessage = (error) => {
  if (error.message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  } else if (error.message.includes('permission')) {
    return 'You do not have permission to perform this action.';
  } else if (error.message.includes('validation')) {
    return 'Invalid data. Please check your input and try again.';
  } else {
    return 'An error occurred. Please try again.';
  }
};

/**
 * Check if error is retryable
 * @sig isRetryableError :: (Error) -> Boolean
 */
const isRetryableError = (error) => {
  const retryableErrors = ['network', 'timeout', 'connection'];
  return retryableErrors.some(keyword => 
    error.message.toLowerCase().includes(keyword)
  );
};

/**
 * Show error message to user
 * @sig showError :: (String) -> Void
 */
const showError = (message) => {
  // Implementation depends on your UI framework
  console.error('User error:', message);
  // Could use toast notifications, modal dialogs, etc.
};
```

## Success Criteria

### Technical
- [ ] Client-side queue operations working offline
- [ ] Offline sync handling functional
- [ ] Conflict resolution mechanisms working
- [ ] Real-time status updates displaying
- [ ] Error handling and retry logic functional

### Functional
- [ ] Operations can be queued while offline
- [ ] Operations sync when connection restored
- [ ] Conflicts resolved automatically
- [ ] Users get real-time feedback on operations
- [ ] Failed operations retry automatically

### User Experience
- [ ] Seamless offline/online experience
- [ ] Clear feedback on operation status
- [ ] Automatic conflict resolution
- [ ] Graceful error handling
- [ ] No data loss during offline periods

## Next Phase
Once offline queue architecture is complete, proceed to **Phase 6: Billing & Export** (`phase6-billing.md`).
