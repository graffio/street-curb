# DSL Module

Fluent query interfaces for AST traversal and source code analysis.

## Overview

Two complementary query systems:

| Module | Purpose | Entry Point | Returns |
|--------|---------|-------------|---------|
| `ast.js` | Query parsed AST nodes | `AST.from(ast)` | `Nodes` (collection of `{ node, parent }` pairs) |
| `source.js` | Query source lines by position | `Lines.from(code)` | `Lines` (collection with position and filter methods) |

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
                └─────────────┘
                       │
                       ▼
                ┌─────────────┐
                │ .mapNode()  │
                │ .toArray()  │────▶ Results
                │ .count()    │
                └─────────────┘

Source Code
    │
    ▼
┌──────────────┐
│ Lines.from() │────▶ Lines (position + collection methods)
└──────────────┘
        │
        ├──────────────────┐
        ▼                  ▼
┌──────────────┐    ┌──────────────┐
│ .before(n)   │    │ .filter()    │
│ .after(n)    │    │ .takeUntil() │────▶ Filtered Lines
│ .beforeNode()│    │ .takeWhile() │
└──────────────┘    └──────────────┘
        │                  │
        └───────┬──────────┘
                ▼
         ┌─────────────┐
         │ .find()     │
         │ .some()     │────▶ Results
         │ .toArray()  │
         └─────────────┘
```

## AST Module

### Entry Points

```javascript
AST.from(ast)      // Query over ALL nodes in tree (depth-first traversal)
AST.topLevel(ast)  // Query over just top-level statements (ast.body)
```

### Nodes Methods

Nodes extends Array, so all array methods work. Custom methods:

```javascript
// Filtering (chainable, return Nodes)
.find(predicate)      // Filter by predicate on { node, parent } - NOTE: returns Nodes, not single element
.ofType(type)         // Filter by node.raw.type === type

// Transformation (terminal, return plain arrays/values)
.mapNode(fn)          // Transform just node: .map(({ node }) => fn(node))
.flatMapNode(fn)      // Transform and flatten: .flatMap(({ node }) => fn(node))
.toArray()            // Get all pairs as plain array
.count()              // Count matching nodes (alias for .length)
.someNode(predicate)  // Check if any node matches (ignores parent)
```

Standard array methods like `.map()`, `.filter()`, `.some()`, `.every()` also work.

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
    .find(({ node }) => AST.lineCount(node) > 5)
    .toArray()
```

## Lines Module

### Entry Point

```javascript
Lines.from(sourceCode)  // Create Lines from source code (1-indexed lines)
```

### Position Methods

Navigate to specific line ranges:

```javascript
.at(lineNum)              // Get single line by number (1-indexed)
.before(lineNum)          // Lines before position, reversed (nearest first)
.after(lineNum)           // Lines after position
.between(start, end)      // Lines between two positions (exclusive)
.beforeNode(node, parent) // Lines before an AST node
.all()                    // All lines (returns self, for chaining)
.lineCount()              // Total number of lines
```

### Collection Methods (chainable)

Filter or limit the line collection:

```javascript
.filter(predicate)        // Keep lines matching predicate
.takeUntil(predicate)     // Take lines until predicate matches (exclusive)
.takeWhile(predicate)     // Take lines while predicate matches
```

### Collection Methods (terminal)

Extract results from the collection:

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

### Lines Examples

```javascript
// Find @sig comment above a function
Lines.from(sourceCode)
    .beforeNode(functionNode, parentNode)
    .takeUntil(PS.isNonCommentLine)
    .find(line => line.includes('@sig'))

// Check if there's a description comment above @sig
Lines.from(sourceCode)
    .before(sigLineNum)
    .takeUntil(PS.isNonCommentLine)
    .some(isDescriptionLine)

// Count non-comment lines in file
Lines.from(sourceCode)
    .all()
    .count(PS.isNonCommentLine)
```

**Note:** `.before()` and `.beforeNode()` return lines in REVERSE order (nearest to position first) for convenient upward searching.

## Design Notes

### ASTNode Wrapping

All nodes returned from `AST.from()` and `AST.topLevel()` are wrapped in `ASTNode` TaggedSum. The wrapper provides:

- `.raw` - Access to the underlying ESTree node
- Type-safe wrapping without modifying ESTree structure

The `AST` module's helpers (like `AST.line()`, `AST.nodeType()`) accept both wrapped ASTNodes and raw ESTree nodes, so you can use them anywhere.

### ESTree Isolation

Only `ast.js` knows about ESTree structure. Rules and shared modules use AST helpers:
- `AST.nodeType(node)` instead of `node.type`
- `AST.line(node)` instead of `node.loc.start.line`
- `AST.hasType(node, 'X')` instead of `node.type === 'X'`
