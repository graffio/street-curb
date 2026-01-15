# Style Compliance Technical Debt

This file tracks folders with pre-existing style violations that are exempted via COMPLEXITY-TODO comments.
These exemptions expire on 2026-04-01 and should be addressed before then.

## Folders Requiring Refactoring

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
