# Task 5: Fix Remaining Integration Tests

## Goal
Update any remaining integration tests to send correct metadata and expect immediate rejection on spoofing.

## Tests to Fix

### handle-blockface-saved.integration-test.js

**Line 53-72: "When blockface is saved multiple times Then each version persists"**

Current error:
```
Action request failed: Cannot modify createdBy
(existing: usr_jcpgzt0e1fpb, provided: usr_000000000001)
```

**Problem:** Test creates blockface with hardcoded userId (`usr_000000000001`) but the actual actorId from auth is different (`usr_jcpgzt0e1fpb`).

**Fix:** Use the actual `actorUserId` from the test context:
```javascript
const blockface = createTestBlockface(organizationId, projectId, actorUserId)
```

**For updates:** Read the existing blockface from Firestore first, then update with same metadata:
```javascript
// Read existing
const fsContext = createFirestoreContext(namespace, organizationId, projectId)
const existing = await fsContext.blockfaces.read(blockface.id)

// Update preserving metadata
const updatedBlockface = Blockface.from({
    ...existing,
    streetName: 'Updated Street',
    updatedBy: actorUserId,
    updatedAt: new Date()
})
```

## Other Tests to Review

Check all integration tests that create or update documents:
- Ensure they use the correct actorId from auth context
- Ensure updates preserve existing createdBy/createdAt
- Ensure all timestamps are recent (not hardcoded dates)

## Implementation Notes

- Run each test file individually to identify failures
- Update test helper functions if needed (e.g., `createTestBlockface`)
- Ensure test data matches real-world client behavior

## Validation

Run all integration tests:
```bash
yarn tap:integration
```

All tests should pass with the corrected metadata handling.
