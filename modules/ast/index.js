// ABOUTME: @graffio/ast - AST abstraction that hides ESTree structure
// ABOUTME: Provides type-safe pattern matching and accessors for JavaScript AST
// COMPLEXITY: exports — Barrel file for module public API (ASTNode, AST, Lines, patterns)

// Re-export public API
// ASTNode is re-exported from ast-node-methods.js which extends the generated type with instance methods
export { ASTNode } from './src/ast-node-methods.js'
export { AST } from './src/ast.js'
export { Lines } from './src/lines.js'
export { countStyleObjects } from './src/patterns.js'
