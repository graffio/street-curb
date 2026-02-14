// ABOUTME: Shared predicate functions for style validator rules
// ABOUTME: Unified file/AST predicates to avoid duplication across rules
// COMPLEXITY: lines — Shared module consolidating predicates from multiple rules
// COMPLEXITY: functions — Shared module consolidating predicates from multiple rules
// COMPLEXITY: export-structure — Abbreviated export name PS per conventions.md

import { AST, ASTNode } from '@graffio/ast'
import { TS } from './transformers.js'

const { ArrowFunctionExpression, BlockStatement, FunctionDeclaration, FunctionExpression } = ASTNode
const { JSXElement, JSXFragment, ReturnStatement, VariableDeclaration } = ASTNode

const PS = {
    // Check if file is a test file that should skip validation
    // @sig isTestFile :: String -> Boolean
    isTestFile: filePath =>
        filePath.includes('.tap.js') ||
        filePath.includes('.test.js') ||
        filePath.includes('.integration-test.js') ||
        filePath.includes('/test/'),

    // Check if a line is a comment line
    // @sig isCommentLine :: String -> Boolean
    isCommentLine: line => {
        const trimmed = line.trim()
        return (
            trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/')
        )
    },

    // Check if a node represents a function (declaration, expression, or arrow)
    // @sig isFunctionNode :: ASTNode -> Boolean
    isFunctionNode: node =>
        FunctionDeclaration.is(node) || FunctionExpression.is(node) || ArrowFunctionExpression.is(node),

    // Check if a node is a function declaration statement
    // @sig isFunctionDeclaration :: ASTNode -> Boolean
    isFunctionDeclaration: node => FunctionDeclaration.is(node),

    // Check if a node is a variable declaration with a function expression
    // @sig isFunctionVariableDeclaration :: ASTNode -> Boolean
    isFunctionVariableDeclaration: node => {
        if (!VariableDeclaration.is(node)) return false
        return node.declarations.some(declaration => {
            const init = declaration.value
            return init && PS.isFunctionNode(init)
        })
    },

    // Check if a node is a function statement (declaration or variable with function)
    // @sig isFunctionStatement :: ASTNode -> Boolean
    isFunctionStatement: node => PS.isFunctionDeclaration(node) || PS.isFunctionVariableDeclaration(node),

    // Check if source code is from a generated file
    // @sig isGeneratedFile :: String -> Boolean
    isGeneratedFile: sourceCode => {
        const markers = ['do not edit ' + 'manually', 'Auto-' + 'generated']
        return markers.some(marker => sourceCode.includes(marker))
    },

    // Check if node is a block statement
    // @sig isBlockStatement :: ASTNode -> Boolean
    isBlockStatement: node => BlockStatement.is(node),

    // Check if a name is PascalCase (starts with uppercase, alphanumeric)
    // @sig isPascalCase :: String -> Boolean
    isPascalCase: name => /^[A-Z][a-zA-Z0-9]*$/.test(name),

    // Check if name is kebab-case (lowercase with hyphens)
    // @sig isKebabCase :: String -> Boolean
    isKebabCase: name => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name),

    // Check if a node spans multiple lines
    // @sig isMultilineNode :: ASTNode -> Boolean
    isMultilineNode: node => node.endLine > node.startLine,

    // Check if node is a function with a block body (not expression)
    // @sig isFunctionWithBlockBody :: ASTNode -> Boolean
    isFunctionWithBlockBody: node => {
        if (!PS.isFunctionNode(node)) return false
        const body = node.body
        return body && BlockStatement.is(body)
    },

    // Check if statement returns JSX element or fragment
    // @sig hasJSXReturnStatement :: ASTNode -> Boolean
    hasJSXReturnStatement: statement => {
        if (!ReturnStatement.is(statement)) return false
        const argument = statement.value
        if (!argument) return false
        return JSXElement.is(argument) || JSXFragment.is(argument)
    },

    // Check if function returns JSX (arrow expression or block return)
    // @sig isJSXFunction :: ASTNode -> Boolean
    isJSXFunction: node => {
        const body = node.body
        if (!body) return false
        if (ArrowFunctionExpression.is(node) && node.isExpression) return JSXElement.is(body) || JSXFragment.is(body)

        if (BlockStatement.is(body)) return body.body.some(PS.hasJSXReturnStatement)
        return false
    },

    // Check if function is the inner part of a curried function (body of another arrow)
    // @sig isInnerCurriedFunction :: (ASTNode, ASTNode?) -> Boolean
    isInnerCurriedFunction: (node, parent) => {
        if (!parent) return false
        if (!ArrowFunctionExpression.is(parent)) return false
        const body = parent.body
        return body && body.isSameAs(node) && PS.isFunctionNode(node)
    },

    // Check if line is a prettier-ignore or eslint directive comment
    // @sig isDirectiveComment :: String -> Boolean
    isDirectiveComment: line => {
        const content = TS.toCommentContent(line).trim().toLowerCase()
        return content.startsWith('prettier-ignore') || content.startsWith('eslint-')
    },

    // Check if line is not a comment (actual code or empty)
    // @sig isNonCommentLine :: String -> Boolean
    isNonCommentLine: line => {
        const trimmed = line.trim()
        return trimmed && !PS.isCommentLine(trimmed)
    },

    // Check if comment matches a rule and is a permanent exemption
    // @sig isPermanentExemption :: (String, { rule, expires?, error? }) -> Boolean
    isPermanentExemption: (ruleName, { rule, expires, error }) => rule === ruleName && !expires && !error,

    // Check if a rule has a permanent exemption (not TODO)
    // @sig isExempt :: (String, String) -> Boolean
    isExempt: (sourceCode, ruleName) =>
        TS.parseComplexityComments(sourceCode).some(c => PS.isPermanentExemption(ruleName, c)),

    // Check if name is a cohesion group identifier (P, T, F, V, A, E)
    // @sig isCohesionGroup :: String -> Boolean
    isCohesionGroup: name => ['P', 'T', 'F', 'V', 'A', 'E'].includes(name),

    // Check if AST contains any JSX elements or fragments
    // @sig hasJSXContext :: AST -> Boolean
    hasJSXContext: ast => AST.from(ast).some(n => ASTNode.JSXElement.is(n) || ASTNode.JSXFragment.is(n)),
}

export { PS }
