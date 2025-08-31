# Implementation Details & Technical Decisions

**Date:** 2025.08.29  
**Purpose:** Technical "how" questions that can be decided during coding  
**Status:** Can start coding with reasonable defaults, refine during implementation

## Event Sourcing Implementation

### Core Event Schema Pattern
**Approach**: All changes stored as immutable events, current state calculated
```javascript
// Events collection - the source of truth
{
  event_id: "evt_12345", // auto-generated UUID
  type: "UserCreated" | "UserUpdated" | "UserDeleted" | "UserForgotten" | "RoleAssigned",
  timestamp: "2025-01-01T10:00:00Z",
  
  // Multi-tenant hierarchy  
  org_id: "org_sf",
  project_id: "default", // nullable, expandable for multi-project
  
  // Actor information (for SOC2 audit)
  actor: {
    type: "user" | "system" | "api",
    id: "admin_bob" | "system-scheduler" | "api-key-123"
  },
  
  // Subject of the event
  subject: {
    type: "user" | "organization" | "project",
    id: "alice"
  },
  
  // Event-specific data
  data: {
    // UserCreated: { email: string, initial_role: string }
    // UserUpdated: { changes: { field: { from: old, to: new } } }
    // UserDeleted: { reason: string }
    // UserForgotten: { reason: "CCPA_request" | "GDPR_request", retention_override: boolean }
  },
  
  // Correlation for debugging
  correlation_id: "req_abc123" // from client request
}
```

**Questions to resolve during implementation**:
- Should we batch related events into transactions?
- How do we handle event ordering guarantees?
- What's the event retention policy (7 years for SOC2)?

### Current State Calculation from Events
**Approach**: Build materialized views for performance, refresh from events
```javascript
// Calculate current user state from events
const getCurrentUserState = async (orgId, projectId, userId) => {
  const userEvents = await db.collection('events')
    .where('org_id', '==', orgId)
    .where('project_id', '==', projectId || 'default')
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
          user_id: userId,
          email: event.data.email,
          role: event.data.initial_role,
          status: 'active',
          created_at: event.timestamp
        };
        break;
        
      case 'UserUpdated':
        if (state) {
          Object.keys(event.data.changes).forEach(field => {
            state[field] = event.data.changes[field].to;
          });
        }
        break;
        
      case 'UserDeleted':
        if (state) state.status = 'deleted';
        break;
        
      case 'UserForgotten':
        return null; // User no longer exists for privacy compliance
        
      case 'RoleAssigned':
        if (state) state.role = event.data.new_role;
        break;
    }
  }
  
  return state?.status === 'deleted' ? null : state;
};
```

**Questions to resolve during implementation**:
- Should we cache calculated state in separate collection?
- How often do we refresh materialized views?
- Do we need event snapshots for performance?

## Authentication Implementation Details

### Firebase Auth → Event Sourcing Integration  
**Approach**: Firebase Auth creates events, not direct Firestore sync
```javascript
// On user login, check if user exists in event store
const ensureUserExists = async (firebaseUser, orgId, projectId = 'default') => {
  const currentState = await getCurrentUserState(orgId, projectId, firebaseUser.uid);
  
  if (!currentState) {
    // User doesn't exist in our event store, create via queue
    await queueUpdate('createUser', {
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email,
      display_name: firebaseUser.displayName,
      org_id: orgId,
      project_id: projectId,
      initial_role: 'user' // default role
    });
  }
  
  // Always create login event for audit trail
  await createEvent({
    type: 'UserLoggedIn',
    org_id: orgId,
    project_id: projectId,
    actor: { type: 'user', id: firebaseUser.uid },
    subject: { type: 'user', id: firebaseUser.uid },
    data: { 
      login_method: 'firebase_auth',
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    }
  });
};
```

**Questions to resolve during implementation**:
- How do we determine orgId/projectId from Firebase Auth user?
- Should we store Firebase custom claims as events too?
- How do we handle concurrent login attempts?

### Permission Checking Implementation
**Default Approach**: Role-based checks in giant function
```javascript
const checkPermission = async (userId, action, resource) => {
  const userRoles = await getUserRoles(userId);
  return userRoles.some(role => 
    role.org_id === resource.org_id && 
    role.permissions.includes(getRequiredPermission(action))
  );
};
```

**Questions to resolve during implementation**:
- Cache user roles for performance?
- How granular should permissions be?
- Resource hierarchy for nested permissions?

## Error Handling & Monitoring

### Giant Function Error Context  
**Default Approach**: Structured logging with correlation IDs
```javascript
const processUpdate = async (queueItem) => {
  const correlationId = queueItem.idempotency_key;
  
  try {
    logger.info('Processing queue item', { 
      correlationId, 
      action: queueItem.action,
      userId: queueItem.user_id 
    });
    
    // ... processing ...
    
  } catch (error) {
    logger.error('Queue processing failed', {
      correlationId,
      error: error.message,
      stack: error.stack,
      queueItem: redactSensitiveData(queueItem)
    });
    throw error;
  }
};
```

**Questions to resolve during implementation**:
- What data should we redact in error logs?
- How do we correlate client errors to server errors?
- Should we use structured logging libraries?

### Client Error Reporting Integration
**Default Approach**: Track queue status for user feedback
```javascript
// Client can watch for operation results
const watchQueueStatus = (queueId, callback) => {
  return onSnapshot(doc(db, 'update_queue', queueId), (doc) => {
    const item = doc.data();
    if (item.status === 'failed') {
      // Report to error service with context
      errorReporting.captureException(new Error(item.error), {
        user: auth.currentUser.uid,
        queueId,
        action: item.action
      });
    }
    callback(item.status, item.result, item.error);
  });
};
```

**Questions to resolve during implementation**:
- How do we avoid duplicate error reports?
- What client context is useful for server errors?

## Testing Implementation

### Firebase Emulator Setup
**Default Approach**: Use emulators for integration tests
```javascript
// test/setup.js
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');

const testEnv = await initializeTestEnvironment({
  projectId: 'test-project',
  firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
  functions: { source: './functions' }
});
```

**Questions to resolve during implementation**:
- How do we seed test data efficiently?
- Should we test against real GCP services sometimes?
- How do we test Stripe integration without charges?

### Infrastructure Testing Strategy
**Default Approach**: Create/destroy test projects with cleanup
```javascript
const testInfrastructure = async () => {
  const testProjectId = `test-infra-${Date.now()}`;
  
  try {
    // Create project
    await createSOC2Project({
      environment: 'test',
      projectName: 'Infrastructure Test',
      owner: 'test-runner',
      projectId: testProjectId
    });
    
    // Test project configuration
    await validateProjectSetup(testProjectId);
    
  } finally {
    // Always cleanup
    await deleteProject(testProjectId);
  }
};
```

**Questions to resolve during implementation**:
- How long should test projects live?
- Should we test project deletion too?
- Parallel test execution safety?

## Stripe Integration Details

### Webhook Signature Verification
**Default Approach**: Verify in Cloud Function before queue processing
```javascript
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = await getSecret('stripe-webhook-secret');
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Queue the webhook event for processing
  await queueUpdate('processStripeWebhook', {
    event_type: event.type,
    event_data: event.data
  });
  
  res.json({ received: true });
});
```

**Questions to resolve during implementation**:
- How do we handle webhook retries from Stripe?
- Should webhook processing be synchronous or queued?
- How do we test webhook endpoints locally?

### Subscription State Management
**Default Approach**: Store Stripe data in Firestore for quick access
```javascript
// organizations collection
{
  id: "org_123",
  stripe_customer_id: "cus_abc123",
  stripe_subscription_id: "sub_def456",
  subscription_status: "active", // synced from Stripe
  billing_tier: "premium",
  next_billing_date: timestamp
}
```

**Questions to resolve during implementation**:
- How often do we sync Stripe state?
- What happens if Stripe webhook fails?
- Should we store full Stripe objects or just key fields?

## Performance & Optimization

### Queue Processing Scalability
**Default Approach**: Single function with concurrency limits
```javascript
exports.processUpdateQueue = functions
  .runWith({ 
    timeoutSeconds: 60,
    memory: '256MB'
  })
  .firestore
  .document('update_queue/{queueId}')
  .onCreate(processUpdate);
```

**Questions to resolve during implementation**:
- What happens if queue processing takes too long?
- Should we batch process multiple queue items?
- How do we handle processing failures and retries?

### Firestore Query Optimization
**Default Approach**: Create indexes as needed, use composite indexes
```javascript
// Example: Get user's accessible organizations
const getUserOrgs = async (userId) => {
  // This will need a composite index: user_id + org_id
  const roles = await db.collection('user_org_roles')
    .where('user_id', '==', userId)
    .get();
  
  return roles.docs.map(doc => doc.data().org_id);
};
```

**Questions to resolve during implementation**:
- How many organizations can a user belong to (query limits)?
- Should we denormalize data for common queries?
- When do we need to use collection groups?

## Deployment & CI/CD

### Environment Configuration Management
**Default Approach**: Environment-specific config files
```javascript
// config/production.json
{
  "stripe_mode": "live",
  "soc2_compliance": true,
  "audit_retention_days": 2555, // 7 years
  "error_reporting_enabled": true
}

// config/development.json  
{
  "stripe_mode": "disabled",
  "soc2_compliance": false,
  "audit_retention_days": 30,
  "error_reporting_enabled": false
}
```

**Questions to resolve during implementation**:
- Where do we store sensitive config (API keys)?
- How do we handle config changes without redeploys?
- Should config be in code or external service?

### Deployment Rollback Strategy
**Default Approach**: Firebase Functions versioning + manual rollback
```javascript
// Deploy with version tags
firebase deploy --only functions --message "User management v1.2.3"

// Rollback if needed (manual process)
// 1. Identify last good deployment
// 2. Redeploy previous version
// 3. Check monitoring for success
```

**Questions to resolve during implementation**:
- How do we test deployments before promoting?
- Should we use blue/green deployments?
- How do we handle database schema changes in rollbacks?

---

## Resolution Strategy

**During Implementation**:
1. Start with default approaches documented here
2. Create TODO comments for decisions that need refinement  
3. Track technical debt for future optimization
4. Document actual decisions made in implementation notes

**Success Criteria**: Working system with documented technical decisions and clear path for optimization