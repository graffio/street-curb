# Progressive Loading Pattern

## Overview
The application uses progressive loading with real-time Firestore listeners to stream data as it becomes available, rather than waiting for all data before showing the UI.

## Loading Sequence

1. **User Bootstrap** (one-time read)
   - Read user document from Firestore
   - Dispatch `UserLoaded` action
   - Extract organizationId from user.organizations

2. **Organization Listener** (real-time)
   - Set up listener for organization document
   - Dispatch `OrganizationSynced` when data arrives or changes
   - If defaultProjectId changes, wipe project-dependent state and set up new blockfaces listener

3. **Blockfaces Listener** (real-time)
   - Set up listener for blockfaces collection under current project
   - Dispatch `BlockfacesSynced` when data arrives or changes
   - Updates blockfaces in Redux without disrupting other state

## App-Level Loading Guard

The main app (`main.jsx`) uses Redux state to determine when to show routes:

```javascript
const AppContent = () => {
    const currentUser = useSelector(S.currentUser)
    const currentOrganization = useSelector(S.currentOrganization)

    // Wait for both user and organization before showing routes
    return currentUser && currentOrganization ? <RouterProvider /> : <LoadingSpinner />
}
```

This eliminates the need for individual routes to check if data is loaded.

## State Management

**Redux State Pattern:**
- Store full objects for singletons (`currentUser`, `currentOrganization`)
- Store IDs for collection items (`currentBlockfaceId` + lookup in `blockfaces` collection)
- Store IDs for references we don't load (`currentProjectId` - project object not loaded)
- Derive IDs from objects via selectors (e.g., `currentOrganizationId` from `state.currentOrganization?.id`)

**Reducer Behavior:**
- `UserLoaded`: Sets currentUser only (bootstrap)
- `OrganizationSynced`: If projectId unchanged, just updates organization; if changed, wipes blockfaces and sets `projectDataLoading: true`
- `BlockfacesSynced`: Updates blockfaces collection and sets `projectDataLoading: false`

## Listener Lifecycle

**Module:** `src/firestore-facade/firestore-listeners.js`

**Initialization:**
1. `initializeListeners()` called from `main.jsx` useEffect
2. Loads user and sets up organization listener
3. Organization listener sets up blockfaces listener on first update

**Cleanup:**
- `cleanupListeners()` called from useEffect cleanup
- Unsubscribes from all active listeners to prevent memory leaks

**Project Switching:**
- Module tracks `lastProjectId` to detect changes
- When organization's defaultProjectId changes, old blockfaces listener is cleaned up and new one created
- Reducer wipes blockfaces state when projectId changes, triggering loading state

## Benefits

- **Better perceived performance**: App shows immediately after user loads
- **Automatic updates**: Changes from other users appear in real-time
- **Efficient**: Only reloads data when necessary (projectId change)
- **Clean architecture**: Routes don't need loading checks, handled at app level
