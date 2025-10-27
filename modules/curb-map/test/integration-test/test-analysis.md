# Integration Test Analysis: Business Logic vs Infrastructure

## Summary

**Total Tests**: 32 tests across 10 files
**Recommendation**: Remove 11 infrastructure tests, keep 18 business logic tests, add 3 missing scenarios

---

## handle-organization-created.integration-test.js

### ⚠️ REMOVE - Infrastructure Tests (Lines 16-36)
**Test**: "When OrganizationCreated is submitted Then Firestore and metadata reflect token UID"
- **Why Remove**: Tests Firestore write capability and timestamp generation (infrastructure)
- **Lines**: 16-36 (checks `processedAt`, `createdBy`, `updatedBy` fields)
- **Note**: Metadata generation is tested repeatedly across all handlers

### ⚠️ REMOVE - Infrastructure Tests (Lines 38-53)
**Test**: "When request omits token Then HTTP 401 is returned"
- **Why Remove**: Tests HTTP authentication middleware (infrastructure, not handler logic)
- **Lines**: 38-53
- **Note**: Auth is tested in every handler - redundant

### ⚠️ REMOVE - Infrastructure Tests (Lines 55-68)
**Test**: "When duplicate OrganizationCreated submitted Then HTTP 409 duplicate is returned"
- **Why Remove**: Tests idempotency key infrastructure
- **Lines**: 55-68

### ⚠️ REMOVE - Infrastructure Tests (Lines 70-81)
**Test**: "When server timestamps set Then completedActions entry has processedAt"
- **Why Remove**: Redundant with line 25, tests Firestore timestamp generation
- **Lines**: 70-81

### ⚠️ REMOVE - Infrastructure Tests (Lines 83-92)
**Test**: "When validation fails Then HTTP 400 is returned"
- **Why Remove**: Tests Tagged type validation library
- **Lines**: 83-92

### ✅ KEEP - Business Logic (Implied)
**Missing Explicit Test**: Organization creation with default project
- **Business Logic**: Line 15-21 in handler creates organization AND default project
- **Current Coverage**: Tests verify documents exist but don't validate the relationship
- **Recommendation**: Add explicit test for `organization.defaultProjectId === projectId` and project-org linkage

---

## handle-organization-updated.integration-test.js

### ✅ KEEP - Business Logic (Lines 10-22)
**Test**: "When OrganizationUpdated changes name Then metadata uses token UID"
- **Business Logic**: Tests name update logic
- **Lines**: 10-22
- **Note**: The metadata assertion (line 19) is infrastructure, but name change is business logic

### ✅ KEEP - Business Logic (Lines 24-35)
**Test**: "When OrganizationUpdated changes status Then status is updated"
- **Business Logic**: Tests status update logic
- **Lines**: 24-35

### 🆕 MISSING - Business Logic
**Scenario**: Partial updates (omit fields via removeNilValues)
- **Handler Logic**: Lines 29-36 use `removeNilValues()` to handle partial updates
- **Missing Test**: Verify that updating only `name` doesn't clear `status`, and vice versa

---

## handle-organization-suspended.integration-test.js

### ✅ KEEP - Business Logic (Lines 10-21)
**Test**: "When OrganizationSuspended runs Then organization status becomes suspended"
- **Business Logic**: Tests suspension state transition
- **Lines**: 10-21
- **Note**: Core business rule that status changes to 'suspended'

---

## handle-organization-deleted.integration-test.js

### ✅ KEEP - Business Logic (Lines 11-22)
**Test**: "When OrganizationDeleted runs Then organization document is removed"
- **Business Logic**: Tests deletion logic
- **Lines**: 11-22
- **Note**: Verifies document is actually deleted, not just marked inactive

---

## handle-user-created.integration-test.js

### ✅ KEEP - Business Logic (Lines 11-44)
**Test**: "When user is created Then user doc has empty organizations map"
- **Business Logic**: Tests initialization of `organizations: {}` map and Firebase Auth claim setting
- **Lines**: 11-44
- **Key Business Logic**: Lines 20, 24 (empty organizations map, custom claim linking)

### ⚠️ REMOVE - Infrastructure Tests (Lines 32-36)
**Subset of Above Test**: Metadata assertions (createdAt, createdBy, updatedBy)
- **Why Remove**: Lines 32-36 test infrastructure (metadata generation)
- **Keep**: Lines 33 (empty organizations map) and 39-41 (custom claims)

### ⚠️ REMOVE - Infrastructure Tests (Lines 46-70)
**Test**: "When request omits token Then authentication fails with HTTP 401"
- **Why Remove**: Tests HTTP auth middleware (infrastructure)
- **Lines**: 46-70

---

## handle-user-updated.integration-test.js

### ✅ KEEP - Business Logic (Lines 10-36)
**Test**: "When user email is updated Then email changes and organizations unchanged"
- **Business Logic**: Tests selective field update and preservation of organizations map
- **Lines**: 10-36
- **Key Assertion**: Line 31 verifies `organizations` map is not modified

### ✅ KEEP - Business Logic (Lines 38-65)
**Test**: "When displayName is updated Then displayName changes and organizations unchanged"
- **Business Logic**: Tests selective field update
- **Lines**: 38-65
- **Key Assertion**: Line 60 verifies `organizations` map is not modified

### ⚠️ REMOVE - Infrastructure Tests (Lines 32-34, 61-63)
**Subset of Above Tests**: Metadata assertions (updatedAt, updatedBy)
- **Why Remove**: Lines 32-34 and 61-63 test infrastructure
- **Keep**: The field update and organizations preservation logic

---

## handle-user-forgotten.integration-test.js

### ✅ KEEP - Business Logic (Lines 11-54)
**Test**: "When user is forgotten Then removedAt set in all orgs and user deleted"
- **Business Logic**: Tests GDPR multi-document cascade delete
- **Lines**: 11-54
- **Key Business Logic**: Lines 44-48 verify soft-delete in ALL organizations user belongs to

### ✅ KEEP - Business Logic (Lines 56-67)
**Test**: "When user not found Then GDPR action handles gracefully"
- **Business Logic**: Tests idempotent deletion (line 136-139 in handler)
- **Lines**: 56-67

### ✅ KEEP - Business Logic (Lines 69-86)
**Test**: "When user has no organizations Then GDPR deletes user only"
- **Business Logic**: Tests edge case where user has no org memberships
- **Lines**: 69-86

---

## handle-member-added.integration-test.js

### ✅ KEEP - Business Logic (Lines 11-28)
**Test**: "When member already active Then reject with validation error"
- **Business Logic**: Tests duplicate member prevention (handler lines 60-61)
- **Lines**: 11-28

### ⚠️ REMOVE - Infrastructure Tests (Lines 17-20)
**Subset of Above Test**: Firebase Auth custom claim verification
- **Why Remove**: Lines 17-20 test infrastructure (custom claims already set by UserCreated handler)
- **Keep**: Lines 22-25 (duplicate validation)

### ⚠️ REMOVE - Infrastructure Tests (Lines 30-49)
**Test**: "When request omits token Then authentication fails with HTTP 401"
- **Why Remove**: Tests HTTP auth middleware
- **Lines**: 30-49

### ✅ KEEP - Business Logic (Lines 51-64)
**Test**: "When new member added Then metadata uses actor userId claim"
- **Business Logic**: Tests cross-document atomic update (org.members + user.organizations)
- **Lines**: 51-64
- **Key Assertion**: Line 61 verifies bidirectional link

### ✅ KEEP - Business Logic (Lines 66-89)
**Test**: "When removed member reactivated Then claims and metadata refresh"
- **Business Logic**: Tests reactivation logic (handler lines 56-65)
- **Lines**: 66-89
- **Key Assertions**: Lines 84-85 verify `removedAt` cleared and role updated

### ⚠️ REMOVE - Infrastructure Tests (Lines 91-102)
**Test**: "When phone sign-in token used Then member added successfully"
- **Why Remove**: Tests Firebase Auth phone provider (infrastructure)
- **Lines**: 91-102

---

## handle-member-removed.integration-test.js

### ✅ KEEP - Business Logic (Lines 10-22)
**Test**: "When member not found Then reject with validation error"
- **Business Logic**: Tests validation (handler line 87)
- **Lines**: 10-22

### ✅ KEEP - Business Logic (Lines 24-39)
**Test**: "When member already removed Then reject with validation error"
- **Business Logic**: Tests double-removal prevention (handler lines 89-90)
- **Lines**: 24-39

### ✅ KEEP - Business Logic (Lines 41-55)
**Test**: "When member removed Then metadata and claims record actor userId"
- **Business Logic**: Tests soft-delete and cross-document update
- **Lines**: 41-55
- **Key Assertion**: Lines 51-52 verify soft-delete semantics

### ⚠️ REMOVE - Infrastructure Tests (Lines 57-74)
**Test**: "When request omits token Then removal call is rejected"
- **Why Remove**: Tests HTTP auth middleware
- **Lines**: 57-74

---

## handle-role-changed.integration-test.js

### ✅ KEEP - Business Logic (Lines 11-23)
**Test**: "When member not found Then reject with validation error"
- **Business Logic**: Tests validation (handler line 117)
- **Lines**: 11-23

### ✅ KEEP - Business Logic (Lines 25-37)
**Test**: "When member removed Then role change rejected"
- **Business Logic**: Tests business rule (handler line 118)
- **Lines**: 25-37

### ✅ KEEP - Business Logic (Lines 39-53)
**Test**: "When role changed Then organization, user, and claims update"
- **Business Logic**: Tests atomic cross-document role update
- **Lines**: 39-53
- **Key Assertions**: Lines 49-50 verify bidirectional sync

### ⚠️ REMOVE - Infrastructure Tests (Lines 55-68)
**Test**: "When request omits token Then role change is rejected"
- **Why Remove**: Tests HTTP auth middleware
- **Lines**: 55-68

---

## 🆕 MISSING - Critical Business Logic Tests

### 1. MemberAdded: Atomic Update Failure Handling
**Handler Lines**: 68-69
**Missing Test**: What happens if org update succeeds but user update fails?
**Business Risk**: Inconsistent state between org.members and user.organizations

### 2. MemberRemoved: Atomic Update Failure Handling
**Handler Lines**: 98-99
**Missing Test**: What happens if org update succeeds but user update fails?
**Business Risk**: User retains organization access after removal

### 3. RoleChanged: Atomic Update Failure Handling
**Handler Lines**: 121-122
**Missing Test**: What happens if org update succeeds but user update fails?
**Business Risk**: User role mismatch between documents

---

## Recommendations

### Immediate Actions
1. **Remove 11 Infrastructure Tests**: All HTTP 401/validation/timestamp/metadata tests
2. **Simplify Remaining Tests**: Remove infrastructure assertions from business logic tests
3. **Add 3 Atomic Failure Tests**: Critical for multi-document update handlers

### Test Organization
- **Unit Tests**: Move HTTP auth, validation, metadata generation to unit test suite
- **Integration Tests**: Focus exclusively on business logic and cross-document consistency
- **E2E Tests**: Consider adding authorization tests (can user X perform action Y?)

### Business Logic Focus
Keep tests that verify:
- ✅ State transitions (active → suspended)
- ✅ Validation rules (duplicate prevention, soft-delete checks)
- ✅ Cross-document atomic updates (bidirectional links)
- ✅ Cascade operations (GDPR deletion across multiple orgs)
- ✅ Edge cases (reactivation, missing data handling)

Remove tests that verify:
- ❌ HTTP status codes (middleware)
- ❌ Timestamp generation (Firestore SDK)
- ❌ Tagged type validation (library functionality)
- ❌ Idempotency keys (infrastructure)
- ❌ Auth provider types (Firebase Auth)

---

## Files Summary

| File | Total Tests | Keep | Remove | Missing |
|------|-------------|------|--------|---------|
| handle-organization-created | 5 | 0 | 5 | 1 |
| handle-organization-updated | 2 | 2 | 0 | 1 |
| handle-organization-suspended | 1 | 1 | 0 | 0 |
| handle-organization-deleted | 1 | 1 | 0 | 0 |
| handle-user-created | 2 | 1 | 1 | 0 |
| handle-user-updated | 2 | 2 | 0 | 0 |
| handle-user-forgotten | 3 | 3 | 0 | 0 |
| handle-member-added | 5 | 2 | 3 | 0 |
| handle-member-removed | 4 | 3 | 1 | 0 |
| handle-role-changed | 4 | 3 | 1 | 0 |
| **TOTAL** | **32** | **18** | **11** | **3** |

**Net Result**: 18 + 3 = 21 integration tests (34% reduction + critical coverage added)
