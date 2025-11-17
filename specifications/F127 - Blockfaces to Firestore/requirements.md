# F127 - Blockfaces to Firestore

## Goal
Persist blockface edits to Firestore with debounced auto-save

## Persistence Timing
- **3 seconds after last edit** - Debounced save to batch rapid edits
- **On blockface switch** - Flush pending save when SelectBlockface
- **On page unload** - beforeunload handler flushes pending save
- **Manual flush available** - For tests/explicit save scenarios

## Actions to Persist
- `CreateBlockface` → persist immediately (new blockface)
- All segment actions → trigger debounced save of entire blockface
  - `UpdateSegmentUse`, `UpdateSegmentLength`, `AddSegment`, `AddSegmentLeft`, `ReplaceSegments`
- Add `Action.SaveBlockface(organizationId, projectId, blockface)` for explicit/debounced saves

## Implementation
1. Add debounce timer to `post.js` (single global timer, keyed by blockfaceId)
2. Segment actions trigger debounce instead of returning `submitActionRequest`
3. `SelectBlockface` clears timer and flushes if pending
4. Add `window.addEventListener('beforeunload')` to flush on exit
5. Create `Action.SaveBlockface(blockfaceId)` for explicit save/flush
6. Update Cloud Function handler to accept SaveBlockface

## Firestore Schema
```
organizations/{orgId}/projects/{projectId}/blockfaces/{blockfaceId}
  id: string
  organizationId: string (denormalized for queries/portability)
  projectId: string (denormalized for queries/portability)
  streetName: string
  geometry: object
  cnnId: string?
  segments: [Segment] (serialized via Segment.toFirestore)
  createdAt: timestamp
  createdBy: userId
  updatedAt: timestamp
  updatedBy: userId
```

## Firestore Rules
```
match /organizations/{orgId}/projects/{projectId}/blockfaces/{blockfaceId} {
  allow read: if request.auth != null
    && request.auth.token.organizationId == orgId;
  allow write: if false; // Cloud Functions only
}
```

## Architectural Decision: Snapshot vs Event Sourcing

**Blockfaces use snapshot-based persistence, NOT event sourcing:**
- Redux actions (UpdateSegmentUse, etc.) remain granular for UI reactivity
- Firestore receives entire blockface snapshots via debounced SaveBlockface
- Trade-off: Lower cost, acceptable audit trail granularity for iterative editing
- Single user per blockface assumed (no concurrent edit conflicts)

**Change tracking:**
- Before saving, diff previous Firestore snapshot vs current state
- Include changes object in SaveBlockface action for audit trail
- Structure: `{ added: [...], modified: [...], removed: [...] }`
- Example: `{ modified: [{ index: 0, field: 'use', oldValue: 'Loading', newValue: 'Parking' }] }`
- Requires fetching previous version before save (1 extra read per save)

## Out of Scope
- Real-time sync (onSnapshot) - defer to separate feature
- Conflict resolution - single user per blockface assumed
- Scaling for thousands of blockfaces - optimize when needed
- Per-action event sourcing for segments - snapshot-based only
- **Deferred**: UI should check `Action.mayI()` before showing save-triggering actions to viewers
