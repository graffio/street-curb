// ABOUTME: Rule to enforce strict React/Redux separation patterns
// ABOUTME: Flags useState, useMemo, useChannel, collection methods, and spreading in component bodies

import { AST, ASTNode } from '@graffio/ast'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const PRIORITY = 8
const COLLECTION_METHODS = ['filter', 'map', 'find', 'includes', 'reduce', 'slice']
const EXEMPT_PATTERNS = ['hover', 'focus', 'drag']

const P = {
    // Check if node is a hook call with given name
    // @sig isHookCall :: String -> ASTNode -> Boolean
    isHookCall: hookName => node => {
        const { CallExpression, Identifier } = ASTNode
        if (!CallExpression.is(node)) return false
        const { target } = node
        return Identifier.is(target) && target.name === hookName
    },

    // Check if node is a call to useState
    // @sig isUseStateCall :: ASTNode -> Boolean
    isUseStateCall: node => P.isHookCall('useState')(node),

    // Check if node is a call to useMemo
    // @sig isUseMemoCall :: ASTNode -> Boolean
    isUseMemoCall: node => P.isHookCall('useMemo')(node),

    // Check if node is a call to useCallback
    // @sig isUseCallbackCall :: ASTNode -> Boolean
    isUseCallbackCall: node => P.isHookCall('useCallback')(node),

    // Check if node is an import of useChannel
    // @sig isUseChannelImport :: ASTNode -> Boolean
    isUseChannelImport: node => {
        if (!ASTNode.ImportDeclaration.is(node)) return false
        const specifiers = node.esTree.specifiers || []
        return specifiers.some(s => s.imported?.name === 'useChannel' || s.local?.name === 'useChannel')
    },

    // Check if node is a collection method call (.filter, .map, etc.)
    // @sig isCollectionMethodCall :: ASTNode -> Boolean
    isCollectionMethodCall: node => {
        const { CallExpression, MemberExpression, Identifier } = ASTNode
        if (!CallExpression.is(node)) return false
        const { target } = node
        if (!target || !MemberExpression.is(target)) return false
        const { member } = target
        return member && Identifier.is(member) && COLLECTION_METHODS.includes(member.name)
    },

    // Check if node is a spread element {...obj} or [...arr]
    // @sig isSpreadElement :: ASTNode -> Boolean
    isSpreadElement: node => node.esTree?.type === 'SpreadElement',

    // Check if line has an EXEMPT comment for useState
    // @sig hasUseStateExemption :: (String, Number) -> Boolean
    hasUseStateExemption: (sourceCode, line) => {
        const lines = sourceCode.split('\n')
        const lineContent = lines[line - 1] || ''
        const prevLineContent = lines[line - 2] || ''
        const combined = prevLineContent + ' ' + lineContent
        return EXEMPT_PATTERNS.some(pattern => combined.includes(`// EXEMPT: ${pattern}`))
    },

    // Check if callback AST node has multiple statements in body
    // @sig hasMultipleStatements :: Object -> Boolean
    hasMultipleStatements: callback => {
        if (!callback) return false
        const { type, body } = callback
        const isFunctionExpr = type === 'ArrowFunctionExpression' || type === 'FunctionExpression'
        if (!isFunctionExpr || !body) return false
        return body.type === 'BlockStatement' && body.body.length > 1
    },

    // Check if useCallback body has more than one expression (complex)
    // @sig isComplexUseCallback :: ASTNode -> Boolean
    isComplexUseCallback: node => {
        if (!P.isUseCallbackCall(node)) return false
        const args = node.esTree.arguments || []
        return P.hasMultipleStatements(args[0])
    },
}

const T = {
    // Get method name from collection call
    // @sig toMethodName :: ASTNode -> String
    toMethodName: node => {
        const target = node.target
        if (!target || !ASTNode.MemberExpression.is(target)) return ''
        const member = target.member
        return member && ASTNode.Identifier.is(member) ? member.name : ''
    },
}

const F = {
    // Create violation for useState
    // @sig createUseStateViolation :: ASTNode -> Violation
    createUseStateViolation: node => ({
        type: 'react-redux-separation',
        line: node.line,
        column: node.column || 1,
        priority: PRIORITY,
        message: 'useState in component body. FIX: Move state to Redux, or add // EXEMPT: hover|focus|drag comment.',
        rule: 'react-redux-separation',
    }),

    // Create violation for useMemo
    // @sig createUseMemoViolation :: ASTNode -> Violation
    createUseMemoViolation: node => ({
        type: 'react-redux-separation',
        line: node.line,
        column: node.column || 1,
        priority: PRIORITY,
        message: 'useMemo in component body. FIX: Move derived state to a selector.',
        rule: 'react-redux-separation',
    }),

    // Create violation for useCallback with complex body
    // @sig createUseCallbackViolation :: ASTNode -> Violation
    createUseCallbackViolation: node => ({
        type: 'react-redux-separation',
        line: node.line,
        column: node.column || 1,
        priority: PRIORITY,
        message: 'useCallback with complex body. FIX: Handler should be single post(Action.X()) call.',
        rule: 'react-redux-separation',
    }),

    // Create violation for useChannel import
    // @sig createUseChannelViolation :: ASTNode -> Violation
    createUseChannelViolation: node => ({
        type: 'react-redux-separation',
        line: node.line,
        column: node.column || 1,
        priority: PRIORITY,
        message: 'useChannel import. FIX: Use Redux actions/selectors instead.',
        rule: 'react-redux-separation',
    }),

    // Create violation for collection method
    // @sig createCollectionMethodViolation :: ASTNode -> Violation
    createCollectionMethodViolation: node => ({
        type: 'react-redux-separation',
        line: node.line,
        column: node.column || 1,
        priority: PRIORITY,
        message: `.${T.toMethodName(node)}() in component body. FIX: Move to selector.`,
        rule: 'react-redux-separation',
    }),

    // Create violation for spread element
    // @sig createSpreadViolation :: ASTNode -> Violation
    createSpreadViolation: node => ({
        type: 'react-redux-separation',
        line: node.line,
        column: node.column || 1,
        priority: PRIORITY,
        message: 'Spread in component body. FIX: Pre-compute in selector or use separate style constants.',
        rule: 'react-redux-separation',
    }),
}

const V = {
    // Validate React/Redux separation patterns
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || !filePath.endsWith('.jsx')) return []
        if (!A.hasJSXContext(ast)) return []

        const { isUseStateCall, hasUseStateExemption, isUseMemoCall, isComplexUseCallback } = P
        const { isCollectionMethodCall, isSpreadElement } = P
        const { createUseStateViolation, createUseMemoViolation, createUseCallbackViolation } = F
        const { createCollectionMethodViolation, createSpreadViolation } = F
        const { findInComponentBodies, collectUseChannelViolations } = A

        const useChannelViolations = collectUseChannelViolations(ast)

        const useStateNodes = findInComponentBodies(ast, isUseStateCall)
        const useStateViolations = useStateNodes
            .filter(node => !hasUseStateExemption(sourceCode, node.line))
            .map(createUseStateViolation)

        const useMemoViolations = findInComponentBodies(ast, isUseMemoCall).map(createUseMemoViolation)
        const useCallbackViolations = findInComponentBodies(ast, isComplexUseCallback).map(createUseCallbackViolation)
        const collectionViolations = findInComponentBodies(ast, isCollectionMethodCall).map(
            createCollectionMethodViolation,
        )
        const spreadViolations = findInComponentBodies(ast, isSpreadElement).map(createSpreadViolation)

        return [
            ...useChannelViolations,
            ...useStateViolations,
            ...useMemoViolations,
            ...useCallbackViolations,
            ...collectionViolations,
            ...spreadViolations,
        ]
    },
}

const A = {
    // Check if AST contains any JSX (file context check)
    // @sig hasJSXContext :: AST -> Boolean
    hasJSXContext: ast => AST.from(ast).some(n => ASTNode.JSXElement.is(n) || ASTNode.JSXFragment.is(n)),

    // Extract body from PascalCase function declaration
    // @sig toFunctionDeclBody :: ASTNode -> ASTNode?
    toFunctionDeclBody: statement => {
        const { name, body } = statement
        return PS.isPascalCase(name) && body ? body : null
    },

    // Extract body from PascalCase variable function
    // @sig toVarFunctionBody :: Object -> ASTNode?
    toVarFunctionBody: declaration => {
        const { name, value } = declaration
        if (!PS.isPascalCase(name) || !value || !PS.isFunctionNode(value)) return null
        return value.body || null
    },

    // Find all React component function bodies (PascalCase functions that return JSX)
    // @sig collectComponentBodies :: AST -> [ASTNode]
    collectComponentBodies: ast => {
        const statements = AST.topLevelStatements(ast)
        const { FunctionDeclaration, VariableDeclaration } = ASTNode

        const functionBodies = statements.filter(FunctionDeclaration.is).map(A.toFunctionDeclBody).filter(Boolean)

        const varBodies = statements
            .filter(VariableDeclaration.is)
            .flatMap(decl => decl.declarations)
            .map(A.toVarFunctionBody)
            .filter(Boolean)

        return [...functionBodies, ...varBodies]
    },

    // Find all nodes within component bodies matching predicate
    // @sig findInComponentBodies :: (AST, (ASTNode -> Boolean)) -> [ASTNode]
    findInComponentBodies: (ast, predicate) =>
        A.collectComponentBodies(ast).flatMap(body => AST.from(body.esTree).filter(predicate)),

    // Collect useChannel import violations (file-level, not component-level)
    // @sig collectUseChannelViolations :: AST -> [Violation]
    collectUseChannelViolations: ast =>
        AST.topLevelStatements(ast).filter(P.isUseChannelImport).map(F.createUseChannelViolation),
}

const checkReactReduxSeparation = FS.withExemptions('react-redux-separation', V.check)
const ReactReduxSeparation = { checkReactReduxSeparation }
export { ReactReduxSeparation }
