# F110.7 - HTTP Action Submission

**Replace Firestore document triggers with HTTP functions for action request processing**

## Overview

This specification replaces the Firestore document trigger approach with HTTP function calls for submitting ActionRequests. HTTP functions provide validation before database writes, synchronous error feedback, and a cleaner audit trail by rejecting malformed requests before they enter the system.

    `Client → HTTP Function → Validates → Processes → completedActions`

This is a breaking change from the original F108/F110 design but provides better validation, security, and client feedback.

## Why HTTP Functions Instead of Firestore Triggers?

### Problem with Firestore Triggers

**Original flow**:
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

### Solution with HTTP Functions

**New flow**:
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

**Benefits**:
- Validation BEFORE database write
- Synchronous error responses (HTTP status codes)
- Cleaner audit trail (only valid operations in completedActions)
- Better security (server is gatekeeper)
- Structured error messages for client debugging

**Trade-offs**:
- Requires offline queue for mobile apps (deferred to backlog)
- Web app is online-only (acceptable - desk workers have reliable internet)
- Slightly more complex client code (HTTP calls vs Firestore writes)

## Architecture Changes

### Collections

**Removed**:
- `/actionRequests/{id}` - No longer needed (HTTP validates before write)

**Kept**:
- `/completedActions/{id}` - Immutable audit trail (SOC2 compliance)

**Domain collections** (written by handlers):
- `/organizations/{id}`
- `/users/{id}`
- `/organizations/{orgId}/projects/{id}`

### HTTP Function Signature

```javascript
POST /submitActionRequest
Content-Type: application/json
Authorization: Bearer <firebase-auth-token>  // F110.5

Request Body:
{
  id: "acr_<cuid12>",              // Client-generated
  action: {
    "@@tagName": "OrganizationCreated",
    organizationId: "org_xyz",
    projectId: "prj_abc",
    name: "City of San Francisco"
  },
  idempotencyKey: "idm_<cuid12>",  // Client-generated
  correlationId: "cor_<cuid12>",   // Client-generated
  projectId: "prj_abc"             // For context creation
}

Success Response (200):
{
  status: "completed",
  id: "acr_<cuid12>",
  processedAt: "2025-01-15T10:30:00Z"
}

Error Response (400):
{
  status: "validation-failed",
  error: "Invalid status: must be 'active' or 'suspended'",
  field: "action.status"
}

Error Response (409):
{
  status: "completed",
  duplicateOf: "acr_previous123",
  message: "Already processed"
}
```

### Server-Side Enrichment

HTTP function adds fields that clients cannot spoof:

```javascript
// Client sends minimal payload
{
  id, action, idempotencyKey, correlationId, projectId
}

// Server enriches with authoritative fields
{
  id,
  action,
  actorId: auth.uid,                    // ← From Firebase Auth token
  subjectId: action.organizationId,     // ← Derived from action
  subjectType: 'organization',          // ← Derived from action type
  organizationId: action.organizationId,// ← Derived from action
  projectId,
  idempotencyKey,
  correlationId,
  status: 'completed',
  schemaVersion: 1,
  createdAt: serverTimestamp(),
  processedAt: serverTimestamp()
}
```

## Authentication Strategy

### F110.7 Implementation (Emulator Bypass)

For testing without full auth system:

```javascript
// In emulator mode, accept actorId in request body
const actorId = process.env.FUNCTIONS_EMULATOR
  ? request.body.actorId  // Test mode: trust client
  : auth.uid;             // Production: from token
```

### F110.5 Integration (Future)

When F110.5 is complete:
- Remove emulator bypass
- Require valid Firebase Auth token in `Authorization` header
- Extract `actorId` from token claims
- Validate user has permission for action

## Offline Behavior

### Web App (Current)

**Online**: HTTP call succeeds, user gets immediate feedback
**Offline**: Show graceful error message:
```
"You're offline. Changes will be enabled when connection is restored."
```

No queue - web app is online-only (acceptable for desk workers).

### Mobile App (Future - Backlog)

When building mobile app, implement offline queue (see `specifications/backlog.md`):
- Queue HTTP calls in IndexedDB/localStorage
- Retry when connection restored
- Show sync progress to user
- Handle conflicts

## References

- F108 — Event sourcing infrastructure (completedActions audit trail)
- F110 — Domain model (Action types, handlers) - partially complete
- F110.5 — Authentication & Authorization (validates HTTP requests) - not started
- Backlog — Offline queue for mobile apps (formerly F111)

## Implementation

See `tasks.yaml` for detailed task breakdown.

## Rationale

**Why before F110.5 (Auth)**: Can test with emulator bypass while building auth system in parallel.

**Why before F110 task_3 (User handlers)**: Better to implement User handlers in HTTP style from the start rather than converting them later.

**Why online-only for web**: Desk workers have reliable internet. Offline adds complexity we don't need yet. Mobile apps (where offline is critical) are future work.

**Why remove actionRequests collection entirely**: Cleaner architecture. No intermediate state between "pending" and "completed". HTTP provides synchronous feedback, so no need to poll for status changes.
