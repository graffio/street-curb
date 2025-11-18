# Task 1: Add BlockfaceSaved Action

- Add `BlockfaceSaved` to `type-definitions/action.type.js`:
  - Fields: `blockface` ('Blockface'), `changes` ('Object?')
  - Note: organizationId/projectId now stored in Blockface itself
- `yarn types:watch` is running so action.js will regenerate automatically
- Update all `action.match()` calls:
  - `piiFields`: return `[]`
  - `toLog`: return `{ type: 'BlockfaceSaved', blockfaceId: action.blockface.id }`
  - `getSubject`: return `{ id: action.blockface.id, type: 'blockface' }`
  - `mayI`: return `['admin', 'editor'].includes(actorRole)` (viewers cannot save)
  - `captureStateSnapshot`: return `{}`
  - `getPersistenceStrategy`: return `submitActionRequest`
  - `reduceAction`: return `state` (no Redux change)
  - `dispatchToHandler`: return `handleBlockfaceSaved` (create in task 6)
