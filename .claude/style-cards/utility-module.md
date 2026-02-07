# Utility Module Style Card

Every JS file follows this structure. No exceptions.

## File Structure (top to bottom)

1. **ABOUTME** — two-line comment at top: what this file does
2. **Configuration constants** — `PRIORITY`, `MAX_LENGTH`, lookup tables
3. **Cohesion groups** — P → T → F → V → A → E (only the ones needed)
4. **Exported function(s)** — at module level, NOT inside cohesion groups
5. **Export object** — single named object matching file name (kebab-case → PascalCase)
6. **Export statement** — `export { MyModule }`

## Cohesion Groups

Every function goes in a group, even if it's the only one of its type:

| Letter | Type         | Name patterns                                        |
|--------|--------------|------------------------------------------------------|
| P      | Predicates   | `is*`, `has*`, `should*`, `can*`                     |
| T      | Transformers | `to*`, `get*`, `extract*`, `parse*`, `format*`       |
| F      | Factories    | `create*`, `make*`, `build*`                         |
| V      | Validators   | `check*`, `validate*`                                |
| A      | Aggregators  | `collect*`, `count*`, `gather*`, `find*`             |
| E      | Effects      | `persist*`, `handle*`, `dispatch*`, `emit*`, `send*` |

If a function doesn't fit any group — stop and ask. Don't leave it uncategorized.

## Naming

- Names describe WHAT, not HOW: `Tool` not `ToolFactory`, `Registry` not `RegistryManager`
- No abbreviations: `declaration` not `decl`, `reference` not `ref`
- No temporal context: never `NewAPI`, `LegacyHandler`, `ImprovedX`

## Fail-Fast

Don't guard internal data. No `?.` on fields that should exist. No silent fallbacks (`?? ''`, `|| []`). Let programming errors throw so they get found and fixed. Guard only: user input, API responses, optional domain fields, async data during initial load.

## Comments

Explain WHAT or WHY. Never "this is better than before" or temporal references ("recently refactored").
