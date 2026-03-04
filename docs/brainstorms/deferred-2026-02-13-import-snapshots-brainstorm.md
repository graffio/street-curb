# Pre-Import Snapshots for Recovery

**Date:** 2026-02-13
**Status:** Ready for planning

## What We're Building

Retain SQLite database snapshots before each import so users can recover from bad imports — especially import logic bugs that mangle good QIF data. Currently `rollback.js` copies the DB before import but deletes the backup after success. We'll retain those backups as named snapshots.

## Why This Approach

- The DB is derived from QIF files, but stable IDs aren't deterministic (counter-based), so re-importing from scratch breaks `lotAssignmentOverrides` references.
- Users may not notice a bad import for several imports. Full rollback loses good work; surgical undo (per-field changelog) is too complex for the payoff.
- Snapshots are cheap — SQLite is a single file, `cp` is trivial.
- Existing `rollback.js` already does the copy-then-replace dance; we're extending it to retain rather than discard.

## Key Decisions

- **Retention:** Last 10 snapshots, pruned on each import (like `importHistory`'s 20-import pattern)
- **Location:** Sibling directory `{dbPath}.snapshots/` — co-located, easy to find. Plan for user-configurable path later but don't build it now.
- **Naming:** `{importId}.sqlite` — ties to `importHistory` so `qif-db snapshots` can show what each import did
- **Rollback UX:** Manual for now (user copies snapshot back). Add `qif-db rollback <importId>` later if needed.
- **List command:** Add `qif-db snapshots -d <database>` to list available snapshots with import summaries

## Scope

### In scope
- Modify `rollback.js` → on success, move pre-import copy to `{dbPath}.snapshots/{importId}.sqlite` instead of deleting
- Create snapshot directory if needed
- Prune snapshots beyond retention count (oldest first, by import timestamp from `importHistory`)
- Add `snapshots` CLI command that lists snapshots joined with `importHistory` summaries

### Out of scope (future)
- `qif-db rollback <importId>` CLI command
- Configurable snapshot directory path
- Configurable retention count
- Snapshot compression

## Open Questions

None — ready for `/workflows:plan`.

## Integration Points

- `rollback.js` — `replaceOnSuccess` needs the importId passed in to name the snapshot
- `import-history.js` — snapshot listing needs to join with `importHistory` for summaries
- `cli.js` — new `snapshots` command
