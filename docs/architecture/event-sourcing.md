---
summary: 'HTTP-based event sourcing with immutable audit trail for SOC2-compliant multi-tenant curb data management'
keywords: ['event-sourcing', 'http', 'transactions', 'idempotency', 'soc2', 'audit-trail', 'multi-tenant']
last_updated: '2025-01-15'
---

# Event Sourcing Architecture

## 1. Overview

CurbMap uses event sourcing with HTTP-based action submission to maintain a SOC2-compliant audit trail while managing
multi-tenant curb data for municipal clients. Every change to curb data—adding a user, updating organization details,
modifying regulations—is recorded as an immutable event with full actor attribution and server-authoritative timestamps.

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
│  ┌────────────────────────────────────────────┐     │
│  │ 1. Check Duplicate                         │     │
│  │    completedActions.readOrNull(id)         │     │
│  │    ├─ Found → return processedAt (409)     │     │
│  │    └─ Not found → continue                 │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  ┌────────────────────────────────────────────┐     │
│  │ 2. Process Action                          │     │
│  │    handler(logger, txContext, request)     │     │
│  │    └─ Writes to domain collections:        │     │
│  │       /organizations/{id}                  │     │
│  │       /users/{id}                          │     │
│  │       /projects/{id}                       │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  ┌────────────────────────────────────────────┐     │
│  │ 3. Write Audit Record                      │     │
│  │    completedActions.create({               │     │
│  │      status: 'completed',                  │     │
│  │      createdAt: new Date(),                │     │      
│  │      processedAt: new Date()               │     │      
│  │    })                                      │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  ⚠️ Why Transaction?                                │
│  Without: Race condition if 2 requests check        │
│           before either writes (both succeed)       │
│  With: Only ONE transaction can write same ID       │
│        Firestore guarantees atomicity               │
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

**Problem**: CurbMap manages critical municipal curb regulation data for multiple cities (San Francisco, Los Angeles,
etc.). Traditional CRUD doesn't provide immutable audit logs, allows client timestamp manipulation, and can't easily
reconstruct "who changed what when" for compliance audits. SOC2 Type II requires immutable audit trail with 7-year
retention, actor attribution, server-authoritative timestamps, and prevention of client clock manipulation. Multi-tenant
isolation requires all events scoped to organizationId/projectId.

**Solution**: Event sourcing writes every change as an immutable event to `completedActions` collection. HTTP functions
validate before writing (not Firestore triggers which write first, validate later). Firestore transactions ensure atomic
duplicate detection using client-provided `idempotencyKey` to prevent race conditions. Action handlers write to
queryable domain collections so the UI doesn't rebuild state from events on every read.

### 1.3 Key Components

**`completedActions/{id}`** (modules/curb-map/src/types/action-request.js):

- Immutable audit trail, written once with `status: 'completed'`, never mutated
- 7-year retention for SOC2 compliance

**HTTP Function** (modules/curb-map/functions/src/submit-action-request.js):

- Validates payload, extracts `actorId` from Firebase Auth token
- Orchestrates: transaction → duplicate check → handler → audit write → response

**Firestore Facades** (modules/curb-map/src/firestore-facade/firestore-admin-facade.js):

- Transaction-aware CRUD operations via optional `tx` parameter
- Provides `readOrNull()` for atomic duplicate checks
- Context created via `createFirestoreContext(namespace, orgId, projectId, tx)`

**Action Handlers** (modules/curb-map/functions/src/handlers/):

- Pattern: `handleActionName(logger, fsContext, actionRequest)`
- Writes domain collections atomically with audit record
- One handler per file: handle-organization-created.js, handle-member-added.js, etc.

**Idempotency Keys** (`idm_<cuid12>`):

- Client-generated unique IDs prevent duplicate processing
- Duplicate returns HTTP 409 with original `processedAt`

**Key Design Decisions** (see [decisions.md](../decisions.md) for details):

- HTTP Functions, Not Triggers: Validate before write (proactive), not after (reactive)
- Transactions Always: Atomic duplicate detection prevents race conditions
- HTTP 409 for Duplicates: Semantically correct for idempotent success
- Server Timestamps Only: `new Date()` on server, not client, for SOC2 tamper-proof timestamps
- Single Write as "completed": Never mutate audit records to maintain immutability

---

## 2. Trade-offs

### 2.1 What This Enables

**SOC2 Compliance**: Immutable audit trail with 7-year retention, actor attribution, server timestamps. Passes SOC2 Type
II audits without manual log reconstruction.

**Multi-Tenant Data Isolation**: Namespace-based isolation ensures cities can't see each other's data. Audit logs scoped
per organization.

**Data Integrity**: Server-side validation prevents bad data from entering Firestore. Clients get immediate HTTP 400
feedback.

**Idempotent Requests**: Clients can safely retry failed requests. Same idempotency key → same result (HTTP 409 with
original `processedAt`).

**Queryable Current State**: Domain collections immediately reflect current state. UI queries directly, no event replay
needed.

### 2.2 What This Constrains

**Online-Only Web App**:

- Current implementation requires HTTP connection
- Offline queue deferred means mobile field inspectors must have wifi/cellular
- **When this matters**: Field workers in tunnels, parking garages, remote areas (10% of users)
- **Why acceptable**: 90% of users are desktop inspectors with reliable wifi
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
- **Why acceptable**: SOC2 compliance value ($10K+ annual savings) outweighs development overhead
- **Mitigation**: Code generation templates if >20 entity types

**No Time Travel Queries**:

- Can't easily answer "what was the organization name on January 1st?" without replaying events
- **When this matters**: Audit investigations, compliance reports (<5 requests/month)
- **Why acceptable**: Use case rare enough to handle manually
- **Mitigation**: Build specialized time-travel query tool if >5 requests/month

### 2.3 When to Revisit

**Triggers for architectural review**:

- Firestore costs > $500/month → migrate audit logs to BigQuery
- Offline mobile apps become priority → implement offline queue (client-side queue stores pending ActionRequests
  locally, background sync when online, same HTTP endpoint, idempotency prevents duplicates)
- Real-time collaboration needed → add WebSocket/SSE event stream
- Team grows beyond 8 developers → split into microservices
- SOC2 audit failure (immutability violated, timestamps manipulated)
- Data corruption from race conditions (transaction logic broken)
- Customer demand for offline support (>25% of customers request mobile app)

---

## 3. Decision History

This architecture was established through 4 key decisions made between 2024-12 and 2025-01-15:

- Event Sourcing Over CRUD (SOC2 requirement)
- HTTP Functions Over Triggers (validation before write)
- Transaction-Based Idempotency (atomic duplicate detection)
- HTTP 409 for Duplicates (semantic correctness)

For complete decision rationale, alternatives considered, and trade-off analysis, see [decisions.md](../decisions.md).
