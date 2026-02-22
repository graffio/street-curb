# Fix Null-Ban Tooling Gaps

**Date:** 2026-02-22
**Status:** Brainstorm

## What We're Building

Four fixes to close gaps in the null-ban enforcement tooling, discovered during the exempted-modules work:

1. **Runtime validators accept null for optional fields** — `runtime-for-generated-types.js` uses `== null` (loose
   equality) in every validator, silently treating null as "absent." Should use `=== undefined`.
2. **Generated type files stale** — The code generator template was already fixed (commit `5a63b53f`) to emit
   `!== undefined`, but generated output files still contain old `!= null`. Need regeneration.
3. **Style validator allows fake section separators** — Section separators (Predicates, Transformers, etc.) can exist
   without corresponding cohesion group objects (`const P = {}`, `const T = {}`). Validator checks ordering but not
   content. Standalone exported functions under P/T/F sections are misleading.
4. **column-definition.type.js missing from type-mappings.js** — The type definition exists in
   `quicken-web-app/type-definitions/` but isn't registered, so `yarn types:generate-all` skips it.

After all fixes, re-validate all files changed on the exempted-modules branch.

## Why This Matters

- Null silently accepted by generated type constructors contradicts the null ban — a hidden timebomb
- Fake section separators caused bad reviewer advice (categorizing by role instead of cohesion group membership)
- An unregistered type definition means column-definition.js diverges from the pipeline permanently

## Settled Approach

### Fix 1: Runtime validators

In `modules/cli-type-generator/runtime-for-generated-types.js`, change all `optional && x == null` guards to
`optional && x === undefined`. Affects: validateRegex, validateNumber, validateString, validateObject, validateDate,
validateBoolean, validateTag, validateArray, validateLookupTable, and the `hasPii` null check in `redact`.

### Fix 1b: Restructure runtime exports

Restructure `runtime-for-generated-types.js` from 15 individual named exports to a single `RuntimeForGeneratedTypes`
object export. Update code generator template from `import * as R` to `import { RuntimeForGeneratedTypes as R }`.
Update manual consumers (logger-production.js, submit-action-request.js, test files). Cheap since we're already
regenerating all types.

### Fix 1c: ASTNode.wrap null default

Change `ASTNode.wrap = (esTreeNode, parent = null)` to `parent = undefined` in ast-node.type.js. The null default
violates the null ban and crashes the runtime validators after the `=== undefined` migration.

### Fix 1d: Fix pre-existing violations in staged files

Pre-commit hook runs the style validator on ALL staged files. Files touched for import changes have pre-existing
violations that now block the commit: runtime-for-generated-types.js (missing Exports section), index.js (missing
ABOUTME), ast-node.type.js (missing Exports), logger-production.js (null-literal, naming),
submit-action-request.js (cohesion, naming, export naming).

### Fix 2: Regenerate types

Run `yarn types:generate-all` after Fix 1. All generated files get both the runtime fix (imported) and the template fix
(already committed).

### Fix 3: Validator rule for section separators

In `modules/cli-style-validator/src/lib/rules/check-section-separators.js`, add a check: a P/T/F/V/A/E section separator
must be followed by its corresponding `const X = {` declaration. If the file has no cohesion groups, those section
separators shouldn't exist — only Constants and Exports sections are valid.

### Fix 4: Register column-definition.type.js

Add `column-definition.type.js` to `type-mappings.js` targeting `quicken-web-app/src/types/`.

### Fix 5: Re-validate

Run the updated validator on all files changed on the exempted-modules branch. Fix any newly-flagged violations
(expected: files like category-resolver.js that have section separators without cohesion groups).

## Knowledge Destination

- `decisions:` append — runtime validators use strict equality for null ban consistency
- `none` — validator rule and type-mappings fix are mechanical

## Open Questions

None.
