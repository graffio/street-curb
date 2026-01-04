// ABOUTME: ASTNode TaggedSum type definition for ESTree AST nodes
// ABOUTME: Maps node.type strings to type-safe variants with .match() pattern matching

/** @module ASTNode */

/**
 * ASTNode wraps ESTree AST nodes in a TaggedSum for type-safe pattern matching.
 * The esTree field is internal - use AST accessors to read node properties.
 * Use .match() for exhaustive type checking instead of node.type === checks.
 *
 * @sig ASTNode ::
 *      // Functions
 *      FunctionDeclaration
 *      ArrowFunctionExpression
 *      FunctionExpression
 *
 *      // Declarations
 *      VariableDeclaration
 *      VariableDeclarator
 *
 *      // Expressions
 *      ObjectExpression
 *      MemberExpression
 *      CallExpression
 *      AssignmentExpression
 *      Identifier
 *
 *      // Properties
 *      Property
 *
 *      // Exports/Imports
 *      ExportNamedDeclaration
 *      ExportDefaultDeclaration
 *      ImportDeclaration
 *      ImportNamespaceSpecifier
 *
 *      // Statements
 *      BlockStatement
 *      ReturnStatement
 *      IfStatement
 *      TryStatement
 *      ThrowStatement
 *      BreakStatement
 *      ContinueStatement
 *
 *      // Loops
 *      ForStatement
 *      WhileStatement
 *      DoWhileStatement
 *      ForInStatement
 *      ForOfStatement
 *
 *      // JSX
 *      JSXElement
 *      JSXFragment
 *
 *      // Catch-all (opaque - add variants for types you need to check)
 *      Other
 */

// prettier-ignore
export const ASTNode = {
    name: 'ASTNode',
    kind: 'taggedSum',
    variants: {
        // Functions
        FunctionDeclaration    : { esTree: 'Object', parent: 'ASTNode?' },
        ArrowFunctionExpression: { esTree: 'Object', parent: 'ASTNode?' },
        FunctionExpression     : { esTree: 'Object', parent: 'ASTNode?' },

        // Declarations
        VariableDeclaration : { esTree: 'Object', parent: 'ASTNode?' },
        VariableDeclarator  : { esTree: 'Object', parent: 'ASTNode?' },

        // Expressions
        ObjectExpression    : { esTree: 'Object', parent: 'ASTNode?' },
        ArrayExpression     : { esTree: 'Object', parent: 'ASTNode?' },
        MemberExpression    : { esTree: 'Object', parent: 'ASTNode?' },
        CallExpression      : { esTree: 'Object', parent: 'ASTNode?' },
        AssignmentExpression: { esTree: 'Object', parent: 'ASTNode?' },
        Identifier          : { esTree: 'Object', parent: 'ASTNode?' },

        // Properties
        Property: { esTree: 'Object', parent: 'ASTNode?' },

        // Exports/Imports
        ExportNamedDeclaration   : { esTree: 'Object', parent: 'ASTNode?' },
        ExportDefaultDeclaration : { esTree: 'Object', parent: 'ASTNode?' },
        ExportSpecifier          : { esTree: 'Object', parent: 'ASTNode?' },
        ImportDeclaration        : { esTree: 'Object', parent: 'ASTNode?' },
        ImportNamespaceSpecifier : { esTree: 'Object', parent: 'ASTNode?' },

        // Statements
        BlockStatement   : { esTree: 'Object', parent: 'ASTNode?' },
        ReturnStatement  : { esTree: 'Object', parent: 'ASTNode?' },
        IfStatement      : { esTree: 'Object', parent: 'ASTNode?' },
        TryStatement     : { esTree: 'Object', parent: 'ASTNode?' },
        ThrowStatement   : { esTree: 'Object', parent: 'ASTNode?' },
        BreakStatement   : { esTree: 'Object', parent: 'ASTNode?' },
        ContinueStatement: { esTree: 'Object', parent: 'ASTNode?' },

        // Loops
        ForStatement     : { esTree: 'Object', parent: 'ASTNode?' },
        WhileStatement   : { esTree: 'Object', parent: 'ASTNode?' },
        DoWhileStatement : { esTree: 'Object', parent: 'ASTNode?' },
        ForInStatement   : { esTree: 'Object', parent: 'ASTNode?' },
        ForOfStatement   : { esTree: 'Object', parent: 'ASTNode?' },

        // JSX
        JSXElement : { esTree: 'Object', parent: 'ASTNode?' },
        JSXFragment: { esTree: 'Object', parent: 'ASTNode?' },

        // Catch-all (opaque - add variants for types you need to check)
        // Keeps esTree/parent for traversal but type checks should use specific variants
        Other: { esTree: 'Object', parent: 'ASTNode?' },
    },
}

// Wrap a raw ESTree node in the appropriate ASTNode variant
// Uses ASTNode['@@tagNames'] to check if type has a dedicated variant
// @sig wrap :: (Object, ASTNode?) -> ASTNode
ASTNode.wrap = (esTreeNode, parent = null) => {
    const type = esTreeNode?.type
    if (!type) return ASTNode.Other(esTreeNode || {}, parent)
    if (ASTNode['@@tagNames'].includes(type)) return ASTNode[type](esTreeNode, parent)
    return ASTNode.Other(esTreeNode, parent)
}

// Check if a value is an ASTNode instance
// @sig isASTNode :: Any -> Boolean
ASTNode.isASTNode = value => value && value['@@typeName'] === 'ASTNode'

// NOTE: Instance methods (line(), name(), body(), etc.) are defined in
// src/ast-node-methods.js which extends the generated type at runtime.
