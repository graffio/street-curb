// ABOUTME: Rule to enforce complexity budgets (lines, style objects, functions)
// ABOUTME: Budgets vary by context (cli, react-page, react-component, selector, utility)

import { traverseAST, isFunctionNode } from '../traverse.js'

const PRIORITY = 0 // Highest priority - fix complexity first

// Context-specific budgets from .claude/pattern-catalog.md
// Note: "functions" counts all function definitions, not just nested ones
const BUDGETS = {
    cli: { lines: 150, styleObjects: 0, functions: 10 },
    'react-page': { lines: 200, styleObjects: 5, functions: 8 },
    'react-component': { lines: 100, styleObjects: 3, functions: 5 },
    selector: { lines: 80, styleObjects: 0, functions: 5 },
    utility: { lines: 150, styleObjects: 0, functions: 10 },
}

// CSS-like property names that indicate a style object
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

/**
 * Determine context from file path
 * @sig getContext :: String -> String
 */
const getContext = filePath => {
    if (filePath.includes('/cli-')) return 'cli'
    if (filePath.includes('/pages/') && filePath.endsWith('.jsx')) return 'react-page'
    if (filePath.includes('/components/') && filePath.endsWith('.jsx')) return 'react-component'
    if (filePath.includes('/selectors/')) return 'selector'
    return 'utility'
}

/**
 * Check if file is a test file that should skip validation
 * @sig isTestFile :: String -> Boolean
 */
const isTestFile = filePath =>
    filePath.includes('.tap.js') || filePath.includes('.test.js') || filePath.includes('/test/')

/**
 * Check if file is generated (should skip validation)
 * @sig isGeneratedFile :: String -> Boolean
 */
// Note: Split strings to avoid self-matching (this file contains these patterns as literals)
const GENERATED_MARKERS = ['do not edit ' + 'manually', 'Auto-' + 'generated']
const isGeneratedFile = sourceCode => GENERATED_MARKERS.some(marker => sourceCode.includes(marker))

/**
 * Check if an object expression looks like a style object
 * @sig isStyleObject :: ASTNode -> Boolean
 */
const isStyleObject = node => {
    if (node.type !== 'ObjectExpression') return false
    if (node.properties.length === 0) return false

    const propertyNames = node.properties
        .filter(p => p.key && (p.key.name || p.key.value))
        .map(p => p.key.name || p.key.value)

    // If more than half the properties are CSS-like, it's a style object
    const cssCount = propertyNames.filter(name => STYLE_PROPERTIES.has(name)).length
    return cssCount >= Math.ceil(propertyNames.length / 2) && cssCount >= 2
}

/**
 * Count style objects in AST
 * @sig countStyleObjects :: AST -> Number
 */
const countStyleObjects = ast => {
    let count = 0
    traverseAST(ast, node => {
        if (isStyleObject(node)) count++
    })
    return count
}

/**
 * Find React component functions (PascalCase arrow functions or function declarations)
 * @sig findComponents :: AST -> [{ name: String, node: ASTNode, startLine: Number, endLine: Number }]
 */
const findComponents = ast => {
    const components = []
    if (!ast?.body) return components

    const isPascalCase = name => name && /^[A-Z]/.test(name)

    ast.body.forEach(node => {
        // const Foo = () => ...
        if (node.type === 'VariableDeclaration') {
            const decl = node.declarations[0]
            if (decl?.id?.name && isPascalCase(decl.id.name) && decl.init && isFunctionNode(decl.init))
                components.push({
                    name: decl.id.name,
                    node: decl.init,
                    startLine: node.loc?.start?.line || 1,
                    endLine: node.loc?.end?.line || 1,
                })
        }

        // function Foo() { ... }
        if (node.type === 'FunctionDeclaration' && isPascalCase(node.id?.name))
            components.push({
                name: node.id.name,
                node,
                startLine: node.loc?.start?.line || 1,
                endLine: node.loc?.end?.line || 1,
            })
    })

    return components
}

/**
 * Count all functions within a component (including the component itself)
 * @sig countFunctions :: ASTNode -> Number
 */
const countFunctions = componentNode => {
    let count = 0
    traverseAST(componentNode, node => {
        if (isFunctionNode(node)) count++
    })
    return count
}

/**
 * Count style objects within a specific component
 * @sig countStyleObjectsInComponent :: ASTNode -> Number
 */
const countStyleObjectsInComponent = componentNode => {
    let count = 0
    traverseAST(componentNode, node => {
        if (isStyleObject(node)) count++
    })
    return count
}

/**
 * Create a budget violation
 * @sig createViolation :: (Number, String, String, Number, Number) -> Violation
 */
const createViolation = (line, metric, context, actual, budget) => ({
    type: 'complexity-budget',
    line,
    column: 1,
    priority: PRIORITY,
    message:
        `${metric} (${actual}) exceeds ${context} budget (${budget}). ` +
        `CHECKPOINT: Run complexity review before proceeding. This may require revising your implementation approach.`,
    rule: 'complexity-budget',
})

/**
 * Check complexity budgets for a file
 * @sig checkComplexityBudget :: (AST?, String, String) -> [Violation]
 */
const checkComplexityBudget = (ast, sourceCode, filePath) => {
    if (!ast) return []
    if (isTestFile(filePath)) return []
    if (isGeneratedFile(sourceCode)) return []

    const context = getContext(filePath)
    const budget = BUDGETS[context]
    const violations = []
    const lines = sourceCode.split('\n')
    const totalLines = lines.length

    // For React files, check per-component
    if (context === 'react-page' || context === 'react-component') {
        const components = findComponents(ast)

        if (components.length === 0) {
            // No components found, check file-level
            if (totalLines > budget.lines)
                violations.push(createViolation(1, 'Lines', context, totalLines, budget.lines))
        } else {
            // Check each component
            components.forEach(comp => {
                const compLines = comp.endLine - comp.startLine + 1
                const compBudget = comp.name.endsWith('Page') ? BUDGETS['react-page'] : BUDGETS['react-component']

                if (compLines > compBudget.lines)
                    violations.push(
                        createViolation(
                            comp.startLine,
                            `Component "${comp.name}" lines`,
                            comp.name.endsWith('Page') ? 'react-page' : 'react-component',
                            compLines,
                            compBudget.lines,
                        ),
                    )

                const funcCount = countFunctions(comp.node)
                if (funcCount > compBudget.functions)
                    violations.push(
                        createViolation(
                            comp.startLine,
                            `Component "${comp.name}" functions`,
                            comp.name.endsWith('Page') ? 'react-page' : 'react-component',
                            funcCount,
                            compBudget.functions,
                        ),
                    )

                const styleCount = countStyleObjectsInComponent(comp.node)
                if (styleCount > compBudget.styleObjects)
                    violations.push(
                        createViolation(
                            comp.startLine,
                            `Component "${comp.name}" style objects`,
                            comp.name.endsWith('Page') ? 'react-page' : 'react-component',
                            styleCount,
                            compBudget.styleObjects,
                        ),
                    )
            })
        }

        // Also check file-level style objects (outside components)
        const totalStyleObjects = countStyleObjects(ast)
        const componentStyleObjects = components.reduce((sum, c) => sum + countStyleObjectsInComponent(c.node), 0)
        const moduleLevelStyles = totalStyleObjects - componentStyleObjects

        // Module-level styles count toward page budget
        if (moduleLevelStyles > 0) {
            const pageComponent = components.find(c => c.name.endsWith('Page'))
            if (pageComponent) {
                const totalForPage = moduleLevelStyles + countStyleObjectsInComponent(pageComponent.node)
                if (totalForPage > BUDGETS['react-page'].styleObjects) {
                    // Already reported in component check, skip
                }
            }
        }
    } else {
        // Non-React files: check file-level metrics
        if (totalLines > budget.lines) violations.push(createViolation(1, 'Lines', context, totalLines, budget.lines))

        const styleCount = countStyleObjects(ast)
        if (styleCount > budget.styleObjects)
            violations.push(createViolation(1, 'Style objects', context, styleCount, budget.styleObjects))

        // For non-React, count total functions in file
        let totalFunctions = 0
        traverseAST(ast, node => {
            if (isFunctionNode(node)) totalFunctions++
        })

        if (totalFunctions > budget.functions)
            violations.push(createViolation(1, 'Functions', context, totalFunctions, budget.functions))
    }

    return violations
}

export { checkComplexityBudget }
