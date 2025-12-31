// ABOUTME: Rule to enforce cohesion group patterns inside React components
// ABOUTME: Detects render* functions that should be components, suggests P/T/F/V/A/E groups

import { PS } from '../predicates.js'
import { AS } from '../aggregators.js'

const PRIORITY = 2 // Medium priority - structural suggestion

// Cohesion group names recognized inside components
const COHESION_GROUPS = ['P', 'T', 'F', 'V', 'A', 'E']

const P = {
    // Check if node is a React component (PascalCase function returning JSX)
    // @sig isReactComponent :: ASTNode -> Boolean
    isReactComponent: node => {
        if (!PS.isFunctionNode(node)) return false
        const name = T.getComponentName(node)
        if (!name || !PS.isPascalCase(name)) return false
        return P.returnsJSX(node)
    },

    // Check if function body returns JSX
    // @sig returnsJSX :: ASTNode -> Boolean
    returnsJSX: node => {
        let hasJSX = false
        AS.traverseAST(node.body, n => {
            if (n.type === 'JSXElement' || n.type === 'JSXFragment') hasJSX = true
        })
        return hasJSX
    },

    // Check if name follows render* pattern
    // @sig isRenderFunction :: String -> Boolean
    isRenderFunction: name => /^render[A-Z]/.test(name),

    // Check if a variable declaration creates a cohesion group
    // @sig isCohesionGroupDecl :: ASTNode -> Boolean
    isCohesionGroupDecl: node => {
        if (node.type !== 'VariableDeclaration') return false
        const decl = node.declarations[0]
        if (!decl?.id?.name) return false
        return COHESION_GROUPS.includes(decl.id.name) && decl.init?.type === 'ObjectExpression'
    },

    // Check if function has internal cohesion groups
    // @sig hasCohesionGroups :: ASTNode -> Boolean
    hasCohesionGroups: node => {
        if (!node.body?.body) return false
        return node.body.body.some(P.isCohesionGroupDecl)
    },
}

const T = {
    // Extract component name from function node
    // @sig getComponentName :: ASTNode -> String?
    getComponentName: node => {
        if (node.type === 'FunctionDeclaration') return node.id?.name
        if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') return node.parent?.id?.name
        return null
    },

    // Extract suggested component name from render function
    // @sig toComponentName :: String -> String
    toComponentName: name => name.replace(/^render/, ''),
}

const A = {
    // Find all render* functions inside a component
    // @sig collectRenderFunctions :: ASTNode -> [{ name: String, line: Number }]
    collectRenderFunctions: componentNode => {
        const renderFns = []
        if (!componentNode.body?.body) return renderFns

        componentNode.body.body.forEach(stmt => {
            if (stmt.type === 'VariableDeclaration')
                stmt.declarations.forEach(decl => {
                    if (decl.id?.name && P.isRenderFunction(decl.id.name) && decl.init && PS.isFunctionNode(decl.init))
                        renderFns.push({ name: decl.id.name, line: stmt.loc?.start?.line || 1 })
                })

            if (stmt.type === 'FunctionDeclaration' && stmt.id?.name && P.isRenderFunction(stmt.id.name))
                renderFns.push({ name: stmt.id.name, line: stmt.loc?.start?.line || 1 })
        })

        return renderFns
    },

    // Find all React components in AST (with parent context for naming)
    // @sig collectReactComponents :: AST -> [ASTNode]
    collectReactComponents: ast => {
        const components = []
        if (!ast?.body) return components

        ast.body.forEach(stmt => {
            if (stmt.type === 'FunctionDeclaration' && P.isReactComponent(stmt)) components.push(stmt)

            if (stmt.type === 'VariableDeclaration')
                stmt.declarations.forEach(decl => {
                    if (decl.init && PS.isFunctionNode(decl.init)) {
                        decl.init.parent = decl // Attach parent for name lookup
                        if (P.isReactComponent(decl.init)) components.push(decl.init)
                    }
                })

            if (stmt.type === 'ExportNamedDeclaration' && stmt.declaration) {
                if (stmt.declaration.type === 'FunctionDeclaration' && P.isReactComponent(stmt.declaration))
                    components.push(stmt.declaration)

                if (stmt.declaration.type === 'VariableDeclaration')
                    stmt.declaration.declarations.forEach(decl => {
                        if (decl.init && PS.isFunctionNode(decl.init)) {
                            decl.init.parent = decl
                            if (P.isReactComponent(decl.init)) components.push(decl.init)
                        }
                    })
            }

            if (stmt.type === 'ExportDefaultDeclaration' && stmt.declaration)
                if (PS.isFunctionNode(stmt.declaration) && P.returnsJSX(stmt.declaration))
                    components.push(stmt.declaration)
        })

        return components
    },

    // Count helper functions in component that could be in cohesion groups
    // @sig countUngroupedHelpers :: ASTNode -> Number
    countUngroupedHelpers: componentNode => {
        if (!componentNode.body?.body) return 0

        let count = 0
        componentNode.body.body.forEach(stmt => {
            if (stmt.type === 'VariableDeclaration' && !P.isCohesionGroupDecl(stmt))
                stmt.declarations.forEach(decl => {
                    if (decl.init && PS.isFunctionNode(decl.init)) count++
                })

            if (stmt.type === 'FunctionDeclaration') count++
        })

        return count
    },
}

const F = {
    // Create a react-component-cohesion violation
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => ({
        type: 'react-component-cohesion',
        line,
        column: 1,
        priority: PRIORITY,
        message,
        rule: 'react-component-cohesion',
    }),

    // Create violation for render function that should be a component
    // @sig createRenderViolation :: (Number, String) -> Violation
    createRenderViolation: (line, name) =>
        F.createViolation(
            line,
            `"${name}" should be extracted to a <${T.toComponentName(name)} /> component. ` +
                `FIX: Move to its own component, not a render function inside the parent.`,
        ),

    // Create violation suggesting cohesion groups
    // @sig createCohesionSuggestion :: (Number, String, Number) -> Violation
    createCohesionSuggestion: (line, componentName, helperCount) =>
        F.createViolation(
            line,
            `CHECKPOINT: "${componentName}" has ${helperCount} helper functions. ` +
                `Consider organizing into P/T/F/V/A/E cohesion groups for clarity.`,
        ),
}

const V = {
    // Validate React component cohesion patterns
    // @sig checkReactComponentCohesion :: (AST?, String, String) -> [Violation]
    checkReactComponentCohesion: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []
        if (!filePath.endsWith('.jsx')) return []

        const violations = []
        const components = A.collectReactComponents(ast)

        components.forEach(component => {
            const componentName = T.getComponentName(component) || '<anonymous>'
            const line = component.loc?.start?.line || 1

            // Check for render* functions that should be components
            const renderFns = A.collectRenderFunctions(component)
            renderFns.forEach(({ name, line: fnLine }) => violations.push(F.createRenderViolation(fnLine, name)))

            // Suggest cohesion groups if component has many ungrouped helpers
            const helperCount = A.countUngroupedHelpers(component)
            if (helperCount >= 3 && !P.hasCohesionGroups(component))
                violations.push(F.createCohesionSuggestion(line, componentName, helperCount))
        })

        return violations
    },
}

const checkReactComponentCohesion = V.checkReactComponentCohesion
export { checkReactComponentCohesion }
