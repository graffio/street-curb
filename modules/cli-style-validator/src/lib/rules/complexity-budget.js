// ABOUTME: Rule to enforce complexity budgets (lines, style objects, functions)
// ABOUTME: Budgets vary by context (cli, react-page, react-component, selector, utility)

import { AS } from '../aggregators.js'
import { PS } from '../predicates.js'

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

const STYLE_PROPERTIES = new Set([
    'padding',
    'margin',
    'width',
    'height',
    'display',
    'flex',
    'color',
    'backgroundColor',
    'background',
    'border',
    'borderRadius',
    'fontSize',
    'fontWeight',
    'textAlign',
    'position',
    'top',
    'left',
    'right',
    'bottom',
    'overflow',
    'overflowX',
    'overflowY',
    'maxHeight',
    'maxWidth',
    'minHeight',
    'minWidth',
    'gap',
    'gridTemplateColumns',
    'gridTemplateRows',
    'justifyContent',
    'alignItems',
    'flexDirection',
    'flexWrap',
    'zIndex',
    'opacity',
    'transform',
    'transition',
    'cursor',
    'boxShadow',
    'outline',
    'fontStyle',
    'textDecoration',
    'lineHeight',
    'letterSpacing',
    'whiteSpace',
    'wordBreak',
    'tableLayout',
    'borderCollapse',
])

const P = {
    // Check if object expression appears to be a style object (>50% CSS properties)
    // @sig isStyleObject :: ASTNode -> Boolean
    isStyleObject: node => {
        if (node.type !== 'ObjectExpression' || node.properties.length === 0) return false
        const names = node.properties.filter(p => p.key?.name || p.key?.value).map(p => p.key.name || p.key.value)
        const cssCount = names.filter(name => STYLE_PROPERTIES.has(name)).length
        return cssCount >= Math.ceil(names.length / 2) && cssCount >= 2
    },

    // Check if context is a React file type (page or component)
    // @sig isReactContext :: String -> Boolean
    isReactContext: context => context === 'react-page' || context === 'react-component',
}

const T = {
    // Determine file context based on path patterns
    // @sig getContext :: String -> String
    getContext: filePath => {
        if (filePath.includes('/cli-')) return 'cli'
        if (filePath.includes('/pages/') && filePath.endsWith('.jsx')) return 'react-page'
        if (filePath.includes('/components/') && filePath.endsWith('.jsx')) return 'react-component'
        if (filePath.endsWith('router.jsx')) return 'router'
        if (filePath.includes('/selectors/')) return 'selector'
        if (filePath.includes('/store/') && filePath.endsWith('reducer.js')) return 'reducer'
        if (filePath.includes('/services/') && filePath.endsWith('storage.js')) return 'storage'
        return 'utility'
    },

    // Get budget for a component based on its name (Page suffix = page budget)
    // @sig getComponentBudget :: String -> Budget
    getComponentBudget: compName => (compName.endsWith('Page') ? BUDGETS['react-page'] : BUDGETS['react-component']),

    // Get context string for a component based on its name
    // @sig getComponentContext :: String -> String
    getComponentContext: compName => (compName.endsWith('Page') ? 'react-page' : 'react-component'),
}

const F = {
    // Create a complexity-budget violation with metric details
    // @sig createViolation :: (Number, String, String, Number, Number) -> Violation
    createViolation: (line, metric, context, actual, budget) => ({
        type: 'complexity-budget',
        line,
        column: 1,
        priority: PRIORITY,
        message:
            `${metric} (${actual}) exceeds ${context} budget (${budget}). ` +
            `CHECKPOINT: Run complexity review before proceeding. This may require revising your implementation approach.`,
        rule: 'complexity-budget',
    }),
}

const V = {
    // Validate a single React component against its budget
    // @sig checkComponentBudget :: ({ name, node, startLine, endLine }) -> [Violation]
    checkComponentBudget: comp => {
        const violations = []
        const budget = T.getComponentBudget(comp.name)
        const context = T.getComponentContext(comp.name)
        const compLines = comp.endLine - comp.startLine + 1

        if (compLines > budget.lines)
            violations.push(
                F.createViolation(comp.startLine, `Component "${comp.name}" lines`, context, compLines, budget.lines),
            )

        const funcCount = AS.countFunctions(comp.node)
        if (funcCount > budget.functions)
            violations.push(
                F.createViolation(
                    comp.startLine,
                    `Component "${comp.name}" functions`,
                    context,
                    funcCount,
                    budget.functions,
                ),
            )

        const styleCount = A.countStyleObjects(comp.node)
        if (styleCount > budget.styleObjects)
            violations.push(
                F.createViolation(
                    comp.startLine,
                    `Component "${comp.name}" style objects`,
                    context,
                    styleCount,
                    budget.styleObjects,
                ),
            )

        return violations
    },

    // Validate React file budget (per-component or file-level)
    // @sig checkReactBudget :: (AST, String, Budget) -> [Violation]
    checkReactBudget: (ast, sourceCode, budget) => {
        const components = A.findComponents(ast)
        if (components.length === 0) {
            const totalLines = sourceCode.split('\n').length
            if (totalLines > budget.lines)
                return [F.createViolation(1, 'Lines', 'react-component', totalLines, budget.lines)]
            return []
        }
        return components.flatMap(V.checkComponentBudget)
    },

    // Validate non-React file budget (utility, selector, cli)
    // @sig checkNonReactBudget :: (AST, String, String, Budget) -> [Violation]
    checkNonReactBudget: (ast, sourceCode, context, budget) => {
        const violations = []
        const totalLines = sourceCode.split('\n').length

        if (totalLines > budget.lines) violations.push(F.createViolation(1, 'Lines', context, totalLines, budget.lines))

        const styleCount = A.countStyleObjects(ast)
        if (styleCount > budget.styleObjects)
            violations.push(F.createViolation(1, 'Style objects', context, styleCount, budget.styleObjects))

        const totalFunctions = AS.countFunctions(ast)
        if (totalFunctions > budget.functions)
            violations.push(F.createViolation(1, 'Functions', context, totalFunctions, budget.functions))

        return violations
    },

    // Validate complexity budget for entire file
    // @sig checkComplexityBudget :: (AST?, String, String) -> [Violation]
    checkComplexityBudget: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || PS.isGeneratedFile(sourceCode)) return []

        const context = T.getContext(filePath)
        const budget = BUDGETS[context]

        if (P.isReactContext(context)) return V.checkReactBudget(ast, sourceCode, budget)
        return V.checkNonReactBudget(ast, sourceCode, context, budget)
    },
}

const A = {
    // Count style objects in an AST subtree
    // @sig countStyleObjects :: ASTNode -> Number
    countStyleObjects: node => {
        let count = 0
        AS.traverseAST(node, n => {
            if (P.isStyleObject(n)) count++
        })
        return count
    },

    // Find all PascalCase component declarations at module level
    // @sig findComponents :: AST -> [{ name: String, node: ASTNode, startLine: Number, endLine: Number }]
    findComponents: ast => {
        const components = []
        if (!ast?.body) return components

        ast.body.forEach(node => {
            if (node.type === 'VariableDeclaration') {
                const decl = node.declarations[0]
                if (decl?.id?.name && PS.isPascalCase(decl.id.name) && decl.init && PS.isFunctionNode(decl.init))
                    components.push({
                        name: decl.id.name,
                        node: decl.init,
                        startLine: node.loc?.start?.line || 1,
                        endLine: node.loc?.end?.line || 1,
                    })
            }
            if (node.type === 'FunctionDeclaration' && PS.isPascalCase(node.id?.name))
                components.push({
                    name: node.id.name,
                    node,
                    startLine: node.loc?.start?.line || 1,
                    endLine: node.loc?.end?.line || 1,
                })
        })

        return components
    },
}

const checkComplexityBudget = V.checkComplexityBudget
export { checkComplexityBudget }
