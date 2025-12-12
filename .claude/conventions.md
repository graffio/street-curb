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
- This is safe: functions can reference variables declared later because the variables are initialized before the function is *called*, not when it's defined

## React Components

Organize component internals in this order:
1. **Functions** - Helper functions used by hooks/callbacks
2. **Hooks** - `useState`, `useSelector`, custom hooks
3. **Memos** - `useMemo` computations
4. **Callbacks** - `useCallback` handlers
5. **Effects** - `useEffect` side effects
6. **Return** - JSX

Keep functions INSIDE their parent component (not hoisted outside) when they use component state or props.

## Files

- Components: `PascalCase.jsx`
- Other: `kebab-case.js`
- ABOUTME comment at top of each file (two lines starting with `// ABOUTME:`)

## Imports

- ES6 `import` only (no `require`)
- Import from `@graffio/design-system`, never `@radix-ui/themes` directly

## Naming

- Names describe WHAT, not HOW (no `ZodValidator`, `MCPWrapper`)
- No temporal context (`NewAPI`, `LegacyHandler`, `ImprovedX`)
- No unnecessary pattern suffixes (`Tool` not `ToolFactory`)
- Good: `Tool`, `Registry`, `execute()`
- Bad: `AbstractToolInterface`, `ToolRegistryManager`, `executeWithValidation()`

## Comments

- Explain WHAT or WHY, never "this is better than before"
- No temporal references ("recently refactored", "moved from")
- Never remove comments unless provably false
- No instructional comments ("copy this pattern")

## Testing

- Framework: Node TAP (`*.tap.js`)
- Structure: Given/When/Then with proper English articles
- Commands: `yarn tap`, `yarn tap:file <path>`
