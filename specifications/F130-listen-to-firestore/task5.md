# Task 5: Update post.js Action Handlers

- Remove `AllInitialDataLoaded` case from `captureRollbackSnapshot()` (return {})
- Remove `AllInitialDataLoaded` case from `getPersistenceStrategy()` (return null)
- Add `UserLoaded` case to `captureRollbackSnapshot()` (return {})
- Add `UserLoaded` case to `getPersistenceStrategy()` (return null - local-only)
- Update authorization check comment: UserLoaded bypasses authorization (like AllInitialDataLoaded did)
