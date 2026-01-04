// ABOUTME: @graffio/ast - AST abstraction that hides ESTree structure
// ABOUTME: Provides type-safe pattern matching and accessors for JavaScript AST
// COMPLEXITY: exports — Barrel file for module public API (ASTNode, AST, Lines, patterns)

// Re-export public API
export { ASTNode } from './src/types/ast-node.js'
export { AST } from './src/ast.js'
export { Lines } from './src/lines.js'
export { isStyleObject, countStyleObjects, STYLE_PROPERTIES } from './src/patterns.js'
