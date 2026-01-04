// ABOUTME: ASTNode TaggedSum type definition for ESTree AST nodes
// ABOUTME: Maps node.type strings to type-safe variants with .match() pattern matching

/** @module ASTNode */

/**
 * ASTNode wraps ESTree AST nodes in a TaggedSum for type-safe pattern matching.
 * Each variant holds the raw ESTree node; access properties via .raw.
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
        FunctionDeclaration    : { raw: 'Object', parent: 'ASTNode?' },
        ArrowFunctionExpression: { raw: 'Object', parent: 'ASTNode?' },
        FunctionExpression     : { raw: 'Object', parent: 'ASTNode?' },

        // Declarations
        VariableDeclaration : { raw: 'Object', parent: 'ASTNode?' },
        VariableDeclarator  : { raw: 'Object', parent: 'ASTNode?' },

        // Expressions
        ObjectExpression    : { raw: 'Object', parent: 'ASTNode?' },
        MemberExpression    : { raw: 'Object', parent: 'ASTNode?' },
        CallExpression      : { raw: 'Object', parent: 'ASTNode?' },
        AssignmentExpression: { raw: 'Object', parent: 'ASTNode?' },
        Identifier          : { raw: 'Object', parent: 'ASTNode?' },

        // Properties
        Property: { raw: 'Object', parent: 'ASTNode?' },

        // Exports/Imports
        ExportNamedDeclaration   : { raw: 'Object', parent: 'ASTNode?' },
        ExportDefaultDeclaration : { raw: 'Object', parent: 'ASTNode?' },
        ImportDeclaration        : { raw: 'Object', parent: 'ASTNode?' },
        ImportNamespaceSpecifier : { raw: 'Object', parent: 'ASTNode?' },

        // Statements
        BlockStatement   : { raw: 'Object', parent: 'ASTNode?' },
        ReturnStatement  : { raw: 'Object', parent: 'ASTNode?' },
        IfStatement      : { raw: 'Object', parent: 'ASTNode?' },
        TryStatement     : { raw: 'Object', parent: 'ASTNode?' },
        ThrowStatement   : { raw: 'Object', parent: 'ASTNode?' },
        BreakStatement   : { raw: 'Object', parent: 'ASTNode?' },
        ContinueStatement: { raw: 'Object', parent: 'ASTNode?' },

        // Loops
        ForStatement     : { raw: 'Object', parent: 'ASTNode?' },
        WhileStatement   : { raw: 'Object', parent: 'ASTNode?' },
        DoWhileStatement : { raw: 'Object', parent: 'ASTNode?' },
        ForInStatement   : { raw: 'Object', parent: 'ASTNode?' },
        ForOfStatement   : { raw: 'Object', parent: 'ASTNode?' },

        // JSX
        JSXElement : { raw: 'Object', parent: 'ASTNode?' },
        JSXFragment: { raw: 'Object', parent: 'ASTNode?' },

        // Catch-all (opaque - add variants for types you need to check)
        // Keeps raw/parent for traversal but type checks should use specific variants
        Other: { raw: 'Object', parent: 'ASTNode?' },
    },
}

// Wrap a raw ESTree node in the appropriate ASTNode variant
// Uses ASTNode['@@tagNames'] to check if type has a dedicated variant
// @sig wrap :: (Object, ASTNode?) -> ASTNode
ASTNode.wrap = (rawNode, parent = null) => {
    const type = rawNode?.type
    if (!type) return ASTNode.Other(rawNode || {}, parent)
    if (ASTNode['@@tagNames'].includes(type)) return ASTNode[type](rawNode, parent)
    return ASTNode.Other(rawNode, parent)
}

// Check if a value is an ASTNode instance
// @sig isASTNode :: Any -> Boolean
ASTNode.isASTNode = value => value && value['@@typeName'] === 'ASTNode'
