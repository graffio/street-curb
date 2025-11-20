# Data Model Architecture

## Metadata Fields Pattern

Every domain document includes audit metadata:
- `createdAt` / `createdBy` - Set once on creation (immutable)
- `updatedAt` / `updatedBy` - Updated on every modification

### Server-authoritative metadata generation

- Handlers call `generateMetadata(fsContext, actionRequest)` for new documents
- Handlers call `updatedMetadata(fsContext, actionRequest)` for updates
- Extracts `actorId` from actionRequest (NOT from action payloads)
- Server generates timestamps via `new Date()` (SOC2 requirement)
- Implementation: `modules/curb-map/functions/src/shared.js`

### Why metadata is NOT in action payloads

- Prevents client timestamp spoofing (SOC2 compliance)
- Prevents actorId spoofing (security)
- Server is single source of truth for "who and when"
- Action payloads describe "what happened", metadata describes "who/when"

Used by handlers: handle-organization-created.js, handle-organization-updated.js, handle-organization-suspended.js, handle-user-created.js, handle-user-updated.js, handle-blockface-saved.js
