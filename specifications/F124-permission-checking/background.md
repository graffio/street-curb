# F124: Permission Checking Implementation

## Status
**Partially Implemented** - Role hierarchy defined, permission checking logic exists inline, not yet extracted to reusable module.

## Overview
Permission checking functions for role-based access control (RBAC). Verifies user permissions based on organization roles stored in Firebase Auth custom claims and Firestore users collection.

## Background

### Why Permission Checking?
Multi-tenant applications need consistent authorization: "Can user X perform action Y in organization Z?" Permission checking centralizes this logic for use across all HTTP endpoints and event handlers.

### Key Requirements
- **Role Hierarchy**: admin > member > viewer
- **Organization-Scoped**: Permissions checked per organization
- **Custom Claims Integration**: Fast lookup via Firebase Auth token
- **Firestore Fallback**: Database lookup when token unavailable

## Role Hierarchy

### Simple Role Enum (MVP)
```javascript
// Three roles: admin | member | viewer
const roles = {
  admin: {
    description: "Full access to organization (manage users, settings, data)",
    permissions: ["read", "write", "admin", "impersonate"],
    scope: "organization"
  },
  member: {
    description: "Read/write data in organization",
    permissions: ["read", "write"],
    scope: "organization"
  },
  viewer: {
    description: "Read-only access to data",
    permissions: ["read"],
    scope: "organization"
  }
};
```

**Rationale**: Simplified for MVP. Granular permissions (e.g., "projects:write", "users:manage") deferred to F110.5+.

### User Roles Structure
```javascript
// Firestore /users/{userId} document
{
  id: "usr_alice",
  email: "alice@sf.gov",
  displayName: "Alice Johnson",
  organizations: {
    "org_sf": "admin",     // User can have different roles
    "org_la": "member"     // in different organizations
  }
}
```

```javascript
// Firebase Auth custom claims
{
  uid: "usr_alice",
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

## Implementation Patterns

### Permission Checking (Token-Based)

```javascript
/**
 * Check if user has required role in organization (using custom claims)
 * @sig hasPermission :: (DecodedToken, String, String) -> Boolean
 *
 * Fast check using Firebase Auth token custom claims (no database lookup)
 */
const hasPermission = (decodedToken, organizationId, requiredRole) => {
  const userRole = decodedToken.organizations?.[organizationId]?.role;

  if (!userRole) return false; // User not in organization

  // Role hierarchy: admin > member > viewer
  if (requiredRole === 'viewer') return ['viewer', 'member', 'admin'].includes(userRole);
  if (requiredRole === 'member') return ['member', 'admin'].includes(userRole);
  if (requiredRole === 'admin') return userRole === 'admin';

  return false;
};
```

**Usage**:
```javascript
// In HTTP function after token validation
const decodedToken = await admin.auth().verifyIdToken(token);

if (!hasPermission(decodedToken, 'org_sf', 'admin')) {
  return res.status(403).json({ error: 'Insufficient permissions' });
}
```

### Permission Checking (Database-Based)

```javascript
/**
 * Check if user has role in organization (using Firestore lookup)
 * @sig hasRole :: (String, String, String) -> Promise<Boolean>
 *
 * Slower check via database (fallback when token unavailable)
 * Used in event handlers where token may not be available
 */
const hasRole = async (userId, organizationId, requiredRole) => {
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(userId)
    .get();

  if (!userDoc.exists) return false;

  const user = userDoc.data();
  const userRole = user.organizations?.[organizationId];

  if (!userRole) return false;

  // Role hierarchy: admin > member > viewer
  if (requiredRole === 'viewer') return ['viewer', 'member', 'admin'].includes(userRole);
  if (requiredRole === 'member') return ['member', 'admin'].includes(userRole);
  if (requiredRole === 'admin') return userRole === 'admin';

  return false;
};
```

**Usage**:
```javascript
// In event handler
const canManageUsers = await hasRole(actorId, organizationId, 'admin');
if (!canManageUsers) {
  throw new Error('Only admins can manage users');
}
```

### Get User Organizations

```javascript
/**
 * Get all organizations user belongs to
 * @sig getUserOrganizations :: (String) -> Promise<Object>
 *
 * Returns: { "org_sf": "admin", "org_la": "member" }
 */
const getUserOrganizations = async (userId) => {
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(userId)
    .get();

  if (!userDoc.exists) return {};

  return userDoc.data().organizations || {};
};
```

### Check Specific Permission

```javascript
/**
 * Check if user has specific permission in organization
 * @sig checkPermission :: (DecodedToken, String, String) -> Boolean
 *
 * Granular permission checking (deferred to F110.5+)
 * For now, delegates to hasPermission with role hierarchy
 */
const checkPermission = (decodedToken, organizationId, permission) => {
  const userRole = decodedToken.organizations?.[organizationId]?.role;

  if (!userRole) return false;

  // Map permissions to roles
  const rolePermissions = roles[userRole]?.permissions || [];
  return rolePermissions.includes(permission);
};
```

**Future (F110.5+)**:
```javascript
// Granular permissions
checkPermission(token, 'org_sf', 'projects:write')  // -> true/false
checkPermission(token, 'org_sf', 'users:manage')    // -> true/false
checkPermission(token, 'org_sf', 'billing:read')    // -> true/false
```

## Current Implementation

### Inline in submit-action-request.js

Permission checking currently exists inline (not extracted):

```javascript
// From security.md:3.2 (lines 271-285)
const hasPermission = (decodedToken, organizationId, requiredRole) => {
  const userRole = decodedToken.organizations?.[organizationId]?.role;

  if (!userRole) return false;

  // Role hierarchy: admin > member > viewer
  if (requiredRole === 'viewer') return ['viewer', 'member', 'admin'].includes(userRole);
  if (requiredRole === 'member') return ['member', 'admin'].includes(userRole);
  if (requiredRole === 'admin') return userRole === 'admin';

  return false;
};
```

### Inline in multi-tenant.md

Database-based checking pattern defined but not implemented:

```javascript
// From multi-tenant.md:237-260
const hasRole = async (userId, organizationId, requiredRole) => {
  const user = await getUser(userId);
  const userRole = user.organizations[organizationId];

  // Simple role check
  if (requiredRole === 'viewer') return ['viewer', 'member', 'admin'].includes(userRole);
  if (requiredRole === 'member') return ['member', 'admin'].includes(userRole);
  if (requiredRole === 'admin') return userRole === 'admin';

  return false;
};
```

## Permission Matrix

### Role Capabilities

| Action | Viewer | Member | Admin |
|--------|--------|--------|-------|
| Read organization data | ✅ | ✅ | ✅ |
| Read user profiles | ✅ | ✅ | ✅ |
| Create/update data | ❌ | ✅ | ✅ |
| Delete data | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Update organization | ❌ | ❌ | ✅ |
| Impersonate users | ❌ | ❌ | ✅ |

### Action-Level Permissions

| Action Type | Required Role |
|-------------|---------------|
| OrganizationCreated | System admin |
| OrganizationUpdated | Admin |
| OrganizationSuspended | System admin |
| OrganizationDeleted | System admin |
| UserCreated | Admin |
| UserUpdated | Admin (or self) |
| UserDeleted | Admin |
| UserForgotten | Admin (or self) |
| RoleAssigned | Admin |

## Testing Strategy

### Unit Tests

**Role Hierarchy**:
- Admin can do admin actions → true
- Admin can do member actions → true
- Admin can do viewer actions → true
- Member can do admin actions → false
- Member can do member actions → true
- Member can do viewer actions → true
- Viewer can do admin actions → false
- Viewer can do member actions → false
- Viewer can do viewer actions → true

**Organization Scoping**:
- User in org_sf with admin role → can manage org_sf
- User in org_sf with admin role → cannot manage org_la
- User not in organization → cannot access at all

### Integration Tests

**Token-Based Checking**:
- Valid token with admin role → allow admin actions
- Valid token with member role → deny admin actions
- Valid token with no org access → deny all actions

**Database-Based Checking**:
- User exists with admin role → return true
- User exists with member role → return false for admin check
- User doesn't exist → return false

### Example Test

```javascript
test('permission checking', async t => {
  // Setup user with admin role in org_sf, member role in org_la
  const token = {
    uid: 'usr_alice',
    organizations: {
      'org_sf': { role: 'admin' },
      'org_la': { role: 'member' }
    }
  };

  // Alice can manage users in org_sf (admin)
  t.true(hasPermission(token, 'org_sf', 'admin'));

  // Alice cannot manage users in org_la (member only)
  t.false(hasPermission(token, 'org_la', 'admin'));

  // Alice can write data in org_la (member)
  t.true(hasPermission(token, 'org_la', 'member'));

  // Alice cannot access org_ny (not a member)
  t.false(hasPermission(token, 'org_ny', 'viewer'));
});
```

## Future Work

### Extract to Module (Priority: Medium)
- Create `modules/curb-map/src/auth/permissions.js`
- Export `hasPermission`, `hasRole`, `checkPermission`
- Use across all HTTP functions and handlers

### Granular Permissions (Priority: Low, F110.5+)
- Move from role enum to permission array
- Support resource-level permissions (e.g., "project:123:write")
- Permission composition (can have multiple permission sets)

### Permission Caching (Priority: Low)
- Cache user permissions in Redis
- Invalidate on RoleAssigned event
- Reduce Firestore reads

## Security Considerations

### Custom Claims Size Limit
- Firebase Auth tokens have 1KB limit for custom claims
- Current structure uses ~100 bytes per organization
- Supports ~10 organizations per user
- Alternative: Store roles in Firestore, query on each request (slower)

### Stale Claims
- Custom claims don't update until token refresh
- User role change may not take effect immediately
- Mitigation: Force token refresh on RoleAssigned event

### Firestore Rules Enforcement
- Permission checking in HTTP functions is first line of defense
- Firestore security rules provide second line (defense-in-depth)
- Even if HTTP function has bug, Firestore rules block unauthorized access

## Error Handling

### Missing User
```javascript
if (!user.exists) {
  throw new Error('User not found');
}
```

### Missing Organization
```javascript
if (!user.organizations[organizationId]) {
  throw new Error('User not in organization');
}
```

### Invalid Role
```javascript
if (!['admin', 'member', 'viewer'].includes(role)) {
  throw new Error('Invalid role');
}
```

## References

**Architecture**:
- [Security Architecture](../../docs/architecture/security.md) - Authorization model, RBAC
- [Data Model](../../docs/architecture/data-model.md) - User roles structure

**Related Specifications**:
- F120: User Impersonation - Requires `impersonate` permission (admin only)
- F121: Authentication Middleware - Token validation before permission check
- F123: Organization Management API - Authorization for organization operations

**Implementation Files**:
- `modules/curb-map/functions/src/submit-action-request.js` - Inline implementation (to be extracted)
- `modules/curb-map/src/auth/permissions.js` - Future module location

**Testing**:
- `modules/curb-map/test/authorization.firebase.js` - Permission tests (to be created)
