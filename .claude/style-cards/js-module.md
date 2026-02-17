# JS Module Style Card

Every JS file follows this structure. No exceptions.

## File Structure (top to bottom)

1. **ABOUTME** — two-line comment at top: what this file does
2. **Configuration constants** — `PRIORITY`, `MAX_LENGTH`, lookup tables
3. **Cohesion groups** — P → T → F → V → A → E (only the ones needed)
4. **Exported function(s)** — at module level, NOT inside cohesion groups
5. **Export** — one of:
   - **Object** (multi-function file): PascalCase matching file name → `export { MyModule }`
   - **Function** (single-function file): camelCase matching file name → `export { myModule }`

## Cohesion Groups

Every function goes in a group, even if it's the only one of its type:

| Letter | Type         | Name patterns                                        |
|--------|--------------|------------------------------------------------------|
| P      | Predicates   | `is*`, `has*`, `should*`, `can*`                     |
| T      | Transformers | `to*`, `parse*`, `format*`                                        |
| F      | Factories    | `create*`, `make*`, `build*`                                      |
| V      | Validators   | `check*`, `validate*`                                             |
| A      | Aggregators  | `collect*`, `count*`, `gather*`, `find*`, `process*`              |
| E      | Effects      | `persist*`, `handle*`, `dispatch*`, `emit*`, `send*`, `query*`, `register*`, `set*`, `reset*`, `hydrate*` |

If a function doesn't fit any group — stop and ask. Don't leave it uncategorized.

**Don't over-extract.** Extract into a named function when:
- Used 3+ times
- A name makes the purpose clearer than the expression itself (compound checks, non-obvious logic)
- Indentation would force a line break

Leave inline when the expression is already self-documenting (`MY_SET.has(x)`, `arr.includes(y)`, `obj.field`).

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
