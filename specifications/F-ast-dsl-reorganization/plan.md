# AST/DSL Reorganization Plan

## Background

The `cli-style-validator` has evolved a fluent DSL for AST traversal and source code querying. This DSL is currently embedded in the validator but has potential for reuse in other tools (e.g., `cli-type-generator`).

This plan reorganizes the DSL code, improves naming clarity, and lays groundwork for a future standalone AST module.

## Goals

1. **Organize code by purpose** — Separate DSL infrastructure from shared utilities
2. **Clear naming** — Replace jargon/abbreviations with plain English
3. **Documented API** — README explaining the DSL patterns
4. **Foundation for future** — Enable later extraction to `@graffio/ast` module

## Current State

### DSL Files (query infrastructure)
- `src/lib/ast.js` — Fluent query DSL for AST traversal (`AST.from()`, `AST.topLevel()`)
- `src/lib/source.js` — Position-based source line access (`Source.from()`)

### Shared Utility Files (used across rules)
- `src/lib/predicates.js` — Boolean checks (`PS.isFunctionNode`, `PS.isTestFile`)
- `src/lib/aggregators.js` — Collection/counting utilities (`AS.countFunctions`, `AS.findComponents`)
- `src/lib/factories.js` — Violation/object creation (`FS.createViolation`, `FS.withExemptions`)

### Naming Issues
- `Query`, `SourceQuery`, `LineQuery` — Not actually queries; they're array wrappers
- Abbreviations throughout: `decl`, `ref`, `init`, `spec`
- ESTree jargon leaking into API: `declarations`, `specifiers`

## Phases

### Phase 1: Folder Reorganization (no API changes)

Move files to clarify purpose:
```
src/lib/
├── dsl/
│   ├── README.md      (new - API documentation)
│   ├── ast.js         (moved from src/lib/)
│   └── source.js      (moved from src/lib/)
└── shared/
    ├── predicates.js  (moved from src/lib/)
    ├── aggregators.js (moved from src/lib/)
    └── factories.js   (moved from src/lib/)
```

Update all imports in rule files to reference new paths.

### Phase 2: Naming Convention Rule (documentation) ✅ COMPLETE

Added to `.claude/conventions.md` under Naming:
```
- **No abbreviations** — use full words in names:
    - `declaration` not `decl`
    - `reference` not `ref`
    - `specification` not `spec`
    - `expression` not `expr`
    - Exception: single-letter variables (`i`, `n`, `x`) in short anonymous callbacks
```

### Phase 3: Rename Wrapper Types (API change)

Current → New:
- `Query` → `Nodes` (collection of AST node pairs)
- `LineQuery` → `Lines` (collection of source lines)
- `SourceQuery` → fold into `Source` (or `SourceView`)

Update entry points:
- `AST.from(ast)` returns `Nodes`
- `Source.from(code).all()` returns `Lines`
- `Source.from(code).before(line)` returns `Lines`

### Phase 4: Tagged Types for Data Shapes (future)

Create proper Tagged types for internal data structures:
- `NamedLocation` — `{ name, line }`
- `FunctionInfo` — `{ name, line, node }`
- `CohesionDeclaration` — `{ name, line, value }`
- `ExternalReference` — `{ group, propertyName, referenceName, line }`
- `Violation` — `{ type, line, column, priority, message, rule }`

Benefits:
- Type-safe with `.match()`
- Self-documenting field names
- Consistent creation via constructors

### Phase 5: ASTNode TaggedSum (future, bigger effort)

Wrap ESTree nodes in our own TaggedSum:
```javascript
const ASTNode = TaggedSum('ASTNode', {
    VariableDeclaration: ['variableName', 'variableValue', 'declarations'],
    FunctionDeclaration: ['name', 'parameters', 'body'],
    ArrowFunctionExpression: ['parameters', 'body'],
    ObjectExpression: ['properties'],
    Property: ['key', 'value'],
    ExportNamedDeclaration: ['specifiers', 'declaration'],
    // ... ~10 more we actually use
    Other: ['type', 'raw']  // catch-all for unhandled types
})
```

Benefits:
- `.match()` for type-safe branching
- Our own property names (no ESTree jargon)
- Exhaustive matching catches missing cases
- `Other` variant explicitly handles "don't care" nodes

This would require:
1. Creating the TaggedSum definition
2. Updating `AST.from()` to wrap nodes during traversal
3. Migrating consumers to use `.match()` instead of type checks

### Future: Standalone @graffio/ast Module

If other tools need AST processing, extract to a shared module:
- Parsing (acorn/acorn-jsx wrapper)
- Query DSL (`Nodes`, `Lines`)
- ASTNode TaggedSum
- Generic predicates and accessors

`cli-style-validator` would then import from `@graffio/ast` and add its rule-specific logic.

## Tasks

- **Phase 1**: Folder reorganization (not started)
- **Phase 2**: Naming convention rule ✅ COMPLETE
- **Phase 3**: Rename wrapper types (not started)
- **Phase 4**: Tagged types for data shapes (future, separate task)
- **Phase 5**: ASTNode TaggedSum (future, after Phase 4)

## Dependencies

- Phases 1-3 have no external dependencies
- Phase 4 requires `@graffio/functional` Tagged types
- Phase 5 requires Phase 4 patterns established

## Verification

After each phase:
- All tests pass (`yarn tap`)
- Style validator passes on changed files
- Imports resolve correctly
