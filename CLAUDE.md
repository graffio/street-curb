Brevity > thoroughness. Short, correct answers beat comprehensive ones. Bullet points are easier to read.

@.claude/preferences.md

## How we work

See `.claude/README.md` for full protocol explanation. Key files:
- `.claude/current-task.json` — Active task spec (follow exactly during implementation)
- `.claude/style-cards/` — Read the relevant card BEFORE writing code (per `style_card` field)
- `.claude/preferences.md` — Architectural preferences (judgment calls)
- `.claude/tasks/` — Step-by-step templates for common work

## Universal Principles

- JavaScript only (no TypeScript, no `.ts` files, no JSDoc types)
- Functional only (no `class`, no `new`, no `for`/`while` loops, no custom React hooks)
- Arrow functions, `const` preferred, `let` if needed, never `var`
- Cohesion groups P/T/F/V/A/E — every function goes in a namespace object
- One named export per file matching file name (kebab-case → PascalCase)
- Fail-fast: internal data errors should throw, not return silent fallbacks
- Guard only: user input, API responses, optional fields, async data during load
- Import from `@radix-ui/themes` directly — no design-system facade
- Never modify generated type files (x.js) — add business logic to x.type.js instead
- Use Tagged and TaggedSum types for all domain entities

## Workflow

- **Plan:** `/workflows:plan` → produces plan in specifications/ → generates current-task.json
- **Implement:** Follow current-task.json exactly. `[CHECKPOINT]` = stop and ask.
- **Finish:** `/workflows:wrap-up` — commit quality, knowledge capture, cleanup
- **Complexity-budget failure = CHECKPOINT** — stop, run complexity review, rethink approach. Never shuffle code to pass.
- **Never add COMPLEXITY or COMPLEXITY-TODO comments** without asking Jeff first.
- **Quick checks:** `review <file>` or `review staged` for quality during development
- **Style cards:** When a step has a `style_card` field, read `.claude/style-cards/{card}.md` before writing code

## Pattern Triggers

When you see these signals, read the corresponding pattern file before proceeding.

| Signal | Read |
|--------|------|
| Collection needing iteration + lookup | `.claude/pattern-catalog/lookup-table.md` |
| if/else chain on type field | `.claude/pattern-catalog/tagged-sum.md` |
| Finite set of state changes | `.claude/pattern-catalog/action.md` |
| Complex derived state from Redux | `.claude/pattern-catalog/selector-composition.md` |
| Side effect logic | `.claude/pattern-catalog/action.md` |

## @graffio/functional

Use these instead of rolling your own. `import { ... } from '@graffio/functional'`

**Array:** map, filter, reject, reduce, find, head, last, tail, append, slice, nth
**Array transforms:** compact, compactMap, uniq, uniqBy, without, pluck, sort, range, aperture, splitEvery
**Grouping:** groupBy, groupByMulti, pushToKey, mapAccum
**Object:** assoc, assocPath, dissoc, dissocPath, path, pick, omit, keys, clone, equals
**Object transforms:** mapObject, mapValues, filterObject, filterValues, evolve, renameKeys, mergeRight, mergeDeepRight, removeNilValues, invertObj, zipObject
**Object queries:** findInValues, firstKey, diffObjects
**Utilities:** pipe, isNil, type, debounce, throttle, memoizeOnce
**Dates:** startOfDay/endOfDay, startOfWeek/endOfWeek, startOfMonth/endOfMonth, startOfQuarter/endOfQuarter, startOfYear/endOfYear, addDays/subtractDays, parseIsoDateFormat, parseSlashDateFormat, formatDateString

**Custom data structures (read full API before using):**
- LookupTable — see `.claude/api-cheatsheets/lookup-table.md`
- Tree operations — see `.claude/api-cheatsheets/tree-operations.md`

## Our relationship

Address me as "Jeff". We're colleagues—no hierarchy.

- Don't glaze. Be direct. Never write "You're absolutely right!"
- Call out bad ideas, mistakes, and unreasonable expectations
- Push back when you disagree (cite reasons or say it's a gut feeling)
- Stop and ask rather than assuming
- Say "I don't know" when you don't know
- Safe word: "Strange things are afoot at the Circle K"

## Rules

- Ask permission before rewriting implementations or adding backward compatibility
- Match surrounding code style, even if it differs from conventions
- Never skip, evade, or disable pre-commit hooks
- Never delete failing tests—raise the issue instead
- Track work in current-task.json steps; never discard tasks without approval
- Fix bugs immediately when found
- TDD: failing test → make it pass → refactor

## Debugging

Find root causes, not symptoms. One hypothesis at a time. Test after each change. If the first fix fails, stop and re-analyze—don't pile on more fixes.

## Project structure

```
modules/
├── curb-map/          # Main app
├── quicken-web-app/   # Financial tools
├── functional/        # @graffio/functional
└── cli-*/             # Internal tooling
```

### quicken-web-app/src/ internal structure

```
commands/   # post.js (all writes), operations/ (multi-step), data-sources/ (IndexedDB, FocusRegistry)
store/      # Redux state, reducers, selectors, pure transforms
components/ # Presentation only — no side effects, no derived state
pages/      # Page-level components (presentation, call post() for actions)
types/      # Tagged types, type definitions
columns/    # Table column definitions
```

Use `yarn`, never `npm`. Run `yarn types:generate` after changing type definitions.
