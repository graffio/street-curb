# Phase 2: Event Sourcing Core

**Goal**: Implement core event sourcing pattern with queue processing

## Architecture Reference

- **Event Sourcing Patterns**: See `docs/architecture/event-sourcing.md` for architectural patterns and principles

## Deliverables
- [ ] Firestore queue collection with proper rules
- [ ] Giant function for event processing
- [ ] Basic event types: `UserCreated`, `UserUpdated`, `UserForgotten`
- [ ] Idempotency handling with UUIDs
- [ ] Events collection with proper structure

## Step 1: Firestore Queue Collection

### 1.1 Queue Collection Structure
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

### 1.2 Queue Security Rules
```javascript
// firestore.rules - Update queue rules
match /update_queue/{queueId} {
  allow create: if 
    request.auth != null &&
    request.resource.data.keys().hasAll(['action', 'data', 'idempotencyKey', 'userId']) &&
    request.resource.data.action is string &&
    request.resource.data.data is map &&
    request.resource.data.idempotencyKey is string &&
    request.resource.data.userId == request.auth.uid;
  
  allow read: if 
    request.auth != null && 
    resource.data.userId == request.auth.uid;
  
  allow update: if false; // Only server functions can update
}
```

## Step 2: Giant Function for Event Processing

### 2.1 Main Queue Processing Function
```javascript
// functions/src/events/processUpdateQueue.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Process update queue items and create events
 * @sig processUpdateQueue :: (DocumentSnapshot, EventContext) -> Promise<Void>
 */
exports.processUpdateQueue = functions.firestore
  .document('update_queue/{queueId}')
  .onCreate(async (snap, context) => {
    const queueItem = snap.data();
    const queueId = context.params.queueId;
    
    try {
      console.log(`Processing queue item: ${queueId}`);
      
      // 1. Idempotency check
      const existing = await checkIdempotencyKey(queueItem.idempotencyKey);
      if (existing) {
        await snap.ref.update({
          status: 'completed',
          result: existing,
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return;
      }
      
      // 2. Input validation
      const validation = validateEventData(queueItem.eventType, queueItem.data);
      if (!validation.valid) {
        throw new Error(`Invalid event data: ${validation.error}`);
      }
      
      // 3. Authorization check
      const authorized = await checkEventAuthorization(
        queueItem.userId, 
        queueItem.eventType, 
        queueItem.data
      );
      if (!authorized) {
        throw new Error('Insufficient permissions for event creation');
      }
      
      // 4. Create event
      const event = await createEvent({
        type: queueItem.eventType,
        organizationId: queueItem.data.organizationId,
        projectId: queueItem.data.projectId || 'default',
        actor: { type: 'user', id: queueItem.userId },
        subject: queueItem.data.subject,
        data: queueItem.data,
        correlationId: queueItem.idempotencyKey
      });
      
      // 5. Update materialized views
      await updateMaterializedViews(event);
      
      // 6. Store idempotency result
      await storeIdempotencyResult(queueItem.idempotencyKey, { eventId: event.eventId });
      
      // 7. Mark queue item complete
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

### 2.2 Event Creation Function
```javascript
// functions/src/events/createEvent.js
const { createId } = require('@paralleldrive/cuid2');

/**
 * Create immutable event in Firestore
 * @sig createEvent :: (Object) -> Promise<Object>
 */
const createEvent = async (eventData) => {
  const event = {
    eventId: createId(),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    schemaVersion: 1,
    ...eventData
  };
  
  // Write to events collection (immutable)
  await admin.firestore()
    .collection('events')
    .doc(event.eventId)
    .set(event);
  
  return event;
};

module.exports = { createEvent };
```

### 2.3 Idempotency Handling
```javascript
// functions/src/events/idempotency.js
/**
 * Check if operation already processed
 * @sig checkIdempotencyKey :: (String) -> Promise<Object|null>
 */
const checkIdempotencyKey = async (key) => {
  const doc = await admin.firestore()
    .collection('processed_operations')
    .doc(key)
    .get();
    
  return doc.exists ? doc.data().result : null;
};

/**
 * Store idempotency result
 * @sig storeIdempotencyResult :: (String, Object) -> Promise<Void>
 */
const storeIdempotencyResult = async (key, result) => {
  await admin.firestore()
    .collection('processed_operations')
    .doc(key)
    .set({ 
      result, 
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
};

module.exports = { checkIdempotencyKey, storeIdempotencyResult };
```

## Step 3: Event Validation

### 3.1 Event Data Validation
```javascript
// functions/src/events/validation.js
/**
 * Validate event data structure and business rules
 * @sig validateEventData :: (String, Object) -> Promise<Object>
 */
const validateEventData = (eventType, data) => {
  // 1. Structure validation
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid payload structure' };
  }
  
  // 2. Event-specific validation
  switch (eventType) {
    case 'UserCreated':
      if (!data.email || !isValidEmail(data.email)) {
        return { valid: false, error: 'Invalid email address' };
      }
      if (!data.organizationId || typeof data.organizationId !== 'string') {
        return { valid: false, error: 'Valid organization ID required' };
      }
      if (!data.subject || data.subject.type !== 'user') {
        return { valid: false, error: 'Valid user subject required' };
      }
      break;
      
    case 'UserUpdated':
      if (!data.subject || data.subject.type !== 'user') {
        return { valid: false, error: 'Valid user subject required' };
      }
      if (!data.changes || typeof data.changes !== 'object') {
        return { valid: false, error: 'Changes object required' };
      }
      break;
      
    case 'UserForgotten':
      if (!data.subject || data.subject.type !== 'user') {
        return { valid: false, error: 'Valid user subject required' };
      }
      if (!data.reason || !['CCPA_request', 'GDPR_request'].includes(data.reason)) {
        return { valid: false, error: 'Valid reason required' };
      }
      break;
      
    default:
      return { valid: false, error: `Unknown event type: ${eventType}` };
  }
  
  // 3. Business rule validation
  if (eventType === 'UserCreated' && data.initialRole === 'admin' && !data.justification) {
    return { valid: false, error: 'Admin role assignment requires justification' };
  }
  
  return { valid: true, data };
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = { validateEventData };
```

### 3.2 Authorization Check
```javascript
// functions/src/events/authorization.js
/**
 * Check if user can create this event
 * @sig checkEventAuthorization :: (String, String, Object) -> Promise<Boolean>
 */
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
      
    default:
      return false;
  }
};

/**
 * Get user roles for all organizations
 * @sig getUserRoles :: (String) -> Promise<Array>
 */
const getUserRoles = async (userId) => {
  const rolesSnapshot = await admin.firestore()
    .collection('user_organization_roles')
    .where('userId', '==', userId)
    .get();
    
  return rolesSnapshot.docs.map(doc => doc.data());
};

module.exports = { checkEventAuthorization };
```

## Step 4: Materialized View Updates

### 4.1 View Update Function
```javascript
// functions/src/events/materializedViews.js
/**
 * Update materialized views based on event
 * @sig updateMaterializedViews :: (Object) -> Promise<Void>
 */
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
      
    default:
      console.log(`No materialized view update needed for event type: ${event.type}`);
  }
};

/**
 * Update user materialized view
 * @sig updateUserView :: (Object) -> Promise<Void>
 */
const updateUserView = async (event) => {
  const userId = event.subject.id;
  const organizationId = event.organizationId;
  
  // Get current user state from events
  const currentState = await getCurrentUserState(organizationId, event.projectId, userId);
  
  if (currentState) {
    // Update materialized view
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .set(currentState, { merge: true });
  }
};

/**
 * Remove user from materialized view (for UserForgotten)
 * @sig removeUserView :: (Object) -> Promise<Void>
 */
const removeUserView = async (event) => {
  const userId = event.subject.id;
  
  // Remove from materialized view
  await admin.firestore()
    .collection('users')
    .doc(userId)
    .delete();
};

/**
 * Calculate current user state from events
 * @sig getCurrentUserState :: (String, String, String) -> Promise<Object|null>
 */
const getCurrentUserState = async (organizationId, projectId, userId) => {
  const userEvents = await admin.firestore()
    .collection('events')
    .where('organizationId', '==', organizationId)
    .where('projectId', '==', projectId || 'default')
    .where('subject.type', '==', 'user')
    .where('subject.id', '==', userId)
    .orderBy('timestamp', 'asc')
    .get();
    
  let state = null;
  
  for (const eventDoc of userEvents.docs) {
    const event = eventDoc.data();
    
    switch (event.type) {
      case 'UserCreated':
        state = {
          userId: userId,
          email: event.data.email,
          role: event.data.initialRole,
          status: 'active',
          createdAt: event.timestamp,
          organizationId: organizationId,
          projectId: projectId || 'default'
        };
        break;
        
      case 'UserUpdated':
        if (state) {
          Object.keys(event.data.changes).forEach(field => {
            state[field] = event.data.changes[field].to;
          });
        }
        break;
        
      case 'UserForgotten':
        return null; // User no longer exists for privacy compliance
    }
  }
  
  return state?.status === 'active' ? state : null;
};

module.exports = { updateMaterializedViews };
```

## Step 5: Client-Side Queue Operations

### 5.1 Queue Event Helper
```javascript
// src/utils/queueEvents.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Queue event for processing
 * @sig queueEvent :: (String, Object) -> Promise<String>
 */
export const queueEvent = async (eventType, data) => {
  const idempotencyKey = crypto.randomUUID();
  
  const queueItem = {
    action: 'createEvent',
    eventType,
    data,
    idempotencyKey,
    userId: auth.currentUser.uid,
    timestamp: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'update_queue'), queueItem);
  return docRef.id;
};

/**
 * Create user via queue
 * @sig createUser :: (String, String, Object) -> Promise<String>
 */
export const createUser = async (organizationId, projectId, userData) => {
  return queueEvent('UserCreated', {
    organizationId,
    projectId: projectId || 'default',
    subject: { type: 'user', id: userData.firebaseUid },
    email: userData.email,
    initialRole: userData.role || 'member'
  });
};

/**
 * Update user via queue
 * @sig updateUser :: (String, String, String, Object) -> Promise<String>
 */
export const updateUser = async (organizationId, projectId, userId, changes) => {
  return queueEvent('UserUpdated', {
    organizationId,
    projectId: projectId || 'default',
    subject: { type: 'user', id: userId },
    changes
  });
};

/**
 * Forget user via queue (CCPA/GDPR compliance)
 * @sig forgetUser :: (String, String, String, String) -> Promise<String>
 */
export const forgetUser = async (organizationId, projectId, userId, reason) => {
  return queueEvent('UserForgotten', {
    organizationId,
    projectId: projectId || 'default',
    subject: { type: 'user', id: userId },
    reason
  });
};
```

### 5.2 Queue Status Tracking
```javascript
// src/utils/queueStatus.js
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Watch queue item status
 * @sig watchQueueStatus :: (String, Function) -> Function
 */
export const watchQueueStatus = (queueId, callback) => {
  return onSnapshot(doc(db, 'update_queue', queueId), (doc) => {
    if (doc.exists()) {
      const item = doc.data();
      callback(item.status, item.result, item.error);
    }
  });
};

/**
 * Create user with status feedback
 * @sig createUserWithFeedback :: (String, String, Object) -> Promise<Object>
 */
export const createUserWithFeedback = async (organizationId, projectId, userData) => {
  const queueId = await createUser(organizationId, projectId, userData);
  
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
  });
};
```

## Success Criteria

### Technical
- [ ] Firestore queue collection created with proper security rules
- [ ] Giant function processes queue items successfully
- [ ] Basic event types (UserCreated, UserUpdated, UserForgotten) working
- [ ] Idempotency prevents duplicate event processing
- [ ] Events stored immutably with proper structure
- [ ] Materialized views updated from events

### Functional
- [ ] Client can queue events for processing
- [ ] Server validates event data and authorization
- [ ] Events created with proper audit trail
- [ ] Materialized views stay in sync with events
- [ ] Error handling works correctly
- [ ] Queue status tracking functional

### Security
- [ ] Firestore rules prevent unauthorized queue access
- [ ] Server-side validation prevents malicious data
- [ ] Authorization checks work correctly
- [ ] Idempotency prevents replay attacks
- [ ] Events provide complete audit trail

## Next Phase
Once event sourcing core is complete, proceed to **Phase 3: Authentication System** (`phase3-auth.md`).
