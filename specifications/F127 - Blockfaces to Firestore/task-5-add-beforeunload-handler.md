# Task 5: Add beforeunload Handler

- Add `window.addEventListener('beforeunload')` in app initialization (e.g., App.jsx or index.jsx)
- In handler, check if there's a pending blockface save (any active debounce timers)
- Call `flushBlockfaceSave()` for any pending blockfaces (uses `fetch` with `keepalive: true`)
- Also add `visibilitychange` listener to save when user switches tabs (better reliability)
- Test by editing blockface and closing tab (should save before unload)
