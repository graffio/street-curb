# Completed Specifications

This file tracks specifications that have been implemented and archived.

## F128 - Improve Metadata Handling (2025-11-20)
**Purpose:** Clarify that organizationId is request metadata, not action payload data

- Removed organizationId field from 7 organization-scoped action variants (OrganizationCreated, OrganizationUpdated, OrganizationDeleted, OrganizationSuspended, MemberAdded, RoleChanged, MemberRemoved)
- Updated Action.getSubject() to accept organizationId as parameter instead of extracting from action
- All handlers extract organizationId from actionRequest (request metadata), not from action payloads
- Removed custom claims from Firebase Auth tokens (eliminates staleness issues)
- Implemented tenant validation by reading user.organizations from Firestore instead of token claims
- Server reads user document to validate organization/project access on every request
- Special handling for UserCreated (user doesn't exist yet) and OrganizationCreated (user creating first org)
- Pattern established: organizationId is ALWAYS request metadata, derived server-side from request context
