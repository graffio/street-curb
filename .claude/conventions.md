# Code Conventions

Brevity > thoroughness. When in doubt, match existing code.

## Language

- JavaScript only (no TypeScript, no `.ts` files, no JSDoc types)
- Functional only (no `class`, no `new`, no `for`/`while` loops)
- Use `@graffio/functional` for FP helpers

## Formatting

- 4 spaces, not tabs
- Single quotes (unless string contains single quote)
- Max 120 chars per line
- Trailing commas in multiline structures
- Remove unnecessary braces: `if (x) doThing()` not `if (x) { doThing() }`

## Functions

- Arrow functions preferred
- One indentation level per function (extract helpers)
- `const` preferred, `let` if needed, never `var`
- Define functions at the TOP of their containing block, before usage
- This is safe: functions can reference variables declared later because the variables are initialized before the
  function is *called*, not when it's defined
- Indentation resets to 0 inside ANY function body, including nested/inline functions
- "Nested indentation" means control flow nesting (`if` inside `if`), not function-inside-function

## Callbacks

- Prefer filter/map chains over forEach with mutation
- Good: `AS.collectNodes(ast).filter(P.isRenderNode).map(F.createViolation)`
- Avoid: `items.forEach(item => { results.push(...) })`
- When iteration callbacks are unavoidable, keep them as single-line delegation calls

## Conditionals

- Prefer ternary for simple if/else returns or assignments
- Good: `return s ? 4 : 5`
- Good: `const x = s ? 4 : 5`
- Never nest ternaries: `s ? t ? 3 : 4 : 5` is unreadable
- Guard clauses stay as-is: `if (!x) return null`

## React Component Files

React component files follow the same structure as other modules:

```javascript
// Configuration constants
const COLUMN_WIDTHS = { name: 200, value: 100 }

// Cohesion groups at module level
const P = { canExpand: row => row.children?.length > 0 }
const T = { toLabel: item => item.name.toUpperCase() }

// Helper components (not exported)
const HelperRow = ({ item }) => <tr>{T.toLabel(item)}</tr>

// Exported component LAST
const MyComponent = ({ prop }) => {
    const [open, setOpen] = useState(false)
    const data = useSelector(S.getData)
    
    const handleClick = useCallback(() => setOpen(!open), [open])
    
    return <div onClick={handleClick}>{P.canExpand(data) && <HelperRow item={data}/>}</div>
}

export { MyComponent }
```

**Rules:**

- P/T/F/V/A/E cohesion groups at module level (not inside components)
- Exported component(s) at bottom of file
- `render*` functions → extract to actual `<Component />`
- Event handlers: use `useCallback` directly for simple `set()`/`post()` calls
- E group at module level: pass setters as parameters for testable effect functions

## Files

- Components: `PascalCase.jsx`
- Other: `kebab-case.js`
- ABOUTME comment at top of each file (two lines starting with `// ABOUTME:`)

## File Structure (Cohesion Groups)

Organize functions into single-letter namespace objects by cohesion type:

| Letter | Type         | Naming Patterns                                      |
|--------|--------------|------------------------------------------------------|
| P      | Predicates   | `is*`, `has*`, `should*`, `can*`, `exports*`         |
| T      | Transformers | `to*`, `get*`, `extract*`, `parse*`, `format*`       |
| F      | Factories    | `create*`, `make*`, `build*`                         |
| V      | Validators   | `check*`, `validate*` (return violations/errors)     |
| A      | Aggregators  | `collect*`, `count*`, `gather*`, `find*`             |
| E      | Effects      | `persist*`, `handle*`, `dispatch*`, `emit*`, `send*` |

**Rules:**

- Every function goes in a cohesion group, even if it's the only one of its type
- Single letters (P, T, F, V, A, E) for brevity: `P.isPascalCase` not `predicates.isPascalCase`
- Same letters across all files for consistency
- Exported function(s) at bottom, outside namespace objects
- Configuration constants at top, before cohesion groups

**Ordering:** Configuration → P → T → F → V → A → E → Exports

**Example:**

```javascript
// ABOUTME: Rule to check file naming conventions
// ABOUTME: Enforces PascalCase for components, kebab-case for utilities

const PRIORITY = 7

const P = {
    isPascalCase: name => /^[A-Z][a-zA-Z0-9]*$/.test(name),
    isKebabCase: name => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name),
}

const T = {
    getBaseName: filePath => filePath.split('/').pop(),
}

const V = {
    checkNaming: (ast, sourceCode, filePath) => {
        // ... returns violations
    },
}

const checkFileNaming = V.checkNaming
export { checkFileNaming }
```

**Uncategorized functions = CHECKPOINT:** If a function doesn't match any pattern, stop and decide: rename it to match a
cohesion type, or justify the exception with a `// COMPLEXITY:` comment. This requires judgment, so it's a checkpoint.

**E Group (Handlers) Rules:**

Handlers that do anything other than call `set()` or `post()` are code smell:

```javascript
// BAD - handler does "preparation" work
const handleSelect = id => {
    const item = items.find(i => i.id === id)
    const transformed = { ...item, selected: true }
    post(Action.SelectItem(transformed))
}

// GOOD - preparation is a selector, handler just calls post
const handleSelect = id => post(Action.SelectItem(id))
// Selector: S.selectedItem(state, id) handles the transformation
```

For complex effects needing local state, pass setters as parameters:

```javascript
// Module level - testable without React
const E = {
    startDrag: (viewId, setIsDragging) => {
        setIsDragging(true)
        // Effect logic here
    },
}

// Component - just wires up the effect
const handleDragStart = useCallback(
    () => E.startDrag(viewId, setIsDragging),
    [viewId],
)
```

## Shared Modules (cli-style-validator)

Utilities used across multiple rules go in shared modules with namespace prefixes:

- `PS` (predicates.js) - Boolean checks on AST nodes, strings, file paths
- `AS` (aggregators.js) - AST traversal, collection, counting utilities
- `FS` (factories.js) - Violation/object creation helpers

**When to extract immediately:**

- Function is **general-purpose** - operates on AST/strings/arrays without rule-specific logic
- Function is **named generically** - name makes sense outside the rule context
- Test: "Would another rule plausibly need this exact function?"

**When NOT to extract:**

- Rule-specific factories with hardcoded rule name/priority
- Domain predicates tied to one rule's purpose (e.g., `isStyleObject`, `isCohesionGroup`)

**During periodic reviews:** Extract duplicates found when scanning multiple files.

## Layer Rules

Different file types have different responsibilities:

| Layer            | Should contain                                   | Should NOT contain                   |
|------------------|--------------------------------------------------|--------------------------------------|
| React components | Local state, `post(Action.X)`, presentation, JSX | Business logic, complex derivations  |
| Selectors        | Redux mechanics, simple derived state            | Business logic (delegate to modules) |
| Business modules | Pure domain logic, computations                  | Redux awareness, UI concerns         |

When a file contains logic belonging to a different layer, that's a signal to move it—not to split the file arbitrarily,
but to place logic in its proper architectural home (decided together).

**Selectors with Parameters:**

Use `createSelector` from `@graffio/functional` when a selector needs to work both curried and uncurried:

```javascript
import { createSelector } from '@graffio/functional'

// Works both ways:
const selectItem = createSelector((state, id) => state.items[id])

// Uncurried - in other selectors, tests, business logic
selectItem(state, 'foo')

// Curried - with useSelector in components
useSelector(selectItem('foo'))
```

Only wrap selectors that actually need curried usage (YAGNI). Simple state-only selectors don't need `createSelector`.

## Imports

- ES6 `import` only (no `require`)
- Import from `@graffio/design-system`, never `@radix-ui/themes` directly

## Naming

- Names describe WHAT, not HOW (no `ZodValidator`, `MCPWrapper`)
- No temporal context (`NewAPI`, `LegacyHandler`, `ImprovedX`)
- No unnecessary pattern suffixes (`Tool` not `ToolFactory`)
- Good: `Tool`, `Registry`, `execute()`
- Bad: `AbstractToolInterface`, `ToolRegistryManager`, `executeWithValidation()`
- Boolean properties use `is` prefix (e.g., `isImportPlaceholder`), never `__` prefix
- `@@` is reserved for hidden type metadata (`@@typeName`, `@@tagName`); `__` has no legitimate use
- **No abbreviations** — use full words in names:
  - `declaration` not `decl`
  - `reference` not `ref`
  - `specification` not `spec`
  - `expression` not `expr`
  - Exception: single-letter variables (`i`, `n`, `x`) in short anonymous callbacks

## Comments

- Explain WHAT or WHY, never "this is better than before"
- No temporal references ("recently refactored", "moved from")
- Never remove comments unless provably false
- No instructional comments ("copy this pattern")
- If a function needs `@sig`, it needs a description; if it needs a description, it needs `@sig`

## Testing

- Framework: Node TAP (`*.tap.js`)
- Structure: Given/When/Then with proper English articles
- Commands: `yarn tap`, `yarn tap:file <path>`

## Type System

- LookupTable is both an array (preserves order) and a key-value object (lookup by id)
- Prefer LookupTable over plain array when contained type is Tagged or TaggedSum
- Syntax: `'{Type:idField}'` for LookupTable, `'[Type]'` for plain array
- ID patterns go in `field-types.js`, not inline in type definitions
