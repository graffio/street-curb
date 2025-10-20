---
summary: "Multi-tenant data model with event sourcing, flat audit trail, and hierarchical domain collections for SOC2-compliant curb data management"
keywords: [ "data-model", "event-sourcing", "multi-tenant", "firestore", "organizations", "users", "projects" ]
last_updated: "2025-01-15"
---

# Data Model Architecture

## Table of Contents

- [1. Overview](#1-overview)
    - [1.1 Architecture Map](#11-architecture-map)
    - [1.2 Why This Architecture](#12-why-this-architecture)
    - [1.3 Key Components](#13-key-components)
    - [1.4 Trade-offs Summary](#14-trade-offs-summary)
    - [1.5 Current Implementation Status](#15-current-implementation-status)
    - [1.6 Key Design Decisions](#16-key-design-decisions)
- [2. Problem & Context](#2-problem--context)
    - [2.1 Requirements](#21-requirements)
    - [2.2 Constraints](#22-constraints)
- [3. Architecture Details](#3-architecture-details)
    - [3.1 Collection Hierarchy](#31-collection-hierarchy)
    - [3.2 Organization Hierarchy](#32-organization-hierarchy)
    - [3.3 Domain Collections](#33-domain-collections)
    - [3.4 Multi-Tenant Data Isolation](#34-multi-tenant-data-isolation)
    - [3.5 Role-Based Access Control](#35-role-based-access-control)
- [4. Implementation Guide](#4-implementation-guide)
    - [4.1 Quick Start: Adding a New Collection](#41-quick-start-adding-a-new-collection)
    - [4.2 Code Locations](#42-code-locations)
    - [4.3 Configuration](#43-configuration)
- [5. Consequences & Trade-offs](#5-consequences--trade-offs)
    - [5.1 What This Enables](#51-what-this-enables)
    - [5.2 What This Constrains](#52-what-this-constrains)
    - [5.3 Future Considerations](#53-future-considerations)
- [6. References](#6-references)
- [7. Decision History](#7-decision-history)

---

## 1. Overview

CurbMap uses a multi-tenant data model with event sourcing for SOC2-compliant audit trails. Organizations represent
municipal customers (cities), each with users (staff), projects (data groupings), and domain data (surveys,
regulations). Event sourcing provides immutable audit trail, while domain collections enable fast queries without event
replay.

### 1.1 Architecture Map

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

### 1.2 Why This Architecture

**Problem**: Municipal customers need complete data isolation (SF cannot see LA data), SOC2-compliant audit trails (who
changed what when), and fast queries (no event replay on every read). Traditional CRUD lacks audit history. Fully
hierarchical structure limits cross-org queries. See [Requirements](#21-requirements) for details.

**Solution**: Hybrid collection strategy - flat for event source and top-level entities (enables cross-org admin
queries, SOC2 audit trail), hierarchical for projects and domain data (enforces isolation, enables cascade deletes).
Organizations get default project with real CUID2 ID (no migration when multi-project support added). Role-based access
control scoped per organization.

### 1.3 Key Components

**completedActions (Flat Collection)**:

- Immutable audit trail storing every processed action
- Flat with `organizationId` field for cross-org queries
- 7-year retention for SOC2 compliance
- Never mutated after write

**organizations (Flat Collection)**:

- Top-level tenant boundary
- Contains: name, status, defaultProjectId, subscription, settings
- Flat structure enables admin queries across all organizations
- Queryable by organizationId for fast lookups

**users (Flat Collection)**:

- User accounts with organization roles
- Flat structure enables cross-org user management
- Contains: email, displayName, organizations map (role per org)
- User can be admin in one org, member in another

**projects (Hierarchical under Organizations)**:

- Hierarchical: `/organizations/{orgId}/projects/{projId}`
- Enforces data isolation (cannot query other org's projects)
- Default project auto-created with real CUID2 ID
- Additional projects deferred to backlog (no migration needed)

**Domain Data (Hierarchical under Projects)**:

- Hierarchical: `/organizations/{orgId}/projects/{projId}/surveys/{id}`
- Complete data isolation by organization + project
- Cascade deletes when parent removed
- Firestore security rules enforce boundaries

### 1.4 Trade-offs Summary

- **Hybrid collection strategy** - More complex than pure flat or pure hierarchical, but enables both cross-org queries
  AND data isolation
- **Default project pattern** - Every org gets default project (slight storage overhead), but eliminates migration when
  multi-project added
- **Metadata duplication** - createdAt/createdBy/updatedAt/updatedBy on every document, but enables fast queries without
  joining events
- **7-year event retention** - Grows indefinitely ($50-100/month at 1000 actions/day), but meets SOC2 compliance

See [Consequences & Trade-offs](#5-consequences--trade-offs) for detailed analysis.

### 1.5 Current Implementation Status

- ✅ **Implemented** (production since 2025-09-15):
    - Flat completedActions collection with organizationId field
    - Flat organizations and users collections
    - Hierarchical projects under organizations
    - Default project auto-creation with real CUID2
    - Organization actions: OrganizationCreated/Updated/Suspended/Deleted
    - User actions: UserCreated (user only), UserUpdated, UserForgotten
    - Member actions: MemberAdded, MemberRemoved, RoleChanged

- 📋 **Deferred to Backlog**:
    - Project CRUD actions (ProjectCreated/Updated/Archived/Deleted)
    - Multi-project support (organizations limited to default project)
    - Billing integration (subscription fields defined but not implemented)
    - SSO settings (subscription fields defined but not implemented)

### 1.6 Key Design Decisions

**Flat Event Source**: completedActions flat with organizationId field (not hierarchical). Enables cross-org admin
queries, SOC2 audit reports. [Details in decisions.md](../decisions.md#flat-event-source)

**Hybrid Collection Strategy**: Flat for users/orgs (cross-org queries), hierarchical for projects/data (isolation).
Balances querying flexibility with data isolation. [Details in decisions.md](../decisions.md#hybrid-collections)

**Default Project Pattern**: Auto-create default project with real CUID2 (not "default" magic string). No migration when
ProjectCreated actions added. [Details in decisions.md](../decisions.md#default-project-pattern)

**Metadata on Every Document**: createdAt/createdBy/updatedAt/updatedBy added by handlers (not client).
Server-authoritative timestamps, prevents spoofing. [Details in decisions.md](../decisions.md#metadata-fields)

**RBAC Scoped Per Organization**: User can have different roles in different organizations. Stored in
users.organizations map and Firebase Auth custom
claims. [Details in decisions.md](../decisions.md#organization-scoped-rbac)

**Two-Step User Creation**: UserCreated creates user with empty organizations map, MemberAdded adds to org. Supports users without org membership, multi-org users. [Details in decisions.md](../decisions.md#user-creation-pattern)

---

## 2. Problem & Context

### 2.1 Requirements

**Multi-Tenant Data Isolation**:

- Organizations (cities) cannot access each other's data
- Complete isolation at database level (Firestore rules)
- Support multiple organizations per user (SF admin, LA member)
- Cross-organization admin queries (support staff)

**SOC2 Type II Compliance**:

- Immutable audit trail (7-year retention)
- Server-authoritative timestamps (prevent client manipulation)
- Actor attribution (every change tied to user)
- Query audit history for compliance reports

**Queryable Current State**:

- UI queries organization/user/project data directly
- No rebuilding from events on every read (performance)
- Fast lookups by organizationId, userId

**Future Multi-Project Support**:

- Each organization can have multiple projects
- Default project for MVP, additional projects deferred
- No migration when ProjectCreated actions added

**Role-Based Access Control**:

- Three roles: admin (full access), member (read/write), viewer (read-only)
- Roles scoped per organization
- User can have different roles in different orgs

### 2.2 Constraints

- **Firestore as Primary Database**: No PostgreSQL, no separate event store (keep infrastructure simple)
- **SOC2 Compliance**: Immutable audit logs, 7-year retention (non-negotiable)
- **Cost Conscious**: Optimize for Firebase free tier ($50-100/month budget)
- **Small Team**: 2-3 developers - prioritize simplicity over microservices
- **No Anonymous Users**: All actions require authenticated users

---

## 3. Architecture Details

### 3.1 Collection Hierarchy

**Flat Collections** (Event Source + Top-Level Entities):

- `/completedActions/{id}` - Immutable audit trail with organizationId field
- `/organizations/{id}` - Organization documents with organizationId field
- `/users/{id}` - User documents with organizations map

**Rationale**: SOC2 audit trail requires cross-org queries ("show all actions by user X"). Flat structure with
organizationId field enables efficient queries while maintaining isolation via Firestore rules.

**Hierarchical Collections** (Projects + Domain Data):

- `/organizations/{orgId}/projects/{projId}` - Projects under organizations
- `/organizations/{orgId}/projects/{projId}/surveys/{id}` - Domain data under projects
- `/organizations/{orgId}/projects/{projId}/regulations/{id}` - Domain data under projects

**Rationale**: Data isolation (cannot query other org's projects), cascade deletes, clearer ownership, simpler security
rules (wildcard paths).

### 3.2 Organization Hierarchy

```
Organization (document fields)
├── name, status, defaultProjectId (core fields)
├── Subscription fields (tier, amount, dates) - backlog
├── SSO Settings fields (enabled, provider) - backlog
├── Members: Users with roles (admin | member | viewer)
└── Projects
    ├── Default Project (auto-created, real CUID2)
    └── Additional Projects (backlog)
```

**Note**: Settings are fields within the organization document (not a subcollection). Subscription and SSO fields are
defined in the schema but not yet implemented - shown for future reference.

**Benefits**: Complete data isolation, scalable architecture, role-based access control, audit compliance.

### 3.3 Domain Collections

**Important**: These schemas are documentation of the actual implementation in
`modules/curb-map/type-definitions/*.type.js`. When updating type definitions, remember to update these schemas
accordingly to keep documentation synchronized with code.

**Organizations**:

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
      displayName: "Alice Chen",
      role: "admin",
      addedAt: timestamp,  // serverTimestamp
      addedBy: "usr_admin",
      removedAt: null  // null = active, timestamp = soft deleted
      removedBy: "usr_admin",
    },
    "usr_bob": {
      displayName: "Bob Smith",
      role: "member",
      addedAt: timestamp,
      addedBy: "usr_alice",
      removedAt: null,
      removedBy: null
    }
  },

  createdAt: timestamp,  // serverTimestamp
  createdBy: "usr_abc",  // from actionRequest.actorId
  updatedAt: timestamp,  // serverTimestamp
  updatedBy: "usr_abc",  // from actionRequest.actorId

  // Backlog (Billing):
  // subscription: { tier, annualAmount, startDate, endDate }

  // Backlog (SSO not in MVP):
  // settings: { ssoEnabled, ssoProvider, auditLogRetention }
}
```

**Members Map**: Bidirectional membership with soft delete - `organization.members` map + `user.organizations` map. All
org members can read org doc to see member list (O(1) lookup, not query). Soft delete (`removedAt` field) preserves
names for UI history display ("Sam Chen edited this curb"). GDPR compliant: UserForgotten deletes user doc but preserves
org.members entries. Fits municipal scale (50-500 members per org, well under 1MB Firestore limit).
See [decisions.md](../decisions.md#organization-members-map) for rationale.

**Users**:

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

  lastLogin: timestamp | null,  // for auth tracking (future)
  failedAttempts: 0,            // for brute force prevention (future)

  createdAt: timestamp,  // serverTimestamp
  createdBy: "usr_abc",  // from actionRequest.actorId
  updatedAt: timestamp,  // serverTimestamp
  updatedBy: "usr_abc",  // from actionRequest.actorId

  // Future (granular permissions):
  // permissions: ["organizations:read", "projects:write", "users:manage"]
}
```

**Two-Step User Creation**:
- `UserCreated` action creates user with `organizations: {}` (empty map)
- `MemberAdded` action adds user to organization with role
- Benefits: Supports users without org membership, multi-org users, cleaner separation of concerns
- Migration note: Changed from original single-step UserCreated (with organizationId/role) to two-step pattern

**Projects**:

```
// /organizations/{orgId}/projects/{projectId}
{
  id: "prj_abc123",        // Real CUID2 ID (not "default" magic string)
  organizationId: "org_xyz",
  name: "Default Project",

  createdAt: timestamp,    // serverTimestamp
  createdBy: "usr_abc",    // from actionRequest.actorId
  updatedAt: timestamp,    // serverTimestamp
  updatedBy: "usr_abc"     // from actionRequest.actorId
}
```

**Metadata Fields**: createdAt/createdBy/updatedAt/updatedBy added by handlers from actionRequest.actorId. NOT sent in
Action payloads (prevents spoofing).

### 3.4 Multi-Tenant Data Isolation

**Data Isolation Principles**:

- Organizations cannot access each other's data
- Event scoping: all actions scoped to organizationId + projectId
- Firestore rules enforce isolation at database level
- Custom claims scope permissions per organization

**Firestore Security Rules**:

All collections enforce server-only writes (`allow write: if false`) - clients cannot directly modify data. Reads are
restricted by organization membership (checked via Firebase Auth custom claims) or user identity. The completedActions
audit trail is immutable and readable only by organization members.

**Implementation**: See `modules/curb-map/firestore.rules` for complete security rules.

**Rationale**: Firestore security rules provide defense-in-depth. Even if HTTP function has a bug, database-level rules
prevent unauthorized access.

**Event Scoping**:

```
// All completed actions scoped to organization
completedActions: {
  id: {
    id: "acr_<cuid12>",
    action: { '@@tagName': "UserAdded", /* ... */ },
    organizationId: "org_<cuid12>",  // Required for all actions
    projectId: "prj_<cuid12>",       // Optional, defaults to defaultProjectId
    // ... rest of action request
  }
}
```

**Materialized View Scoping**: Domain collections queryable by organizationId. Queries always include
`where('organizationId', '==', orgId)` to enforce isolation.

### 3.5 Role-Based Access Control

**Role Hierarchy**: admin > member > viewer

**Three roles scoped per organization**:

- **admin**: Full access (manage users, settings, data, impersonate)
- **member**: Read/write data in organization
- **viewer**: Read-only access to data

**User Roles Map**:

```
// In /users/{userId} document
organizations: {
  "org_sf": "admin",   // Admin in San Francisco
  "org_la": "member",  // Member in Los Angeles
  "org_ny": "viewer"   // Viewer in New York
}
```

**Firebase Auth Custom Claims**:

```
// In Firebase Auth token (for fast authorization)
{
  uid: "usr_alice",
  organizations: {
    "org_sf": {
      role: "admin",           // Single role per organization
      joinedAt: "2025-01-15T10:00:00Z"
    }
  }
}
```

**Role Capabilities**:

- **admin**: Can read/write data, manage users/settings, impersonate users
- **member**: Can read/write data (no user management)
- **viewer**: Can read data only (no writes)

**Note**: In MVP, roles are simple enums (`admin | member | viewer`). Future: granular permissions (e.g.,
`projects:write`, `users:manage`) will replace role enums.

**Permission Checking**: Role hierarchy (admin > member > viewer) implemented in event handlers. Token-based checks use
Firebase Auth custom claims for fast authorization. Database-based fallback queries Firestore users collection.

**Organization Management**: Organizations created via OrganizationCreated action requests (see
`modules/curb-map/functions/src/events/organization-handlers.js`). Event sourcing provides complete audit trail for CRUD
operations.

---

## 4. Implementation Guide

### 4.1 Quick Start: Adding a New Collection

**Need to add a new domain collection quickly?** Follow these steps:

1. **Decide hierarchy**: Flat (cross-org queries needed) or Hierarchical (data isolation)
2. **Define schema**: Create `*.type.js` file in `modules/curb-map/type-definitions/`
    - Include metadata fields: `createdAt`, `createdBy`, `updatedAt`, `updatedBy`
    - Run type generator to auto-create `*.js` in `modules/curb-map/src/types/`
3. **Add Firestore rules**: Add rule to `modules/curb-map/firestore.rules`
    - **Important**: New collections should NEVER allow client writes (`allow write: if false`)
    - All writes must go through server functions (event handlers)
4. **Create action types**: Add variants to `modules/curb-map/type-definitions/action.type.js`
    - Define events for CRUD operations (e.g., `SurveyCreated`, `SurveyUpdated`)
    - Run type generator to auto-update `modules/curb-map/src/types/action.js`
5. **Implement handlers**: Create event handler in `modules/curb-map/functions/src/events/`
    - Write to collection when action is processed

See [Code Locations](#42-code-locations) for where to add code.

### 4.2 Code Locations

**Collection Schemas**:

- Document structures defined in this file (section 3.3)
- Type definitions: `modules/curb-map/type-definitions/*.type.js` (source of truth)
- Generated types: `modules/curb-map/src/types/*.js` (auto-generated via type generator)

**Type Generation**: All `*.js` files in `src/types/` are auto-generated from `*.type.js` files in `type-definitions/`.
Never edit generated files directly - always edit the `.type.js` source and regenerate.

**Firestore Rules**:

- `firestore.rules` - Security rules enforcing data isolation

**Event Handlers**:

- `modules/curb-map/functions/src/events/organization-handlers.js` - Organization CRUD
- `modules/curb-map/functions/src/events/user-handlers.js` - User CRUD and member management
- Future: `project-handlers.js` (when ProjectCreated actions added)

**Action Types**:

- `modules/curb-map/type-definitions/action.type.js` - Type definitions (source of truth)
- `modules/curb-map/src/types/action.js` - Auto-generated from action.type.js

**Important**: `action.js` is automatically regenerated when `action.type.js` changes via the type generator. Never edit
`action.js` directly - always edit `action.type.js` and regenerate.

**Tests**:

- `modules/curb-map/test/organization-handlers-http.firebase.js` - Organization tests
- `modules/curb-map/test/user-handlers.firebase.js` - User tests
- `modules/curb-map/test/member-handlers.firebase.js` - Member management tests
- `modules/curb-map/test/firestore-admin.firebase.js` - Facade tests

### 4.3 Configuration

**Firestore Indexes**:

- Index on `organizationId` for all flat collections
- Compound index on `organizationId + projectId` for domain data
- Index on `userId + organizationId` for role queries

**Environment Variables**:

- `GCLOUD_PROJECT` - GCP project ID
- `FIRESTORE_EMULATOR_HOST` - Emulator host (tests only)

---

## 5. Consequences & Trade-offs

### 5.1 What This Enables

**Complete Data Isolation**: Organizations cannot access each other's data. Firestore rules enforce at database level.

**SOC2 Compliance**: Immutable audit trail with 7-year retention, server timestamps, actor attribution.

**Fast Queries**: Domain collections immediately queryable without event replay. UI reads current state directly.

**Multi-Organization Users**: Users can be admin in one org, member in another. Supports consultants, support staff.

**Future Multi-Project Support**: Default project pattern eliminates migration when ProjectCreated actions added.

**Cross-Org Admin Queries**: Flat collections enable support staff to query across organizations (with proper
permissions).

**Flexible User Membership**: Two-step user creation allows users without org membership, supports multi-org scenarios.

### 5.2 What This Constrains

**Hybrid Collection Complexity**:

- Two different patterns (flat vs hierarchical) increases cognitive load
- **When this matters**: New developers must learn both patterns
- **Why acceptable**: Benefits outweigh complexity (enables both cross-org queries AND data isolation)
- **Mitigation**: Clear documentation (this file), code examples in handlers

**Storage Overhead from Default Projects**:

- Every organization gets default project (slight storage cost)
- **When this matters**: 1000 organizations = 1000 default projects (~1MB total)
- **Why acceptable**: Eliminates migration, storage cost negligible
- **Mitigation**: None needed, cost < $1/month

**Metadata Duplication**:

- createdAt/createdBy/updatedAt/updatedBy on every document
- **When this matters**: Duplicates data from completedActions audit trail
- **Why acceptable**: Enables fast queries without joining events
- **Mitigation**: None needed, query performance more important

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
- **Why acceptable**: Cleaner separation, supports multi-org users, no breaking change for greenfield
- **Mitigation**: Batch submit both actions in sequence from client

### 5.3 Future Considerations

**When to Revisit**:

- Firestore costs > $500/month → migrate audit logs to BigQuery
- Multi-project support requested by >25% of customers → implement ProjectCreated actions
- Granular permissions requested → replace role enum with permission array (future work)
- User count > 10K → consider caching layer for permission checks

**What Would Trigger Redesign**:

- SOC2 audit failure (immutability violated, data isolation breached)
- Firestore query limits exceeded (collection size > 1TB)
- Custom claims size limit hit (>10 orgs per user)
- Customer demand for multi-region data residency

---

## 6. References

**Related Architecture**:

- [Event Sourcing](./event-sourcing.md) - Action request pattern, transaction-based idempotency
- [Security](./security.md) - Authentication, authorization, RBAC
- [Multi-Tenant Architecture](./multi-tenant.md) - Organization hierarchy (will be deleted after merge)

**Implementation**:

- Event handlers: `modules/curb-map/functions/src/events/organization-handlers.js`
- Event handlers: `modules/curb-map/functions/src/events/user-handlers.js`
- Type definitions: `modules/curb-map/type-definitions/*.type.js`
- Generated types: `modules/curb-map/src/types/*.js` (auto-generated from type-definitions)

**Decisions**:

- [decisions.md](../decisions.md) - Decision history and alternatives

**SOC2 Compliance**:

- [SOC2 Audit & Logging](../soc2-compliance/audit-and-logging.md)

---

## 7. Decision History

This architecture was established through 6 key decisions made between 2024-11 and 2025-01-15:

- Hybrid Collection Strategy (flat for events/users/orgs, hierarchical for projects/data)
- Default Project Pattern (auto-create with real CUID2, no migration needed)
- Flat Event Source (completedActions with organizationId field for cross-org queries)
- Organization-Scoped RBAC (user can have different roles in different orgs)
- Metadata on Every Document (server-authoritative timestamps prevent spoofing)
- Two-Step User Creation (UserCreated + MemberAdded for flexible membership)

For complete decision rationale, alternatives considered, and trade-off analysis, see [decisions.md](../decisions.md).
