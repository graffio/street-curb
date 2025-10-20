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

### **task_4_user_handlers** ❌ **PENDING** *(from F110-multi-tenant-data-model)*

- Implement 5 user event handlers
- Write to flat collection: `/users/{userId}`
- Validation: email format, role enum
- Unit tests for handlers

### **task_5_authentication** ❌ **PENDING** *(from F110.5)*

- Implement Firebase Auth with custom claims
- Configure passcode authentication
- Create custom claims system (organization roles and permissions)
- Basic auth middleware (token verification, user context injection)

### **task_6_authorization** ❌ **PENDING** *(from F110.5)*

- Implement authorization via Firestore security rules
- Add rules for hierarchical collections
- Implement permission checking using custom claims
- Add organization-scoped access control rules

### **task_7_integration_testing** ❌ **PENDING** *(from F110.5)*

- End-to-end authentication and authorization testing
- Test complete flow: auth → write ActionRequest → verify security rules → process event
- Test data isolation between organizations
- Test role-based access control via security rules

## Status

**Completed**: 5/8 tasks
**Remaining**: User handlers + Authentication/Authorization (~18 hours)

## References

- F110-multi-tenant-data-model: Original specification with detailed architectural decisions
- F110.8-transaction-idempotency: Transaction-based processing implementation
- F110.7-http-action-submission: HTTP function infrastructure (mostly complete)
