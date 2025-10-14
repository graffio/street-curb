# F110.8 - Transaction-Based Idempotency

**Migrate from write-first to transaction-based single write for SOC2-compliant immutable audit trail**

## Problem

Current implementation writes "pending" then mutates to "completed" - violates SOC2 audit log immutability.

## Solution

Use Firestore transactions for atomic duplicate detection and single write as "completed".

**Decision**: `submit-action-request.js` ALWAYS uses transactions (not optional). This ensures:
- Atomic duplicate check + handler execution + audit write
- Single immutable write to completedActions (SOC2)
- Crash safety (all-or-nothing)
- Simpler code (one path, not two)

Facade accepts optional `tx` parameter for flexibility in tests/migrations/background jobs, but HTTP endpoint always creates transaction.

See [docs/architecture/event-sourcing.md](../../docs/architecture/event-sourcing.md#transaction-based-idempotency) for architectural pattern and rationale.

## Implementation

See `tasks.yaml` for task breakdown.

## Changes Required

1. **firestore-admin-facade.js**: Add optional `tx` parameter, add `readOrNull()` method, use `tx.get()`/`tx.set()` when present
2. **firestore-context.js**: Pass optional `tx` through to all facades
3. **submit-action-request.js**: ALWAYS wrap in `db.runTransaction()`, use `readOrNull()` for duplicate check, single write as "completed" with `serverTimestamp()`
4. **Tests**: Verify immutability, HTTP 409 for duplicates, server timestamps, parallel race conditions
5. **Documentation**: Update event-sourcing.md with corrected examples

## Notes

- **Transactions**: Submit-action-request.js ALWAYS uses transactions (required for atomicity)
- **Handlers unchanged**: Same interface, don't know about transactions
- **No retry logic**: Firestore handles transaction retries automatically
- **Tagged type pattern**: Always `Type.from(rawData)` before use
- **Authorization**: HTTP function uses Admin SDK which bypasses Firestore security rules; auth logic must be in function code (F110.5)
- **Timestamps**: Use `FirestoreAdminFacade.serverTimestamp()` for SOC2 audit trail integrity (server-authoritative, not client `new Date()`)
- **Facade flexibility**: Optional `tx` parameter supports tests, migrations, background jobs without forcing transactions everywhere

## Breaking Changes

**This is a breaking change** - clients must be updated:

**Old behavior (F110.7)**:
- Duplicate requests: HTTP 200 with `{ status: 'completed', processedAt: '...', duplicate: true }`
- Clients check `response.duplicate === true` to detect duplicates

**New behavior (F110.8)**:
- Duplicate requests: HTTP 409 with `{ status: 'duplicate', message: 'Already processed', processedAt: '...' }`
- Clients must handle 409 status code as "already processed" (idempotent success)

**Client migration**:
```javascript
// Before (F110.7):
if (response.status === 200 && response.data.duplicate) {
  // Handle duplicate
}

// After (F110.8):
if (response.status === 409 && response.data.status === 'duplicate') {
  // Handle duplicate (idempotent - operation already succeeded)
}
```
