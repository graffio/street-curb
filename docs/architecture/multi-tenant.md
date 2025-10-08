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
    subscription: {
      tier: "premium",
      annualAmount: 50000,
      startDate: "2025-01-01T00:00:00Z",
      endDate: "2026-01-01T00:00:00Z"
    },
    settings: {
      ssoEnabled: false,
      ssoProvider: null,
      auditLogRetention: 2555 // 7 years
    },
    createdAt: "2025-01-01T00:00:00Z",
    createdBy: "userId"
  }
}
```

### Organization Events
- **OrganizationCreated**: New organization setup
- **OrganizationUpdated**: Organization settings changes
- **OrganizationDeleted**: Organization removal
- **OrganizationSuspended**: Temporary suspension
- **OrganizationReactivated**: Reactivation after suspension

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
// Projects - cached from events
projects: {
  projectId: {
    organizationId: "cuid2",
    name: "Downtown Curb Management",
    status: "active" | "inactive" | "archived",
    createdBy: "userId",
    createdAt: "2025-01-01T00:00:00Z",
    settings: {
      dataRetention: 2555, // 7 years
      exportFormat: ["json", "csv", "cds"]
    }
  }
}
```

### Project Events
- **ProjectCreated**: New project within organization
- **ProjectUpdated**: Project settings changes
- **ProjectArchived**: Project archival
- **ProjectDeleted**: Project removal

### Project Scoping
- **Default Project**: Each organization has a default project
- **Multi-Project Support**: Organizations can have multiple projects
- **Project Isolation**: Data isolated by project within organization
- **Cross-Project Access**: Controlled by organization-level permissions

## Role-Based Access Control (RBAC)

### Role Hierarchy
```javascript
const roles = {
  admin: {
    permissions: ["read", "write", "admin", "impersonate"],
    scope: "organization"
  },
  member: {
    permissions: ["read", "write"],
    scope: "project"
  },
  viewer: {
    permissions: ["read"],
    scope: "project"
  }
};
```

### Permission Model
```javascript
// User roles within organizations
users: {
  userId: {
    email: "alice@sf.gov",
    displayName: "Alice Johnson",
    roles: {
      organizationId: {
        role: "admin" | "member" | "viewer",
        permissions: ["read", "write", "admin"],
        lastAccess: "2025-01-15T10:30:00Z"
      }
    },
    lastLogin: "2025-01-15T09:00:00Z",
    failedAttempts: 0
  }
}
```

### Permission Checking
```javascript
/**
 * Check if user has permission for resource
 * @sig hasPermission :: (String, String, String) -> Promise<Boolean>
 */
const hasPermission = async (userId, organizationId, permission) => {
  const userRoles = await getUserRoles(userId);
  
  return userRoles.some(role => 
    role.organizationId === organizationId && 
    role.permissions.includes(permission)
  );
};
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
  eventId: {
    type: "UserCreated",
    organizationId: "cuid2", // Required for all events
    projectId: "cuid2", // Optional, defaults to 'default'
    // ... rest of event
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
