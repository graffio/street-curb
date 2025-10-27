---
summary: "HTTP-based event sourcing with immutable audit trail for SOC2-compliant multi-tenant curb data management"
keywords: ["event-sourcing", "http", "transactions", "idempotency", "soc2", "audit-trail", "multi-tenant"]
last_updated: "2025-01-15"
---

# Event Sourcing Architecture

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
  - [3.1 Data Flow](#31-data-flow)
  - [3.2 Component Connections](#32-component-connections)
  - [3.3 Facade Transaction Support](#33-facade-transaction-support)
  - [3.4 Handler Pattern](#34-handler-pattern)
- [4. Implementation Guide](#4-implementation-guide)
  - [4.1 Quick Start: Adding a New Action Type](#41-quick-start-adding-a-new-action-type)
  - [4.2 Code Locations](#42-code-locations)
  - [4.3 Adding a New Action Type (Detailed)](#43-adding-a-new-action-type-detailed)
  - [4.4 Configuration](#44-configuration)
  - [4.5 Testing](#45-testing)
- [5. Consequences & Trade-offs](#5-consequences--trade-offs)
  - [5.1 What This Enables](#51-what-this-enables)
  - [5.2 What This Constrains](#52-what-this-constrains)
  - [5.3 Future Considerations](#53-future-considerations)
- [6. References](#6-references)
- [7. Decision History](#7-decision-history)

---

## 1. Overview

CurbMap uses event sourcing with HTTP-based action submission to maintain a SOC2-compliant audit trail while managing multi-tenant curb data for municipal clients. Every change to curb data—adding a user, updating organization details, modifying regulations—is recorded as an immutable event with full actor attribution and server-authoritative timestamps.

### 1.1 Architecture Map

```
┌─────────────────────────────────────────────────────┐
│ Client Application                                  │
│ • Generates idempotencyKey, correlationId           │
│ • Attaches Firebase Auth token                      │
└────────────────┬────────────────────────────────────┘
                 │ POST /submitActionRequest
                 │ {action, idempotencyKey, correlationId}
                 ↓
┌─────────────────────────────────────────────────────┐
│ HTTP Function                                       │
│ submit-action-request.js                            │
│ • Validates payload structure                       │
│ • Extracts actorId from auth token                  │
│ • Creates transaction-scoped context                │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ Firestore Transaction (atomic)                      │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │ 1. Check Duplicate                         │    │
│  │    completedActions.readOrNull(id)         │    │
│  │    ├─ Found → return processedAt (409)     │    │
│  │    └─ Not found → continue                 │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │ 2. Process Action                          │    │
│  │    handler(logger, txContext, request)     │    │
│  │    └─ Writes to domain collections:        │    │
│  │       /organizations/{id}                  │    │
│  │       /users/{id}                          │    │
│  │       /projects/{id}                       │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │ 3. Write Audit Record                      │    │
│  │    completedActions.create({               │    │
│  │      status: 'completed',                  │    │
│  │      createdAt: new Date(),         │    │
│  │      processedAt: new Date()        │    │
│  │    })                                      │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  ⚠️ Why Transaction?                                │
│  Without: Race condition if 2 requests check       │
│           before either writes (both succeed)      │
│  With: Only ONE transaction can write same ID      │
│        Firestore guarantees atomicity              │
└────────────────┬────────────────────────────────────┘
                 │ All writes atomic (all or nothing)
                 ↓
┌─────────────────────────────────────────────────────┐
│ HTTP Response                                       │
│ • 200: {status: 'completed', processedAt}           │
│ • 409: {status: 'duplicate', processedAt}           │
│ • 400: {status: 'validation-failed', error}         │
│ • 500: {status: 'error', error, handler}            │
└─────────────────────────────────────────────────────┘
```

### 1.2 Why This Architecture

**Problem**: CurbMap manages critical municipal curb regulation data for multiple cities (San Francisco, Los Angeles, etc.). Traditional CRUD doesn't provide immutable audit logs, allows client timestamp manipulation, and can't easily reconstruct "who changed what when" for compliance audits. See [Requirements](#requirements) for complete details.

**Solution**: Event sourcing writes every change as an immutable event to `completedActions` collection. HTTP functions validate before writing (not Firestore triggers which write first, validate later). Firestore transactions ensure atomic duplicate detection using client-provided `idempotencyKey` to prevent race conditions. Action handlers write to queryable domain collections so the UI doesn't rebuild state from events on every read.

### 1.3 Key Components

**`completedActions/{id}`** (Firestore collection):
- Immutable audit trail storing every processed action
- Written once as `status: 'completed'`, never mutated
- Contains: action payload, actor ID, server timestamps, organization/project scope
- 7-year retention for SOC2 compliance
- Type: `ActionRequest` (see `action-request.type.js`)

**HTTP Function** (`submit-action-request.js`):
- Entry point for all client actions
- Validates payload structure using `ActionRequest.from()`
- Extracts `actorId` from Firebase Auth token
- Orchestrates: transaction → duplicate check → handler → audit write → response

**Firestore Facades** (`firestore-admin-facade.js`, `firestore-context.js`):
- Transaction-aware CRUD operations
- Optional `tx` parameter: when provided, all operations use transaction; when absent, use regular Firestore
- Provides `readOrNull()` method for atomic duplicate checks (returns null instead of throwing)
- Created per-request via `createFirestoreContext(namespace, orgId, projectId, tx)`

**Action Handlers** (`organization-handlers.js`, future: `user-handlers.js`):
- Domain logic for each action type (OrganizationCreated, UserUpdated, etc.)
- Writes to domain collections (organizations, users, projects)
- Transaction-agnostic: same interface whether in transaction or not
- Pattern: `handleActionName(logger, fsContext, actionRequest)`

**Domain Collections** (Firestore):
- `/organizations/{id}`: Organization records (queryable, current state)
- `/users/{id}`: User records (queryable, current state)
- `/organizations/{orgId}/projects/{id}`: Project records (subcollection)
- These are "materialized views" - immediately queryable, no event replay needed

**Idempotency Keys** (`idm_<cuid12>`):
- Client-generated unique IDs (CUID2 format)
- Prevent duplicate processing when clients retry failed requests
- Checked atomically within transaction
- If duplicate found: return original `processedAt` (HTTP 409)

### 1.4 Trade-offs Summary

- **Increased complexity** for SOC2 compliance value ($10K+ annual savings vs manual audit trail)
- **Higher storage costs** ($50-100/month) for immutable 7-year audit trail
- **Online-only web app** to ship faster (90% of users are desktop inspectors with reliable wifi)
- **Single HTTP function** for simpler deployment/monitoring (2-3 person team)

See [Consequences & Trade-offs](#consequences--trade-offs) for detailed analysis and business impact.

### 1.5 Current Implementation Status

- ✅ **Implemented** (production since 2025-09-15):
  - HTTP action submission with validation
  - Transaction-based idempotency (atomic duplicate detection)
  - Organization actions: OrganizationCreated, OrganizationUpdated, OrganizationSuspended, OrganizationDeleted
  - User actions: UserCreated, UserUpdated, UserDeleted, UserForgotten, RoleAssigned
  - Server-authoritative timestamps (`new Date()`)
  - Firestore facade with optional transaction parameter

- 📋 **Deferred to Backlog**:
  - Project CRUD actions (organizations get default project; manual management deferred)
  - Audit log export to BigQuery (revisit when Firestore costs exceed $500/month)

**Future: Mobile Offline Support** (iOS/Android native apps):
- Client-side queue (Core Data/Realm/SQLite) stores pending ActionRequests locally
- Background sync service monitors network state, processes queue when online
- Same HTTP endpoint (`/submitActionRequest`) handles both online and synced offline requests
- Idempotency keys prevent duplicates when offline queue syncs (server returns HTTP 409 for already-processed requests)
- Architecture designed to support this pattern - no server changes needed, only native client implementation

### 1.6 Key Design Decisions

**HTTP Functions, Not Triggers**: Triggers activate *after* a write (reactive validation). HTTP functions validate *before* write (proactive). This prevents bad data from entering Firestore. [Details in decisions.md](../decisions.md#http-functions-over-triggers)

**Transactions Always**: All HTTP submissions use Firestore transactions (not optional). Atomic duplicate detection prevents race conditions when concurrent requests use same idempotency key. [Details in decisions.md](../decisions.md#transaction-based-idempotency)

**HTTP 409 for Duplicates** (breaking change 2025-01-15): Semantically correct - "this operation already succeeded". Clients handle as idempotent success. [Details in decisions.md](../decisions.md#http-409-for-duplicates)

**Server Timestamps Only**: All timestamps use `new Date()`, not client `new Date()`. SOC2 requires tamper-proof timestamps. [Details in decisions.md](../decisions.md#server-timestamps-only)

**Single Write as "completed"**: Actions written directly with `status: 'completed'`, never mutated to avoid violating audit log immutability. [Details in decisions.md](../decisions.md#single-write-as-completed)

---

## 2. Problem & Context

### 2.1 Requirements

**SOC2 Type II Compliance**:
- Immutable audit trail (no modifications after write)
- Actor attribution (every change tied to authenticated user or system)
- 7-year retention (queryable for compliance audits)
- Server-authoritative timestamps (prevent client clock manipulation)

**Multi-Tenant Data Isolation**:
- Organizations (cities) cannot see each other's data
- Namespace-based isolation: `{namespace}/organizations/{id}`
- Event scoping: all actions scoped to `organizationId` and `projectId`

**Data Integrity**:
- Server-side validation before any write
- Synchronous error feedback (HTTP 400 for validation failures)
- No invalid data in database (e.g., malformed coordinates, invalid regulation types)

**Idempotency**:
- Clients retry failed requests (network timeouts, server errors)
- Same action submitted twice should process once
- Duplicate detection must be atomic (no race conditions)

**Queryable Current State**:
- UI queries current organization/user/project data directly
- No rebuilding from events on every read (performance)

### 2.2 Constraints

- **SOC2 Compliance**: Immutable audit logs, server timestamps, 7-year retention (non-negotiable for enterprise customers)
- **Firestore as Primary Database**: No PostgreSQL, no separate event store (keep infrastructure simple for 2-3 person team)
- **Cost Conscious**: Optimize for Firestore free tier ($50-100/month budget for production)
- **Small Team**: 2-3 developers - prioritize simplicity over microservices
- **No Anonymous Users**: All actions require authenticated users (passcode-only auth)

---

## 3. Architecture Details

### 3.1 Data Flow

**1. Client Submits Action**
- Client generates: `idempotencyKey` (prevents duplicate processing), `correlationId` (error tracking)
- POSTs to `/submitActionRequest` with Firebase Auth token
- Payload: `{id, action, idempotencyKey, correlationId, projectId}`

**2. HTTP Function Validates**
- Extracts `actorId` from Firebase Auth token (who is making this change)
- Validates payload structure: `ActionRequest.from()` (tagged type validation)
- Checks required fields, action-specific validation
- Rejects with HTTP 400 if validation fails

**3. Transaction Processes** (see Architecture Map diagram for complete flow)

**4. HTTP Response** (see Architecture Map diagram for response codes)

### 3.2 Component Connections

```
Client
  ↓ fetch('/submitActionRequest')
submit-action-request.js (HTTP function)
  ↓ createFirestoreContext(namespace, orgId, projectId, tx)
firestore-context.js
  ↓ returns { completedActions, organizations, users, projects }
  ↓ each facade: FirestoreAdminFacade(Type, prefix, db, collection, tx)
firestore-admin-facade.js
  ↓ provides: read, readOrNull, write, create, update, delete
  ↓ uses: tx.get() / tx.set() if tx provided, else regular Firestore ops

Handler dispatch:
submit-action-request.js
  ↓ handlers[action.tagName](logger, fsContext, actionRequest)
organization-handlers.js (or user-handlers.js, etc.)
  ↓ fsContext.organizations.write({...})
firestore-admin-facade.js
  ↓ writes to Firestore (within transaction if tx provided)
```

### 3.3 Facade Transaction Support

The facade accepts optional `tx` parameter enabling transaction-aware operations. When `tx` is provided, all CRUD operations (`read`, `write`, `create`, `update`, `delete`) use Firestore transaction methods (`tx.get()`, `tx.set()`). When `tx` is absent, operations use regular Firestore methods.

This design allows handlers to be transaction-agnostic - they use the same facade interface whether in a transaction or not.

**Implementation**: See `firestore-admin-facade.js` for complete pattern.

### 3.4 Handler Pattern

Handlers receive `(logger, fsContext, actionRequest)` and write to domain collections atomically. For example, `handleOrganizationCreated` extracts organization details from the action payload and writes to `fsContext.organizations` with metadata (createdAt, createdBy, updatedAt, updatedBy).

Domain collections are updated atomically with the audit write (same transaction), making them immediately queryable without event replay.

**Implementation**: See `organization-handlers.js` for complete examples.

---

## 4. Implementation Guide

### 4.1 Quick Start: Adding a New Action Type

**Need to add a new action type quickly?** Follow these 4 steps (detailed instructions in section 4.2):

1. **Define** action type in `modules/curb-map/src/types/action.js`
2. **Implement** handler in `modules/curb-map/functions/src/*-handlers.js`
3. **Register** handler in `submit-action-request.js` handlers object
4. **Test** in `modules/curb-map/test/*.firebase.js`

See section 4.2 for complete step-by-step instructions with code examples.

### 4.2 Code Locations

**HTTP Function**:
- `modules/curb-map/functions/src/submit-action-request.js` - Main endpoint
- `modules/curb-map/functions/src/index.js` - Function export

**Firestore Facades**:
- `modules/curb-map/src/firestore-facade/firestore-admin-facade.js` - Transaction support, CRUD operations
- `modules/curb-map/functions/src/firestore-context.js` - Context creation with facades

**Action Handlers**:
- `modules/curb-map/functions/src/organization-handlers.js` - Organization event handlers
- Future: `user-handlers.js`, `project-handlers.js`

**Types**:
- `modules/curb-map/src/types/action-request.js` - ActionRequest tagged type
- `modules/curb-map/src/types/action.js` - Action tagged sum type
- `modules/curb-map/type-definitions/action-request.type.js` - Type definition
- `modules/curb-map/type-definitions/action.type.js` - Action type definition

**Tests**:
- `modules/curb-map/test/minimal-http-function.firebase.js` - HTTP integration tests
- `modules/curb-map/test/organization-handlers-http.firebase.js` - Handler tests
- `modules/curb-map/test/helpers/http-submit-action.js` - Test helpers

### 4.3 Adding a New Action Type (Detailed)

**1. Define Action Type** in `modules/curb-map/src/types/action.js`:
- Use `Action.define('ActionName', ['field1', 'field2', ...])`
- See existing definitions for OrganizationCreated, UserUpdated, etc.

**2. Add Handler** in new or existing handler file (e.g., `project-handlers.js`):
- Pattern: `handleActionName(logger, fsContext, actionRequest)`
- Extract fields from `actionRequest.action`
- Write to appropriate facade: `fsContext.organizations.write({...})`
- See `organization-handlers.js` for complete examples

**3. Register Handler** in `modules/curb-map/functions/src/submit-action-request.js`:
- Add to `handlers` object: `ActionName: handleActionName`

**4. Write Tests** in `modules/curb-map/test/`:
- Create action: `Action.ActionName.from({ ... })`
- Submit: `submitAndExpectSuccess({ action, namespace })`
- Verify status: `t.equal(result.status, 'completed')`
- See `minimal-http-function.firebase.js` for test patterns

### 4.4 Configuration

**Environment Variables**:
- `GCLOUD_PROJECT` - GCP project ID
- `FIRESTORE_EMULATOR_HOST` - Emulator host (tests only)

**Firebase Functions**:
- Region: `us-central1`
- Memory: 256MB
- Timeout: 60s

### 4.5 Testing

**Run Integration Tests**:
```bash
npm test -- modules/curb-map/test/minimal-http-function.firebase.js
```

**Test Helpers** (in `test/helpers/http-submit-action.js`):
- `submitAndExpectSuccess({ action, namespace })` - Expect HTTP 200
- `submitAndExpectDuplicate({ action, namespace, idempotencyKey })` - Expect HTTP 409
- `submitAndExpectValidationError({ action, ... })` - Expect HTTP 400

---

## 5. Consequences & Trade-offs

### 5.1 What This Enables

**SOC2 Compliance**: Immutable audit trail with 7-year retention, actor attribution, server timestamps. Passes SOC2 Type II audits without manual log reconstruction.

**Multi-Tenant Data Isolation**: Namespace-based isolation ensures cities can't see each other's data. Audit logs scoped per organization.

**Data Integrity**: Server-side validation prevents bad data from entering Firestore. Clients get immediate HTTP 400 feedback.

**Idempotent Requests**: Clients can safely retry failed requests. Same idempotency key → same result (HTTP 409 with original `processedAt`).

**Queryable Current State**: Domain collections immediately reflect current state. UI queries directly, no event replay needed.

**Future Offline Sync**: Architecture supports offline queue (deferred to backlog). Events can be queued locally, submitted when online.

### 5.2 What This Constrains

**Online-Only Web App**:
- Current implementation requires HTTP connection
- Offline queue deferred means mobile field inspectors must have wifi/cellular
- **When this matters**: Field workers in tunnels, parking garages, remote areas
- **Mitigation**: Prioritized for backlog when >10% of users request mobile app

**No Real-Time Collaboration**:
- Events process synchronously via HTTP (not real-time event stream)
- **When this matters**: Multiple users editing same organization simultaneously
- **Why acceptable**: Low collision rate for curb management (different cities, different projects)

**Firestore Storage Costs**:
- `completedActions` grows indefinitely (7-year retention)
- ~$50-100/month at 1000 actions/day
- **When this matters**: Costs exceed $500/month
- **Mitigation**: Export to BigQuery for cold storage, query recent events from Firestore

**Handler Complexity**:
- Each action type requires handler code (10-50 lines)
- More complex than simple CRUD
- **When this matters**: Slows feature development by ~1-2 days per new entity type
- **Why acceptable**: SOC2 compliance value outweighs development overhead
- **Mitigation**: Code generation templates if >20 entity types

**No Time Travel Queries**:
- Can't easily answer "what was the organization name on January 1st?" without replaying events
- **When this matters**: Audit investigations, compliance reports
- **Why acceptable**: Use case rare enough to handle manually
- **Mitigation**: Build specialized time-travel query tool if >5 requests/month

### 5.3 Future Considerations

**When to Revisit**:
- Firestore costs > $500/month → migrate audit logs to BigQuery
- Offline mobile apps become priority → implement offline queue
- Real-time collaboration needed → add WebSocket/SSE event stream
- Team grows beyond 8 developers → split into microservices

**What Would Trigger Redesign**:
- SOC2 audit failure (immutability violated, timestamps manipulated)
- Data corruption from race conditions (transaction logic broken)
- Customer demand for offline support (>25% of customers request mobile app)

---

## 6. References

**Related Architecture**:
- [Data Model](./data-model.md) - Collection schemas, multi-tenant isolation
- [Security](./security.md) - Authorization model, SOC2 controls
- [Multi-Tenant Architecture](./multi-tenant.md) - Namespace isolation
- [Authentication](./authentication.md) - Passcode auth, actor attribution

**SOC2 Compliance**:
- [SOC2 Audit & Logging](../soc2-compliance/audit-and-logging.md) - Compliance requirements

**Decisions**:
- [decisions.md](../decisions.md) - Decision history and alternatives

**Runbooks**:
- [Firebase Functions Deployment](../runbooks/firebase-functions-deploy.md)
- [Running Firebase Integration Tests](../runbooks/running-firebase-integration-tests.md)
- [Firebase Manual Setup](../runbooks/firebase-manual-setup.md)

## 7. Decision History

This architecture was established through 4 key decisions made between 2024-12 and 2025-01-15:

- Event Sourcing Over CRUD (SOC2 requirement)
- HTTP Functions Over Triggers (validation before write)
- Transaction-Based Idempotency (atomic duplicate detection)
- HTTP 409 for Duplicates (semantic correctness)

For complete decision rationale, alternatives considered, and trade-off analysis, see [decisions.md](../decisions.md).
