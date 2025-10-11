# Multi-Tenant Architecture

## Core Pattern: Organization + Project Hierarchy

```
Organization
├── Members (Users)
├── Projects
│   ├── Data Collections
│   └── Reports
└── Settings
```

**Benefits**: Complete data isolation, scalable architecture, role-based access control, audit compliance

## Multi-Tenant Data Model

### Organization Hierarchy
- **Organizations**: Top-level tenant boundary
- **Projects**: Sub-tenant boundaries within organizations
- **Members**: Users with roles within organizations
- **Data Scoping**: All data scoped to organization + project

### Data Isolation Principles
- **Complete Isolation**: Organizations cannot access each other's data
- **Event Scoping**: All events scoped to `organizationId` + `projectId`
- **Materialized View Scoping**: Views filtered by organization
- **Security Rules**: Firestore rules enforce isolation

## Organization Management

### Organization Structure
```javascript
// Organizations - cached from events
organizations: {
  organizationId: {
    name: "City of San Francisco",
    status: "active" | "suspended",  // initialized to "active"
    defaultProjectId: "prj_abc123",  // links to default project (real CUID2)
    createdAt: timestamp,             // serverTimestamp
    createdBy: "userId",              // from actionRequest.actorId
    updatedAt: timestamp,             // serverTimestamp
    updatedBy: "userId"               // from actionRequest.actorId

    // Deferred to F112 (Billing):
    // subscription: {tier, annualAmount, startDate, endDate}

    // Deferred to backlog (SSO not in MVP):
    // settings: {ssoEnabled, ssoProvider, auditLogRetention}
  }
}

// Metadata fields (createdAt/createdBy/updatedAt/updatedBy) added by handlers from actionRequest.actorId
// NOT sent in Action payloads (prevents spoofing)
```

### Organization Events
- **OrganizationCreated**: New organization setup
- **OrganizationUpdated**: Organization name or status changes
- **OrganizationSuspended**: Suspend organization (shorthand for status change)
- **OrganizationDeleted**: Permanently delete organization

Note: OrganizationReactivated removed - use OrganizationUpdated with status="active" instead

### Organization API Patterns
```javascript
/**
 * Create organization via action request
 * @sig createOrganization :: (Object, Object) -> Promise<String>
 */
const createOrganization = async (organizationData, actor) => {
  const action = Action.OrganizationCreated.from({
    organizationId: organizationData.organizationId,
    metadata: {
      name: organizationData.name,
      subscription: {
        tier: organizationData.tier || 'basic',
        annualAmount: organizationData.annualAmount || 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      settings: {
        ssoEnabled: organizationData.ssoEnabled || false,
        ssoProvider: organizationData.ssoProvider,
        auditLogRetention: 2555 // 7 years
      }
    }
  });

  return createActionRequest(action, actor);
};
```

## Project Management

### Project Structure
```javascript
// Projects - default project per organization
// Hierarchical structure: /organizations/{orgId}/projects/{projectId}/
// Project CRUD actions deferred to backlog

projects: {
  "prj_abc123": {                  // Real CUID2 ID (not "default" magic string)
    organizationId: "org_123",
    name: "Default Project",
    createdAt: timestamp,          // serverTimestamp
    createdBy: "userId",           // from actionRequest.actorId
    updatedAt: timestamp,          // serverTimestamp
    updatedBy: "userId"            // from actionRequest.actorId
  }
}

// Found via: organization.defaultProjectId

// When projects are added (backlog):
// ProjectCreated, ProjectUpdated, ProjectArchived, ProjectDeleted actions
// Fields: {id, organizationId, name, status, createdAt, createdBy, updatedAt, updatedBy, settings}
// No migration needed - hierarchical structure already in place
```

### Project Events (Deferred to Backlog)
- **ProjectCreated**: New project within organization
- **ProjectUpdated**: Project settings changes
- **ProjectArchived**: Project archival
- **ProjectDeleted**: Project removal

Note: Project CRUD actions deferred to backlog. Using internal "default" project for now.

### Project Scoping
- **Default Project**: Each organization has a default project
- **Multi-Project Support**: Organizations can have multiple projects
- **Project Isolation**: Data isolated by project within organization
- **Cross-Project Access**: Controlled by organization-level permissions

## Role-Based Access Control (RBAC)

### Role Hierarchy (Simplified for MVP)
```javascript
// Simple role enum: "admin" | "member" | "viewer"
// Granular permissions deferred to F110.5+

const roles = {
  admin: {
    description: "Full access to organization (manage users, settings, data)",
    scope: "organization"
  },
  member: {
    description: "Read/write data in organization",
    scope: "organization"
  },
  viewer: {
    description: "Read-only access to data",
    scope: "organization"
  }
};

// Deferred to F110.5+ (granular permissions):
// permissions: ["organizations:read", "projects:write", "users:manage"]
```

### Permission Model (Simplified for MVP)
```javascript
// User roles within organizations
users: {
  userId: {
    email: "alice@sf.gov",
    displayName: "Alice Johnson",
    organizations: {
      "org_123": "admin",  // simple role enum: admin | member | viewer
      "org_456": "member"
    },
    lastLogin: timestamp | null,  // for auth tracking (F110.5, initialized null)
    failedAttempts: 0,            // for brute force prevention (F110.5)
    createdAt: timestamp,         // serverTimestamp
    createdBy: "userId",          // from actionRequest.actorId
    updatedAt: timestamp,         // serverTimestamp
    updatedBy: "userId"           // from actionRequest.actorId

    // Deferred to F110.5+ (granular permissions):
    // permissions: ["organizations:read", "projects:write", "users:manage"]

    // Deferred to backlog (analytics):
    // lastAccess: {orgId: timestamp}
  }
}

// Metadata fields (createdAt/createdBy/updatedAt/updatedBy) added by handlers from actionRequest.actorId
// NOT sent in Action payloads (prevents spoofing)
```

### Permission Checking (Simplified for MVP)
```javascript
/**
 * Check if user has role in organization
 * @sig hasRole :: (String, String, String) -> Promise<Boolean>
 *
 * Granular permission checking deferred to F110.5+
 * For now, check role enum (admin | member | viewer)
 */
const hasRole = async (userId, organizationId, requiredRole) => {
  const user = await getUser(userId);
  const userRole = user.organizations[organizationId];

  // Simple role check
  if (requiredRole === 'viewer') return ['viewer', 'member', 'admin'].includes(userRole);
  if (requiredRole === 'member') return ['member', 'admin'].includes(userRole);
  if (requiredRole === 'admin') return userRole === 'admin';

  return false;
};

// F110.5+ will add granular permission checking:
// hasPermission(userId, organizationId, "projects:write")
```

## Data Isolation Implementation

### Firestore Security Rules
```javascript
// Organization data isolation
match /organizations/{organizationId} {
  allow read, write: if 
    request.auth != null &&
    request.auth.token.organizations[organizationId] != null;
}

// Project data isolation
match /projects/{projectId} {
  allow read, write: if 
    request.auth != null &&
    request.auth.token.organizations[resource.data.organizationId] != null;
}

// User data isolation
match /users/{userId} {
  allow read, write: if 
    request.auth != null &&
    request.auth.uid == userId;
}
```

### Event Scoping
```javascript
// All completed actions scoped to organization
completedActions: {
  id: {
    id: "acr_<cuid12>",              // action request ID (used as document ID)
    action: { '@@tagName': "UserAdded", /* ... */ },
    organizationId: "org_<cuid12>",  // Required for all actions
    projectId: "prj_<cuid12>",       // Optional, defaults to 'default'
    // ... rest of action request
  }
}
```

### Materialized View Scoping
```javascript
// Views filtered by organization
const getOrganizationData = async (organizationId) => {
  return admin.firestore()
    .collection('organizations')
    .where('organizationId', '==', organizationId)
    .get();
};
```

## Multi-Tenant Security

### Access Control Patterns
- **Organization-Level**: Users belong to specific organizations
- **Project-Level**: Users can have different roles in different projects
- **Resource-Level**: Access controlled by organization + project scoping
- **Permission-Based**: Fine-grained permissions within organizations

### Data Protection
- **Complete Isolation**: No cross-organization data access
- **Audit Logging**: All actions logged with organization context
- **Data Encryption**: Organization-specific encryption keys
- **Access Logging**: Track all data access by organization

### Compliance Features
- **SOC2 Compliance**: Complete audit trail per organization
- **Data Residency**: Organization data stored in specified regions
- **Data Retention**: Organization-specific retention policies
- **Data Export**: Organization-specific data export capabilities

## Performance Optimization

### Query Optimization
- **Organization Indexes**: Index on organizationId for fast queries
- **Project Indexes**: Compound indexes on organizationId + projectId
- **User Indexes**: Index on userId + organizationId for role queries

### Caching Strategy
- **Organization Cache**: Cache organization data for quick access
- **User Role Cache**: Cache user roles within organizations
- **Project Cache**: Cache project data for quick access

### Scaling Considerations
- **Horizontal Scaling**: Scale by organization
- **Database Sharding**: Shard by organizationId
- **CDN Distribution**: Distribute by organization region

## Monitoring and Observability

### Organization Metrics
- **Active Organizations**: Number of active organizations
- **User Count**: Users per organization
- **Data Volume**: Data stored per organization
- **API Usage**: API calls per organization

### Security Monitoring
- **Access Patterns**: Monitor unusual access patterns
- **Failed Access**: Track failed access attempts
- **Permission Changes**: Audit role and permission changes
- **Data Access**: Log all data access by organization

### Performance Monitoring
- **Query Performance**: Monitor query performance by organization
- **Cache Hit Rates**: Monitor cache performance
- **Database Load**: Monitor database load by organization

## Migration and Onboarding

### Organization Onboarding
- **Self-Service**: Organizations can self-register
- **Admin Approval**: Require admin approval for new organizations
- **Trial Period**: Free trial period for new organizations
- **Onboarding Flow**: Guided setup process

### Data Migration
- **Organization Migration**: Move data between organizations
- **Project Migration**: Move projects between organizations
- **User Migration**: Transfer users between organizations
- **Data Validation**: Validate data integrity during migration

## References

- **F107 Implementation**: See `specifications/F107-firebase-soc2-vanilla-app/phase4-multitenant.md`
- **Data Model**: See `docs/architecture/data-model.md`
- **Authentication**: See `docs/architecture/authentication.md`
- **Security**: See `docs/architecture/security.md`
- **Event Sourcing**: See `docs/architecture/event-sourcing.md`
