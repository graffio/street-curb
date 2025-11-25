# Task 1: Update Security Integration Tests (TDD)

## Goal
Update `security.integration-test.js` to reflect the new validation strategy where the server immediately rejects spoofed metadata rather than silently correcting it.

## Current Problem
Tests expect the server to accept spoofed metadata and overwrite it. The new strategy rejects spoofed metadata immediately with a 500 error.

## Changes Required

### Tests to Update

1. **"When client sends blockface with fake createdBy"** (line 125)
   - Currently expects: HTTP 200 (metadata overwritten)
   - Should expect: HTTP 500 with error message about createdBy mismatch

2. **"When client sends blockface with backdated createdAt"** (line 147)
   - Currently expects: HTTP 200 (timestamp overwritten)
   - Should expect: HTTP 500 with error message about createdAt mismatch

3. **"When client modifies createdBy on existing blockface"** (line 172)
   - Currently expects: HTTP 500 (this is correct - keep as is)
   - Verify error message is clear

4. **"When client modifies createdAt on existing blockface"** (line 211)
   - Currently expects: HTTP 500 (this is correct - keep as is)
   - Verify error message is clear

### Tests to Keep Unchanged

- Tenant access tests (lines 28-60) - these should continue to work
- Project-level action tests (lines 62-84) - these should continue to work
- New user organization creation (lines 86-100) - should continue to work
- Member access tests (lines 102-118) - should continue to work
- Tenant boundary violation tests (lines 245-307) - should continue to work

## Implementation Notes

- Use TDD: update tests BEFORE changing submit-action-request.js
- Tests will fail initially (expected)
- Tests should pass once task 2 is complete
- Focus on making test expectations match the new "reject immediately" strategy

## Validation

Run tests with:
```bash
yarn tap:file test/integration-test/security.integration-test.js
```

Tests should fail initially, demonstrating they're properly checking for the new behavior.
