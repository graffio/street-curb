# F123: Organization Management API

## Status
**Partially Implemented** - Handlers exist for OrganizationCreated/Updated/Suspended/Deleted, client-facing API helpers not yet created.

## Overview
API patterns for creating, updating, suspending, and deleting organizations via event sourcing action requests. Provides helper functions for common organization management tasks.

## Background

### Why Organization API?
Organization management is a core workflow: create new municipal customer, update billing info, suspend for non-payment, delete after contract ends. Event sourcing ensures complete audit trail for these operations.

### Key Requirements
- **Event-Based**: All organization changes via action requests (OrganizationCreated, OrganizationUpdated, etc.)
- **Default Project**: Auto-create default project with real CUID2 ID
- **Audit Trail**: Complete history of organization lifecycle
- **Validation**: Server-side validation before state changes

## Implementation Patterns

### Create Organization

```javascript
/**
 * Create organization via action request
 * @sig createOrganization :: (Object, Object) -> Promise<String>
 *
 * Returns action request ID
 */
const createOrganization = async (organizationData, actor) => {
  const action = Action.OrganizationCreated.from({
    organizationId: organizationData.organizationId || FieldTypes.newOrganizationId(),
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

**Handler Logic** (already implemented):
1. Validate organization data structure
2. Create organization document in `/organizations/{id}`
3. Create default project document with real CUID2
4. Link default project via `organization.defaultProjectId`
5. Write to `completedActions` for audit trail

Location: `modules/curb-map/functions/src/events/organization-handlers.js:handleOrganizationCreated`

### Update Organization

```javascript
/**
 * Update organization metadata
 * @sig updateOrganization :: (String, Object, Object) -> Promise<String>
 */
const updateOrganization = async (organizationId, updates, actor) => {
  const action = Action.OrganizationUpdated.from({
    organizationId,
    metadata: updates
  });

  return createActionRequest(action, actor);
};
```

**Example Usage**:
```javascript
// Update organization name
await updateOrganization('org_sf', { name: 'City of San Francisco (Updated)' }, actor);

// Change subscription tier
await updateOrganization('org_sf', {
  subscription: {
    tier: 'enterprise',
    annualAmount: 50000,
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2026-01-01T00:00:00Z'
  }
}, actor);

// Update settings
await updateOrganization('org_sf', {
  settings: {
    ssoEnabled: true,
    ssoProvider: 'okta',
    auditLogRetention: 2555
  }
}, actor);
```

Location: `modules/curb-map/functions/src/events/organization-handlers.js:handleOrganizationUpdated`

### Suspend Organization

```javascript
/**
 * Suspend organization (e.g., non-payment)
 * @sig suspendOrganization :: (String, String, Object) -> Promise<String>
 */
const suspendOrganization = async (organizationId, reason, actor) => {
  const action = Action.OrganizationSuspended.from({
    organizationId,
    metadata: { reason }
  });

  return createActionRequest(action, actor);
};
```

**Handler Logic**:
- Sets `organization.status = 'suspended'`
- Blocks all API access for organization users (enforced by Firestore rules)
- Audit trail shows suspension reason

**Example Usage**:
```javascript
await suspendOrganization('org_sf', 'Non-payment for 90 days', actor);
```

Location: `modules/curb-map/functions/src/events/organization-handlers.js:handleOrganizationSuspended`

### Reactivate Organization

```javascript
/**
 * Reactivate suspended organization
 * @sig reactivateOrganization :: (String, Object) -> Promise<String>
 *
 * Note: Uses OrganizationUpdated (not separate ReactivateOrganization action)
 */
const reactivateOrganization = async (organizationId, actor) => {
  const action = Action.OrganizationUpdated.from({
    organizationId,
    metadata: { status: 'active' }
  });

  return createActionRequest(action, actor);
};
```

**Rationale**: OrganizationReactivated removed from action types. Use OrganizationUpdated with `status: 'active'` instead for simplicity.

### Delete Organization

```javascript
/**
 * Permanently delete organization
 * @sig deleteOrganization :: (String, String, Object) -> Promise<String>
 *
 * WARNING: Permanent deletion. Consider archival instead.
 */
const deleteOrganization = async (organizationId, reason, actor) => {
  const action = Action.OrganizationDeleted.from({
    organizationId,
    metadata: { reason }
  });

  return createActionRequest(action, actor);
};
```

**Handler Logic**:
- Marks organization as deleted (soft delete)
- OR permanently removes from Firestore (hard delete)
- Cascades to default project and all organization data
- Audit trail preserved in `completedActions`

**Example Usage**:
```javascript
await deleteOrganization('org_sf', 'Contract ended, customer requested deletion', actor);
```

Location: `modules/curb-map/functions/src/events/organization-handlers.js:handleOrganizationDeleted`

## Organization Document Structure

```javascript
// /organizations/{organizationId}
{
  id: "org_xyz",
  name: "City of San Francisco",
  status: "active" | "suspended",
  defaultProjectId: "prj_abc123",  // Real CUID2 ID
  createdAt: timestamp,             // serverTimestamp
  createdBy: "usr_abc",             // from actionRequest.actorId
  updatedAt: timestamp,             // serverTimestamp
  updatedBy: "usr_abc",             // from actionRequest.actorId

  // Deferred to F112 (Billing):
  subscription: {
    tier: "basic" | "professional" | "enterprise",
    annualAmount: 0,
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2026-01-01T00:00:00Z"
  },

  // Deferred to backlog (SSO not in MVP):
  settings: {
    ssoEnabled: false,
    ssoProvider: "okta" | "azure-ad" | null,
    auditLogRetention: 2555  // 7 years
  }
}
```

## Default Project Pattern

### Auto-Creation on OrganizationCreated

When an organization is created, a default project is automatically created:

```javascript
// /organizations/{orgId}/projects/{projectId}
{
  id: "prj_abc123",  // FieldTypes.newProjectId() - real CUID2
  organizationId: "org_xyz",
  name: "Default Project",
  createdAt: timestamp,
  createdBy: "usr_abc",
  updatedAt: timestamp,
  updatedBy: "usr_abc"
}
```

**Benefits**:
- No migration needed when project CRUD actions are added (backlog)
- Consistent ID format (all projects use real CUID2)
- Hierarchical structure ready for multi-project support

### Future Project Management (Deferred)

When project CRUD actions are implemented (backlog):
- **ProjectCreated**: Create additional projects
- **ProjectUpdated**: Modify project metadata
- **ProjectArchived**: Soft-delete projects
- **ProjectDeleted**: Hard-delete projects

No data migration required - hierarchical structure already in place.

## Query Patterns

### Get Organization
```javascript
const getOrganization = async (organizationId) => {
  const doc = await admin.firestore()
    .collection('organizations')
    .doc(organizationId)
    .get();

  if (!doc.exists) {
    throw new Error('Organization not found');
  }

  return doc.data();
};
```

### Get Organization with Default Project
```javascript
const getOrganizationWithProject = async (organizationId) => {
  const org = await getOrganization(organizationId);
  const projectDoc = await admin.firestore()
    .collection('organizations')
    .doc(organizationId)
    .collection('projects')
    .doc(org.defaultProjectId)
    .get();

  return {
    organization: org,
    defaultProject: projectDoc.exists ? projectDoc.data() : null
  };
};
```

### List Organizations (Admin)
```javascript
const listOrganizations = async (filters = {}) => {
  let query = admin.firestore().collection('organizations');

  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => doc.data());
};
```

## Validation Rules

### Organization Name
- Required
- 1-100 characters
- No special characters except spaces, hyphens, apostrophes

### Organization ID
- Auto-generated via `FieldTypes.newOrganizationId()` (CUID2 format: `org_<cuid12>`)
- Immutable after creation

### Subscription Tier
- Enum: `basic`, `professional`, `enterprise`
- Defaults to `basic`

### Status
- Enum: `active`, `suspended`
- Defaults to `active`
- Cannot transition directly from `suspended` to `deleted` (must reactivate first)

## Event Sourcing Integration

### OrganizationCreated Event
```javascript
{
  type: 'OrganizationCreated',
  organizationId: 'org_xyz',
  projectId: 'prj_abc123',  // default project
  actor: { type: 'user', id: 'usr_admin' },
  subject: { type: 'organization', id: 'org_xyz' },
  data: {
    name: 'City of San Francisco',
    subscription: { tier: 'professional', annualAmount: 25000, ... },
    settings: { ssoEnabled: false, ... }
  }
}
```

### OrganizationUpdated Event
```javascript
{
  type: 'OrganizationUpdated',
  organizationId: 'org_xyz',
  actor: { type: 'user', id: 'usr_admin' },
  subject: { type: 'organization', id: 'org_xyz' },
  data: {
    name: 'City of San Francisco (Updated)',  // partial update
  }
}
```

### OrganizationSuspended Event
```javascript
{
  type: 'OrganizationSuspended',
  organizationId: 'org_xyz',
  actor: { type: 'user', id: 'usr_admin' },
  subject: { type: 'organization', id: 'org_xyz' },
  data: {
    reason: 'Non-payment for 90 days'
  }
}
```

## Testing Strategy

### Unit Tests
- Create organization → verify document structure
- Update organization → verify partial updates
- Suspend organization → verify status change
- Delete organization → verify removal

### Integration Tests
- Create organization → query via HTTP → verify response
- Update organization → verify audit trail
- Suspend organization → verify API access blocked
- Delete organization → verify cascade to projects

### E2E Tests (when UI implemented)
- Admin creates organization via UI
- Admin updates subscription tier
- Admin suspends organization
- Admin reactivates organization
- Admin deletes organization

## Security Considerations

### Authorization
- Only admins can create/update/delete organizations
- Organization members cannot modify organization metadata
- Firestore rules block direct writes (server functions only)

### Validation
- Server-side validation prevents invalid data
- OrganizationCreated validates required fields
- OrganizationUpdated validates partial updates
- OrganizationDeleted requires reason (audit trail)

### Audit Trail
- All organization changes logged to `completedActions`
- Immutable audit trail for SOC2 compliance
- Can reconstruct organization history from events

## Future Enhancements

### Organization Transfer
- Transfer organization between billing accounts
- Preserve audit trail during transfer

### Organization Archival
- Soft-delete with data retention
- Restore archived organizations
- Auto-archive after subscription ends

### Bulk Operations
- Create multiple organizations from CSV
- Bulk suspend for non-payment
- Bulk delete after retention period

## References

**Architecture**:
- [Data Model](../../docs/architecture/data-model.md) - Organization document structure
- [Event Sourcing](../../docs/architecture/event-sourcing.md) - Action request pattern

**Related Specifications**:
- F110: Multi-Tenant Data Model - Organization hierarchy
- F124: Permission Checking - Authorization for organization operations

**Implementation Files**:
- `modules/curb-map/functions/src/events/organization-handlers.js` - Event handlers (implemented)
- `modules/curb-map/src/types/action.js` - Action type definitions (implemented)
- `modules/curb-map/functions/src/api/organization.js` - API helpers (to be created)

**Testing**:
- `modules/curb-map/test/organization-handlers-http.firebase.js` - Handler tests (implemented)
