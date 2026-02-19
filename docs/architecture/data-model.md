---
summary: "Multi-tenant data model with event sourcing, flat audit trail, and hierarchical domain collections for SOC2-compliant curb data management"
keywords: [ "data-model", "event-sourcing", "multi-tenant", "firestore", "organizations", "users", "projects" ]
module: curb-map
last_updated: "2025-01-15"
---

# Data Model Architecture

## Overview

CurbMap uses a multi-tenant data model with event sourcing for SOC2-compliant audit trails. Organizations represent
municipal customers (cities), each with users (staff), projects (data groupings), and domain data (surveys,
regulations). Event sourcing provides immutable audit trail, while domain collections enable fast queries without event
replay.

### Architecture Diagram

```
Multi-Tenant Hierarchy:
Organization (City of SF)
├── Members (Users with roles in this org)
├── Default Project (auto-created with real CUID2)
│   └── Domain Data (surveys, regulations)
└── Additional Projects (future)

Data Storage Pattern:
┌─────────────────────────────────────────┐
│ Flat Collections (Event Source + Users/Orgs)
│ /completedActions/{id}  ← immutable audit trail
│ /organizations/{id}     ← flat with orgId field
│ /users/{id}             ← flat with orgId field
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Hierarchical Collections (Projects + Data)
│ /organizations/{orgId}/projects/{projId}
│ /organizations/{orgId}/projects/{projId}/surveys/{id}
│ /organizations/{orgId}/projects/{projId}/regulations/{id}
└─────────────────────────────────────────┘
```

### Why This Architecture

**Problem**: Municipal customers need complete data isolation (SF cannot see LA data), SOC2-compliant audit trails (who
changed what when), and fast queries (no event replay on every read). Traditional CRUD lacks audit history. Fully
hierarchical structure limits cross-org queries.

**Solution**: Hybrid collection strategy - flat for event source and top-level entities (enables cross-org admin
queries, SOC2 audit trail), hierarchical for projects and domain data (enforces isolation, enables cascade deletes).
Organizations get default project with real CUID2 ID (no migration when multi-project support added). Role-based access
control scoped per organization.

### Key Components

**completedActions (Flat Collection)**:

- Immutable audit trail storing every processed action
- Flat with `organizationId` field for cross-org queries
- 7-year retention for SOC2 compliance
- Implementation: `modules/curb-map/type-definitions/action.type.js`

**organizations (Flat Collection)**:

- Top-level tenant boundary
- Contains: name, status, defaultProjectId, members map, subscription, settings
- Flat structure enables admin queries across all organizations
- Implementation: `modules/curb-map/functions/src/handlers/handle-organization-created.js`

**users (Flat Collection)**:

- User accounts with organization roles
- Flat structure enables cross-org user management
- Contains: email, displayName, organizations map (role per org)
- Implementation: `modules/curb-map/functions/src/handlers/handle-user-created.js`

**projects (Hierarchical under Organizations)**:

- Hierarchical: `/organizations/{orgId}/projects/{projId}`
- Enforces data isolation (cannot query other org's projects)
- Default project auto-created with real CUID2 ID

**Domain Data (Hierarchical under Projects)**:

- Hierarchical: `/organizations/{orgId}/projects/{projId}/surveys/{id}`
- Complete data isolation by organization + project
- Cascade deletes when parent removed

## Architecture Details

### Data Structures

**Organization Document**:

```
// /organizations/{organizationId}
{
  id: "org_xyz",
  name: "City of San Francisco",
  status: "active" | "suspended",
  defaultProjectId: "prj_abc123",  // Real CUID2 ID

  // Members map for org admin visibility and audit trail
  members: {
    "usr_alice": {
      userId: "usr_alice",  // Duplicated in key and value for self-describing data
      displayName: "Alice Chen",
      role: "admin",
      addedAt: timestamp,  // serverTimestamp
      addedBy: "usr_admin",
      removedAt: null,  // null = active, timestamp = soft deleted
      removedBy: null
    }
  },

  createdAt: timestamp,  // serverTimestamp
  createdBy: "usr_abc",  // from actionRequest.actorId
  updatedAt: timestamp,  // serverTimestamp
  updatedBy: "usr_abc"
}
```

**Members Map Pattern**: Bidirectional membership with soft delete - `organization.members` map + `user.organizations`
map. All org members can read org doc to see member list (O(1) lookup). Soft delete (`removedAt` field) preserves names
for UI history display. GDPR compliant: UserForgotten deletes user doc but preserves org.members entries. Fits municipal
scale (50-500 members per org, well under 1MB Firestore limit).

**User Document**:

```
// /users/{userId}
{
  id: "usr_abc",
  email: "alice@sf.gov",
  displayName: "Alice Johnson",
  organizations: {
    "org_sf": "admin",   // User can have different roles
    "org_la": "member"   // in different organizations
  },

  createdAt: timestamp,  // serverTimestamp
  createdBy: "usr_abc",
  updatedAt: timestamp,
  updatedBy: "usr_abc"
}
```

**Two-Step User Creation**:

- `UserCreated` action creates user with `organizations: {}` (empty map)
- `MemberAdded` action adds user to organization with role
- Benefits: Supports users without org membership, multi-org users, cleaner separation of concerns

**Project Document**:

```
// /organizations/{orgId}/projects/{projectId}
{
  id: "prj_abc123",        // Real CUID2 ID (not "default" magic string)
  organizationId: "org_xyz",
  name: "Default Project",

  createdAt: timestamp,
  createdBy: "usr_abc",
  updatedAt: timestamp,
  updatedBy: "usr_abc"
}
```

**Metadata Fields**: createdAt/createdBy/updatedAt/updatedBy added by handlers from actionRequest.actorId. NOT sent in
Action payloads (prevents spoofing).

### Multi-Tenant Data Isolation

**Firestore Security Rules**:

- All collections enforce server-only writes (`allow write: if false`)
- Reads restricted by organization membership (Firebase Auth custom claims) or user identity
- completedActions audit trail immutable and readable only by organization members
- Implementation: `modules/curb-map/firestore.rules`

**Event Scoping**:

```
// All completed actions scoped to organization
completedActions: {
  id: {
    id: "acr_<cuid12>",
    action: { '@@tagName': "MemberAdded", /* ... */ },
    organizationId: "org_<cuid12>",  // Required for all actions
    projectId: "prj_<cuid12>",       // Optional, defaults to defaultProjectId
    // ... rest of action request
  }
}
```

### Role-Based Access Control

**Role Hierarchy**: admin > member > viewer

**Three roles scoped per organization**:

- **admin**: Full access (manage users, settings, data, impersonate)
- **member**: Read/write data in organization
- **viewer**: Read-only access to data

**Firebase Auth Custom Claims**:

```
// In Firebase Auth token (for fast authorization)
{
  uid: "usr_alice",
  organizations: {
    "org_sf": {
      role: "admin",
      joinedAt: "2025-01-15T10:00:00Z"
    }
  }
}
```

**Permission Checking**: Role hierarchy (admin > member > viewer) implemented in event handlers. Token-based checks use
Firebase Auth custom claims for fast authorization. Database-based fallback queries Firestore users collection.

Implementation: `modules/curb-map/functions/src/submit-action-request.js:297`

### Current Implementation Status

**Implemented** (code complete, emulator-tested):

- Flat completedActions collection with organizationId field
- Flat organizations and users collections
- Hierarchical projects under organizations
- Default project auto-creation with real CUID2
- Organization actions: OrganizationCreated/Updated/Suspended/Deleted
- User actions: UserCreated, UserUpdated, UserForgotten
- Member actions: MemberAdded, MemberRemoved, RoleChanged

**Note**: No production deployment yet - currently runs on Firebase emulators only.
See [deployment-operations.md](../runbooks/deployment-operations.md).

**Deferred to Backlog**:

- Project CRUD actions (ProjectCreated/Updated/Archived/Deleted)
- Multi-project support (organizations limited to default project)
- Billing integration (subscription fields defined but not implemented)
- SSO settings (subscription fields defined but not implemented)

## Trade-offs

### What This Enables

**Complete Data Isolation**: Organizations cannot access each other's data. Firestore rules enforce at database level.

**SOC2 Compliance**: Immutable audit trail with 7-year retention, server timestamps, actor attribution.

**Fast Queries**: Domain collections immediately queryable without event replay. UI reads current state directly.

**Multi-Organization Users**: Users can be admin in one org, member in another. Supports consultants, support staff.

**Future Multi-Project Support**: Default project pattern eliminates migration when ProjectCreated actions added.

**Cross-Org Admin Queries**: Flat collections enable support staff to query across organizations (with proper
permissions).

### What This Constrains

**Hybrid Collection Complexity**:

- Two different patterns (flat vs hierarchical) increases cognitive load
- **When this matters**: New developers must learn both patterns
- **Why acceptable**: Benefits outweigh complexity (enables both cross-org queries AND data isolation)
- **Mitigation**: Clear documentation, code examples in handlers

**Storage Overhead from Default Projects**:

- Every organization gets default project (slight storage cost)
- **When this matters**: 1000 organizations = 1000 default projects (~1MB total)
- **Why acceptable**: Eliminates migration, storage cost negligible (~$1/month)

**Metadata Duplication**:

- createdAt/createdBy/updatedAt/updatedBy on every document
- **When this matters**: Duplicates data from completedActions audit trail
- **Why acceptable**: Enables fast queries without joining events

**7-Year Event Retention**:

- completedActions grows indefinitely (~$50-100/month at 1000 actions/day)
- **When this matters**: Costs exceed $500/month
- **Why acceptable**: SOC2 compliance requires 7-year audit trail
- **Mitigation**: Export to BigQuery for cold storage if costs exceed budget

**No Time Travel Queries**:

- Can't easily answer "what was organization name on January 1st?" without replaying events
- **When this matters**: Audit investigations, compliance reports
- **Why acceptable**: Use case rare enough to handle manually
- **Mitigation**: Build specialized time-travel query tool if >5 requests/month

**Two-Step User Onboarding**:

- Requires two actions (UserCreated + MemberAdded) to fully onboard user
- **When this matters**: Adds latency (~200ms extra) to user creation flow
- **Why acceptable**: Cleaner separation, supports multi-org users
- **Mitigation**: Batch submit both actions in sequence from client

### When to Revisit

**Costs exceed budget**:

- Firestore costs > $500/month → migrate audit logs to BigQuery

**Customer demand changes**:

- Multi-project support requested by >25% of customers → implement ProjectCreated actions
- Granular permissions requested → replace role enum with permission array

**Scale limits approached**:

- User count > 10K → consider caching layer for permission checks
- Firestore query limits exceeded (collection size > 1TB)
- Custom claims size limit hit (>10 orgs per user)

**Compliance issues**:

- SOC2 audit failure (immutability violated, data isolation breached)
- Customer demand for multi-region data residency

## Decision History

This architecture was established through 6 key decisions made between 2024-11 and 2025-01-15:

- **Hybrid Collection Strategy**: Flat for events/users/orgs (cross-org queries), hierarchical for projects/data (
  isolation)
- **Default Project Pattern**: Auto-create with real CUID2 (no migration when multi-project added)
- **Flat Event Source**: completedActions with organizationId field enables cross-org audit queries
- **Organization-Scoped RBAC**: User can have different roles in different organizations
- **Metadata on Every Document**: Server-authoritative timestamps prevent spoofing
- **Two-Step User Creation**: UserCreated + MemberAdded for flexible membership

For complete decision rationale, alternatives considered, and trade-off analysis, see [decisions.md](../decisions.md).
