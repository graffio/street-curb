---
title: Validator self-application causes cascading fixes
date: 2026-02-12
category: architecture
tags:
  - style-validator
  - export-structure
  - pre-commit-hook
  - dogfooding
module: modules/cli-style-validator
symptoms:
  - Pre-commit hook fails on validator's own files after adding new rule
  - New rule catches patterns in staged files that weren't the target
  - JSX components flagged for camelCase when PascalCase is correct
  - Single-property object wrapper flagged on validator's own export
severity: medium
---

# Validator Self-Application Causes Cascading Fixes

## Problem

Adding a new rule to the style validator (export-structure) triggered a cascade: the pre-commit hook runs the
validator on all staged files, including the validator's own source. The new rule caught violations in:

1. The validator's own export: `ExportStructure = { checkExportStructure }` (single-property object)
2. The validator's API file: `Api = { checkFile }` (single-property object)
3. JSX files staged alongside: `TransactionRegisterPage` flagged as should be `transactionRegisterPage`
4. `hydration.js` staged alongside: 3 named exports

Each fix introduced new issues — renaming `api.js` to `check-file.js`, reordering cohesion groups, adding JSX
exemptions — across 4 commit attempts before the hook passed.

## Root Cause

The validator has no "bootstrap" exemption. When the pre-commit hook runs, it validates every staged file with
the current (just-modified) rules. A rule that changes what's valid can invalidate the validator itself and any
co-staged files that were previously compliant.

## Solution

**Accept the cascade and fix forward.** The validator eating its own dog food is a feature, not a bug. The fixes
are legitimate improvements:

- Single-property object wrappers are genuinely unnecessary
- JSX PascalCase exemption was a real gap in the rule
- File names should match export names

**Practical workflow when adding validator rules:**

1. Write the rule + tests in isolation, commit just the rule
2. Run the validator on its own source files *before* staging other work
3. Fix any self-violations in a separate commit
4. Then stage the application-side fixes

This avoids the cascade by separating "rule addition" from "rule application."

## Key Details

- `FS.withExemptions(...)` returns a CallExpression, not ArrowFunctionExpression — the validator can't see through
  function calls. Wrap in an explicit arrow if you need the validator to detect a function export:
  `const foo = (a, b) => FS.withExemptions('rule', V.check)(a, b)`
- Cohesion group ordering (P → T → F → V → A → E) is enforced — reordering groups is safe when later groups
  reference earlier ones via closures (resolved at call time, not declaration time)
- JSX files need PascalCase function exports (React components) — added `P.isJsxFile` predicate to accept both
  PascalCase and camelCase for function exports in `.jsx` files
