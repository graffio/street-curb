# DSL Module

Fluent query interfaces for AST traversal and source code analysis.

## Overview

Two complementary query systems:

| Module | Purpose | Entry Point | Returns |
|--------|---------|-------------|---------|
| `ast.js` | Query parsed AST nodes | `AST.from(ast)` | `Nodes` (collection of `{ node, parent }` pairs) |
| `source.js` | Query source lines by position | `Source.from(code)` | `SourceView` with position-based access |

Both produce chainable collection wrappers with filter/map/find operations.

## Data Flow

```
Source Code
    │
    ▼
┌─────────┐
│  acorn  │  (parsing)
└────┬────┘
     │
     ▼
┌─────────┐     ┌─────────────┐
│   AST   │────▶│ AST.from()  │────▶ Nodes (query over all nodes)
└─────────┘     └─────────────┘
                       │
                       ▼
                ┌─────────────┐
                │ .find()     │
                │ .ofType()   │────▶ Filtered Nodes
                │ .where()    │
                └─────────────┘
                       │
                       ▼
                ┌─────────────┐
                │ .map()      │
                │ .toArray()  │────▶ Results
                │ .first()    │
                └─────────────┘

Source Code
    │
    ▼
┌──────────────┐
│ Source.from()│────▶ SourceView (position-based line access)
└──────────────┘
        │
        ▼
┌──────────────┐
│ .before(n)   │
│ .all()       │────▶ Lines (query over line strings)
│ .after(n)    │
└──────────────┘
```

## AST Module

### Entry Points

```javascript
AST.from(ast)      // Query over ALL nodes in tree (depth-first traversal)
AST.topLevel(ast)  // Query over just top-level statements (ast.body)
```

### Nodes Methods (chainable)

```javascript
.find(predicate)      // Filter by predicate on { node, parent }
.where(predicate)     // Alias for find
.reject(predicate)    // Exclude nodes matching predicate
.ofType(type)         // Filter by node.type === type
.ofParentType(type)   // Filter by parent.type === type
```

### Nodes Methods (terminal)

```javascript
.map(fn)              // Transform each pair, returns array
.flatMap(fn)          // Transform and flatten, returns array
.mapNode(fn)          // Transform just node: .map(({ node }) => fn(node))
.flatMapNode(fn)      // Transform just node: .flatMap(({ node }) => fn(node))
.toArray()            // Get all pairs as array
.first()              // Get first pair or null
.count()              // Count matching nodes
.some(predicate)      // Check if any match
.someNode(predicate)  // Check if any node matches (ignores parent)
.every(predicate)     // Check if all match
```

### Type Predicates

```javascript
AST.isType(type)             // Returns predicate: node => node.type === type
AST.hasType(node, type)      // Direct check: node.type === type
AST.isVarDecl(node)          // node.type === 'VariableDeclaration'
AST.isFunctionDecl(node)     // node.type === 'FunctionDeclaration'
AST.isObjectExpr(node)       // node.type === 'ObjectExpression'
AST.isNamedFunctionDecl(node)// FunctionDeclaration with id.name
```

### Property Accessors (safe, return undefined/[] on missing)

```javascript
AST.body(ast)            // ast.body or []
AST.declarations(node)   // node.declarations or []
AST.variableName(node)   // First declared variable's name
AST.variableValue(node)  // First declared variable's value (rhs)
AST.properties(node)     // node.properties or []
AST.specifiers(node)     // node.specifiers or []
AST.rhs(node)            // Right-hand side of assignment (node.init)
AST.idName(node)         // node.id?.name
AST.keyName(property)    // property.key?.name || property.key?.value
AST.keyValue(property)   // { key: String?, value: ASTNode? }
AST.exportedName(spec)   // spec.exported?.name
AST.value(property)      // property.value
```

### Node Helpers

```javascript
AST.walk(node, visitor)          // Low-level depth-first traversal
AST.lineCount(node)              // Lines spanned by node
AST.startLine(node)              // First line of node
AST.endLine(node)                // Last line of node
AST.line(node)                   // startLine with fallback to 1
AST.isTopLevel(node, ast)        // Is node at module top level?
AST.effectiveLine(node, parent)  // Line for comment searching
```

### AST Examples

```javascript
// Find all functions in tree
AST.from(ast).ofType('FunctionDeclaration').toArray()

// Get top-level variable declarations
AST.topLevel(ast).ofType('VariableDeclaration').toArray()

// Find exports with their specifiers
AST.topLevel(ast)
    .ofType('ExportNamedDeclaration')
    .flatMap(({ node }) => AST.specifiers(node).map(s => AST.exportedName(s)))

// Find all functions longer than 5 lines
AST.from(ast)
    .find(({ node }) => PS.isFunctionNode(node))
    .where(({ node }) => AST.lineCount(node) > 5)
    .toArray()
```

## Source Module

### Entry Point

```javascript
Source.from(sourceCode)  // Create query interface over source lines (1-indexed)
```

### SourceView Methods

```javascript
.at(lineNum)              // Get single line by number (1-indexed)
.before(lineNum)          // Lines before position, reversed (nearest first)
.after(lineNum)           // Lines after position
.between(start, end)      // Lines between two positions (exclusive)
.beforeNode(node, parent) // Lines before an AST node
.all()                    // All lines as a Lines collection
.lineCount()              // Total number of lines
```

### Lines Methods (chainable)

```javascript
.filter(predicate)        // Keep lines matching predicate
.takeUntil(predicate)     // Take lines until predicate matches (exclusive)
.takeWhile(predicate)     // Take lines while predicate matches
```

### Lines Methods (terminal)

```javascript
.find(predicate)          // First line matching predicate, or undefined
.findIndex(predicate)     // Index of first match, or -1
.some(predicate)          // Any line matches?
.every(predicate)         // All lines match?
.first()                  // First line or null
.count(predicate?)        // Count lines (optionally filtered)
.map(fn)                  // Transform lines
.toArray()                // Get lines as array
```

### Source Examples

```javascript
// Find @sig comment above a function
Source.from(sourceCode)
    .beforeNode(functionNode, parentNode)
    .takeUntil(PS.isNonCommentLine)
    .find(line => line.includes('@sig'))

// Check if there's a description comment above @sig
Source.from(sourceCode)
    .before(sigLineNum)
    .takeUntil(PS.isNonCommentLine)
    .some(isDescriptionLine)

// Count non-comment lines in file
Source.from(sourceCode)
    .all()
    .count(PS.isNonCommentLine)
```

**Note:** `.before()` and `.beforeNode()` return lines in REVERSE order (nearest to position first) for convenient upward searching.

## Future Plans

### Phase 4: Tagged Types for Data Shapes

Internal data structures will become proper Tagged types:

```javascript
NamedLocation({ name, line })
FunctionInfo({ name, line, node })
CohesionDeclaration({ name, line, value })
Violation({ type, line, column, priority, message, rule })
```

### Phase 5: ASTNode TaggedSum

Wrap ESTree nodes in our own TaggedSum for type-safe matching:

```javascript
const ASTNode = TaggedSum('ASTNode', {
    VariableDeclaration: ['variableName', 'variableValue', 'declarations'],
    FunctionDeclaration: ['name', 'parameters', 'body'],
    // ... other types we care about
    Other: ['type', 'raw']  // catch-all
})

// Usage with .match()
node.match({
    VariableDeclaration: ({ variableName }) => ...,
    FunctionDeclaration: ({ name }) => ...,
    Other: () => null
})
```

See `specifications/F-ast-dsl-reorganization/plan.md` for full roadmap.
