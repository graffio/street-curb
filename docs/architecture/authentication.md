# Authentication Architecture

## Core Pattern: Passcode-Only Authentication

**Decision**: Passcode-only authentication, no anonymous users
**Rationale**: Simplified security model, better audit trail, reduced attack surface

## Authentication Flow

```
User → Passcode Entry → Firebase Auth → Custom Claims → Role-Based Access
```

### Benefits
- **Simplified UX**: No complex password management
- **Better Security**: No password-based attacks
- **Audit Trail**: Clear user identification for all actions
- **SOC2 Compliance**: Meets enterprise security requirements

## User Management

### User Creation
```javascript
// User creation via event sourcing
{
  type: "UserCreated",
  data: {
    email: "alice@sf.gov",
    displayName: "Alice Johnson",
    organizationId: "cuid2",
    role: "admin"
  }
}
```

### Role Assignment
```javascript
// Role assignment via events
{
  type: "RoleAssigned",
  data: {
    userId: "cuid2",
    organizationId: "cuid2",
    role: "admin",
    permissions: ["read", "write", "admin"]
  }
}
```

## Security Model

### Firebase Auth Configuration
- **Provider**: Custom passcode authentication
- **Custom Claims**: Organization roles and permissions
- **Token Lifetime**: 1-12 hours (configurable)
- **MFA**: Required for all user accounts

### Access Control
```javascript
// Firestore rules example
match /organizations/{organizationId} {
  allow read, write: if 
    request.auth != null &&
    request.auth.token.organizations[organizationId] != null;
}
```

## Developer Authentication

### Service Account Impersonation
**Decision**: Service account impersonation instead of key files
**Rationale**: Better security, individual accountability, easier revocation

### Setup Process
1. Create service accounts per project
2. Grant developer impersonation permissions
3. Use `gcloud auth application-default login --impersonate-service-account`
4. Tokens auto-refresh when expired

### Benefits
- **No Key Files**: Eliminates credential management risk
- **Individual Accountability**: Audit logs show user + service account
- **Easy Revocation**: Remove IAM binding to revoke access
- **MFA Protection**: User accounts require multi-factor authentication

## Multi-Tenant Security

### Data Isolation
- **Complete Isolation**: Organizations cannot access each other's data
- **Role-Based Access**: Permissions scoped to organization
- **Audit Logging**: All actions logged with user and organization context

### Impersonation Feature
- **Support Access**: Debug customer issues in production
- **Audit Trail**: All impersonation actions logged
- **SOC2 Compliance**: Proper audit logging for compliance

## Compliance

### SOC2 Requirements
- **User Identification**: All actions tied to authenticated users
- **Access Control**: Role-based permissions with least privilege
- **Audit Logging**: Complete audit trail via event sourcing
- **Data Isolation**: Complete separation between organizations

### CCPA/GDPR
- **Right to be Forgotten**: UserForgotten events remove user data
- **Data Portability**: Export functionality for user data
- **Consent Management**: Clear data usage policies

## Implementation Examples

### F107 Implementation
- **Firebase Auth**: Custom passcode authentication
- **Custom Claims**: Organization roles and permissions
- **Service Account Impersonation**: Developer authentication
- **Event Sourcing**: User management via events

### Future Implementations
- **OAuth Integration**: For enterprise customers
- **SSO Support**: SAML/OIDC integration
- **Multi-Factor**: Additional security layers

## Security Considerations

### Threats Mitigated
- **Password Attacks**: No passwords to attack
- **Credential Theft**: No long-lived credentials
- **Insider Threats**: Individual accountability via impersonation
- **Data Breaches**: Complete data isolation

### Monitoring
- **Failed Authentication**: Track and alert on failures
- **Unusual Access**: Monitor for suspicious patterns
- **Impersonation**: Log all impersonation activities
- **Role Changes**: Audit all permission modifications

## Rate Limiting

### Passcode Request Rate Limiting
```javascript
// Rate limiting for passcode requests
const rateLimitPasscodeRequests = async (phoneNumber) => {
  const key = `passcode_requests:${phoneNumber}`;
  const attempts = await redis.get(key) || 0;
  
  if (attempts >= 3) {
    throw new Error('Rate limit exceeded: 3 attempts per hour');
  }
  
  await redis.setex(key, 3600, attempts + 1); // 1 hour TTL
};
```

### Implementation Guidelines
- **Phone Number Limit**: 3 attempts per phone number per hour
- **IP Address Limit**: 5 attempts per IP address per hour
- **Progressive Delays**: 30s, 2min, 5min delays for repeated failures
- **Monitoring**: Alert on rate limit violations

## SMS Provider Integration

### Firebase Auth SMS Service
```javascript
// Real Firebase Auth SMS implementation
const sendPasscode = async (phoneNumber) => {
  try {
    // Use Firebase Auth phone authentication
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    const confirmationResult = await firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier);
    
    // Store verification ID for later verification
    return { verificationId: confirmationResult.verificationId };
  } catch (error) {
    console.error('SMS send failed:', error);
    throw error;
  }
};
```

### Alternative SMS Providers
If Firebase Auth SMS is not available:
- **Twilio**: Use Twilio SMS API with custom passcode generation
- **AWS SNS**: Use AWS SNS for SMS delivery
- **Custom Provider**: Implement custom SMS service with rate limiting

## Event Sourcing Integration

### Authentication Events
All authentication activities must be logged as events per `docs/architecture/event-sourcing.md`:

```javascript
// Log authentication events
const logAuthEvent = async (eventType, userId, data) => {
  await createEvent({
    type: eventType,
    organizationId: data.organizationId || 'system',
    projectId: data.projectId || 'default',
    actor: { type: 'user', id: userId },
    subject: { type: 'user', id: userId },
    data: data
  });
};

// Event types for authentication
const AUTH_EVENTS = {
  PASSCODE_REQUESTED: 'PasscodeRequested',
  PASSCODE_VERIFIED: 'PasscodeVerified',
  USER_AUTHENTICATED: 'UserAuthenticated',
  IMPERSONATION_STARTED: 'ImpersonationStarted',
  IMPERSONATION_ENDED: 'ImpersonationEnded',
  ROLE_ASSIGNED: 'RoleAssigned'
};
```

## Operational Safeguards

### Monitoring and Alerting
```javascript
// Monitor authentication failures
const monitorAuthFailures = async () => {
  const failures = await getRecentAuthFailures(24 * 60 * 60 * 1000); // 24 hours
  
  if (failures.length > 100) {
    await sendAlert('High authentication failure rate detected');
  }
  
  if (failures.some(f => f.type === 'RATE_LIMIT_EXCEEDED')) {
    await sendAlert('Rate limiting triggered - possible attack');
  }
};
```

### SOC2 Compliance Controls
- **Audit Logging**: All authentication events logged to immutable store
- **Access Monitoring**: Track failed authentication attempts
- **Rate Limiting**: Prevent brute force attacks
- **Session Management**: Automatic session expiration and cleanup
- **Impersonation Audit**: Complete audit trail for support activities

## Firebase Auth Implementation Patterns

### Passcode-Only Configuration
```javascript
// PSEUDOCODE - Firebase Admin SDK APIs may differ
// Configure Firebase Auth for passcode-only authentication
const configurePasscodeAuth = async () => {
  // PSEUDOCODE - Check Firebase Admin SDK documentation for actual API
  await admin.auth().updateConfig({
    phoneNumberSignInEnabled: true,
    emailSignInEnabled: false,
    passwordSignInEnabled: false,
    anonymousSignInEnabled: false
  });
  
  // Configure SMS settings
  await admin.auth().updateConfig({
    smsCodeSettings: {
      smsCodeLength: 6,
      smsCodeValidity: 300 // 5 minutes
    }
  });
};
```

### Passcode Delivery
```javascript
// PSEUDOCODE - Firebase Admin SDK APIs may differ
const sendPasscode = async (phoneNumber) => {
  try {
    // PSEUDOCODE - Use actual Firebase Auth API for SMS
    await admin.auth().generateSignInWithPhoneNumberToken(phoneNumber);
  } catch (error) {
    console.error('Failed to send passcode:', error);
    throw error;
  }
};
```

### Passcode Verification
```javascript
// PSEUDOCODE - Firebase Admin SDK APIs may differ
const verifyPasscode = async (phoneNumber, passcode) => {
  try {
    // PSEUDOCODE - Use actual Firebase Auth credential API
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

### Custom Claims Management
```javascript
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

const hasPermission = async (userId, organizationId, permission) => {
  const claims = await getUserClaims(userId);
  const orgClaims = claims.organizations?.[organizationId];
  
  if (!orgClaims) return false;
  return orgClaims.permissions.includes(permission) || orgClaims.role === 'admin';
};
```

### Impersonation System
```javascript
const startImpersonation = async (impersonatorId, targetUserId, reason) => {
  // Verify impersonator has permission
  const canImpersonate = await hasPermission(impersonatorId, 'impersonate');
  if (!canImpersonate) {
    throw new Error('Insufficient permissions for impersonation');
  }
  
  // Get target user's claims
  const targetClaims = await getUserClaims(targetUserId);
  
  // Create impersonation session
  const sessionId = crypto.randomUUID();
  const session = {
    sessionId,
    impersonatorId,
    targetUserId,
    targetClaims,
    reason,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    status: 'active'
  };
  
  // Store session and log event
  await admin.firestore().collection('impersonation_sessions').doc(sessionId).set(session);
  await createEvent({
    type: 'ImpersonationStarted',
    organizationId: 'system',
    projectId: 'default',
    actor: { type: 'user', id: impersonatorId },
    subject: { type: 'user', id: targetUserId },
    data: { sessionId, reason }
  });
  
  return session;
};
```

### Security Middleware
```javascript
// Authentication middleware
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

// Authorization middleware
const authorizeOrganization = (permission) => async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user.uid;
    
    const hasPermission = await checkPermission(userId, organizationId, permission);
    
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

## References

- **F109 Implementation**: See `specifications/F109-authentication-system/implementation.md`
- **Security Patterns**: See `docs/architecture/security.md`
- **Data Model**: See `docs/architecture/data-model.md`
