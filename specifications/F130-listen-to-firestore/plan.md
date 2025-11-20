# F130: Progressive Data Loading with Firestore Listeners

## Overview
Replace `AllInitialDataLoaded` with progressive loading pattern. User loads first (app shows), then Organization and Blockfaces stream in via real-time listeners.

## Key Changes
- **New Action**: `UserLoaded` - bootstrap only, sets currentUser
- **Enhanced Actions**: `OrganizationSynced` and `BlockfacesSynced` - handle listener updates, manage loading states
- **New State**: `projectDataLoading` flag - tracks when project data is loading
- **New Module**: `src/firestore-facade/firestore-listeners.js` - manages listener lifecycle with flat functions
- **Behavior**: OrganizationSynced wipes project-dependent state (blockfaces, selections) and triggers re-fetch

## Loading Flow
1. User loads → dispatch `UserLoaded` → app visible
2. Organization listener fires → dispatch `OrganizationSynced` → wipe blockfaces, set `projectDataLoading: true`
3. Blockfaces listener fires → dispatch `BlockfacesSynced` → set `projectDataLoading: false`

## State Management
- Only unsubscribe functions live at module level (not app state)
- organizationId and projectId derived from Redux state
- Explicit state rebuild in OrganizationSynced (not `...state` spreading)
