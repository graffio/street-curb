# Completed Specifications

This file tracks specifications that have been implemented and archived.

## F130 - Progressive Data Loading with Firestore Listeners (2025-11-20)
**Purpose:** Implement real-time data synchronization with progressive loading

- Replaced `AllInitialDataLoaded` with progressive loading using three actions: `UserLoaded`, `OrganizationSynced`, `BlockfacesSynced`
- Added `projectDataLoading` state flag to track when project data is loading
- Created `firestore-listeners.js` module to manage listener lifecycle with flat functions
- App-level loading guard in `main.jsx` waits for user and organization before showing routes (eliminates per-route loading checks)
- Organization listener fires `OrganizationSynced`; only wipes project state when defaultProjectId changes (name changes don't trigger reload)
- Blockfaces listener provides real-time updates for all users
- Fixed Redux state pattern: removed redundant `currentOrganizationId`, derive IDs from objects via selectors
- Fixed Firestore rules: flattened nested structure for `organizations/{organizationId}/projects/{projectId}/blockfaces/{blockfaceId}`
- Fixed `descendant()` bug in firestore-client-facade.js that was duplicating collection names in paths
- Updated server-side handler to recognize renamed actions

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
