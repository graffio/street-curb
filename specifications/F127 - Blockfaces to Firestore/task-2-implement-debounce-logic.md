# Task 2: Implement Debounce Logic in post.js

- Add debounce timer map (keyed by blockfaceId) at top of post.js
- Create `scheduleBlockfaceSave(blockfaceId)` function that clears existing timer and sets new 3s timeout
- Create `flushBlockfaceSave(blockfaceId)` function that clears timer and saves immediately
- Update segment action handlers to call `scheduleBlockfaceSave()` after Redux dispatch
- Update `SelectBlockface` handler to call `flushBlockfaceSave()` for previous blockface before switching
