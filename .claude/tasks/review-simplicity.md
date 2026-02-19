# Review Simplicity

Analyze a file's abstractions and API design for unnecessary complexity.

## Core Question

**Does each abstraction earn its existence?**

This review complements complexity review (structural) and style validation (mechanical). It focuses on whether
abstractions are justified, not just whether they're organized correctly.

## When to Use

- Part of commit flow for files with new/changed exports
- When a file feels "overengineered"
- Before finalizing an API surface

## Anti-Patterns

### Pointless Indirection

| Pattern                                    | Problem                                | Fix                                   |
|--------------------------------------------|----------------------------------------|---------------------------------------|
| `P.x = (a, b, c) => y(a, b, c)`            | Wrapper adds nothing                   | Delete, use `y` directly              |
| Helper called only once                    | Obscures actual logic                  | Inline it                             |
| Predicate that's single expression         | `P.isFoo = x => x.type === 'foo'`      | Inline at call site if only used once |
| Intermediate variable that doesn't clarify | `const result = foo(); return result;` | Return directly                       |

**Exception:** Wrapper is valid if it:

- Provides a better name at call sites (multiple callers)
- Partially applies arguments
- Adds type safety or validation

### API Confusion

| Pattern                               | Problem                   | Fix                              |
|---------------------------------------|---------------------------|----------------------------------|
| Function accepts unrelated types      | `from(string \| ASTNode)` | **CHECKPOINT** — flag for review |
| Name implies singular, returns plural | `getItem()` returns array | Rename to `getItems()`           |
| Parameter derivable internally        | `foo(x, x.length)`        | Derive length inside             |

**Note:** Multi-type inputs are sometimes intentional convenience APIs. Flag for human review, don't assume it's wrong.

### Unnecessary Complexity

| Pattern                 | Problem                                        | Fix                                    |
|-------------------------|------------------------------------------------|----------------------------------------|
| Accumulator parameter   | `collect(node, results = [])`                  | Build result with recursion/flatMap    |
| Manual destructuring    | `if (node.type === 'X') { ... node.left ... }` | Generic traversal if pattern repeats   |
| Explicit null filtering | `items.map(f).filter(x => x != null)`          | Use flatMap with conditional           |
| Overly specific code    | Code handles only known cases                  | Consider if generic version is simpler |

## Litmus Test

Each abstraction should pass **at least one**:

- [ ] **Called from 2+ places** — actual reuse, not hypothetical
- [ ] **Better name at call site** — `P.isExpired(item)` clearer than `item.date < now`
- [ ] **Encapsulates non-obvious logic** — reader shouldn't need to understand internals
- [ ] **Provides type safety** — catches errors that wouldn't be caught otherwise

If none apply, the abstraction doesn't earn its existence.

## Steps

1. **Read the file** — Get full contents

2. **List exports** — Identify the public API surface

3. **For each export, ask:**
    - Is this the simplest correct implementation?
    - Does every helper it uses earn its existence?
    - Is the signature as simple as it can be?

4. **Check for anti-patterns** — Scan for patterns listed above

5. **Verify abstractions** — Run litmus test on each internal function

## Output Format

```
## Simplicity Review: <file>

### Exports
- <list exports with signatures>

### Findings

#### Pointless Indirection (if any)
- `P.foo` (line X): wrapper around `bar()` with no added value → inline or delete

#### API Confusion (if any)
- `getName()` returns array but name is singular → rename to `getNames()`

#### Unnecessary Complexity (if any)
- `collectAll` takes accumulator parameter → can build result with flatMap

### Questions for Developer
<patterns that might be intentional, need global context>
- `from()` accepts both string and ASTNode — intentional convenience or should split?

### Summary
- X abstractions reviewed
- Y findings (N pointless, M confusing, K unnecessary)
```

## Rules

### What counts as "earning existence"

An abstraction earns its existence when removing it would make the code **worse**, not just different:

| Abstraction                                                   | Earns existence? | Why                        |
|---------------------------------------------------------------|------------------|----------------------------|
| `P.isExpired = item => item.date < Date.now()` used 3x        | Yes              | Reuse + clear name         |
| `P.isExpired = item => item.date < Date.now()` used 1x        | No               | Inline is equally clear    |
| `const wrap = x => wrapper(x)`                                | No               | Zero value add             |
| `const wrap = x => wrapper(x, defaultOpts)`                   | Yes              | Partial application        |
| `T.getName = node => node.name`                               | No               | Trivial property access    |
| `T.getName = node => node.name \|\| node.id \|\| 'anonymous'` | Yes              | Non-obvious fallback logic |

### Invalid recommendations

**Never recommend:**

- Adding abstraction "for future flexibility"
- Keeping unused wrapper "in case we need it"
- Preserving confusing API "for backward compatibility" (unless explicitly requested)

### Self-check

Before flagging something:

1. Would removing this make code harder to read?
2. Is the "fix" actually simpler, or just different?
3. Am I adding abstraction to fix abstraction?
