# F110 - Multi-Tenant Data Model

**Define the domain model for organizations, projects, and users**

## Overview

This specification defines the domain model (Action types and event handlers) for CurbMap's multi-tenant architecture. The domain model follows the organization + project hierarchy pattern defined in [multi-tenant], with all domain events processed through F108's event sourcing infrastructure.

    `Action Types → Event Handlers → Collections (Flat + Hierarchical)`

This specification focuses solely on defining the **domain model** - what entities exist, what actions can be performed on them, and how those actions are validated and processed. APIs, authorization, materialized views, and data isolation belong in later specs (F110.5, F110.6, and backlog).

## Simplified Domain Model

### **9 Action Types** (Organization + User only)

**Organization Actions (4)**:
- OrganizationCreated - create new organization
- OrganizationUpdated - update name or status
- OrganizationSuspended - suspend organization (sets status="suspended")
- OrganizationDeleted - permanently delete organization

**User Actions (5)**:
- UserCreated - add user to organization with role
- UserUpdated - update user profile (email, displayName)
- UserDeleted - remove user from organization
- UserForgotten - GDPR/CCPA data deletion
- RoleAssigned - assign/change user role in organization

**Projects**: Each organization gets a default project with real CUID2 ID (CRUD deferred to backlog)

### **Minimal Entity Schemas**

**Organization** (7 fields):
```javascript
{
  id: "org_xyz",                       // FieldTypes.newOrganizationId()
  name: "City of San Francisco",
  status: "active" | "suspended",      // initialized to "active"
  defaultProjectId: "prj_abc123",      // links to default project
  createdAt: timestamp,                // serverTimestamp
  createdBy: "usr_abc",                // from actionRequest.actorId
  updatedAt: timestamp,                // serverTimestamp
  updatedBy: "usr_abc"                 // from actionRequest.actorId
}
```

**User** (8 fields):
```javascript
{
  id: "usr_abc",                       // FieldTypes.newUserId()
  email: "alice@sf.gov",
  displayName: "Alice Johnson",
  organizations: {
    "org_xyz": "admin"                 // simple role enum: admin | member | viewer
  },
  lastLogin: timestamp | null,         // for F110.5 auth tracking (initialized null)
  failedAttempts: 0,                   // for F110.5 brute force prevention
  createdAt: timestamp,                // serverTimestamp
  createdBy: "usr_abc",                // from actionRequest.actorId
  updatedAt: timestamp,                // serverTimestamp
  updatedBy: "usr_abc"                 // from actionRequest.actorId
}
```

**Project** (default per organization):
```javascript
{
  id: "prj_abc123",                    // FieldTypes.newProjectId() - real CUID2
  organizationId: "org_xyz",
  name: "Default Project",
  createdAt: timestamp,                // serverTimestamp
  createdBy: "usr_abc",                // from actionRequest.actorId
  updatedAt: timestamp,                // serverTimestamp
  updatedBy: "usr_abc"                 // from actionRequest.actorId
}
```

**Note**: Metadata fields (createdAt/createdBy/updatedAt/updatedBy) are added by handlers from actionRequest.actorId, NOT sent in Action payloads (prevents spoofing).

## Architecture Change: HTTP Action Submission

**Implementation Status**: Partially complete (Organization handlers done, User handlers pending)

F110 was originally designed with Firestore document triggers (`onDocumentWritten`). During implementation, we switched to HTTP functions (F110.7) for better validation and security.

### Original Design vs Current Implementation

**Original**:
```
Client → writes ActionRequest to Firestore
       → onDocumentWritten trigger fires
       → Giant function validates & processes
       → Marks as 'completed' or 'failed'
```

**Current** (F110.7):
```
Client → calls HTTP function
       → HTTP function validates immediately
       → Rejects malformed requests (HTTP 400)
       → Processes valid requests
       → Writes to completedActions only
```

### Key Changes

**Removed**:
- `/actionRequests/{id}` collection (no longer needed)
- Document trigger registration

**Benefits**:
1. **Validation before database write** - Cleaner audit trail
2. **Synchronous error responses** - Better client UX
3. **Better security** - Server is gatekeeper
4. **Simpler architecture** - One less collection

**Trade-offs**:
- Requires offline queue for mobile apps (deferred to backlog)
- Web app is online-only (acceptable for desk workers)

### Materialized Views Already Implemented

Handlers write directly to domain collections:
- `/organizations/{id}` - Organization documents
- `/users/{id}` - User documents
- `/organizations/{orgId}/projects/{id}` - Project documents

These collections serve dual purpose:
1. Domain model storage (source of truth)
2. Queryable views for UI

**Result**: F110.6 (Materialized Views) is obsolete - the functionality is already built into F110 handlers.

## References

- [multi-tenant] — Organization/project patterns, data isolation rules
- [event-sourcing] — Event sourcing patterns
- F108 — Event sourcing infrastructure (completed)
- F110.5 — Authentication & Authorization (depends on F110, F110.7)
- F110.6 — Materialized Views (OBSOLETE - already implemented in F110)
- F110.7 — HTTP Action Submission (in progress - replaces Firestore triggers)

## Implementation: 4 Tasks (12 hours)

### **task_1_action_types** (3h)
- Define 9 Action tagged type variants
- Implement toFirestore/fromFirestore serialization
- Unit tests for Action creation and serialization

### **task_2_organization_handlers** (3h)
- Implement 4 organization event handlers
- Write to flat collection: `/organizations/{orgId}`
- Validation: required fields, status enum
- Unit tests for handlers

### **task_3_user_handlers** (3h)
- Implement 5 user event handlers
- Write to flat collection: `/users/{userId}`
- Validation: email format, role enum
- Unit tests for handlers

### **task_4_integration** (3h)
- Integrate handlers with F108 giant function (dispatch logic)
- Create test auth helpers (minimal for testing)
- E2E integration tests (all 9 Actions)

## Deferred Features & Rationale

### **Deferred to F110.5** (Authentication & Authorization)

**Granular Permissions**:
- Current: Simple role enum (`admin` | `member` | `viewer`)
- Deferred: Resource-based permissions (`organizations:read`, `projects:write`)
- Rationale: Can't define permission rules without knowing what resources exist in the domain model. F110 defines the domain first, then F110.5 adds proper authorization.

**SSO Configuration**:
- Current: No SSO fields
- Deferred: `settings.ssoEnabled`, `settings.ssoProvider`
- Rationale: SSO not needed for MVP, easy to add as new optional fields later

**Authorization Middleware**:
- Deferred: Using Firestore security rules instead (simpler for MVP)

### **Deferred to F112** (Billing & Subscription)

**Subscription Fields**:
- Current: No subscription tracking
- Deferred: `subscription.tier`, `subscription.annualAmount`, dates
- Rationale: F112 handles billing infrastructure. Easy to add as new optional fields when billing is implemented.

### **Deferred to Backlog** (Future Enhancements)

**Project CRUD Actions** (4 deferred actions):
- ProjectCreated, ProjectUpdated, ProjectArchived, ProjectDeleted
- Rationale: **Post-customer migration risk**
  * If we use flat structure now, migrating to hierarchical after customers exist would cost 20-40+ hours with significant business risk (zero-downtime requirement, data loss prevention, rollback plans)
  * Instead: Use hierarchical structure from day 1 (`/organizations/{orgId}/projects/{projectId}/...`)
  * Each org gets a default project with real CUID2 ID (e.g., `prj_abc123`)
  * Found via: `organization.defaultProjectId`
  * When projects are needed: Just implement the 4 CRUD actions, zero migration needed
  * Cost: Small complexity NOW (defaultProjectId field) vs massive migration effort LATER

**CRUD APIs**:
- Rationale: Not needed for MVP (clients write ActionRequests directly). Needed later for webhooks/external integrations.

**Analytics Fields**:
- `user.lastAccess` per organization
- Rationale: Not critical for MVP, easy to add as optional field

**Configurable Audit Retention**:
- Current: Hardcoded 7 years (SOC2 compliance)
- Deferred: Per-organization configurable retention
- Rationale: One less thing to test/validate, trivial to add later

## Architecture Decisions

### **Hierarchical Structure Ready (No Migration)**

**Collections**:
- Flat: `/actionRequests/{id}`, `/completedActions/{id}`, `/organizations/{id}`, `/users/{id}`
- Hierarchical: `/organizations/{orgId}/projects/{projectId}/...` (domain data)

**Default Project per Organization**:
- Each org gets a default project with real CUID2 ID (e.g., `prj_abc123`)
- Stored in: `organization.defaultProjectId`
- Created automatically when OrganizationCreated is processed
- Found via: `const org = await getOrganization(orgId); const projectId = org.defaultProjectId`
- No magic strings or naming conventions

**Future-Proof**:
- When projects are added: No data migration, no query rewrites, no security rule changes
- Just implement ProjectCreated/Updated/Deleted actions (~2 hours)
- Default project remains as first project

### **Simple Roles for MVP**

**Role Meanings** (authorization details in F110.5):
- `admin` - full access to organization (can manage users, settings, data)
- `member` - read/write data in organization
- `viewer` - read-only access to data

**Extensible**:
- Can add granular permissions later without breaking existing role field
- F110.5+ can add `user.permissions: ["organizations:read", "projects:write"]` alongside roles

### **Metadata Handling (Prevent Spoofing)**

**All entities include metadata fields**:
- `createdAt`: serverTimestamp (when entity created)
- `createdBy`: userId (from actionRequest.actorId, who created entity)
- `updatedAt`: serverTimestamp (when entity last modified)
- `updatedBy`: userId (from actionRequest.actorId, who last modified entity)

**Added by handlers, NOT in Action payloads**:
- Actions contain ONLY domain fields (e.g., `{organizationId, projectId, name}`)
- Handlers add metadata from `actionRequest.actorId` and `serverTimestamp()`
- Prevents spoofing: clients cannot claim to be someone else

**Example**:
```javascript
// Client sends Action (domain fields only):
OrganizationCreated.from({organizationId: "org_xyz", projectId: "prj_abc123", name: "City of SF"})

// Handler adds metadata:
{
  id: "org_xyz",
  name: "City of SF",
  status: "active",
  defaultProjectId: "prj_abc123",
  createdAt: serverTimestamp(),      // ← added by handler
  createdBy: actionRequest.actorId,  // ← added by handler
  updatedAt: serverTimestamp(),      // ← added by handler
  updatedBy: actionRequest.actorId   // ← added by handler
}
```

### **Fields Needed for F110.5 Included Now**

**Organization.status**:
- Needed for F110.5: Prevent access to suspended organizations
- Added now: Avoids adding field during F110.5 implementation

**User.lastLogin / User.failedAttempts**:
- Needed for F110.5: Authentication tracking, brute force prevention
- Added now: Initialized by F110 handlers (null, 0), updated by F110.5 auth system

## Rationale

**Why F110 before F110.5**: Can't define authorization rules without knowing what Actions and entities exist in the domain model. F110 defines the domain first, enabling F110.5 to implement proper authorization that matches reality.

**Why minimal schemas**: Avoid over-engineering. Only include fields that are:
1. Core to the entity identity (id, name, email)
2. Needed for immediate next spec (F110.5 auth tracking)
3. Required for SOC2 audit trail (createdAt, createdBy)

All other fields can be added later as optional fields with zero migration cost.

**Why hierarchical structure with real CUID2 default project**: Post-customer migration from flat to hierarchical would be extremely expensive (20-40+ hours) and risky (data loss, downtime). The small complexity of `organization.defaultProjectId` field is worth avoiding that future pain. Using real CUID2 IDs (not "default" magic string) follows naming conventions and avoids special cases.

**Why metadata in handlers, not Actions**: Prevents spoofing - clients cannot claim to be someone else by setting `createdBy` in the Action payload. The server is the source of truth for who performed an action (from `actionRequest.actorId`).

**Why simple roles over granular permissions**: YAGNI - we don't need fine-grained access control yet. Starting simple (admin/member/viewer) allows us to understand actual permission needs before building a complex system. Can add granular permissions in F110.5+ without breaking existing roles.

[multi-tenant]: ../../docs/architecture/multi-tenant.md
[event-sourcing]: ../../docs/architecture/event-sourcing.md
