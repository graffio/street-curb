# JS Module Style Card

Every JS file follows this structure. No exceptions.

## File Structure — Section Separators

Use section separators to organize files. Functions first, data after. Canonical order (skip empty sections):

| #  | Section            | Contains                                                    |
|----|--------------------|-------------------------------------------------------------|
| 1  | P (Predicates)     | `is*`, `has*`, `should*`, `can*`                            |
| 2  | T (Transforms)     | `to*`, `parse*`, `format*`                                  |
| 3  | F (Factories)      | `create*`, `make*`, `build*`                                |
| 4  | V (Validators)     | `check*`, `validate*`                                       |
| 5  | A (Aggregators)    | `collect*`, `count*`, `gather*`, `find*`                    |
| 6  | E (Effects)        | `persist*`, `handle*`, `dispatch*`, `register*`             |
| 7  | Constants          | `const` values, style objects, config                       |
| 8  | Actions            | `// prettier-ignore` action/trigger table arrays            |
| 9  | Module-level state | `let` vars, `Map`s (hybrid files only)                      |
| 10 | Exports            | Exported function(s) + `export` statement                   |

**Separator format** — 5-line block:
```js
// ---------------------------------------------------------------------------------------------------------------------
//
// Section Name
//
// ---------------------------------------------------------------------------------------------------------------------
```

**ABOUTME** always comes before all sections (no separator needed — imports are universal).

**Export naming:**
- **Object** (multi-function file): PascalCase matching file name → `export { MyModule }`
- **Function** (single-function file): camelCase matching file name → `export { myModule }`

## Inline by Default

Most expressions stay at their call site. **Do not extract a function or constant unless it meets a threshold:**

1. **Used 2+ times** in the file — actual reuse, not hypothetical
2. **Compound check** — 2+ conditions joined by `&&`/`||` (the combination expresses a domain concept even when individual conditions are simple)
3. **Indentation at the call site would force a line break** beyond 120 chars

**These are NOT extraction candidates** (even if a cohesion group exists for them): single comparisons, field access, `.includes()`, `.has()`, single-operator checks. These are self-documenting at their call site.

If a single-expression arrow function fits at its call site within 120 chars and is used once — it is NOT a candidate for extraction. Period.

```js
// BAD — extracted because the P group exists, not because extraction helps
const isOverBudget = txn => txn.amount > txn.budgetLimit
// ... used once, 30 lines away ...
const overBudget = filter(isOverBudget, transactions)

// GOOD — the expression IS the documentation
const overBudget = filter(txn => txn.amount > txn.budgetLimit, transactions)
```

```js
// GOOD extraction — compound check; the name reveals a domain concept
const isReconciled = txn => txn.clearedStatus === 'R' && !isNil(txn.matchId)
```

## Cohesion Groups

Cohesion groups organize functions **that earned their names** via the thresholds above. They don't create demand for new functions.

Every named function goes in a group:

| Letter | Type         | Name patterns                                        |
|--------|--------------|------------------------------------------------------|
| P      | Predicates   | `is*`, `has*`, `should*`, `can*`                     |
| T      | Transformers | `to*`, `parse*`, `format*`                           |
| F      | Factories    | `create*`, `make*`, `build*`                         |
| V      | Validators   | `check*`, `validate*`                                |
| A      | Aggregators  | `collect*`, `count*`, `gather*`, `find*`, `process*` |
| E      | Effects      | `persist*`, `handle*`, `dispatch*`, `emit*`, `send*`, `query*`, `register*`, `set*`, `reset*`, `hydrate*` |

If a function doesn't fit any group — stop and ask. Don't leave it uncategorized.

## Tagged Types

Domain entities should be Tagged or TaggedSum types. When adding behavior to a domain type, put it in the `.type.js` file — never modify the generated `.js` file. The `.type.js` file follows the same cohesion group structure as any other module.

## Naming

- Names describe WHAT, not HOW: `Tool` not `ToolFactory`, `Registry` not `RegistryManager`
- No abbreviations: `declaration` not `decl`, `reference` not `ref`
- No temporal context: never `NewAPI`, `LegacyHandler`, `ImprovedX`

## The `commands/` Directory

Every state change goes through `post(Action.X(...))`. No exceptions.

- `commands/post.js` — routes each Action to Redux dispatch + persistence side effects
- `commands/operations/` — multi-step operations (file loading, initialization)
- `commands/data-sources/` — non-Redux state (IndexedDB, FocusRegistry) — plain JS modules, no React

## Fail-Fast

Don't guard internal data. No `?.` on fields that should exist. No silent fallbacks (`?? ''`, `|| []`). Let programming errors throw so they get found and fixed. Guard only: user input, API responses, optional domain fields, async data during initial load.

## Comments

Explain WHAT or WHY. Never "this is better than before" or temporal references ("recently refactored").
