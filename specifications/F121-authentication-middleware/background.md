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

### 2. Passcode Verification

```javascript
/**
 * Verify passcode and generate custom token
 * @sig verifyPasscode :: (String, String) -> Promise<{token: String, user: Object}>
 */
const verifyPasscode = async (phoneNumber, passcode) => {
  try {
    // Verify passcode via Firebase Auth
    const credential = admin.auth.PhoneAuthProvider.credential(phoneNumber, passcode);
    const userCredential = await admin.auth().signInWithCredential(credential);

    // Generate custom token with organization claims
    const customToken = await admin.auth().createCustomToken(userCredential.user.uid, {
      phoneNumber: userCredential.user.phoneNumber,
      organizations: await getUserOrganizations(userCredential.user.uid)
    });

    return { token: customToken, user: userCredential.user };
  } catch (error) {
    console.error('Passcode verification failed:', error);
    throw error;
  }
};
```

**Status**: Deferred - waiting for passcode SMS delivery implementation

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
