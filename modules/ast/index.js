// ABOUTME: @graffio/ast - AST abstraction that hides ESTree structure
// ABOUTME: Provides type-safe pattern matching and accessors for JavaScript AST
// COMPLEXITY: exports — Barrel file for module public API (AstNode, Ast, Lines, countStyleObjects)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// AstNode is re-exported from ast-node.js which extends the generated type with instance methods
export { AstNode } from './src/ast-node.js'
export { Ast } from './src/ast.js'
export { Lines } from './src/lines.js'
export { countStyleObjects } from './src/patterns.js'
