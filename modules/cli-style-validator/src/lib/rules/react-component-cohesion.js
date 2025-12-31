// ABOUTME: Rule to enforce React component cohesion patterns
// ABOUTME: Detects render* functions and cohesion groups defined inside components

import { PS } from '../predicates.js'
import { AS } from '../aggregators.js'

const PRIORITY = 2
const COHESION_GROUPS = ['P', 'T', 'F', 'V', 'A', 'E']

const P = {
    // Check if node is a cohesion group definition (const P = {}, etc.)
    // @sig isCohesionGroupDef :: ASTNode -> Boolean
    isCohesionGroupDef: node =>
        node.type === 'VariableDeclarator' &&
        COHESION_GROUPS.includes(node.id?.name) &&
        node.init?.type === 'ObjectExpression',

    // Check if node is a render function (declaration or variable with render* name)
    // @sig isRenderNode :: ASTNode -> Boolean
    isRenderNode: node => {
        const { type, id, init } = node
        const name = id?.name
        if (!name || !/^render[A-Z]/.test(name)) return false
        return type === 'FunctionDeclaration' || (type === 'VariableDeclarator' && init && PS.isFunctionNode(init))
    },
}

const T = {
    // Convert render function name to component name
    // @sig toComponentName :: String -> String
    toComponentName: name => name.replace(/^render/, ''),
}

const F = {
    // Create violation for render function
    // @sig createRenderViolation :: ASTNode -> Violation
    createRenderViolation: node => ({
        type: 'react-component-cohesion',
        line: node.loc?.start?.line || 1,
        column: 1,
        priority: PRIORITY,
        message:
            `"${node.id.name}" should be extracted to a <${T.toComponentName(node.id.name)} /> component. ` +
            `FIX: Move to its own component, not a render function inside the parent.`,
        rule: 'react-component-cohesion',
    }),

    // Create violation for cohesion group inside component
    // @sig createCohesionGroupViolation :: (ASTNode, String) -> Violation
    createCohesionGroupViolation: (node, componentName) => ({
        type: 'react-component-cohesion',
        line: node.loc?.start?.line || 1,
        column: 1,
        priority: PRIORITY,
        message:
            `Cohesion group "${node.id.name}" defined inside component "${componentName}". ` +
            `FIX: Move to module level, above the component.`,
        rule: 'react-component-cohesion',
    }),
}

const V = {
    // Check if AST contains any JSX (file context check)
    // @sig hasJSXContext :: AST -> Boolean
    hasJSXContext: ast => AS.collectNodes(ast).some(n => n.type === 'JSXElement' || n.type === 'JSXFragment'),
}

const A = {
    // Find cohesion groups inside a component function body
    // @sig findCohesionGroupsIn :: (ASTNode, String) -> [Violation]
    findCohesionGroupsIn: (funcNode, name) => {
        const body = funcNode.body?.body || []
        const varDecls = body.filter(s => s.type === 'VariableDeclaration')
        const declarators = varDecls.flatMap(s => s.declarations)
        return declarators.filter(P.isCohesionGroupDef).map(d => F.createCohesionGroupViolation(d, name))
    },

    // Collect cohesion violations from all React components in AST
    // @sig collectCohesionViolations :: AST -> [Violation]
    collectCohesionViolations: ast => {
        const body = ast?.body || []
        const violations = []

        body.filter(s => s.type === 'FunctionDeclaration' && PS.isPascalCase(s.id?.name)).forEach(s =>
            violations.push(...A.findCohesionGroupsIn(s, s.id.name)),
        )

        body.filter(s => s.type === 'VariableDeclaration')
            .flatMap(s => s.declarations)
            .filter(d => PS.isPascalCase(d.id?.name) && d.init && PS.isFunctionNode(d.init))
            .forEach(d => violations.push(...A.findCohesionGroupsIn(d.init, d.id.name)))

        return violations
    },
}

// Validate React component cohesion patterns
// @sig checkReactComponentCohesion :: (AST?, String, String) -> [Violation]
const checkReactComponentCohesion = (ast, sourceCode, filePath) => {
    if (!ast || PS.isTestFile(filePath) || !filePath.endsWith('.jsx')) return []
    if (!V.hasJSXContext(ast)) return []

    const renderViolations = AS.collectNodes(ast).filter(P.isRenderNode).map(F.createRenderViolation)
    return [...renderViolations, ...A.collectCohesionViolations(ast)]
}

export { checkReactComponentCohesion }
