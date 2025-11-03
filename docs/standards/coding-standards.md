# JavaScript Functional Coding Standards

**CRITICAL**: Read and follow these standards before writing ANY code in this project.

## Top Non-Negotiables

- **Pure functional code only** — Avoid `class`, `new`, and direct mutation; use helpers from `@graffio/functional`
- **JavaScript everywhere** — TypeScript syntax, file extensions (`.ts`, `.tsx`, `.d.ts`), and JSDoc typing are forbidden
- **One indentation level per function** — Extract helpers at the top of the local scope when complexity grows
- **TAP tests use Given/When/Then** — Proper articles and natural language expectations required
- **Document 5+ line functions** — Use Hindley-Milner `@sig` annotations covering inputs and outputs

## Core Principles

### Functional Programming (Must)
Favor pure, composable functions and immutable data.

**Forbidden**: `class`, `new`, `for` loops, `while` loops
**Preferred**: `map`, `reduce`, `filter`, `forEach`
**Mutation**: Use `assoc` function instead of direct mutation

**Compliant:**
```javascript
const processUsers = users => {
    const activeUsers = users.filter(user => user.isActive)
    return activeUsers.map(user => ({ ...user, processed: true }))
}
```

**Non-compliant:**
```javascript
class UserProcessor {
    constructor() {
        this.users = []
    }
    processUsers() {
        for (let i = 0; i < this.users.length; i++) {
            this.users[i].processed = true
        }
    }
}
```

### TypeScript Prohibition (Must)
TypeScript syntax and tooling are banned; rely on runtime validation.

**Allowed**: `.js`, `.jsx` files only
**Forbidden**: `.ts`, `.tsx`, `.d.ts`, TypeScript annotations, JSDoc types, `tsconfig.json`
**Alternative**: Runtime validation with `@graffio/tagged` types

### Single Indentation Level (Must)
Limit each function to one indentation level; prefer helper extraction and early returns.

**Rules**:
- Each function definition resets indentation counting
- Lift helper functions to the top of the current scope
- Split complex flows into additional functions instead of nesting
- Indentation contexts: `try/catch`, object literals, JSX elements, function definitions

**Compliant:**
```javascript
const processData = data => {
    const validateAndProcess = user => {
        if (!user.email) return null
        const processed = { ...user, validated: true }
        return processed
    }

    if (!data) return []
    if (data.length === 0) return []

    return data.map(validateAndProcess).filter(Boolean)
}
```

**Non-compliant:**
```javascript
const processData = data => {
    if (data) {
        if (data.length > 0) {
            return data.map(user => {
                if (user.email) {
                    return { ...user, processed: true }
                }
                return null
            })
        }
    }
    return []
}
```

## Formatting Rules

- **Line length**: Max 120 characters
- **Indentation**: 4 spaces (not tabs)
- **Strings**: Single quotes (unless string contains single quotes)
- **Braces**: Remove unnecessary braces and parentheses
- **Trailing commas**: Required in multiline objects/arrays
- **Blank lines**: Before braced statements, between logical sections, before comment blocks

**Remove unnecessary braces:**
```javascript
// Compliant
if (condition) doSomething()
const transform = item => item.processed ? item : { ...item, processed: true }
if (user.isActive) return processUser(user)

// Non-compliant
if (condition) {
    doSomething()
}
const transform = (item) => {
    return item.processed ? item : { ...item, processed: true }
}
```

## Function Structure

### Placement
Functions belong at the top of their narrowest usage scope:
1. Used by one function → top of that function
2. Used by one component → top of that component
3. Used by multiple components → top of module

Within each scope: **functions before variables before execution**

**Compliant:**
```javascript
const processData = data => {
    const validateUser = user => {
        if (!user.email) return false
        return user.isActive !== false
    }

    const enrichUser = user => {
        const timestamp = new Date().toISOString()
        return { ...user, processedAt: timestamp }
    }

    const validUsers = data.filter(validateUser)
    return validUsers.map(enrichUser)
}
```

### Anonymous Functions
- **Single line**: Allowed inline
- **Multi-line**: Must be named
- **Preference**: Arrow functions for anonymous

## Language Features

### Variables (Must)
- **Preferred**: `const`
- **Fallback**: `let`
- **Forbidden**: `var`

### Control Flow (Must)
- **if/else**: Avoid, prefer ternary or early return
- **Nested ternary**: Forbidden
- **Switch statements**: Avoid, use functions
- **For loops**: Forbidden, use functional patterns

### Error Handling
- **Pure functions**: No exceptions
- **Boundaries**: `try/catch` allowed
- **Async operations**: Prefer `async/await`
- **Promise rejections**: Explicit handling required

## Documentation (Must)

### @sig Annotations
Required for: top-level functions and functions over 5 lines

**Format**: Hindley-Milner notation
**Type casing**: Capitalized primitives (String, Number, Boolean, Object, Array)
**Optional types**: `Type?`

**Compliant:**
```javascript
/*
 * Process user data with validation and enrichment
 * @sig processUsers :: ([User], Config) -> [ProcessedUser]
 *     User = { id: String, name: String, email: String, isActive: Boolean }
 *     Config = { includeTimestamp: Boolean }
 *     ProcessedUser = { id: String, name: String, email: String, processedAt: String? }
 */
const processUsers = (users, config) => {
    // implementation
}
```

### Inline Comments
- Single line: `//`
- Multi-line: `/* */`
- Purposes: variable purpose, business logic, non-obvious details

## React-Specific

### Components
- **Class components**: Forbidden
- **JSX complexity limit**: 20 lines (extract when exceeded)
- **File naming**: PascalCase single word `.jsx` (e.g., `SegmentCurbEditor.jsx`)

### State Management
- **Preferred**: Redux with selectors
- **useState**: Component local only
- **Context**: Avoid

### UI Library
Radix UI with Radix Themes, Vanilla Extract

### Logic Separation
Extract calculatable UI logic to pure functions (prefer testable functions over JSX-embedded logic)

## Naming Conventions

### Files (Must)
- **React components**: PascalCase single word `.jsx` (e.g., `SegmentCurbEditor.jsx`)
- **Other files**: kebab-case `.js` (e.g., `ui-calculations.js`)

### Abbreviations
Single uppercase character only

## Module System (Must)

- **Import style**: ES6 `import`
- **Require**: Forbidden
- **Exports**: Single export statement at bottom of file
- **Default exports**: Avoid

## Testing (Must)

### Framework
**Node TAP** — `test/*.tap.js`

**Commands**:
- All tests: `yarn tap`
- Single test: `tap test/filename.tap.js`

### Documentation Style
Tests act as documentation and MUST use Given/When/Then structure with proper English.

**Structure**:
- **Outer test**: `Given [scenario context]`
- **Inner test**: `When [action occurs]`
- **Assertion**: `Then [expected outcome]`

**Rules**:
- Use proper English with articles (`the`, `a`, `an`)
- Avoid programming notation (`=`, `+`, `()`, variable names)
- Use natural language

**Compliant:**
```javascript
t.test('Given a user clicks "Add First Segment"', t => {
    t.test('When there are no segments yet', t => {
        const result = processAddSegment([], 240)
        t.equal(result.segments.length, 1, 'Then one segment of 20 feet is added')
        t.equal(result.totalLength, 240, 'Then the total length matches the blockface')
        t.end()
    })
    t.end()
})
```

**Non-compliant:**
```javascript
t.same(processAddSegment([], 240), expected, "processAddSegment returns segment")
t.test('should maintain blockfaceLength = sum(segments) + unknownRemaining', ...)
t.test('has start + 2 segment ends + final tick', ...)
```

### Test Methodology
- **Pure function testing**: Preferred
- **Mocking**: Avoid when possible
- **Test real functions**: True
- **Verify @sig contracts**: Required

## Security (Must)

- **Input validation**: Required at boundaries
- **Data sanitization**: Before database operations
- **Secrets**: Environment variables only
- **Sensitive data**: Never commit

## Package Management (Must)

- **Preferred**: `yarn`
- **Forbidden**: `npm`

## Libraries

- **Functional utilities**: `@graffio/functional`
- **Runtime validation**: `@graffio/tagged` (tagged and taggedSum types)
- **Testing**: Node TAP
- **React props**: PropTypes for exported components

## Behavioral Constraints

- **Code modification**: Only task-related changes
- **Guessing**: Forbidden — ask questions instead
- **Response length**: Prefer brief answers
