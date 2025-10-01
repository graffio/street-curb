# Sample Task Prompt - 2025-01-15

## Task Details
- **Timestamp**: 2025-01-15T10:30:00Z
- **Summary**: Add offline queue status indicator to CurbMap UI
- **Target Module**: `modules/curb-map`
- **Specification**: F107 Phase 5 implementation

## Pre-Flight Check
- **Failing Test**: `modules/curb-map/test/offline-indicator.tap.js`
- **Command**: `yarn workspace curb-map tap test/offline-indicator.tap.js`
- **Result**: Test fails as expected (indicator not implemented)

## Context
- **Architecture**: Reference `docs/architecture/offline-first.md` for offline patterns
- **Implementation**: Reference `specifications/F107-firebase-soc2-vanilla-app/phase5-offline.md` for specific implementation
- **Queue Mechanism**: Reference `docs/architecture/queue-mechanism.md` for queue status patterns

## Rationale
Need to add visual feedback for users when operations are queued offline. This follows the offline-first patterns established in the architecture docs and implements the specific UI requirements from F107 Phase 5.

## Test Results
- **Before**: Test fails - no offline indicator
- **After**: Test passes - indicator shows when offline, hides when online
- **Command**: `yarn workspace curb-map tap test/offline-indicator.tap.js`
- **Result**: ✅ All tests pass

## Risks & Rollback
- Low risk - UI-only change
- Rollback: Remove indicator component and test
- No data migration required
- No breaking changes to existing functionality

## Files Modified
- `modules/curb-map/src/components/OfflineIndicator.js` (new)
- `modules/curb-map/test/offline-indicator.tap.js` (new)
- `modules/curb-map/src/App.js` (modified - added indicator)

## Architecture References Used
- `docs/architecture/offline-first.md` - Offline-first design patterns
- `docs/architecture/queue-mechanism.md` - Queue status tracking
- `specifications/F107-firebase-soc2-vanilla-app/phase5-offline.md` - Implementation details
