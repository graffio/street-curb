# Integration Test Simplification - Tech Lead Review

## Executive Summary

After implementing and reviewing issues #1-4, the tech lead assessment is:

**✅ Completed and valuable:**
- Issue #1: Unified auth wrapper (`asSignedInUser`)
- Issue #2: Removed environment capture/restore utilities

**⚠️ Worth pursuing:**
- Issue #5: `buildPayload` helper (pure boilerplate reduction)
- Issue #8: `expectError` helper (optional quality-of-life improvement)

**❌ Not recommended:**
- Issues #3, #4, #6, #7, #9-14: These create competing abstractions or abstract patterns that should remain explicit in test code

**Key principle:** Test code duplication is often intentional and beneficial for clarity. Test files should be self-contained and obvious, not DRY.

---

## ✅ Issue #1: Unified Auth Wrapper - COMPLETED

**Problem:** Multiple auth wrapper patterns (`withOrgAuth`, `withHttpAuth`, raw `withAuthTestEnvironment`)

**Solution:** Created `asSignedInUser(options, effect)` in `auth-emulator.js`

**Result:**
- Supports string labels: `asSignedInUser('test-name', fn)`
- Supports options: `asSignedInUser({ signInMethod: 'phone' }, fn)`
- Returns `{ namespace, token, uid, actorUserId }` to test callback
- All test files now use consistent pattern

**Status:** ✅ Complete and working

---

## ✅ Issue #2: Environment Utilities - COMPLETED

**Problem:** Over-engineered `captureEnv`/`restoreEnv` pattern duplicated across files

**Solution:** Removed capture/restore, using idempotent environment setup

**Result:**
- Hardcoded emulator ports (8080, 9099)
- Read `GCLOUD_PROJECT` from environment once
- Simpler, more reliable setup

**Status:** ✅ Complete and working

---

## ⚠️ Issue #5: Repetitive Payload Construction - RECOMMENDED

**Problem:** Inline `Action.toFirestore()` + key generation repeated 10+ times

```javascript
// Current boilerplate (repeated everywhere):
const payload = {
    action: Action.toFirestore(action),
    idempotencyKey: FieldTypes.newIdempotencyKey(),
    correlationId: FieldTypes.newCorrelationId(),
    namespace,
}
const result = await rawHttpRequest({ body: payload })
```

**Proposed solution:** Add `buildPayload` helper to reduce pure boilerplate

```javascript
// In auth-emulator.js or http-submit-action.js:
export const buildPayload = (namespace, action, { idempotencyKey, correlationId } = {}) => ({
    action: Action.toFirestore(action),
    idempotencyKey: idempotencyKey || FieldTypes.newIdempotencyKey(),
    correlationId: correlationId || FieldTypes.newCorrelationId(),
    namespace,
})

// Usage:
const result = await rawHttpRequest({
    body: buildPayload(namespace, Action.MemberAdded.from({ ... }))
})
```

**Locations:**
- member-handlers.js: line 62-67 (`buildPayload` already exists locally - extract it)
- user-handlers.js: lines 61-66
- organization-handlers-http.js: lines 63-68

**Status:** ⚠️ Recommended - pure boilerplate reduction, no coupling risk

---

## ✅ Issue #8: Inline Error Assertions - COMPLETED

**Problem:** try-catch-fail pattern repeated 8+ times

```javascript
// Current pattern:
try {
    await removeMember({ namespace, token, userId, organizationId })
    t.fail('Then member not found should be rejected')
} catch (error) {
    t.match(error.message, /not found|does not exist/, 'Then validation error thrown')
}
```

**Proposed solution:** Optional helper for common case

```javascript
// In test-helpers.js or inline:
const expectError = async (t, fn, pattern, message) => {
    try {
        await fn()
        t.fail(message || 'Expected error to be thrown')
    } catch (error) {
        t.match(error.message, pattern, message || 'Error message matches pattern')
        return error
    }
}

// Usage:
await expectError(
    t,
    () => removeMember({ namespace, token, userId, organizationId }),
    /not found|does not exist/,
    'Then member not found should be rejected'
)
```

**Trade-off:** Slightly less obvious what's happening, but reduces 6 lines to 1

**Solution implemented:**
```javascript
const expectError = async (t, fn, pattern, message) => {
    try {
        await fn()
        t.fail(message || 'Expected error to be thrown')
    } catch (error) {
        t.match(error.message, pattern, message)
        return error
    }
}
```

**Migrated:**
- member-handlers.js: 5 occurrences replaced
- user-handlers.js: 3 occurrences replaced
- Total: 8 try-catch blocks simplified

**Status:** ✅ Complete and working

---

## ❌ Issue #3: State Reader Patterns - NOT RECOMMENDED

**Original problem:** `orgState`, `projectState`, `firestoreState` helpers duplicated

**Why not recommended:**
1. **They're test fixtures** - Local helpers make tests self-contained
2. **Slight variations** - `orgState` vs `firestoreState` have different return shapes for different needs
3. **`createFirestoreContext` is the abstraction** - We already have the right pattern
4. **Adding `readState` creates competition** - Now there are two ways to read state

**Current state is good:**
```javascript
// In organization-handlers-http.js:
const orgState = async ({ namespace, organizationId, projectId }) => {
    const fsContext = createFirestoreContext(namespace, organizationId, projectId)
    return fsContext.organizations.readOrNull(organizationId)
}

// In member-handlers.js:
const firestoreState = async ({ namespace, organizationId, projectId, userId }) => {
    const fsContext = createFirestoreContext(namespace, organizationId, projectId)
    const org = await fsContext.organizations.read(organizationId)
    const user = userId ? await fsContext.users.read(userId) : null
    return { org, user }
}
```

These are 3-5 line wrappers that make tests obvious. Keep them.

**Status:** ❌ Rejected - current code is good

---

## ❌ Issue #4: Action Builders - NOT RECOMMENDED

**Original problem:** `createOrg`, `createOrganization`, `createUser`, `addMember` duplicated

**Why not recommended:**
1. **Test setup should be explicit** - Reader should see exactly what's being created
2. **Low duplication** - Most helpers appear in 1-2 files only
3. **Coupling risk** - Shared helpers couple unrelated test files
4. **Variations needed** - Different tests need different parameters

**Current state is good:**
```javascript
// In member-handlers.js:
const createOrganization = async ({ namespace, token, organizationId, projectId, name }) => {
    await submitAndExpectSuccess({
        action: Action.OrganizationCreated.from({ organizationId, projectId, name }),
        namespace,
        token,
    })
    return { organizationId, projectId }
}
```

Simple, obvious, self-contained. Keep local to each test file.

**Status:** ❌ Rejected - test code should be explicit

---

## ❌ Issues #6, #7, #9-14 - NOT RECOMMENDED

**Why not recommended:**

**#6 (Common scenario fixtures):** Multi-step test setups should be explicit in tests. `setupOrgWithMember` hides important context.

**#7 (Auth user creation):** `admin.auth().createUser({ email, password })` is already clear. A helper obscures what's happening.

**#9 (Consistency review):** Already consistent with `asSignedInUser`

**#10 (Transaction helpers):** Only used in 1 file, not worth abstracting

**#11 (Cleanup abstraction):** Namespace isolation prevents leaks, explicit cleanup is fine

**#12 (Documentation):** `rawHttpRequest` is already well-documented by usage

**#13 (Timestamp fixtures):** File-specific patterns are appropriate

**#14 (Listener helpers):** Only 3 uses, pattern is already clear

**Status:** ❌ Rejected - no action needed

---

## Final Recommendation

**Completed:**
1. ✅ Issue #1: Unified auth wrapper (`asSignedInUser`)
2. ✅ Issue #2: Removed environment capture/restore
3. ✅ Issue #5: Extracted `buildActionPayload` helper
4. ✅ Issue #8: Added `expectError` helper for error assertions

**Keep as-is:**
- Local test fixtures (`orgState`, `firestoreState`, `createOrganization`, etc.)
- Explicit auth user creation
- Explicit multi-step test setup
- File-specific patterns

**Philosophy:**
Test code prioritizes **clarity** over **DRY**. Duplication in tests is acceptable when it makes tests self-contained and obvious. Only extract helpers when they reduce pure boilerplate (like payload construction) without hiding important context.

---

## Implementation Status

### ✅ Completed Tasks

**Issue #1 - Unified auth wrapper:**
- Created `asSignedInUser` in auth-emulator.js
- All test files migrated

**Issue #2 - Environment utilities:**
- Removed capture/restore pattern
- Simplified to idempotent setup

**Issue #5 - buildActionPayload helper:**
- Added to http-submit-action.js
- Migrated member-handlers.js, user-handlers.js, organization-handlers-http.js

**Issue #8 - expectError helper:**
- Added to http-submit-action.js
- Migrated 5 occurrences in member-handlers.js
- Migrated 3 occurrences in user-handlers.js
- Total: 8 try-catch blocks simplified

### ❌ Rejected Tasks

Issues #3, #4, #6, #7, #9-14 were rejected to preserve test clarity and avoid over-abstraction.
