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

## References

- **F107 Implementation**: See `specifications/F107-firebase-soc2-vanilla-app/phase3-auth.md`
- **Security Patterns**: See `docs/architecture/security.md`
- **Data Model**: See `docs/architecture/data-model.md`
