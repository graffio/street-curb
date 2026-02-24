# Unwrap Single-Property Namespace Objects in cli-qif-to-sqlite

**Date:** 2026-02-23
**Status:** Brainstorm

## What We're Building

Remove 8 unjustified COMPLEXITY comments across 6 files in `modules/cli-qif-to-sqlite/src/`. Each file wraps a single function in a PascalCase namespace object (e.g., `ParseQifData = { parseQifData }`) and exports the wrapper. Unwrap all of them to export the function directly, rename mismatched files, and update all call sites.

## Why This Matters

The single-property wrappers add indirection with no benefit — `ParseQifData.parseQifData(x)` is strictly worse than `parseQifData(x)`. The COMPLEXITY comments suppress real violations rather than fixing them.

## Settled Decisions

### Unwrap all 7 files

Remove the namespace object wrapper. Export the function directly:
- `const ParseQifData = { parseQifData }` → `export { parseQifData }`
- Update all call sites from `Module.functionName(...)` to `functionName(...)`

### File renames (mismatches only)

Files where kebab-case name already matches the unwrapped export stay as-is:
- `parse-qif-data.js` → stays (exports `parseQifData`) ✓
- `import-lots.js` → stays (exports `importLots`) ✓
- `cli.js` → stays (entry point; will retain COMPLEXITY comment for `handleCli` ≠ `cli`)

Files that need renaming:
- `line-group-to-entry.js` → `parse-line-group.js` (exports `parseLineGroup`)
- `placeholder-creator.js` → `create-placeholders.js` (exports `createPlaceholders`)
- `rollback.js` → `with-rollback.js` (exports `withRollback`)
- `sql-boundary.js` → `to-sql-params.js` (exports `toSqlParams`)

### Validator verb prefix additions

- Add "with" to the function-naming verb prefix list (for `withRollback` and future HOF patterns like `withTransaction`)

### Consumer blast radius

| File | Call sites to update |
|------|---------------------|
| `cli.js` | 2 (ParseQifData, Rollback) |
| `import.js` | ~18 (SqlBoundary ×14, ImportLots ×1, PlaceholderCreator ×1, SqlBoundary in other spots) |
| `import-lots.js` | ~3 (SqlBoundary) |
| `parse-qif-data.js` | 1 (LineGroupToEntry) |
| `index.js` | 5 (barrel re-exports) |
| `test/round-trip.tap.js` | ~13 (ParseQifData) |
| `test/placeholder-creator.tap.js` | ~9 (PlaceholderCreator) |
| `test/rollback.tap.js` | ~3 (Rollback) |
| `scripts/generate-fixtures.js` | 1 (ParseQifData) |

## Knowledge Destination

- `none` — knowledge lives in the code and validator output

## Open Questions

- None
