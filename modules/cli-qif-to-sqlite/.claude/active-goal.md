# Active Goal: cli-qif-to-sqlite Refactor

**Goal:** Fix architectural issues - simplify to single stable ID system, preserve Tagged types, track transfers and gain markers.

**Approach:**
- Eliminate hash-based IDs, use 12-digit zero-padded stable IDs directly in base tables
- Add transferAccountId and gainMarkerType columns for transfer/gain tracking
- Create CategoryResolver module for centralized category parsing
- Preserve Tagged types through pipeline (use .from(), not spread)

**Key decisions:**
- 12-digit IDs (`acc_000000000001`) match existing web app regex - no web app changes needed
- Breaking change for field names - use canonical QIF names
