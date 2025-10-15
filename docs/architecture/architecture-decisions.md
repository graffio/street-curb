# Architecture Decisions

**Historical record of architectural decisions and their rationale**

This document captures the decision-making process behind key architectural choices, including alternatives considered, trade-offs evaluated, and rationale for the chosen approach.

## Table of Contents

- [HTTP Functions vs Firestore Triggers](#http-functions-vs-firestore-triggers)
- [Transaction-Based Idempotency](#transaction-based-idempotency)
- [Materialized Views Architecture](#materialized-views-architecture)
- [Multi-Tenant Data Model](#multi-tenant-data-model)
- [Authentication & Authorization](#authentication--authorization)

---

## HTTP Functions vs Firestore Triggers

**Decision**: Use HTTP Cloud Functions as entry point for all client actions, not Firestore triggers.

**Date**: January 2025  
**Specification**: F110.7 - HTTP Action Submission

### Problem

Original F108/F110 design used Firestore document triggers:

```
Client writes ActionRequest to Firestore
  ↓
onDocumentWritten trigger fires
  ↓
Giant function validates
  ↓ (if invalid)
Marks ActionRequest as 'failed' in database
```

**Issues**:
- Malformed data can be written to database
- Validation happens AFTER write (audit trail pollution)
- Client gets no immediate feedback on validation errors
- Firestore security rules can't express complex validation logic
- Malicious/buggy clients can bypass client-side validation

### Solution

HTTP Cloud Functions with validation before database write:

```
Client calls HTTP function with Action payload
  ↓
HTTP function validates request
  ↓ (if invalid)
Returns HTTP 400 with error message (no DB write)
  ↓ (if valid)
Processes action → writes to completedActions
  ↓
Returns HTTP 200 with success response
```

### Benefits

1. **Validation before database write** - Cleaner audit trail
2. **Synchronous error responses** - Better client UX
3. **Better security** - Server is gatekeeper
4. **Simpler architecture** - One less collection (`actionRequests` removed)

### Trade-offs

- **Requires offline queue for mobile apps** (deferred to backlog)
- **Web app is online-only** (acceptable for desk workers)
- **Breaking change** - clients must call HTTP function instead of writing to Firestore

### Alternatives Considered

- **Keep Firestore triggers** - Rejected due to validation issues
- **Hybrid approach** - Rejected for complexity
- **Client-side validation only** - Rejected for security reasons

---

## Transaction-Based Idempotency

**Decision**: Use Firestore transactions for atomic duplicate detection and single write as "completed".

**Date**: January 2025  
**Specification**: F110.8 - Transaction-Based Idempotency

### Problem

Current implementation violated SOC2 audit log immutability:

```
Write "pending" → Process → Update to "completed"
```

**Issues**:
- Mutates audit trail (SOC2 violation)
- Race conditions in duplicate detection
- Complex error handling for partial states

### Solution

Transaction-based single write:

```javascript
await db.runTransaction(async tx => {
  // Atomic duplicate check
  const existing = await txContext.completedActions.readOrNull(actionRequest.id)
  if (existing) return { duplicate: true, processedAt: existing.processedAt }
  
  // Process action
  await handler(logger, txContext, actionRequest)
  
  // Single write as "completed"
  await txContext.completedActions.create(actionRequest)
  
  return { duplicate: false }
})
```

### Benefits

- **Atomic duplicate detection and write** (no race conditions)
- **Immutable audit trail** (SOC2 compliant)
- **Crash-safe** (all or nothing)
- **Simpler code** (one path, not two)

### Trade-offs

- **Requires Firestore transactions** (more complex than simple check-then-write)
- **Breaking change** - HTTP 409 for duplicates instead of HTTP 200 + duplicate flag
- **Server timestamps required** (more complex than client timestamps)

### Alternatives Considered

- **Keep write-first pattern** - Rejected for SOC2 compliance
- **Separate idempotency collection** - Rejected for complexity
- **Client-side duplicate prevention** - Rejected for reliability

---

## Materialized Views Architecture

**Decision**: Handlers write directly to domain collections, eliminating need for separate materialized views.

**Date**: January 2025  
**Specification**: F110.6 - Materialized Views (OBSOLETE)

### Original Plan

Create separate materialized views by listening to `completedActions`:

```
completedActions → Trigger → Build views → Queryable collections
```

### Actual Implementation

F110 handlers write final state directly to domain collections:

```
HTTP Function → Validates → Processes → Writes to domain collections + completedActions
```

### Why This Approach Won

**Collections written by F110 handlers**:
- `/organizations/{id}` - Written by OrganizationCreated/Updated/Suspended handlers
- `/users/{id}` - Written by UserCreated/Updated/Deleted/Forgotten/RoleAssigned handlers
- `/organizations/{orgId}/projects/{id}` - Written by OrganizationCreated handler (default project)

**Benefits**:
- **No lag** between action completion and view availability
- **Simpler architecture** with fewer moving parts
- **Immediately queryable** - UI queries these collections directly
- **Source of truth** - No separate "view building" step needed

### Result

F110.6 (Materialized Views) became obsolete - the functionality is already built into F110 handlers.

### Future Considerations

Separate materialized views might be needed for:
1. **Complex aggregations** across organizations
2. **Cross-organization analytics** 
3. **Performance optimization** for specific query patterns

---

## Multi-Tenant Data Model

**Decision**: Use hierarchical structure with real CUID2 default projects from day 1.

**Date**: January 2025  
**Specification**: F110 - Multi-Tenant Data Model

### Problem

Post-customer migration from flat to hierarchical structure would be extremely expensive and risky.

### Solution

Use hierarchical structure from day 1:

**Collections**:
- **Flat**: `/actionRequests/{id}`, `/completedActions/{id}`, `/organizations/{id}`, `/users/{id}`
- **Hierarchical**: `/organizations/{orgId}/projects/{projectId}/...` (domain data)

**Default Project Pattern**:
- Each org gets a default project with real CUID2 ID (e.g., `prj_abc123`)
- Stored in: `organization.defaultProjectId`
- Created automatically when OrganizationCreated is processed
- Found via: `const org = await getOrganization(orgId); const projectId = org.defaultProjectId`

### Benefits

- **No data migration needed** when projects are added later
- **No query rewrites** required
- **No security rule changes** needed
- **Future-proof** architecture

### Trade-offs

- **Small complexity now** (`defaultProjectId` field)
- **Slightly more complex** than flat structure
- **Real CUID2 IDs** instead of magic strings

### Cost Analysis

**If we used flat structure now**:
- Migration cost: 20-40+ hours
- Business risk: Zero-downtime requirement, data loss prevention, rollback plans
- Timeline risk: Significant

**With hierarchical structure**:
- Implementation cost: ~2 hours (just implement ProjectCreated/Updated/Deleted actions)
- Migration cost: Zero
- Risk: Minimal

### Alternatives Considered

- **Flat structure with migration later** - Rejected due to cost/risk
- **Magic string default projects** - Rejected for consistency
- **No default projects** - Rejected for UX complexity

---

## Authentication & Authorization

**Decision**: Use Firestore security rules for authorization, not middleware.

**Date**: January 2025  
**Specification**: F110.5 - Authentication & Authorization

### Problem

Need to implement authentication and authorization for multi-tenant system.

### Solution

**Authentication**: Firebase Auth with passcode authentication
**Authorization**: Firestore security rules (not middleware)

### Benefits

- **Simpler architecture** - Security rules handle authorization
- **Better performance** - No middleware overhead
- **Firebase native** - Leverages Firebase's security model
- **Organization-scoped** - Rules can check custom claims

### Trade-offs

- **Less flexible** than middleware approach
- **Firebase-specific** - Tied to Firestore security rules
- **Complex rules** - Security rules can be hard to debug

### Alternatives Considered

- **Authorization middleware** - Rejected for complexity
- **API Gateway** - Rejected for over-engineering
- **Custom auth system** - Rejected for maintenance burden

---

## Decision Log Summary

| Decision | Date | Status | Rationale |
|----------|------|--------|-----------|
| HTTP functions over Firestore triggers | Jan 2025 | Accepted | Validation before write, synchronous errors, cleaner audit trail |
| Transaction-based idempotency | Jan 2025 | Accepted | Atomic duplicate detection, immutable audit trail, SOC2 compliance |
| Handlers write to domain collections | Jan 2025 | Accepted | Fast reads, no view-building lag, simpler architecture |
| Hierarchical structure from day 1 | Jan 2025 | Accepted | Avoids expensive post-customer migration |
| Firestore security rules for authorization | Jan 2025 | Accepted | Simpler than middleware, Firebase native |
| Server-authoritative timestamps | Jan 2025 | Accepted | Audit integrity, SOC2 compliance |
| HTTP 409 for duplicates | Jan 2025 | Accepted | Standard HTTP semantics, clear duplicate indication |
| Status field removal | Jan 2025 | Accepted | Simplified architecture, immutable completedActions only |
