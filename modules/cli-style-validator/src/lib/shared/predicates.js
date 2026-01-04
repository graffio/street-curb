// ABOUTME: Shared predicate functions for style validator rules
// ABOUTME: Unified file/AST predicates to avoid duplication across rules
// COMPLEXITY: lines — Shared module consolidating predicates from multiple rules
// COMPLEXITY: functions — Shared module consolidating predicates from multiple rules

import { ASTNode } from '@graffio/ast'
import { TS } from './transformers.js'

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
        ASTNode.FunctionDeclaration.is(node) ||
        ASTNode.FunctionExpression.is(node) ||
        ASTNode.ArrowFunctionExpression.is(node),

    // Check if a node is a function declaration statement
    // @sig isFunctionDeclaration :: ASTNode -> Boolean
    isFunctionDeclaration: node => ASTNode.FunctionDeclaration.is(node),

    // Check if a node is a variable declaration with a function expression
    // @sig isFunctionVariableDeclaration :: ASTNode -> Boolean
    isFunctionVariableDeclaration: node => {
        if (!ASTNode.VariableDeclaration.is(node)) return false
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
    isBlockStatement: node => ASTNode.BlockStatement.is(node),

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
        return body && ASTNode.BlockStatement.is(body)
    },

    // Check if statement returns JSX element or fragment
    // @sig hasJSXReturnStatement :: ASTNode -> Boolean
    hasJSXReturnStatement: statement => {
        if (!ASTNode.ReturnStatement.is(statement)) return false
        const argument = statement.value
        if (!argument) return false
        return ASTNode.JSXElement.is(argument) || ASTNode.JSXFragment.is(argument)
    },

    // Check if function returns JSX (arrow expression or block return)
    // @sig isJSXFunction :: ASTNode -> Boolean
    isJSXFunction: node => {
        const body = node.body
        if (!body) return false
        if (ASTNode.ArrowFunctionExpression.is(node) && node.isExpression)
            return ASTNode.JSXElement.is(body) || ASTNode.JSXFragment.is(body)

        if (ASTNode.BlockStatement.is(body)) return body.body.some(PS.hasJSXReturnStatement)
        return false
    },

    // Check if function is the inner part of a curried function (body of another arrow)
    // @sig isInnerCurriedFunction :: (ASTNode, ASTNode?) -> Boolean
    isInnerCurriedFunction: (node, parent) => {
        if (!parent) return false
        if (!ASTNode.ArrowFunctionExpression.is(parent)) return false
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
}

export { PS }
