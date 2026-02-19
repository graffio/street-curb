# Review Complexity

Analyze a file for complexity issues and recommend pattern applications.

## Core Principle

**Complexity reduces when you push logic into reusable, testable places** — not when you shuffle files. File extraction
that just relocates code is not simplification; it adds navigation overhead.

**Key insight: Simplification means disentangling concerns.** This can happen:

- **Within a file**: Converting `renderFoo` to `<Foo>` component disentangles row rendering from table orchestration
- **Across files**: Moving styles to shared module makes them reusable; moving logic to selectors makes it testable

Reorganization that doesn't disentangle anything (e.g., moving a function from line 160 to line 15) is not
simplification.

## Inputs

- Target file path (or "staged" for all staged files)

### Multi-file mode (review staged)

When reviewing staged files together:

- Run style validator on each file individually
- Run complexity review across all files, noting cross-file patterns:
    - Duplicated style objects across files
    - Shared predicates/transformers that could be extracted
    - Components used in multiple places
- Can answer "is this used elsewhere?" for the staged set (not the whole codebase)

## Previous Decision Comments

Files may contain `// COMPLEXITY:` comments documenting past decisions not to implement a recommendation:

```js
// COMPLEXITY: Not grouping predicates - prefer flat structure for this module
```

When found, include these in the review output to prompt reconsideration — the decision may no longer be appropriate as
the code evolves.

## Steps

1. **Read the file** - Get full contents

2. **Identify cohesion types** - Categorize ALL functions into P/T/F/V/A/E:
    - **P** (Predicates): `is*`, `has*`, `should*`, `can*`, `exports*` — pure, returns boolean
    - **T** (Transformers): `to*`, `get*`, `extract*`, `parse*`, `format*` — pure, data → data
    - **F** (Factories): `create*`, `make*`, `build*` — constructs objects
    - **V** (Validators): `check*`, `validate*` — returns violations/errors
    - **A** (Aggregators): `collect*`, `count*`, `gather*`, `find*` — collects/counts items
    - **E** (Effects): `useEffect` callbacks, side-effect-producing functions (I/O, DOM, subscriptions)
    - Configuration: static objects, constants (not in namespace, at top)
    - Exports: main entry point(s) at bottom

3. **Verify cohesion grouping** - Every function must be in a P/T/F/V/A/E namespace:
    - Even a single function goes in its group (it's a way of thinking, not window dressing)
    - Uncategorized functions are a CHECKPOINT — rename to match a pattern or justify with `// COMPLEXITY:`

4. **Apply simplification strategies** (in order of preference):

| Signal                                          | Simplification               | Destination                                              | Why it helps                            |
|-------------------------------------------------|------------------------------|----------------------------------------------------------|-----------------------------------------|
| `useCallback`/`useRef` closure over Redux state | Dispatch-intent pattern      | Operation (`commands/operations/`)                       | No closure, reads state at call time    |
| `useEffect` for init/ensure                     | Selector-with-defaults       | `selectors.js` (memoized selector)                       | Testable, no mount-time side effect     |
| `useRef` for DOM focus                          | FocusRegistry ref callback   | `commands/data-sources/focus-registry.js` + JSX ref attr | Plain JS, testable, no hook             |
| `useEffect` for page title                      | Router-layer dispatch        | `router.js`                                              | Pages don't know their own title        |
| `useMemo` from Redux state                      | Memoized selector            | `selectors.js`                                           | Testable, reusable, memoized            |
| `useState` for non-serializable state           | Plain JS data source         | `commands/data-sources/*.js`                             | Like FocusRegistry pattern              |
| Handler with inline logic                       | Move to `post(Action.X)`     | `reducer.js`                                             | Logic in reducer = testable             |
| Style objects in component                      | Use semantic CSS vars        | `styles.css` or inline vars                              | Eliminates objects entirely             |
| Style objects (if vars won't work)              | Move to shared module        | `styles/*.js`                                            | Reusable across files                   |
| `renderFoo` function with logic                 | Convert to `<Foo>` component | Same file (if small) or own file (if reused)             | Encapsulates, testable                  |
| Any function not in P/T/F/V/A/E namespace       | Add to appropriate namespace | Stays in file                                            | Forces categorization, self-documenting |
| if/else on type field                           | TaggedSum with `.match()`    | Type definition file                                     | Exhaustive, self-documenting            |

**Anti-examples (these are NOT simplification):**

| What it looks like                               | Why it's wrong                        |
|--------------------------------------------------|---------------------------------------|
| Move `containerStyle` from line 160 to line 15   | Same file, nothing disentangled       |
| Move nested function to module level (same file) | Nothing disentangled, just relocated  |
| Extract component to own file (single use)       | Navigation overhead, no reuse benefit |
| Add wrapper/helper that only has one call site   | More abstraction, same complexity     |

**Valid within-file changes:**

| What it looks like                                  | Why it's valid                                                   |
|-----------------------------------------------------|------------------------------------------------------------------|
| `renderFoo` → `<Foo>` component (same file)         | Disentangles row logic from table orchestration                  |
| All functions organized into P/T/F/V/A/E namespaces | Forces categorization, self-documenting (e.g., `P.isPascalCase`) |

5. **Verify each recommendation passes the litmus test:**

   For each proposed change, at least ONE must be true:
    - [ ] **Disentangles concerns**: separates unrelated logic (e.g., `renderFoo` → `<Foo>`)
    - [ ] **Increases testability**: code moves to place where it can be unit tested (e.g., selector)
    - [ ] **Increases reusability**: code moves to place where other files can use it (e.g., shared styles)

   Additionally for cross-file moves:
    - [ ] Component extraction to own file: only if component IS reused (not "could be")
    - [ ] Style extraction to shared file: only if styles ARE shared (not "could be")

   If none of the boxes apply, it's just reorganization. Don't recommend it.

6. **Check catalog for existing patterns** - Is this already solved elsewhere?

## Output Format

```
## Complexity Review: <file>

### Cohesion Analysis
- Predicates (P): <list or "none">
- Transformers (T): <list or "none">
- Factories (F): <list or "none">
- Validators (V): <list or "none">
- Aggregators (A): <list or "none">
- Effects (E): <list or "none">
- Configuration: <list or "none">
- Uncategorized: <list — these are CHECKPOINTs>

### Previous Decisions (if any)
<list any // COMPLEXITY: comments found, with line numbers>
- "Not grouping predicates" (line 3) — still appropriate given current structure?

### Observations
<describe patterns, potential issues, things that seem off - even if you're not sure how to fix them>

### Questions for the Developer
<questions that require global knowledge or architectural decisions>

Examples of good questions:
- "This hand-rolled table resembles DataTable patterns - should it use DataTable instead?"
- "These gain/loss colors appear semantic - are they used elsewhere? Should they be CSS variables?"
- "This component duplicates styling from X - is there a shared style module?"
- "This logic seems similar to [other file] - intentional duplication or consolidation opportunity?"

### Clear Wins (if any)
<only changes that are unambiguously improvements without needing global context>
- Must pass the litmus test (disentangles, testability, reusability)
- Must not require knowing about other files to validate

### Patterns to Investigate
<patterns from catalog that MIGHT apply - flag for human review, don't assume>
```

## Rules

### What counts as simplification

Complexity reduces when logic moves to a **more testable or more reusable** place:

| Move                              | Testable?         | Reusable?              | Valid?  |
|-----------------------------------|-------------------|------------------------|---------|
| Handler logic → reducer           | Yes (unit test)   | Yes (other components) | **Yes** |
| `useMemo` → selector              | Yes (unit test)   | Yes (other components) | **Yes** |
| Style objects → shared module     | N/A               | Yes (other components) | **Yes** |
| Style objects → semantic CSS vars | N/A               | Yes (whole app)        | **Yes** |
| `renderFoo` → `<Foo>` component   | Yes (render test) | Maybe                  | **Yes** |
| Presentation component → own file | No (same tests)   | No (single use)        | **No**  |

### Invalid recommendations

**Never recommend these:**

1. **"Extract to file"** for presentation-only components with no independent test value
2. **"Add abstraction"** that only has one use site
3. **"Refactor for clarity"** without specific testability/reusability gain

### Valid recommendations

**Always recommend in this order of preference:**

1. Move logic to reducer (handler → `post(Action.X)`)
2. Move derivation to selector (`useMemo` with Redux data → selector)
3. Eliminate style objects (semantic CSS vars > shared styles > inline)
4. Convert render functions to components (`renderFoo` → `<Foo>`)
5. Group scattered functions by cohesion (namespace objects)

### Format

- Be specific: "Move `containerStyle` (lines 160-167) to `styles/table.js`"
- State the destination file explicitly
- State what becomes testable or reusable
- Verify line count impact: "Removes ~8 lines from this file"
- Reference catalog patterns by name
- If file has no actionable issues: "No action needed"

### Self-check before finalizing

**For "Clear Wins"** - only include if ALL are true:

1. Does this disentangle concerns, increase testability, or increase reusability?
2. Can you validate it without knowing about other files in the codebase?
3. For within-file changes: does this separate unrelated logic, or just shuffle code around?

**For "Questions for the Developer"** - include when:

1. You notice a pattern but don't know if it's used elsewhere
2. Something looks like it could be shared/consolidated, but you're not sure
3. A design system component might apply, but you don't know the full context
4. Style values look semantic (gain/loss, stale/fresh) but might be one-off

**Key principle:** When in doubt, ask a question rather than prescribe a solution. The human has global context you
don't.
