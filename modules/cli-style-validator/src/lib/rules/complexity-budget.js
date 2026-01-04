// ABOUTME: Rule to enforce complexity budgets (lines, style objects, functions)
// ABOUTME: Budgets vary by context (cli, react-page, react-component, selector, utility)
// COMPLEXITY-TODO: lines — STYLE_PROPERTIES config takes 50 lines (expires 2026-01-03)
// COMPLEXITY-TODO: cohesion-structure — Budget checking requires many validators (expires 2026-01-03)
// COMPLEXITY-TODO: chain-extraction — Component analysis accesses nested props (expires 2026-01-03)

import { ASTNode } from '../../types/index.js'
import { AS } from '../shared/aggregators.js'
import { AST } from '../dsl/ast.js'
import { PS } from '../shared/predicates.js'
import { Lines } from '../dsl/source.js'

const PRIORITY = 0

const BUDGETS = {
    cli: { lines: 150, styleObjects: 0, functions: 10 },
    'react-page': { lines: 200, styleObjects: 5, functions: 8 },
    'react-component': { lines: 100, styleObjects: 3, functions: 5 },
    router: { lines: 200, styleObjects: 3, functions: 15 },
    selector: { lines: 80, styleObjects: 0, functions: 5 },
    reducer: { lines: 150, styleObjects: 0, functions: 20 },
    storage: { lines: 100, styleObjects: 0, functions: 15 },
    utility: { lines: 150, styleObjects: 0, functions: 10 },
}

// prettier-ignore
const STYLE_PROPERTIES = new Set([
    'alignItems', 'background', 'backgroundColor', 'border', 'borderCollapse', 'borderRadius', 'bottom', 'boxShadow',
    'color', 'cursor', 'display', 'flex', 'flexDirection', 'flexWrap', 'fontSize', 'fontStyle', 'fontWeight', 'gap',
    'gridTemplateColumns', 'gridTemplateRows', 'height', 'justifyContent', 'left', 'letterSpacing', 'lineHeight',
    'margin', 'maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'opacity', 'outline', 'overflow', 'overflowX',
    'overflowY', 'padding', 'position', 'right', 'tableLayout', 'textAlign', 'textDecoration', 'top', 'transform',
    'transition', 'whiteSpace', 'width', 'wordBreak', 'zIndex',
])

const P = {
    // Check if object expression appears to be a style object (>50% CSS properties)
    // @sig isStyleObject :: ASTNode -> Boolean
    isStyleObject: node => {
        if (!ASTNode.ObjectExpression.is(node) || AST.propertyCount(node) === 0) return false
        const names = AST.propertyNames(node)
        const cssCount = names.filter(name => STYLE_PROPERTIES.has(name)).length
        return cssCount >= Math.ceil(names.length / 2) && cssCount >= 2
    },

    // Check if context is a React file type (page or component)
    // @sig isReactContext :: String -> Boolean
    isReactContext: context => context === 'react-page' || context === 'react-component',
}

const T = {
    // Determine file context based on path patterns
    // @sig toContext :: String -> String
    toContext: filePath => {
        if (filePath.includes('/cli-')) return 'cli'
        if (filePath.includes('/pages/') && filePath.endsWith('.jsx')) return 'react-page'
        if (filePath.includes('/components/') && filePath.endsWith('.jsx')) return 'react-component'
        if (filePath.endsWith('router.jsx')) return 'router'
        if (filePath.includes('/selectors/')) return 'selector'
        if (filePath.includes('/store/') && filePath.endsWith('reducer.js')) return 'reducer'
        if (filePath.includes('/services/') && filePath.endsWith('storage.js')) return 'storage'
        return 'utility'
    },

    // Transform component name to its budget (Page suffix = page budget)
    // @sig toComponentBudget :: String -> Budget
    toComponentBudget: compName => (compName.endsWith('Page') ? BUDGETS['react-page'] : BUDGETS['react-component']),

    // Transform component name to its context string
    // @sig toComponentContext :: String -> String
    toComponentContext: compName => (compName.endsWith('Page') ? 'react-page' : 'react-component'),
}

const CHECKPOINT_SUFFIX =
    'CHECKPOINT: Run complexity review before proceeding. This may require revising your approach.'

const F = {
    // Create a complexity-budget violation with metric details
    // @sig createViolation :: (Number, String, String, Number, Number, Boolean?) -> Violation
    createViolation: (line, metric, context, actual, budget, expired = false) => {
        const base = `${metric} (${actual}) exceeds ${context} budget (${budget}).`
        const message = expired ? `${base} COMPLEXITY-TODO expired.` : `${base} ${CHECKPOINT_SUFFIX}`
        return { type: 'complexity-budget', line, column: 1, priority: PRIORITY, message, rule: 'complexity-budget' }
    },

    // Create a warning for deferred complexity metric
    // @sig createWarning :: (Number, String, String, Number) -> Warning
    createWarning: (line, rule, reason, daysRemaining) => ({
        type: 'complexity-budget-warning',
        line,
        column: 1,
        priority: PRIORITY,
        message: `COMPLEXITY-TODO deferred: ${rule} — "${reason}" (${daysRemaining} days remaining)`,
        rule: 'complexity-budget',
        daysRemaining,
    }),
}

const V = {
    // Validate a single React component against its budget
    // @sig checkComponentBudget :: ({ name, node, startLine, endLine }, String) -> [Violation]
    checkComponentBudget: (comp, sourceCode) => {
        const budget = T.toComponentBudget(comp.name)
        const context = T.toComponentContext(comp.name)
        const compLines = comp.endLine - comp.startLine + 1
        const funcCount = AS.countFunctions(comp.node)
        const styleCount = A.countStyleObjects(comp.node)
        const line = comp.startLine

        return [
            V.checkMetric(sourceCode, 'lines', compLines, budget.lines, context, line),
            V.checkMetric(sourceCode, 'functions', funcCount, budget.functions, context, line),
            V.checkMetric(sourceCode, 'style-objects', styleCount, budget.styleObjects, context, line),
        ].filter(Boolean)
    },

    // Validate React file budget (per-component or file-level)
    // @sig checkReactBudget :: (AST, String, Budget) -> [Violation]
    checkReactBudget: (ast, sourceCode, budget) => {
        const components = AS.findComponents(ast)
        if (components.length === 0) {
            const codeLines = Lines.from(sourceCode).all().count(PS.isNonCommentLine)
            const result = V.checkMetric(sourceCode, 'lines', codeLines, budget.lines, 'react-component')
            return result ? [result] : []
        }
        return components.flatMap(comp => V.checkComponentBudget(comp, sourceCode))
    },

    // Check a single metric against budget with exemption support
    // @sig checkMetric :: (String, String, Number, Number, String, Number?) -> Violation | Warning | null
    checkMetric: (sourceCode, metricName, actual, budgetValue, context, line = 1) => {
        if (actual <= budgetValue) return null

        const status = PS.getExemptionStatus(sourceCode, metricName)
        if (status.exempt) return null
        if (status.deferred) return F.createWarning(line, metricName, status.reason, status.daysRemaining)

        const metricLabel =
            metricName === 'style-objects' ? 'Style objects' : metricName.charAt(0).toUpperCase() + metricName.slice(1)
        return F.createViolation(line, metricLabel, context, actual, budgetValue, status.expired)
    },

    // Validate non-React file budget (utility, selector, cli)
    // @sig checkNonReactBudget :: (AST, String, String, Budget) -> [Violation]
    checkNonReactBudget: (ast, sourceCode, context, budget) => {
        const codeLines = Lines.from(sourceCode).all().count(PS.isNonCommentLine)
        const styleCount = A.countStyleObjects(ast)
        const totalFunctions = AS.countFunctions(ast)

        return [
            V.checkMetric(sourceCode, 'lines', codeLines, budget.lines, context),
            V.checkMetric(sourceCode, 'style-objects', styleCount, budget.styleObjects, context),
            V.checkMetric(sourceCode, 'functions', totalFunctions, budget.functions, context),
        ].filter(Boolean)
    },

    // Validate complexity budget for entire file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || PS.isGeneratedFile(sourceCode)) return []

        const context = T.toContext(filePath)
        const budget = BUDGETS[context]

        if (P.isReactContext(context)) return V.checkReactBudget(ast, sourceCode, budget)
        return V.checkNonReactBudget(ast, sourceCode, context, budget)
    },
}

const A = {
    // Count style objects in an AST subtree
    // @sig countStyleObjects :: (ESTreeAST | ASTNode) -> Number
    countStyleObjects: node => AST.from(node).filter(P.isStyleObject).length,
}

const checkComplexityBudget = V.check
export { checkComplexityBudget }
