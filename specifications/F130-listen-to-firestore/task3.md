# Task 3: Create Firestore Listeners Module

- Create `src/firestore-facade/firestore-listeners.js`
- Module-level state: only `organizationUnsubscribe` and `blockfacesUnsubscribe` (cleanup functions)
- Functions (flat, single indent): `loadUser()`, `setupOrganizationListener()`, `handleOrganizationUpdate()`, `setupBlockfacesListener()`, `handleBlockfacesUpdate()`, cleanup helpers
- Export `initializeListeners(onUserLoaded)` and `cleanupListeners()`
- Logic: loadUser → UserLoaded → onUserLoaded callback → setup org listener → OrganizationSynced → setup blockfaces listener → BlockfacesSynced
