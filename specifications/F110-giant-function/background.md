# F110-new - Multi-Tenant Data Model

**Consolidated specification for multi-tenant domain model implementation**

## Overview

This specification consolidates the multi-tenant data model tasks from the original F110 specifications, focusing on the core implementation tasks needed to complete the domain model.

## Tasks

### **task_1_action_types** ✅ **COMPLETED** *(from F110-multi-tenant-data-model)*

- Define 9 Action tagged type variants (Organization + User actions)
- Implement toFirestore/fromFirestore serialization
- Unit tests for Action creation and serialization

### **task_2_organization_handlers** ✅ **COMPLETED** *(from F110-multi-tenant-data-model)*

- Implement 4 organization event handlers
- Write to flat collection: `/organizations/{orgId}`
- Validation: required fields, status enum
- Unit tests for handlers

### **task_2_5_http_handler** ✅ **COMPLETED** *(from F110.7)*

- Create HTTP function for action request submission
- Implement validation, processing, and error handling
- Update tests to use HTTP submission
- Remove Firestore trigger and actionRequests collection

### **task_3_transaction_infrastructure** ✅ **COMPLETED** *(from F110.8)*

- Add transaction support to firestore-admin-facade.js
- Write failing tests for transaction-based HTTP function
- Implement transaction-based HTTP function with context updates
- Remove obsolete status field from ActionRequest type and related systems
- Update event-sourcing.md documentation

### **task_3_5_organization_members** ✅ **COMPLETED** *(new)*

- Add organization members map to data model with soft delete
- Update type definitions (organization.type.js, action.type.js)
- Rename actions: UserDeleted→MemberRemoved, RoleAssigned→RoleChanged, add MemberAdded
- Document handler logic for member operations with validation

### **task_4_user_handlers** ✅ **COMPLETED** *(from F110-multi-tenant-data-model)*

- Implement 5 user event handlers
- Write to flat collection: `/users/{userId}`
- Validation: email format, role enum
- Unit tests for handlers

### **task_5_authentication** 🟡 **PARTIAL (~90%, F121 PasscodeVerified deferred)** *(from F110.5)*

**Completed:**
- ✅ Token verification middleware with specific error messages
- ✅ User context injection from verified tokens
- ✅ Auth emulator test infrastructure
- ✅ Comprehensive HTTP 401 test coverage
- ✅ userId claim synchronization in UserCreated handler (safety net)
- ✅ authUid field added to UserCreated action

**Deferred to F121 (Authentication Actions):**
- ⏸️ Action.PasscodeRequested (sends SMS with passcode)
- ⏸️ Action.PasscodeVerified (verifies code, **sets userId claim**, returns token)
- ⏸️ SMS delivery infrastructure
- ⏸️ Auth event logging (not immediate priority)

**PRODUCTION BLOCKER:**
- ⚠️ **Deadlock**: Token needs userId claim to submit UserCreated, but UserCreated sets the claim
- ⚠️ **Fix**: PasscodeVerified action (F121) must set claim BEFORE UserCreated is submitted
- ⚠️ Flow: PasscodeVerified sets claim → Client gets token with claim → UserCreated succeeds
- ✅ Tests pass (pre-populate claim, simulating PasscodeVerified's behavior)
- ❌ Production blocked until F121 implements PasscodeVerified action

**Architectural Decisions:**
- ❌ Custom claims for organization roles **REMOVED**
- ✅ Security rules read user doc instead of claims
- ✅ Only userId claim needed (set by PasscodeVerified, re-set by UserCreated as safety net)
- ✅ Authentication actions go through giant function (event sourcing for SOC2 audit trail)
- **Rationale**: See [docs/decisions.md#auth-claims-simplification](../../docs/decisions.md#auth-claims-simplification) and [docs/decisions.md#userid-claim-sync](../../docs/decisions.md#userid-claim-sync)

### **task_6_authorization** ✅ **COMPLETED** *(from F110.5)*

- ✅ Firestore security rules enforce organization membership
- ✅ Users can only read their own user doc
- ✅ All writes restricted to Cloud Functions only
- ✅ Rules use user doc as source of truth (not custom claims)

### **task_7_integration_testing** ❌ **PENDING** *(from F110.5)*

- End-to-end authentication and authorization testing
- Test complete flow: auth → write ActionRequest → verify security rules → process event
- Test data isolation between organizations
- Test role-based access control via security rules

## Status

**Completed**: 6.5/8 tasks
- ✅ task_1 through task_4 fully complete
- 🚧 task_5 (auth) ~85% complete - token verification done, userId claim sync in progress, passcode/logging deferred
- ✅ task_6 (authorization) complete
- ❌ task_7 (integration testing) pending

**In Progress**:
- userId claim synchronization via UserCreated handler (~1 hour remaining)

**Remaining**:
- Integration testing (~4 hours)
- Deferred: Passcode delivery (blocked on F121)

## References

- F110-multi-tenant-data-model: Original specification with detailed architectural decisions
- F110.8-transaction-idempotency: Transaction-based processing implementation
- F110.7-http-action-submission: HTTP function infrastructure (mostly complete)
