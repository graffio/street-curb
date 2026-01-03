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
 *
 *      // Statements
 *      BlockStatement
 *
 *      // JSX
 *      JSXElement
 *      JSXFragment
 *
 *      // Catch-all
 *      Other
 */

// prettier-ignore
export const ASTNode = {
    name: 'ASTNode',
    kind: 'taggedSum',
    variants: {
        // Functions
        FunctionDeclaration    : { raw: 'Object' },
        ArrowFunctionExpression: { raw: 'Object' },
        FunctionExpression     : { raw: 'Object' },

        // Declarations
        VariableDeclaration : { raw: 'Object' },
        VariableDeclarator  : { raw: 'Object' },

        // Expressions
        ObjectExpression    : { raw: 'Object' },
        MemberExpression    : { raw: 'Object' },
        CallExpression      : { raw: 'Object' },
        AssignmentExpression: { raw: 'Object' },
        Identifier          : { raw: 'Object' },

        // Properties
        Property: { raw: 'Object' },

        // Exports/Imports
        ExportNamedDeclaration  : { raw: 'Object' },
        ExportDefaultDeclaration: { raw: 'Object' },
        ImportDeclaration       : { raw: 'Object' },

        // Statements
        BlockStatement: { raw: 'Object' },

        // JSX
        JSXElement : { raw: 'Object' },
        JSXFragment: { raw: 'Object' },

        // Catch-all for unhandled node types
        Other: { nodeType: 'String', raw: 'Object' },
    },
}

// Map ESTree type strings to variant constructors
const VARIANT_MAP = {
    FunctionDeclaration: 'FunctionDeclaration',
    ArrowFunctionExpression: 'ArrowFunctionExpression',
    FunctionExpression: 'FunctionExpression',
    VariableDeclaration: 'VariableDeclaration',
    VariableDeclarator: 'VariableDeclarator',
    ObjectExpression: 'ObjectExpression',
    MemberExpression: 'MemberExpression',
    CallExpression: 'CallExpression',
    AssignmentExpression: 'AssignmentExpression',
    Identifier: 'Identifier',
    Property: 'Property',
    ExportNamedDeclaration: 'ExportNamedDeclaration',
    ExportDefaultDeclaration: 'ExportDefaultDeclaration',
    ImportDeclaration: 'ImportDeclaration',
    BlockStatement: 'BlockStatement',
    JSXElement: 'JSXElement',
    JSXFragment: 'JSXFragment',
}

// Wrap a raw ESTree node in the appropriate ASTNode variant
// @sig wrap :: Object -> ASTNode
ASTNode.wrap = rawNode => {
    const type = rawNode?.type
    if (!type) return ASTNode.Other('unknown', rawNode || {})
    const variantName = VARIANT_MAP[type]
    if (variantName) return ASTNode[variantName](rawNode)
    return ASTNode.Other(type, rawNode)
}

// Check if a value is an ASTNode instance
// @sig isASTNode :: Any -> Boolean
ASTNode.isASTNode = value => value && value['@@typeName'] === 'ASTNode'
