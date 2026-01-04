// ABOUTME: Shared AST traversal/aggregation utilities for style validator rules
// ABOUTME: Provides higher-level aggregation over AST module primitives
// COMPLEXITY: lines — Shared module consolidating utilities from multiple rules
// COMPLEXITY: functions — Shared module consolidating utilities from multiple rules

import { AST, ASTNode } from '@graffio/ast'
import { PS } from './predicates.js'

const AS = {
    // Collect all wrapped nodes in an AST into a flat array (enables filter/map chains)
    // @sig collectNodes :: ESTreeAST -> [ASTNode]
    collectNodes: ast => AST.from(ast),

    // Recursively visit all wrapped nodes in an AST with parent context via node.parent
    // @sig traverseAST :: (ESTreeAST, (ASTNode) -> Void) -> Void
    traverseAST: (ast, visitor) => AST.from(ast).forEach(visitor),

    // Get all direct child nodes (for custom traversal patterns that need scope awareness)
    // @sig getChildNodes :: (ASTNode | ESTreeNode) -> [ESTreeNode]
    getChildNodes: node => (ASTNode.isASTNode(node) ? AST.children(node) : AST.children(ASTNode.wrap(node))),

    // Count lines in a function's body (for length checks)
    // @sig countFunctionLines :: ASTNode -> Number
    countFunctionLines: node => {
        const body = AST.functionBody(node)
        if (!body) return 0
        return AST.lineCount(body)
    },

    // Get the name of a function from its AST node
    // @sig getFunctionName :: ASTNode -> String
    getFunctionName: node => {
        if (AST.hasType(node, 'FunctionDeclaration')) return AST.idName(node) || '<anonymous>'
        if (AST.hasType(node, 'VariableDeclarator')) return AST.idName(node) || '<anonymous>'
        return '<anonymous>'
    },

    // Check if a function node should count toward complexity
    // Named functions, variable-assigned functions, and multiline anonymous functions count
    // @sig isCountableFunction :: ASTNode -> Boolean
    isCountableFunction: node => {
        if (!PS.isFunctionNode(node)) return false
        if (AST.idName(node)) return true
        const parent = node.parent
        if (parent && AST.hasType(parent, 'VariableDeclarator') && AST.isSameNode(AST.variableInit(parent), node))
            return true
        return PS.isMultilineNode(node)
    },

    // Count complex functions in an AST subtree (excludes single-line anonymous callbacks)
    // @sig countFunctions :: ESTreeAST -> Number
    countFunctions: ast => AST.from(ast).filter(AS.isCountableFunction).length,

    // Find whether a function is used as a callback (passed as argument or in non-declarator position)
    // @sig isCallbackFunction :: ASTNode -> Boolean
    isCallbackFunction: node => {
        if (AST.hasType(node, 'FunctionDeclaration')) return false
        const parent = node.parent
        if (!parent) return false

        // If parent is CallExpression and node is not the callee, it's an argument (callback)
        if (AST.hasType(parent, 'CallExpression') && !AST.isSameNode(AST.callee(parent), node)) return true

        // If parent is ArrayExpression, the function is in an array (likely passed to something)
        if (AST.hasType(parent, 'ArrayExpression')) return true

        return false
    },

    // Convert AST statement to component info if it's a PascalCase component declaration
    // @sig toComponent :: ASTNode -> { name: String, node: ASTNode, startLine: Number, endLine: Number } | null
    toComponent: node => {
        const startLine = AST.line(node)
        const endLine = AST.endLine(node)

        if (ASTNode.FunctionDeclaration.is(node)) {
            const name = AST.idName(node)
            return PS.isPascalCase(name) ? { name, node, startLine, endLine } : null
        }

        if (!ASTNode.VariableDeclaration.is(node)) return null

        const decl = AST.declarations(node)[0]
        if (!decl) return null
        const name = decl.id?.name
        const init = decl.init
        if (!name || !PS.isPascalCase(name) || !init) return null

        // Wrap the init node to check if it's a function
        const wrappedInit = ASTNode.wrap(init)
        if (!PS.isFunctionNode(wrappedInit)) return null

        return { name, node: wrappedInit, startLine, endLine }
    },

    // Find all PascalCase component declarations at module level
    // @sig findComponents :: ESTreeAST -> [{ name: String, node: ASTNode, startLine: Number, endLine: Number }]
    findComponents: ast => AST.topLevel(ast).map(AS.toComponent).filter(Boolean),

    // Generate array of numbers from start to end inclusive
    // @sig lineRange :: (Number, Number) -> [Number]
    lineRange: (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i),

    // Transform AST node to array of line numbers it covers
    // @sig toNodeLineNumbers :: ASTNode -> [Number]
    toNodeLineNumbers: node => AS.lineRange(AST.startLine(node), AST.endLine(node)),

    // Recursively find the base identifier of a member expression
    // @sig findBase :: ASTNode -> ASTNode?
    findBase: node => {
        if (!node) return null
        if (AST.hasType(node, 'Identifier')) return node
        if (AST.hasType(node, 'MemberExpression')) {
            const obj = AST.memberObject(node)
            return obj ? AS.findBase(obj) : null
        }
        return null
    },

    // Transform AST to unique exported names
    // @sig toExportedNames :: ESTreeAST -> [String]
    toExportedNames: ast =>
        AST.topLevel(ast)
            .flatMap(node => [...AS.toSpecifierNames(node), ...AS.toDefaultExportName(node)])
            .filter((name, i, arr) => arr.indexOf(name) === i),

    // Extract exported names from named export specifiers
    // @sig toSpecifierNames :: ASTNode -> [String]
    toSpecifierNames: node =>
        AST.hasType(node, 'ExportNamedDeclaration')
            ? AST.specifiers(node)
                  .map(s => s.exported?.name)
                  .filter(Boolean)
            : [],

    // Extract name from default export declaration
    // @sig toDefaultExportName :: ASTNode -> [String]
    toDefaultExportName: node => {
        const name = AST.defaultExportName(node)
        return name ? [name] : []
    },
}

export { AS }
