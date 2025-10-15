# F120: User Impersonation System

## Status
**Deferred** - Infrastructure defined, implementation deferred until support staff tooling is prioritized.

## Overview
Support staff can impersonate users to debug customer issues in production while maintaining SOC2-compliant audit trail. Impersonation sessions are time-limited (1 hour), require admin `impersonate` permission, and log all activity to completedActions.

## Background

### Why Impersonation?
Municipal customers often encounter issues that can only be debugged by viewing their exact data and permissions. Direct database access violates SOC2 controls. Impersonation provides controlled, audited access to user sessions.

### Key Requirements
- **Permission-Based**: Only users with `impersonate` permission (typically admins)
- **Audit Trail**: All impersonation sessions logged with reason, timestamps, and actor identity
- **Time-Limited**: Sessions expire after 1 hour (configurable)
- **SOC2 Compliant**: Meets audit requirements for production access

## Implementation Pattern

### Impersonation Session Document
```javascript
// Firestore collection: impersonation_sessions
{
  sessionId: "ses_<uuid>",
  impersonatorId: "usr_alice",
  targetUserId: "usr_bob",
  targetClaims: {
    organizations: {
      "org_sf": { role: "member", joinedAt: "2025-01-10T14:30:00Z" }
    }
  },
  reason: "Debug survey submission issue in ticket #1234",
  startedAt: "2025-01-15T10:00:00Z",
  expiresAt: "2025-01-15T11:00:00Z",
  status: "active" | "expired" | "terminated"
}
```

### Start Impersonation Function
```javascript
/**
 * Start impersonation session
 * @sig startImpersonation :: (String, String, String) -> Promise<Session>
 */
const startImpersonation = async (impersonatorId, targetUserId, reason) => {
  // 1. Verify impersonator has permission
  const canImpersonate = await hasPermission(impersonatorId, 'impersonate');
  if (!canImpersonate) {
    throw new Error('Insufficient permissions for impersonation');
  }

  // 2. Get target user's claims
  const targetClaims = await getUserClaims(targetUserId);

  // 3. Create impersonation session
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

  // 4. Store session and log event
  await admin.firestore().collection('impersonation_sessions').doc(sessionId).set(session);
  await logAuthEvent('ImpersonationStarted', impersonatorId, {
    targetUserId,
    sessionId,
    reason
  });

  return session;
};
```

### End Impersonation Function
```javascript
/**
 * End impersonation session
 * @sig endImpersonation :: (String, String) -> Promise<Void>
 */
const endImpersonation = async (sessionId, impersonatorId) => {
  const session = await admin.firestore()
    .collection('impersonation_sessions')
    .doc(sessionId)
    .get();

  if (!session.exists) {
    throw new Error('Session not found');
  }

  if (session.data().impersonatorId !== impersonatorId) {
    throw new Error('Cannot end another user\'s impersonation session');
  }

  await admin.firestore()
    .collection('impersonation_sessions')
    .doc(sessionId)
    .update({ status: 'terminated' });

  await logAuthEvent('ImpersonationEnded', impersonatorId, {
    targetUserId: session.data().targetUserId,
    sessionId,
    endedAt: new Date().toISOString()
  });
};
```

### Session Validation Middleware
```javascript
/**
 * Validate impersonation session in HTTP requests
 * @sig validateImpersonationSession :: (String) -> Promise<Session | null>
 */
const validateImpersonationSession = async (sessionId) => {
  const session = await admin.firestore()
    .collection('impersonation_sessions')
    .doc(sessionId)
    .get();

  if (!session.exists) return null;

  const data = session.data();

  // Check expiration
  if (new Date(data.expiresAt) < new Date()) {
    await admin.firestore()
      .collection('impersonation_sessions')
      .doc(sessionId)
      .update({ status: 'expired' });
    return null;
  }

  // Check status
  if (data.status !== 'active') return null;

  return data;
};
```

## Event Sourcing Integration

### ImpersonationStarted Event
```javascript
{
  type: 'ImpersonationStarted',
  organizationId: 'system',
  projectId: 'default',
  actor: { type: 'user', id: 'usr_alice' },
  subject: { type: 'user', id: 'usr_bob' },
  data: {
    sessionId: 'ses_<uuid>',
    reason: 'Debug survey submission issue in ticket #1234'
  }
}
```

### ImpersonationEnded Event
```javascript
{
  type: 'ImpersonationEnded',
  organizationId: 'system',
  projectId: 'default',
  actor: { type: 'user', id: 'usr_alice' },
  subject: { type: 'user', id: 'usr_bob' },
  data: {
    sessionId: 'ses_<uuid>',
    endedAt: '2025-01-15T10:30:00Z'
  }
}
```

## UI Flow (Deferred)

### Admin Impersonation Panel
1. Admin navigates to User Management
2. Selects user to impersonate
3. Enters reason for impersonation (required)
4. Clicks "Start Impersonation"
5. UI switches to target user's view with banner: "Impersonating [User] - Session expires in 59:32"
6. Admin can "End Impersonation" at any time
7. Session automatically expires after 1 hour

## Security Considerations

### Permission Checking
- Only users with `impersonate` permission can start sessions
- Typically restricted to admins or support staff
- Cannot impersonate users in organizations where impersonator has no access

### Audit Trail
- All impersonation sessions logged to completedActions (immutable)
- Reason required (free-text) for SOC2 compliance
- Timestamps show exact duration of impersonation
- Can query: "Who impersonated whom, when, and why?"

### Session Expiration
- Hard limit: 1 hour (configurable)
- Automatic termination on expiration
- Manual termination available
- Expired sessions cannot be reused

## Testing Strategy

### Unit Tests
- Permission checking (only admins can impersonate)
- Session creation and validation
- Expiration handling
- Event logging

### Integration Tests
- Start/end impersonation via HTTP
- Validate impersonated requests
- Query audit trail for impersonation events

### E2E Tests (when UI implemented)
- Admin starts impersonation
- Admin performs actions as target user
- Admin ends impersonation
- Verify audit trail completeness

## Future Enhancements

### Session Management
- List active impersonation sessions (admin view)
- Force-terminate sessions (super admin)
- Session duration configuration per organization

### Advanced Permissions
- Granular impersonation permissions (e.g., "can impersonate viewers only")
- Organization-scoped impersonation (can only impersonate within own org)

### Analytics
- Impersonation usage metrics
- Alerting on unusual impersonation patterns
- Compliance reports for SOC2 audits

## References

**Architecture**:
- [Security Architecture](../../docs/architecture/security.md) - Authentication, authorization, RBAC
- [Event Sourcing](../../docs/architecture/event-sourcing.md) - Audit trail integration

**Related Specifications**:
- F121: Authentication Middleware - Token validation, permission checking
- F124: Permission Checking - `hasPermission` implementation

**Implementation Status**:
- ✅ Event types defined (ImpersonationStarted, ImpersonationEnded)
- ✅ Architecture documented
- ⏸️ HTTP endpoints deferred (no current need)
- ⏸️ UI deferred (support staff tooling not prioritized)
