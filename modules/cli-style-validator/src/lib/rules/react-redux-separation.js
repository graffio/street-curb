// ABOUTME: Rule to enforce strict React/Redux separation patterns
// ABOUTME: Flags forbidden patterns in components and complex selectors

import { AST, ASTNode } from '@graffio/ast'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const PRIORITY = 8
const COLLECTION_METHODS = ['filter', 'map', 'find', 'includes', 'reduce', 'slice']
const EXEMPT_PATTERNS = ['hover', 'focus', 'drag']
const SELECTOR_MAX_LINES = 6
const SELECTOR_MAX_COLLECTION_CHAIN = 2

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

    // Check if a .map() call returns JSX (standard React render pattern)
    // @sig isJsxRenderMap :: ASTNode -> Boolean
    isJsxRenderMap: node => {
        const { CallExpression, MemberExpression, Identifier } = ASTNode
        if (!CallExpression.is(node)) return false
        const { target, esTree } = node
        if (!target || !MemberExpression.is(target)) return false
        const { member } = target
        if (!member || !Identifier.is(member) || member.name !== 'map') return false
        const callback = esTree?.arguments?.[0]
        if (!callback) return false
        const { body } = callback
        if (!body) return false
        const { type: bodyType, body: blockBody } = body
        if (bodyType === 'JSXElement' || bodyType === 'JSXFragment') return true
        if (bodyType === 'BlockStatement') {
            const returnStmt = blockBody?.find(s => s.type === 'ReturnStatement')
            const arg = returnStmt?.argument
            return arg?.type === 'JSXElement' || arg?.type === 'JSXFragment'
        }
        return false
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

    // Check if file path indicates a selector file
    // @sig isSelectorFile :: String -> Boolean
    isSelectorFile: filePath => {
        if (!filePath.endsWith('.js')) return false
        return (
            filePath.includes('/selectors/') || filePath.includes('-selectors.js') || filePath.endsWith('/selectors.js')
        )
    },

    // Check if name is a cohesion group identifier (P, T, F, V, A, E)
    // @sig isCohesionGroupName :: String -> Boolean
    isCohesionGroupName: name => ['P', 'T', 'F', 'V', 'A', 'E'].includes(name),

    // Check if node is an if statement
    // @sig isIfStatement :: ASTNode -> Boolean
    isIfStatement: node => ASTNode.IfStatement.is(node),

    // Check if esTree node is a conditional expression (ternary)
    // @sig isConditionalExpr :: Object -> Boolean
    isConditionalExpr: esNode => esNode?.type === 'ConditionalExpression',

    // Check if node is an Action.X() call (e.g., Action.SetDraggingView(...))
    // @sig isActionCall :: ASTNode -> Boolean
    isActionCall: node => {
        const { CallExpression, MemberExpression, Identifier } = ASTNode
        if (!CallExpression.is(node)) return false
        const { target } = node
        if (!target || !MemberExpression.is(target)) return false
        const { base } = target
        return base && Identifier.is(base) && base.name === 'Action'
    },

    // Check if esTree node is a function expression
    // @sig isFunctionExpr :: Object -> Boolean
    isFunctionExpr: esNode => {
        if (!esNode) return false
        const { type } = esNode
        return type === 'ArrowFunctionExpression' || type === 'FunctionExpression'
    },

    // Check if Action call has function arguments
    // @sig hasActionFunctionArg :: ASTNode -> Boolean
    hasActionFunctionArg: node => {
        if (!P.isActionCall(node)) return false
        const args = node.esTree?.arguments || []
        return args.some(P.isFunctionExpr)
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

    // Count lines in a function body
    // @sig toLineCount :: ASTNode -> Number
    toLineCount: funcNode => {
        const { esTree } = funcNode
        if (!esTree) return 0
        const { start, end } = esTree.loc || {}
        return start && end ? end.line - start.line + 1 : 0
    },

    // Count collection method calls in function body
    // @sig toCollectionMethodCount :: (AST, ASTNode) -> Number
    toCollectionMethodCount: (ast, bodyNode) => {
        if (!bodyNode?.esTree) return 0
        return AST.from(bodyNode.esTree).filter(P.isCollectionMethodCall).length
    },

    // Check for nested if statements in function body
    // @sig toHasNestedIf :: (AST, ASTNode) -> Boolean
    toHasNestedIf: (ast, bodyNode) => {
        if (!bodyNode?.esTree) return false
        const ifStatements = AST.from(bodyNode.esTree).filter(P.isIfStatement)
        return ifStatements.some(ifNode => AST.from(ifNode.esTree).filter(P.isIfStatement).length > 1)
    },

    // Check if a single node is a nested ternary
    // @sig toIsNestedTernaryNode :: Object -> Boolean
    toIsNestedTernaryNode: node => {
        if (!node || typeof node !== 'object') return false
        if (!P.isConditionalExpr(node)) return false
        const { consequent, alternate } = node
        return P.isConditionalExpr(consequent) || P.isConditionalExpr(alternate)
    },

    // Recursively check esTree for nested ternary
    // @sig toHasNestedTernary :: Object -> Boolean
    toHasNestedTernary: esTree => {
        if (!esTree) return false
        if (T.toIsNestedTernaryNode(esTree)) return true
        const values = Object.values(esTree).filter(v => v && typeof v === 'object')
        return values.some(v => (Array.isArray(v) ? v.some(T.toHasNestedTernary) : T.toHasNestedTernary(v)))
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

    // Create violation for Action call with function argument
    // @sig createActionFunctionViolation :: ASTNode -> Violation
    createActionFunctionViolation: node => ({
        type: 'react-redux-separation',
        line: node.line,
        column: node.column || 1,
        priority: PRIORITY,
        message: 'Function passed to Action. FIX: Actions should only carry data, not functions.',
        rule: 'react-redux-separation',
    }),

    // Create violation for selector too long
    // @sig createSelectorTooLongViolation :: (String, Number, Number) -> Violation
    createSelectorTooLongViolation: (name, line, lineCount) => {
        const fix = 'FIX: Move logic to Type.from{InputType}() or business module.'
        return {
            type: 'react-redux-separation',
            line,
            column: 1,
            priority: PRIORITY,
            message: `Selector "${name}" is ${lineCount} lines. ${fix}`,
            rule: 'react-redux-separation',
        }
    },

    // Create violation for nested if in selector
    // @sig createSelectorNestedIfViolation :: (String, Number) -> Violation
    createSelectorNestedIfViolation: (name, line) => ({
        type: 'react-redux-separation',
        line,
        column: 1,
        priority: PRIORITY,
        message: `Selector "${name}" has nested conditionals. FIX: Move to Type.from{InputType}() or business module.`,
        rule: 'react-redux-separation',
    }),

    // Create violation for nested ternary in selector
    // @sig createSelectorNestedTernaryViolation :: (String, Number) -> Violation
    createSelectorNestedTernaryViolation: (name, line) => ({
        type: 'react-redux-separation',
        line,
        column: 1,
        priority: PRIORITY,
        message: `Selector "${name}" has nested ternary. FIX: Move to Type.from{InputType}() or use if/else.`,
        rule: 'react-redux-separation',
    }),

    // Create violation for too many collection methods in selector
    // @sig createSelectorTooManyCollectionsViolation :: (String, Number, Number) -> Violation
    createSelectorTooManyCollectionsViolation: (name, line, count) => {
        const fix = 'FIX: Move to Type.from{InputType}() or business module.'
        return {
            type: 'react-redux-separation',
            line,
            column: 1,
            priority: PRIORITY,
            message: `Selector "${name}" chains ${count} collection methods. ${fix}`,
            rule: 'react-redux-separation',
        }
    },

    // Create violation for export referencing cohesion group function
    // @sig createExportFromCohesionViolation :: (String, String, Number) -> Violation
    createExportFromCohesionViolation: (exportName, groupRef, line) => {
        const fix = 'FIX: Define exported functions at module level, not in cohesion groups.'
        return {
            type: 'react-redux-separation',
            line,
            column: 1,
            priority: PRIORITY,
            message: `Export "${exportName}" references ${groupRef}. ${fix}`,
            rule: 'react-redux-separation',
        }
    },
}

const V = {
    // Validate React component patterns (JSX files)
    // @sig checkComponents :: (AST, String, String) -> [Violation]
    checkComponents: (ast, sourceCode, filePath) => {
        if (!A.hasJSXContext(ast)) return []

        const { isUseStateCall, hasUseStateExemption, isUseMemoCall, isComplexUseCallback } = P
        const { isCollectionMethodCall, isSpreadElement, hasActionFunctionArg } = P
        const { createUseStateViolation, createUseMemoViolation, createUseCallbackViolation } = F
        const { createCollectionMethodViolation, createSpreadViolation, createActionFunctionViolation } = F
        const { findInComponentBodies, collectUseChannelViolations } = A

        const useChannelViolations = collectUseChannelViolations(ast)

        const useStateNodes = findInComponentBodies(ast, isUseStateCall)
        const useStateViolations = useStateNodes
            .filter(node => !hasUseStateExemption(sourceCode, node.line))
            .map(createUseStateViolation)

        const useMemoViolations = findInComponentBodies(ast, isUseMemoCall).map(createUseMemoViolation)
        const useCallbackViolations = findInComponentBodies(ast, isComplexUseCallback).map(createUseCallbackViolation)
        const collectionViolations = findInComponentBodies(ast, isCollectionMethodCall)
            .filter(node => !P.isJsxRenderMap(node))
            .map(createCollectionMethodViolation)
        const spreadViolations = findInComponentBodies(ast, isSpreadElement).map(createSpreadViolation)
        const actionFunctionViolations = findInComponentBodies(ast, hasActionFunctionArg).map(
            createActionFunctionViolation,
        )

        return [
            ...useChannelViolations,
            ...useStateViolations,
            ...useMemoViolations,
            ...useCallbackViolations,
            ...collectionViolations,
            ...spreadViolations,
            ...actionFunctionViolations,
        ]
    },

    // Validate selector complexity (selector files)
    // @sig checkSelectors :: (AST, String, String) -> [Violation]
    checkSelectors: (ast, sourceCode, filePath) => {
        const functionViolations = A.collectSelectorFunctions(ast).flatMap(sel => A.collectSelectorViolations(ast, sel))
        const exportViolations = A.collectCohesionExportViolations(ast)
        return [...functionViolations, ...exportViolations]
    },

    // Main entry point - dispatches to component or selector checks
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []

        if (filePath.endsWith('.jsx')) return V.checkComponents(ast, sourceCode, filePath)
        if (P.isSelectorFile(filePath)) return V.checkSelectors(ast, sourceCode, filePath)

        return []
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

    // Convert function declaration to function info
    // @sig toFunctionInfo :: ASTNode -> {name, line, node}?
    toFunctionInfo: s => {
        const { name, line } = s
        return name ? { name, line, node: s } : null
    },

    // Convert variable declaration to function info if it's a function
    // @sig toVarFunctionInfo :: Object -> {name, line, node}?
    toVarFunctionInfo: d => {
        const { name, line, value } = d
        if (!value || !PS.isFunctionNode(value)) return null
        return { name, line, node: value }
    },

    // Convert property to function info for cohesion group
    // @sig toPropFunctionInfo :: (String, ASTNode) -> {name, line, node}
    toPropFunctionInfo: (groupName, prop) => {
        const { name, line, value } = prop
        return { name: `${groupName}.${name || 'unknown'}`, line: line || value.line, node: value }
    },

    // Extract functions from cohesion group object (P, T, F, V, A, E)
    // @sig toCohesionGroupFunctions :: Object -> [{name, line, node}]
    toCohesionGroupFunctions: d => {
        const { name, value } = d
        if (!P.isCohesionGroupName(name) || !value || !ASTNode.ObjectExpression.is(value)) return []
        const funcProps = value.properties.filter(prop => prop.value && PS.isFunctionNode(prop.value))
        return funcProps.map(prop => A.toPropFunctionInfo(name, prop))
    },

    // Collect all functions in selector files (top-level + cohesion groups)
    // @sig collectSelectorFunctions :: AST -> [{name: String, line: Number, node: ASTNode}]
    collectSelectorFunctions: ast => {
        const { toFunctionInfo, toVarFunctionInfo, toCohesionGroupFunctions } = A
        const statements = AST.topLevelStatements(ast)
        const { FunctionDeclaration, VariableDeclaration } = ASTNode
        const funcDecls = statements.filter(FunctionDeclaration.is).map(toFunctionInfo).filter(Boolean)
        const varDeclarations = statements.filter(VariableDeclaration.is).flatMap(decl => decl.declarations)
        const varFunctions = varDeclarations.map(toVarFunctionInfo).filter(Boolean)
        const cohesionFunctions = varDeclarations.flatMap(toCohesionGroupFunctions)
        return [...funcDecls, ...varFunctions, ...cohesionFunctions]
    },

    // Check if a property value references a cohesion group (e.g., T.foo, A.bar)
    // @sig toCohesionRef :: ASTNode -> String?
    toCohesionRef: prop => {
        const { value } = prop
        const { MemberExpression, Identifier } = ASTNode
        if (!value || !MemberExpression.is(value)) return null
        const { base, member } = value
        if (!Identifier.is(base) || !P.isCohesionGroupName(base.name)) return null
        const memberName = member && Identifier.is(member) ? member.name : 'unknown'
        return `${base.name}.${memberName}`
    },

    // Convert property to export violation if it references a cohesion group
    // @sig toExportViolation :: (Number, ASTNode) -> Violation?
    toExportViolation: (declLine, prop) => {
        const ref = A.toCohesionRef(prop)
        if (!ref) return null
        const exportName = prop.name || 'unknown'
        return F.createExportFromCohesionViolation(exportName, ref, prop.line || declLine)
    },

    // Check if declaration is an export object (PascalCase name with ObjectExpression value)
    // @sig isExportObject :: Object -> Boolean
    isExportObject: d => {
        const { name, value } = d
        return value && ASTNode.ObjectExpression.is(value) && PS.isPascalCase(name)
    },

    // Collect violations for exports referencing cohesion group functions
    // @sig collectCohesionExportViolations :: AST -> [Violation]
    collectCohesionExportViolations: ast => {
        const statements = AST.topLevelStatements(ast)
        const { VariableDeclaration } = ASTNode
        const exportObjects = statements
            .filter(VariableDeclaration.is)
            .flatMap(decl => decl.declarations)
            .filter(A.isExportObject)

        return exportObjects.flatMap(decl =>
            decl.value.properties.map(prop => A.toExportViolation(decl.line, prop)).filter(Boolean),
        )
    },

    // Collect violations for a single selector
    // @sig collectSelectorViolations :: (AST, {name, line, node}) -> [Violation]
    collectSelectorViolations: (ast, selector) => {
        const { name, line, node } = selector
        const { body, esTree } = node
        const bodyOrNode = body || node
        const violations = []

        const lineCount = T.toLineCount(node)
        if (lineCount > SELECTOR_MAX_LINES) violations.push(F.createSelectorTooLongViolation(name, line, lineCount))

        if (T.toHasNestedIf(ast, bodyOrNode)) violations.push(F.createSelectorNestedIfViolation(name, line))

        if (T.toHasNestedTernary(esTree)) violations.push(F.createSelectorNestedTernaryViolation(name, line))

        const collectionCount = T.toCollectionMethodCount(ast, bodyOrNode)
        if (collectionCount > SELECTOR_MAX_COLLECTION_CHAIN)
            violations.push(F.createSelectorTooManyCollectionsViolation(name, line, collectionCount))

        return violations
    },
}

const checkReactReduxSeparation = FS.withExemptions('react-redux-separation', V.check)
const ReactReduxSeparation = { checkReactReduxSeparation }
export { ReactReduxSeparation }
