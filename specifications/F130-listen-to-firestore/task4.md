# Task 4: Update main.jsx

- Import `initializeListeners` and `cleanupListeners` from firestore-listeners.js
- Remove all facade setup and listener logic from component
- In useEffect, call `initializeListeners(() => setDataLoaded(true))`
- In useEffect cleanup, call `cleanupListeners()`
- Keep flush pending save logic unchanged
