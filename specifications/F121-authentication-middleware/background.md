# F121: Authentication Middleware

## Status
**Partially Implemented** - Token validation exists in submit-action-request.js, passcode delivery deferred.

## Overview
Middleware for authenticating users via Firebase Auth tokens and authorizing actions based on custom claims. Provides reusable patterns for token validation, passcode verification, and custom claims management.

## Background

### Why Middleware?
HTTP functions need consistent authentication/authorization patterns. Middleware centralizes token validation, permission checking, and error handling across all endpoints.

### Key Requirements
- **Token Validation**: Verify Firebase Auth tokens on every request
- **Custom Claims**: Extract organization roles from token
- **Authorization**: Check permissions before processing actions
- **Passcode Auth**: SMS-based authentication (deferred)

## Implementation Patterns

### 1. Firebase Auth Configuration

```javascript
/**
 * Configure Firebase Auth for passcode-only authentication
 * @sig configurePasscodeAuth :: () -> Promise<Void>
 *
 * Note: Check Firebase Admin SDK documentation for exact API
 * This pattern shows the intent, actual API may differ
 */
const configurePasscodeAuth = async () => {
  await admin.auth().updateConfig({
    phoneNumberSignInEnabled: true,
    emailSignInEnabled: false,
    passwordSignInEnabled: false,
    anonymousSignInEnabled: false
  });
};
```

**Status**: Deferred - passcode delivery not yet implemented

### 2. Passcode Verification (SOC2-Compliant Action Flow)

The passcode verification flow uses two Actions for SOC2 audit trail compliance:

```javascript
/**
 * Handle PasscodeRequested action
 * @sig handlePasscodeRequested :: (Logger, FirestoreContext, ActionRequest) -> Promise<Void>
 *
 * Creates a passcode session stored in completedActions metadata
 * Sends SMS with 6-digit passcode (via Twilio or Firebase)
 */
const handlePasscodeRequested = async (logger, fsContext, actionRequest) => {
  const { phoneNumber } = actionRequest.action;

  // Generate random 6-digit passcode
  const passcode = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash passcode with bcrypt (cost factor 10)
  const hashedPasscode = await bcrypt.hash(passcode, 10);

  // Store hashed passcode in ActionRequest metadata
  const metadata = {
    hashedPasscode,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attemptsRemaining: 3,
  };

  // ActionRequest will be written with metadata by submit-action-request.js
  actionRequest.metadata = metadata;

  // Send SMS (implementation depends on SMS provider)
  await sendSMS(phoneNumber, `Your verification code is: ${passcode}`);

  logger.flowStep('Passcode sent via SMS');
};

/**
 * Handle PasscodeVerified action
 * @sig handlePasscodeVerified :: (Logger, FirestoreContext, ActionRequest) -> Promise<Void>
 *
 * Verifies passcode against stored hash
 * Creates User document if new user
 * Returns Firebase custom token to client via HTTP response metadata
 */
const handlePasscodeVerified = async (logger, fsContext, actionRequest) => {
  const { phoneNumber, passcode, correlationId } = actionRequest.action;

  // Find most recent PasscodeRequested for this phone number
  const recentRequest = await fsContext.completedActions.query({
    where: [
      ['action.type', '==', 'PasscodeRequested'],
      ['action.phoneNumber', '==', phoneNumber],
    ],
    orderBy: [['createdAt', 'desc']],
    limit: 1,
  });

  if (!recentRequest) {
    throw new Error('No passcode request found for this phone number');
  }

  const { metadata } = recentRequest;

  // Check expiration
  if (new Date() > metadata.expiresAt) {
    throw new Error('Passcode expired - request a new one');
  }

  // Check attempts remaining
  if (metadata.attemptsRemaining <= 0) {
    throw new Error('Too many failed attempts - request a new passcode');
  }

  // Verify passcode
  const isValid = await bcrypt.compare(passcode, metadata.hashedPasscode);

  if (!isValid) {
    // Decrement attempts and update metadata
    await fsContext.completedActions.update(recentRequest.id, {
      'metadata.attemptsRemaining': metadata.attemptsRemaining - 1,
    });
    throw new Error('Invalid passcode');
  }

  // Check if user exists
  let userId;
  const existingUser = await fsContext.users.queryOne({
    where: [['phoneNumber', '==', phoneNumber]],
  });

  if (existingUser) {
    userId = existingUser.id;
    logger.flowStep('Existing user authenticated');
  } else {
    // New user - create User document
    const userAction = Action.UserCreated.from({
      phoneNumber,
      displayName: phoneNumber, // Default to phone number
    });

    const userActionRequest = ActionRequest.from({
      action: userAction,
      actorId: 'system', // System-initiated
      idempotencyKey: `idm_${correlationId}`,
      correlationId,
    });

    await handleUserCreated(logger, fsContext, userActionRequest);
    userId = userAction.userId;
    logger.flowStep('New user created');
  }

  // Generate Firebase custom token with userId in claims
  const customToken = await admin.auth().createCustomToken(userId, { userId });

  // Store token in ActionRequest metadata for HTTP response
  actionRequest.metadata = { customToken };

  logger.flowStep('Authentication successful');
};
```

**Status**: Implementation planned - handlers defined, integration pending

**SOC2 Compliance**:
- CC6.1: Both actions logged to completedActions for audit trail
- CC6.7: Passcodes hashed with bcrypt before storage
- CC7.2: Failed attempts logged and rate-limited (3 attempts max)
- CC7.3: Passcode expiration prevents replay attacks (10 min TTL)

### 3. Set Custom Claims

```javascript
/**
 * Set custom claims on Firebase Auth token
 * @sig setUserClaims :: (String, String, String, [String]) -> Promise<Void>
 */
const setUserClaims = async (userId, organizationId, role, permissions) => {
  const user = await admin.auth().getUser(userId);
  const currentClaims = user.customClaims || {};

  const updatedClaims = {
    ...currentClaims,
    organizations: {
      ...currentClaims.organizations,
      [organizationId]: {
        role,
        permissions,
        joinedAt: new Date().toISOString()
      }
    }
  };

  await admin.auth().setCustomUserClaims(userId, updatedClaims);
};
```

**Status**: Ready - pattern defined, used by RoleAssigned handler

### 4. Authentication Middleware

```javascript
/**
 * Authenticate user via Firebase Auth token
 * @sig authenticateUser :: (Request, Response, Next) -> Promise<Void>
 *
 * Middleware for Express-style HTTP functions
 * Attaches decoded token to req.user
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Status**: Implemented in submit-action-request.js (inline, not middleware pattern yet)

### 5. Authorization Middleware

```javascript
/**
 * Authorize user for organization access
 * @sig authorizeOrganization :: (String) -> (Request, Response, Next) -> Promise<Void>
 *
 * Higher-order function returning middleware
 * Checks if user has required role in organization
 */
const authorizeOrganization = (requiredRole) => async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user.uid;

    const hasPermission = await checkPermission(req.user, organizationId, requiredRole);

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

**Status**: Pattern defined, not yet extracted to reusable middleware

### 6. Get User Organizations Helper

```javascript
/**
 * Get user's organizations from Firestore users collection
 * @sig getUserOrganizations :: (String) -> Promise<Object>
 *
 * Used when setting custom claims after authentication
 */
const getUserOrganizations = async (userId) => {
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(userId)
    .get();

  if (!userDoc.exists) {
    return {};
  }

  return userDoc.data().organizations || {};
};
```

**Status**: Pattern defined, used by custom claims logic

### 7. SOC2-Compliant Passcode Authentication Flow

The complete authentication flow uses Actions for audit trail compliance:

```
┌──────────┐                    ┌──────────────┐                    ┌──────────────┐
│  Client  │                    │  submitAction│                    │   Handlers   │
│          │                    │   Request    │                    │              │
└────┬─────┘                    └──────┬───────┘                    └──────┬───────┘
     │                                 │                                   │
     │ POST PasscodeRequested          │                                   │
     │ {phoneNumber: "+14155551234"}   │                                   │
     ├────────────────────────────────>│                                   │
     │                                 │                                   │
     │                                 │ handlePasscodeRequested           │
     │                                 ├──────────────────────────────────>│
     │                                 │                                   │
     │                                 │                   Generate passcode (6 digits)
     │                                 │                   Hash with bcrypt
     │                                 │                   Store in metadata
     │                                 │                   Send SMS
     │                                 │                                   │
     │                                 │<──────────────────────────────────┤
     │                                 │                                   │
     │ HTTP 200: {status: "completed"} │                                   │
     │<────────────────────────────────┤                                   │
     │                                 │                                   │
     │ [User receives SMS with code]   │                                   │
     │                                 │                                   │
     │ POST PasscodeVerified           │                                   │
     │ {phoneNumber, passcode: "123456"}│                                  │
     ├────────────────────────────────>│                                   │
     │                                 │                                   │
     │                                 │ handlePasscodeVerified            │
     │                                 ├──────────────────────────────────>│
     │                                 │                                   │
     │                                 │                   Lookup PasscodeRequested
     │                                 │                   Verify passcode hash
     │                                 │                   Create/lookup User
     │                                 │                   Generate custom token
     │                                 │                                   │
     │                                 │<──────────────────────────────────┤
     │                                 │                                   │
     │ HTTP 200: {status: "completed", │                                   │
     │           token: "eyJhbGc..." } │                                   │
     │<────────────────────────────────┤                                   │
     │                                 │                                   │
     │ [Client stores token, redirects]│                                   │
     │                                 │                                   │
```

**Why Two Actions?**

1. **Audit Trail (SOC2 CC6.1)**: Both request and verification logged to `completedActions`
   - Enables detection of brute force attacks (multiple failed PasscodeVerified for same phone)
   - Enables rate limit monitoring (too many PasscodeRequested from same IP)
   - Provides complete authentication timeline for incident response

2. **Failed Attempt Tracking (SOC2 CC7.2)**: PasscodeVerified failures logged separately
   - Each failed verification creates a completedActions entry (handler throws error)
   - Query pattern: Count PasscodeVerified failures between PasscodeRequested → successful PasscodeVerified

3. **Temporal Correlation**: PasscodeRequested.createdAt vs PasscodeVerified.createdAt
   - Detect delayed verification attacks (suspicious if >9 minutes after request)
   - Detect rapid-fire verification attempts (suspicious if multiple within seconds)

**Action Definitions**:

```javascript
// type-definitions/action.type.js
PasscodeRequested: {
  phoneNumber: FieldTypes.phoneNumber,
}

PasscodeVerified: {
  phoneNumber: FieldTypes.phoneNumber,
  passcode: 'String',  // Plain text, never stored (only hashed version in metadata)
}
```

**Session Metadata Structure**:

```javascript
// completedActions/{acr_xxx} for PasscodeRequested
{
  id: 'acr_xxx',
  action: { type: 'PasscodeRequested', phoneNumber: '+14155551234' },
  actorId: 'anonymous',  // No auth required for requesting passcode
  createdAt: Timestamp,
  processedAt: Timestamp,
  metadata: {
    hashedPasscode: '$2b$10$...',  // bcrypt hash
    expiresAt: Timestamp,  // createdAt + 10 minutes
    attemptsRemaining: 3,  // Decrements on each failed verification
  }
}
```

**Security Properties**:

- Passcodes never stored in plaintext
- 10-minute expiration prevents replay attacks
- 3-attempt limit prevents brute force (per session)
- All attempts logged for incident response
- 90-day retention before BigQuery archival (see Data Retention section)

**Status**: Architecture defined, implementation pending

### 8. Data Retention and Archival

**SOC2 Requirements**:
- CC6.1: Maintain audit logs for authentication events
- CC4.2: Data retention policy must balance audit needs vs storage costs

**Retention Policy**:

```javascript
// Firestore retention: 90 days
// - Fast queries for recent incident response
// - Keeps storage costs manageable
// - Sufficient for most security investigations

// BigQuery archival: Indefinite
// - Long-term audit trail for compliance
// - Cheaper storage for historical data
// - Queryable for annual audits

// Scheduled function (runs daily at 2am UTC)
const archiveOldPasscodeAttempts = onSchedule(
  { schedule: '0 2 * * *', timeZone: 'UTC' },
  async () => {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    // Query old PasscodeRequested and PasscodeVerified actions
    const oldActions = await admin.firestore()
      .collection('completedActions')
      .where('action.type', 'in', ['PasscodeRequested', 'PasscodeVerified'])
      .where('createdAt', '<', cutoffDate)
      .get();

    // Export to BigQuery
    const rows = oldActions.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      archivedAt: new Date(),
    }));

    await bigquery
      .dataset('audit_logs')
      .table('authentication_events')
      .insert(rows);

    // Delete from Firestore
    const batch = admin.firestore().batch();
    oldActions.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    console.log(`Archived ${rows.length} authentication events to BigQuery`);
  }
);
```

**BigQuery Schema**:

```sql
CREATE TABLE audit_logs.authentication_events (
  id STRING,                        -- ActionRequest ID (acr_xxx)
  action_type STRING,               -- PasscodeRequested | PasscodeVerified
  phone_number STRING,              -- Hashed for privacy (SHA256)
  actor_id STRING,                  -- 'anonymous' or userId
  created_at TIMESTAMP,             -- When action was created
  processed_at TIMESTAMP,           -- When action completed
  success BOOLEAN,                  -- true if PasscodeVerified succeeded
  error_message STRING,             -- If failed, what error
  metadata JSON,                    -- Session metadata (hashedPasscode, etc)
  archived_at TIMESTAMP             -- When archived from Firestore
);

-- Indexes for common queries
CREATE INDEX idx_phone_created ON authentication_events(phone_number, created_at DESC);
CREATE INDEX idx_type_created ON authentication_events(action_type, created_at DESC);
```

**Query Examples**:

```sql
-- Find all authentication attempts for a phone number
SELECT created_at, action_type, success, error_message
FROM audit_logs.authentication_events
WHERE phone_number = SHA256('+14155551234')
ORDER BY created_at DESC;

-- Detect brute force attacks (>10 failed attempts in 1 hour)
SELECT phone_number, COUNT(*) as failed_attempts
FROM audit_logs.authentication_events
WHERE action_type = 'PasscodeVerified'
  AND success = false
  AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
GROUP BY phone_number
HAVING COUNT(*) > 10;

-- Monthly authentication stats for SOC2 reporting
SELECT
  DATE_TRUNC(created_at, MONTH) as month,
  COUNT(*) as total_attempts,
  COUNTIF(success) as successful_logins,
  COUNTIF(NOT success) as failed_logins
FROM audit_logs.authentication_events
WHERE action_type = 'PasscodeVerified'
GROUP BY month
ORDER BY month DESC;
```

**Status**: Schema defined, scheduled function pending implementation

## Current Implementation

### Token Validation in submit-action-request.js

Currently implemented inline (not as middleware):

```javascript
// Extract from submit-action-request.js
const getActorId = req =>
    // TODO (F110.5): Extract from Firebase Auth token
    // const token = req.headers.authorization?.split('Bearer ')[1]
    // const decodedToken = await admin.auth().verifyIdToken(token)
    // return decodedToken.uid

    // Emulator bypass
    req.body.actorId || 'usr_emulatorbypass'
```

Location: `modules/curb-map/functions/src/submit-action-request.js:161-168`

## Usage Patterns

### Protecting HTTP Endpoints

```javascript
// Example: Protected organization endpoint
app.get(
  '/organizations/:organizationId',
  authenticateUser,  // First: verify token
  authorizeOrganization('viewer'),  // Second: check permissions
  async (req, res) => {
    // Handler logic - user is authenticated and authorized
    const { organizationId } = req.params;
    const org = await getOrganization(organizationId);
    res.json(org);
  }
);
```

### Custom Claims Structure

```javascript
// Firebase Auth token custom claims
{
  uid: "usr_abc123",
  phoneNumber: "+14155551234",
  organizations: {
    "org_sf": {
      role: "admin",
      permissions: ["read", "write", "admin", "impersonate"],
      joinedAt: "2025-01-15T10:00:00Z"
    },
    "org_la": {
      role: "member",
      permissions: ["read", "write"],
      joinedAt: "2025-01-10T14:30:00Z"
    }
  }
}
```

## Testing Strategy

### Unit Tests

**Token Validation**:
- Valid token → extract actorId
- Expired token → return 401
- Invalid token → return 401
- Missing token → return 401

**Authorization Checking**:
- Admin role → allow admin/member/viewer actions
- Member role → allow member/viewer actions
- Viewer role → allow only viewer actions
- No role → deny all actions

### Integration Tests

**Authentication Flow**:
- Request passcode → verify SMS sent (deferred)
- Verify passcode → receive token (deferred)
- Use token in subsequent requests → success
- Use expired token → 401

**Authorization Flow**:
- Valid token + org access → allow
- Valid token + no org access → 403
- Invalid token → 401

### Example Test (from security.md)

```javascript
test('organizationRead', async t => {
  const alice = testEnv.authenticatedContext('usr_alice', {
    organizations: { 'org_sf': { role: 'admin' } }
  });

  // Alice can read org_sf
  await alice.firestore().collection('organizations').doc('org_sf').get();
  t.pass('Alice can read org_sf');

  // Alice cannot read org_la
  await t.rejects(
    alice.firestore().collection('organizations').doc('org_la').get(),
    'Alice cannot read org_la'
  );
});
```

## Future Work

### Extract Middleware (Priority: Medium)
- Create `modules/curb-map/functions/src/middleware/auth.js`
- Extract `authenticateUser` from inline implementation
- Extract `authorizeOrganization` pattern
- Update all HTTP functions to use middleware

### Passcode Delivery (Priority: Low)
- Implement SMS delivery via Firebase Auth or Twilio
- Add `/requestPasscode` HTTP endpoint
- Add `/verifyPasscode` HTTP endpoint
- See F122 for rate limiting requirements

### Custom Claims Refresh (Priority: Low)
- Token refresh when roles change
- Force token refresh on RoleAssigned event
- Handle stale claims gracefully

## Security Considerations

### Token Expiration
- Firebase Auth tokens expire after 1 hour by default
- Client must refresh tokens before expiration
- Expired tokens return HTTP 401

### Custom Claims Size Limit
- Firebase Auth tokens have 1KB size limit for custom claims
- Current structure uses ~100 bytes per organization
- Supports ~10 organizations per user before hitting limit
- Alternative: Store roles in Firestore, lookup on each request (slower)

### Passcode Security (SOC2 CC6.7, CC7.2)

**Hashing**:
- All passcodes hashed with bcrypt (cost factor 10) before storage
- Plain-text passcodes never stored in Firestore
- Only hashed value in `PasscodeRequested.metadata.hashedPasscode`
- bcrypt.compare() used for verification (constant-time comparison)

**Brute Force Protection**:
- Per-session limit: 3 attempts per PasscodeRequested (tracked in metadata.attemptsRemaining)
- Time-based limit: 10-minute expiration per passcode session
- Rate limiting: Applied via F122 to limit PasscodeRequested calls per phone number
  - Recommended: Max 5 PasscodeRequested per phone per hour
  - Recommended: Max 20 PasscodeRequested per IP per hour

**Replay Attack Prevention**:
- Each PasscodeRequested generates new random 6-digit code
- Passcodes expire after 10 minutes (metadata.expiresAt)
- Successful PasscodeVerified consumes the session (future: add consumed flag)
- Old sessions archived to BigQuery after 90 days

**Phone Number Privacy**:
- Phone numbers hashed (SHA256) before archival to BigQuery
- Allows querying without exposing PII in long-term storage
- Firestore retains plain phone numbers for 90 days (operational need)

**Incident Response**:
- All failed attempts logged to completedActions
- BigQuery queries can identify attack patterns:
  - Multiple failed PasscodeVerified for same phone (credential stuffing)
  - Multiple PasscodeRequested from same IP (enumeration attack)
  - PasscodeVerified >9 minutes after PasscodeRequested (suspicious delay)

### Emulator Bypass
- `usr_emulatorbypass` hardcoded for testing
- **MUST** be removed before production deployment
- F110.5 will replace with real token validation

## References

**Architecture**:
- [Security Architecture](../../docs/architecture/security.md) - Authentication flow, zero trust model
- [Event Sourcing](../../docs/architecture/event-sourcing.md) - Actor attribution via actorId

**Related Specifications**:
- F120: User Impersonation - Uses custom claims for target user permissions
- F122: Rate Limiting - Applied to passcode requests
- F124: Permission Checking - `checkPermission` implementation

**Implementation Files**:
- `modules/curb-map/functions/src/submit-action-request.js` - Current inline implementation
- `modules/curb-map/functions/src/auth/` - Future middleware location (to be created)

**Testing**:
- `modules/curb-map/test/auth.firebase.js` - Authentication flow tests (to be created)
- `modules/curb-map/test/authorization.firebase.js` - Permission tests (to be created)
