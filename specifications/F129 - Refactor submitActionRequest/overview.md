# F129 - Refactor submitActionRequest

## Problem
The current `submitActionRequest` implementation is overly complex with ambiguous responsibility for metadata validation and correction. It's difficult to reason about the flow, and the three-layer security model (detect, correct, verify) creates confusion about when spoofed data should be rejected vs overwritten.

## Solution
Rewrite `submitActionRequest` with a simpler, more auditable flow that immediately rejects any spoofed or invalid requests rather than attempting to correct them.

## Core Principles

1. **Reject immediately** - Any spoofing or invalid data causes instant rejection with clear error message
2. **Validate before transaction** - All validation happens outside transaction (except idempotency check)
3. **Simple sequential flow** - Clear steps with named helper functions, use throw/catch for control flow
4. **No mutation** - Client sends correct metadata or gets rejected; server doesn't "fix" anything
5. **Handler responsibility** - Handlers receive pre-validated actions and only implement domain logic

## Client Metadata Requirements

Clients MUST send correct metadata or be rejected:

**For creates:**
- `createdBy`: Must equal actor's userId (from auth token)
- `createdAt`: Must be recent timestamp (within tolerance)
- `updatedBy`: Must equal actor's userId
- `updatedAt`: Must be recent timestamp

**For updates:**
- `createdBy`: Must equal existing document's createdBy (unchanged)
- `createdAt`: Must equal existing document's createdAt (unchanged)
- `updatedBy`: Must equal actor's userId (from auth token)
- `updatedAt`: Must be recent timestamp

Any mismatch = immediate rejection as spoofing attempt.

## New Flow

```
┌─ OUTSIDE TRANSACTION (validation) ──────────────────┐
│ 1. Authenticate (extract actorId from token)         │
│ 2. Build ActionRequest from HTTP payload             │
│ 3. Validate tenant membership                        │
│    - Actor is non-removed member of organization     │
│ 4. Validate authorization                            │
│    - Role-based permissions for this action          │
│ 5. Read existing documents                           │
│    - If metadata declares documents to read          │
│ 6. Validate metadata (detect spoofing)               │
│    - Creates: createdBy/updatedBy === actorId        │
│    - Updates: createdBy/At unchanged, updatedBy ok   │
│    - All: timestamps are recent                      │
│    → REJECT immediately if spoofed                   │
│ 7. Validate tenant boundaries                        │
│    - organizationId/projectId in nested data         │
│    → REJECT immediately if violated                  │
└──────────────────────────────────────────────────────┘

┌─ IN TRANSACTION (writes only) ───────────────────────┐
│ 8. Check idempotency → return 409 if duplicate       │
│ 9. Execute handler (receives pre-validated action)   │
│ 10. Write completedAction                             │
└──────────────────────────────────────────────────────┘

11. Send HTTP response (200, 409, or error)
```

## Metadata Validation Rules

**On create:**
- `createdBy` must be the actorId (user who sent request)
- `createdAt` must be "recent" (within 5 seconds of server time)
- `updatedBy` must be the actorId
- `updatedAt` must be "recent"

**On update:**
- `createdBy` must be identical to existing document's `createdBy`
- `createdAt` must be identical to existing document's `createdAt`
- `updatedBy` must be the actorId
- `updatedAt` must be "recent"

**For upserts:**
- Determine if create or update based on whether existing document found in Firestore
- Apply appropriate validation rules

## Tenant Boundary Validation

In ALL cases:
- Actor must be a non-removed member of the organization they're writing to
- `organizationId` in ActionRequest must match `organizationId` in embedded data (e.g., `action.blockface.organizationId`)
- `projectId` in ActionRequest must match `projectId` in embedded data (if applicable)

## Error Handling Strategy

Use throw/catch liberally for control flow:
- Each validation step throws descriptive error if validation fails
- Single catch block at bottom interprets errors and sends appropriate HTTP response
- Clear error messages distinguish between authentication, authorization, validation, and system errors

## Implementation Approach

**Simplifications:**
- Remove three-layer security model (detect/correct/verify)
- Remove defensive metadata overwrites
- Remove `verifyHandlerOutput` function
- Idempotency check ONLY inside transaction (not double-checked)
- All document reads happen outside transaction

**Code structure:**
- Top-level function is very simple, calls named helper functions
- Helper functions have clear, unambiguous names
- Each validation step is a separate function that throws on failure
- No complex nested conditionals

## Expected Changes

**submit-action-request.js:**
- Complete rewrite with simplified flow
- Named helper functions for each validation step
- Single transaction containing only: idempotency check, handler execution, completedAction write
- Single catch block for error handling

**action.type.js metadata:**
- Keep or simplify `validateInput` functions
- May need adjustments based on new validation flow
- `writesTo` declarations should remain

**Handlers:**
- Receive pre-validated actions (no metadata checking needed)
- Remove any defensive metadata overwrites
- Focus purely on domain logic

**Tests:**
- Update to send correct metadata
- Expect immediate rejection on spoofing (not silent correction)
- Remove tests expecting defensive overwrites
