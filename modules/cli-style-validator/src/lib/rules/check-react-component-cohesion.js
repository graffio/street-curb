// ABOUTME: Rule to enforce React component cohesion patterns
// ABOUTME: Detects render* functions and cohesion groups defined inside components

import { AST, ASTNode } from '@graffio/ast'
import { Aggregators as AS } from '../shared/aggregators.js'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

const PRIORITY = 2

const P = {
    // Check if node is a cohesion group definition (const P = {}, etc.)
    // @sig isCohesionGroupDef :: ASTNode -> Boolean
    isCohesionGroupDef: node =>
        ASTNode.VariableDeclarator.is(node) && PS.isCohesionGroup(node.name) && ASTNode.ObjectExpression.is(node.value),

    // Check if node is a render function (declaration or variable with render* name)
    // @sig isRenderNode :: ASTNode -> Boolean
    isRenderNode: node => {
        const name = node.name
        if (!name || !/^render[A-Z]/.test(name)) return false
        if (ASTNode.FunctionDeclaration.is(node)) return true
        if (ASTNode.VariableDeclarator.is(node)) return node.value && PS.isFunctionNode(node.value)
        return false
    },
}

const T = {
    // Convert render function name to component name
    // @sig toComponentName :: String -> String
    toComponentName: name => name.replace(/^render/, ''),
}

const violation = FS.createViolation('react-component-cohesion', PRIORITY)

const F = {
    // Create violation for render function
    // @sig createRenderViolation :: ASTNode -> Violation
    createRenderViolation: node =>
        violation(
            node.line,
            1,
            `"${node.name}" should be extracted to a <${T.toComponentName(node.name)} /> component. ` +
                `FIX: Move to its own component, not a render function inside the parent.`,
        ),

    // Create violation for cohesion group inside component
    // @sig createCohesionGroupViolation :: (ASTNode, String) -> Violation
    createCohesionGroupViolation: (node, componentName) =>
        violation(
            node.line,
            1,
            `Cohesion group "${node.name}" defined inside component "${componentName}". ` +
                `FIX: Move to module level, above the component.`,
        ),
}

const V = {
    // Validate React component cohesion patterns
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || !filePath.endsWith('.jsx')) return []
        if (!PS.hasJSXContext(ast)) return []

        const renderViolations = AST.from(ast).filter(P.isRenderNode).map(F.createRenderViolation)
        return [...renderViolations, ...A.collectCohesionViolations(ast)]
    },
}

const A = {
    // Find cohesion groups inside a component function body
    // @sig findCohesionGroupsIn :: (ASTNode, String) -> [Violation]
    findCohesionGroupsIn: (funcNode, name) => {
        if (!PS.isFunctionWithBlockBody(funcNode)) return []
        return funcNode.body.body
            .filter(ASTNode.VariableDeclaration.is)
            .flatMap(decl => decl.declarations)
            .filter(P.isCohesionGroupDef)
            .map(d => F.createCohesionGroupViolation(d, name))
    },

    // Collect cohesion violations from all React components in AST
    // @sig collectCohesionViolations :: AST -> [Violation]
    collectCohesionViolations: ast => AS.findComponents(ast).flatMap(c => A.findCohesionGroupsIn(c.node, c.name)),
}

// Run react-component-cohesion rule with COMPLEXITY exemption support
// @sig checkReactComponentCohesion :: (AST?, String, String) -> [Violation]
const checkReactComponentCohesion = (ast, sourceCode, filePath) =>
    FS.withExemptions('react-component-cohesion', V.check, ast, sourceCode, filePath)
export { checkReactComponentCohesion }
