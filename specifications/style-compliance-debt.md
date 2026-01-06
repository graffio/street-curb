# Style Compliance Technical Debt

This file tracks folders with pre-existing style violations that are exempted via COMPLEXITY-TODO comments.
These exemptions expire on 2026-04-01 and should be addressed before then.

## Folders Requiring Refactoring

### modules/cli-qif-to-sqlite/src/

**Files:**
- `cli-ui.js` - CLI display functions
- `line-group-to-entry.js` - QIF line group parsing

**Violations:**
- lines: Files exceed line budget
- functions: Too many functions per file
- cohesion-structure: Functions not organized into P/T/F/V/A/E cohesion groups
- chain-extraction: Long method chains should be extracted
- single-level-indentation: Functions have more than one level of indentation
- function-declaration-ordering: Functions not defined before usage
- sig-documentation: Missing @sig documentation

**Refactoring Strategy:**
- Extract display functions into separate cohesion-grouped modules
- Split QIF parsing into smaller, focused modules by context type

---

### modules/cli-qif-to-sqlite/src/services/database/

**Files:**
- `accounts.js` - Account CRUD and balance queries
- `prices.js` - Price import and transaction-derived prices

**Violations:**
- lines: Files exceed line budget
- functions: Too many functions per file
- vague-prefix: Getter functions use unclear naming (e.g., `get*` instead of more specific patterns)
- cohesion-structure: Database module exports pattern doesn't match cohesion groups
- single-level-indentation: Collision handling has nested control flow
- functional-patterns: Collision handling uses while loops
- sig-documentation: Missing @sig documentation

**Refactoring Strategy:**
- Split database operations by entity type into smaller modules
- Extract complex SQL queries into documented query builders
- Move collision handling into shared utility

---

### modules/quicken-web-app/src/services/

**Files:**
- `sqlite-service.js` - Browser SQLite loading via sql.js

**Violations:**
- lines: File exceeds line budget
- functions: Too many functions per file
- cohesion-structure: Query functions not organized into cohesion groups
- sig-documentation: Missing @sig documentation

**Refactoring Strategy:**
- Extract query functions into separate module per entity type
- Share entity mapping logic with cli-qif-to-sqlite where applicable

---

### modules/functional/src/

**Files:**
- `date-utils.js` - Core date manipulation utilities

**Violations:**
- functions: 19 functions exceeds utility budget (10)
- cohesion-structure: Functions not organized into P/T/F/V/A/E cohesion groups
- vague-prefix: `getDaysInMonth` uses unclear naming

**Refactoring Strategy:**
- Split into focused modules (period calculations, parsing, formatting)
- Organize into cohesion groups

---

### modules/design-system/src/utils/

**Files:**
- `date-input-utils.js` - Date input validation and formatting utilities

**Violations:**
- functions: 14 functions exceeds utility budget (10)
- vague-prefix: `getDefaultStartDate`, `getDefaultEndDate` use unclear naming
- chain-extraction: `newParts` accessed multiple times without destructuring
- single-level-indentation: Nested control flow in validation
- sig-documentation: Missing @sig for longer functions

**Refactoring Strategy:**
- Split validation vs formatting into separate modules
- Extract date defaults logic

---

### modules/design-system/src/components/

**Files:**
- `KeyboardDateInput.jsx` - Custom date input with keyboard navigation

**Violations:**
- lines: 291 lines exceeds react-component budget (100)
- function-declaration-ordering: 22 handlers defined after hooks
- react-component-cohesion: 5 render functions should be extracted to components
- sig-documentation: 22 missing @sig annotations
- single-level-indentation: Multi-line callbacks need extraction

**Refactoring Strategy:**
- Extract render functions to actual components (Part, KeyboardMode, TextMode)
- Move handlers before hooks
- Consider splitting keyboard logic into custom hook

---

## Review Schedule

- **Expiration**: 2026-04-01
- **Trigger**: Before adding new features to these folders
- **Owner**: Next developer touching these files should address violations

## Notes

These violations were identified during bug fixes on 2026-01-06. The exemptions allow
the bug fixes to be committed without expanding scope to full refactoring.
