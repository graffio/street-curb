// ABOUTME: Rule to enforce strict React/Redux separation patterns
// ABOUTME: Flags forbidden patterns in components and complex selectors

import { AST, ASTNode } from '@graffio/ast'
import { Aggregators as AS } from '../shared/aggregators.js'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

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

    // Check if node is a call to useEffect
    // @sig isUseEffectCall :: ASTNode -> Boolean
    isUseEffectCall: node => P.isHookCall('useEffect')(node),

    // Check if node is a call to useRef
    // @sig isUseRefCall :: ASTNode -> Boolean
    isUseRefCall: node => P.isHookCall('useRef')(node),

    // Check if file path is an exempt design-system wrapper component
    // @sig isExemptComponent :: String -> Boolean
    isExemptComponent: filePath => EXEMPT_COMPONENTS.some(name => filePath.endsWith('/' + name)),

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

    // Check if file path indicates a selector file
    // @sig isSelectorFile :: String -> Boolean
    isSelectorFile: filePath => {
        if (!filePath.endsWith('.js')) return false
        return (
            filePath.includes('/selectors/') || filePath.includes('-selectors.js') || filePath.endsWith('/selectors.js')
        )
    },

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

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Component hook violations — each takes a node and returns a violation with a fixed message
    // Creates violation for useState in component body
    // @sig createUseStateViolation :: ASTNode -> Violation
    createUseStateViolation: node =>
        violation(node.line, node.column || 1, 'useState in component. FIX: Move state to Redux.'),

    // Creates violation for useMemo in component body
    // @sig createUseMemoViolation :: ASTNode -> Violation
    createUseMemoViolation: node =>
        violation(node.line, node.column || 1, 'useMemo in component body. FIX: Move derived state to a selector.'),

    // Creates violation for useCallback in component body
    // @sig createUseCallbackViolation :: ASTNode -> Violation
    createUseCallbackViolation: node =>
        violation(node.line, node.column || 1, 'useCallback in component. FIX: Use dispatch-intent command function.'),

    // Creates violation for useEffect in component body
    // @sig createUseEffectViolation :: ASTNode -> Violation
    createUseEffectViolation: node =>
        violation(node.line, node.column || 1, 'useEffect in component. FIX: Use selector-with-defaults or post.'),

    // Creates violation for useRef in component body
    // @sig createUseRefViolation :: ASTNode -> Violation
    createUseRefViolation: node =>
        violation(node.line, node.column || 1, 'useRef in component. FIX: Use FocusRegistry ref callback or post.'),

    // Creates violation for useChannel import
    // @sig createUseChannelViolation :: ASTNode -> Violation
    createUseChannelViolation: node =>
        violation(node.line, node.column || 1, 'useChannel import. FIX: Use Redux actions/selectors instead.'),

    // Creates violation for spread in component body
    // @sig createSpreadViolation :: ASTNode -> Violation
    createSpreadViolation: node =>
        violation(node.line, node.column || 1, 'Spread in component body. FIX: Pre-compute in selector.'),

    // Creates violation for function argument in Action call
    // @sig createActionFunctionViolation :: ASTNode -> Violation
    createActionFunctionViolation: node =>
        violation(node.line, node.column || 1, 'Function passed to Action. FIX: Actions carry data, not functions.'),

    // Create violation for collection method in component body
    // @sig createCollectionMethodViolation :: ASTNode -> Violation
    createCollectionMethodViolation: node =>
        violation(node.line, node.column || 1, `.${T.toMethodName(node)}() in component body. FIX: Move to selector.`),

    // Create violation for selector exceeding line limit
    // @sig createSelectorTooLongViolation :: (String, Number, Number) -> Violation
    createSelectorTooLongViolation: (name, line, lineCount) =>
        violation(
            line,
            1,
            `Selector "${name}" is ${lineCount} lines. FIX: Move logic to Type.from{InputType}() or business module.`,
        ),

    // Create violation for selector with nested if statements
    // @sig createSelectorNestedIfViolation :: (String, Number) -> Violation
    createSelectorNestedIfViolation: (name, line) =>
        violation(
            line,
            1,
            `Selector "${name}" has nested conditionals. FIX: Move to Type.from{InputType}() or business module.`,
        ),

    // Create violation for selector with nested ternary expressions
    // @sig createSelectorNestedTernaryViolation :: (String, Number) -> Violation
    createSelectorNestedTernaryViolation: (name, line) =>
        violation(
            line,
            1,
            `Selector "${name}" has nested ternary. FIX: Move to Type.from{InputType}() or use if/else.`,
        ),

    // Create violation for selector chaining too many collection methods
    // @sig createSelectorTooManyCollectionsViolation :: (String, Number, Number) -> Violation
    createSelectorTooManyCollectionsViolation: (name, line, count) =>
        violation(
            line,
            1,
            `Selector "${name}" chains ${count} collection methods. FIX: Move to Type or business module.`,
        ),

    // Create violation for export that references a cohesion group function
    // @sig createExportFromCohesionViolation :: (String, String, Number) -> Violation
    createExportFromCohesionViolation: (exportName, groupRef, line) =>
        violation(
            line,
            1,
            `Export "${exportName}" references ${groupRef}. FIX: Define exported functions at module level.`,
        ),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Validators
//
// ---------------------------------------------------------------------------------------------------------------------

const V = {
    // Validate React component patterns (JSX files)
    // @sig checkComponents :: (AST, String, String) -> [Violation]
    checkComponents: (ast, sourceCode, filePath) => {
        if (!PS.hasJSXContext(ast)) return []
        if (P.isExemptComponent(filePath)) return []

        const { isUseStateCall, isUseMemoCall, isUseCallbackCall, isUseEffectCall, isUseRefCall } = P
        const { isCollectionMethodCall, isSpreadElement, hasActionFunctionArg } = P
        const { createUseStateViolation, createUseMemoViolation, createUseCallbackViolation } = F
        const { createUseEffectViolation, createUseRefViolation } = F
        const { createCollectionMethodViolation, createSpreadViolation, createActionFunctionViolation } = F
        const { findInComponentBodies, collectUseChannelViolations } = A

        const useChannelViolations = collectUseChannelViolations(ast)
        const useStateViolations = findInComponentBodies(ast, isUseStateCall).map(createUseStateViolation)
        const useMemoViolations = findInComponentBodies(ast, isUseMemoCall).map(createUseMemoViolation)
        const useCallbackViolations = findInComponentBodies(ast, isUseCallbackCall).map(createUseCallbackViolation)
        const useEffectViolations = findInComponentBodies(ast, isUseEffectCall).map(createUseEffectViolation)
        const useRefViolations = findInComponentBodies(ast, isUseRefCall).map(createUseRefViolation)
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
            ...useEffectViolations,
            ...useRefViolations,
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

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Find all nodes within component bodies matching predicate
    // @sig findInComponentBodies :: (AST, (ASTNode -> Boolean)) -> [ASTNode]
    findInComponentBodies: (ast, predicate) =>
        AS.findComponents(ast)
            .map(c => c.node.body)
            .filter(Boolean)
            .flatMap(body => AST.from(body.esTree).filter(predicate)),

    // Collect useChannel import violations (file-level, not component-level)
    // @sig collectUseChannelViolations :: AST -> [Violation]
    collectUseChannelViolations: ast =>
        AST.topLevelStatements(ast).filter(P.isUseChannelImport).map(F.createUseChannelViolation),

    // Convert function declaration to function info
    // @sig toFunctionInfo :: ASTNode -> {name, line, node}?
    toFunctionInfo: s => {
        const { name, line } = s
        return name ? { name, line, node: s } : undefined
    },

    // Convert variable declaration to function info if it's a function
    // @sig toVarFunctionInfo :: Object -> {name, line, node}?
    toVarFunctionInfo: d => {
        const { name, line, value } = d
        if (!value || !PS.isFunctionNode(value)) return undefined
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
        if (!PS.isCohesionGroup(name) || !value || !ASTNode.ObjectExpression.is(value)) return []
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
        if (!value || !MemberExpression.is(value)) return undefined
        const { base, member } = value
        if (!Identifier.is(base) || !PS.isCohesionGroup(base.name)) return undefined
        const memberName = member && Identifier.is(member) ? member.name : 'unknown'
        return `${base.name}.${memberName}`
    },

    // Convert property to export violation if it references a cohesion group
    // @sig toExportViolation :: (Number, ASTNode) -> Violation?
    toExportViolation: (declLine, prop) => {
        const ref = A.toCohesionRef(prop)
        if (!ref) return undefined
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

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const PRIORITY = 8
const COLLECTION_METHODS = ['filter', 'map', 'find', 'includes', 'reduce', 'slice']
const EXEMPT_COMPONENTS = ['DataTable.jsx', 'KeyboardDateInput.jsx']
const SELECTOR_MAX_LINES = 6
const SELECTOR_MAX_COLLECTION_CHAIN = 2

const violation = FS.createViolation('react-redux-separation', PRIORITY)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run react-redux-separation rule with COMPLEXITY exemption support
// @sig checkReactReduxSeparation :: (AST?, String, String) -> [Violation]
const checkReactReduxSeparation = (ast, sourceCode, filePath) =>
    FS.withExemptions('react-redux-separation', V.check, ast, sourceCode, filePath)
export { checkReactReduxSeparation }
