---
summary: "User management UI requirements"
status: "active"
---

# User Management UI Requirements

## Overview

User management interface for viewing and managing organization members with role-based access control.

**Implementation:** See task-1, task-2, task-3 for technical details.

## UI Structure by Role

### Admin
- Two tabs: "Active Users" and "Removed Users"
- Can change other users' roles via dropdown
- Cannot change own role (ensures ≥1 admin always exists)

### Member
- Single view: "Users" (active only)
- Read-only, no actions

### Viewer
- No access to user management UI

## Table Columns

### Active Users (All Roles Can View)
1. Display name
2. Role (admin/member/viewer)
   - Admins see: dropdown to change role
   - Members see: plain text

### Removed Users (Admins Only)
1. Display name
2. Role (at time of removal)
3. Removed At (date format: "March 15, 2024")

## Filters & Sorting

**Search:**
- Filter by display name (case-insensitive)
- Real-time as user types

**Role Filter:**
- Dropdown: All / Admin / Member / Viewer
- Default: All
- Applies to current tab

**Sorting:**
- Click column headers to sort
- Toggle between ascending/descending
- Display name: alphabetical (A-Z ⟷ Z-A)
- Role: hierarchy (admin > member > viewer)
- Removed At: chronological

## Actions

### Role Change (Admin Only)
- Dropdown shows all 3 roles
- No confirmation dialog needed
- Own entry disabled with tooltip: "You cannot change your own role"
- On success: Toast notification
- On failure: Error dialog, revert to actual state

### Validation
- Server-side: Validate all role changes
- Client-side: Disable own entry dropdown

## User Lifecycle States

**Active Member**
- `removedAt = null`
- Visible in Active Users tab

**Removed by Admin**
- `removedAt = timestamp`
- `removedBy = admin userId`
- Visible in Removed Users tab (admin only)

**Forgotten by User (GDPR)**
- `removedAt = timestamp`
- `removedBy = userId` (self-removal)
- Appears same as "Removed by Admin" in UI

## Decisions Made

**Display Names:** Preserved for forgotten users (legal review deferred)

**User Document Deletion:** Soft-delete with `removedAt`/`removedBy` fields

**No Visual Distinction:** Removed vs. forgotten users appear identical

**No "Removed By" Column:** Simplified—only show when removed, not who removed

## Open Questions

**Filter Persistence:** When switching tabs, should search/role filter reset or persist? (TBD)

## Phase 2: Deferred Features

- Update CurbMap to use Table and not `RadixTable`
- App routing and integration
- Real Firestore connection
- Toast notifications
- Error dialogs
- Role change via `submitActionRequest()`
- Invitation system
- Bulk actions
- Additional columns (addedAt, addedBy, last active)
- Empty state messaging
