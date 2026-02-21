// ABOUTME: Shared AST traversal/aggregation utilities for style validator rules
// ABOUTME: Provides higher-level aggregation over AST module primitives

import { Ast, AstNode } from '@graffio/ast'
import { Predicates as PS } from './predicates.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const AS = {
    // Count lines in a function's body (for length checks)
    // @sig countFunctionLines :: AstNode -> Number
    countFunctionLines: node => {
        const body = node.body
        if (!body) return 0
        return body.lineCount
    },

    // Get the name of a function from its AST node
    // @sig getFunctionName :: AstNode -> String
    getFunctionName: node => {
        if (FunctionDeclaration.is(node)) return node.name || '<anonymous>'
        if (VariableDeclarator.is(node)) return node.name || '<anonymous>'
        return '<anonymous>'
    },

    // Check if a function node should count toward complexity
    // Named functions, variable-assigned functions, and multiline anonymous functions count
    // @sig isCountableFunction :: AstNode -> Boolean
    isCountableFunction: node => {
        if (!PS.isFunctionNode(node)) return false
        if (node.name) return true
        const parent = node.parent
        if (parent && VariableDeclarator.is(parent) && parent.value?.isSameAs(node)) return true
        return PS.isMultilineNode(node)
    },

    // Count complex functions in an AST subtree (excludes single-line anonymous callbacks)
    // @sig countFunctions :: (ESTreeAST | AstNode) -> Number
    countFunctions: node => {
        const nodes = AstNode.isASTNode(node) ? Ast.descendants(node) : Ast.from(node)
        return nodes.filter(AS.isCountableFunction).length
    },

    // Find whether a function is used as a callback (passed as argument or in non-declarator position)
    // @sig isCallbackFunction :: AstNode -> Boolean
    isCallbackFunction: node => {
        if (FunctionDeclaration.is(node)) return false
        const parent = node.parent
        if (!parent) return false

        // If parent is CallExpression and node is not the callee, it's an argument (callback)
        if (CallExpression.is(parent) && !parent.target?.isSameAs(node)) return true

        // If parent is ArrayExpression, the function is in an array (likely passed to something)
        if (ArrayExpression.is(parent)) return true

        return false
    },

    // Convert AST statement to component info if it's a PascalCase component declaration
    // @sig toComponent :: AstNode -> { name: String, node: AstNode, startLine: Number, endLine: Number }?
    toComponent: node => {
        const { endLine, line, name } = node

        if (FunctionDeclaration.is(node))
            return PS.isPascalCase(name) ? { name, node, startLine: line, endLine } : undefined

        if (!VariableDeclaration.is(node)) return undefined

        const decl = node.declarations[0]
        if (!decl) return undefined
        const declName = decl.name
        const init = decl.value
        if (!declName || !PS.isPascalCase(declName) || !init) return undefined

        if (!PS.isFunctionNode(init)) return undefined

        return { name: declName, node: init, startLine: line, endLine }
    },

    // Find all PascalCase component declarations at module level
    // @sig findComponents :: ESTreeAST -> [{ name: String, node: AstNode, startLine: Number, endLine: Number }]
    findComponents: ast => Ast.topLevelStatements(ast).map(AS.toComponent).filter(Boolean),

    // Generate array of numbers from start to end inclusive
    // @sig lineRange :: (Number, Number) -> [Number]
    lineRange: (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i),

    // Transform AST node to array of line numbers it covers
    // @sig toNodeLineNumbers :: AstNode -> [Number]
    toNodeLineNumbers: node => AS.lineRange(node.startLine, node.endLine),

    // Transform a statement into function info records for module-level functions
    // @sig toStatementFunctions :: AstNode -> [{ name: String, line: Number }]
    toStatementFunctions: stmt => {
        const { declarations, line, name } = stmt
        if (FunctionDeclaration.is(stmt) && name) return [{ name, line }]
        if (!VariableDeclaration.is(stmt)) return []
        return declarations
            .filter(({ value, name: n }) => value && PS.isFunctionNode(value) && n)
            .map(({ name: n, line: l }) => ({ name: n, line: l }))
    },

    // Collect all module-level function declarations and variable-assigned functions
    // @sig collectModuleLevelFunctions :: AST -> [{ name: String, line: Number }]
    collectModuleLevelFunctions: ast => Ast.topLevelStatements(ast).flatMap(AS.toStatementFunctions),

    // Transform AST to unique exported names
    // @sig toExportedNames :: ESTreeAST -> [String]
    toExportedNames: ast =>
        Ast.topLevelStatements(ast)
            .flatMap(node => [...AS.toSpecifierNames(node), ...AS.toDefaultExportName(node)])
            .filter((name, i, arr) => arr.indexOf(name) === i),

    // Extract exported names from named export specifiers
    // @sig toSpecifierNames :: AstNode -> [String]
    toSpecifierNames: node =>
        ExportNamedDeclaration.is(node) ? node.specifiers.map(s => s.exportedName).filter(Boolean) : [],

    // Extract name from default export declaration
    // @sig toDefaultExportName :: AstNode -> [String]
    toDefaultExportName: node => {
        if (!ExportDefaultDeclaration.is(node)) return []
        const name = node.declarationName
        return name ? [name] : []
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const { ArrayExpression, CallExpression, ExportDefaultDeclaration, ExportNamedDeclaration } = AstNode
const { FunctionDeclaration, VariableDeclaration, VariableDeclarator } = AstNode

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export { AS as Aggregators }
