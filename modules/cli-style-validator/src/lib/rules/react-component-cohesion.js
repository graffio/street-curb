// ABOUTME: Rule to enforce React component cohesion patterns
// ABOUTME: Detects render* functions and cohesion groups defined inside components

import { AST, ASTNode } from '@graffio/ast'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const PRIORITY = 2
const COHESION_GROUPS = ['P', 'T', 'F', 'V', 'A', 'E']

const P = {
    // Check if node is a cohesion group definition (const P = {}, etc.)
    // @sig isCohesionGroupDef :: ASTNode -> Boolean
    isCohesionGroupDef: node =>
        ASTNode.VariableDeclarator.is(node) &&
        COHESION_GROUPS.includes(node.name) &&
        ASTNode.ObjectExpression.is(node.value),

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

const F = {
    // Create violation for render function
    // @sig createRenderViolation :: ASTNode -> Violation
    createRenderViolation: node => ({
        type: 'react-component-cohesion',
        line: node.line,
        column: 1,
        priority: PRIORITY,
        message:
            `"${node.name}" should be extracted to a <${T.toComponentName(node.name)} /> component. ` +
            `FIX: Move to its own component, not a render function inside the parent.`,
        rule: 'react-component-cohesion',
    }),

    // Create violation for cohesion group inside component
    // @sig createCohesionGroupViolation :: (ASTNode, String) -> Violation
    createCohesionGroupViolation: (node, componentName) => ({
        type: 'react-component-cohesion',
        line: node.line,
        column: 1,
        priority: PRIORITY,
        message:
            `Cohesion group "${node.name}" defined inside component "${componentName}". ` +
            `FIX: Move to module level, above the component.`,
        rule: 'react-component-cohesion',
    }),
}

const V = {
    // Validate React component cohesion patterns
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || !filePath.endsWith('.jsx')) return []
        if (!A.hasJSXContext(ast)) return []

        const renderViolations = AST.from(ast).filter(P.isRenderNode).map(F.createRenderViolation)
        return [...renderViolations, ...A.collectCohesionViolations(ast)]
    },
}

const A = {
    // Find cohesion groups inside a component function body
    // @sig findCohesionGroupsIn :: (ASTNode, String) -> [Violation]
    findCohesionGroupsIn: (funcNode, name) => {
        const bodyBlock = funcNode.body
        if (!bodyBlock || !ASTNode.BlockStatement.is(bodyBlock)) return []
        return bodyBlock.body
            .filter(ASTNode.VariableDeclaration.is)
            .flatMap(decl => decl.declarations)
            .filter(P.isCohesionGroupDef)
            .map(d => F.createCohesionGroupViolation(d, name))
    },

    // Collect cohesion violations from all React components in AST
    // @sig collectCohesionViolations :: AST -> [Violation]
    collectCohesionViolations: ast => {
        const statements = AST.topLevelStatements(ast)

        const funcDecls = statements
            .filter(ASTNode.FunctionDeclaration.is)
            .filter(s => PS.isPascalCase(s.name))
            .flatMap(s => A.findCohesionGroupsIn(s, s.name))

        const varDecls = statements
            .filter(ASTNode.VariableDeclaration.is)
            .flatMap(decl => decl.declarations)
            .filter(d => PS.isPascalCase(d.name) && d.value && PS.isFunctionNode(d.value))
            .flatMap(d => A.findCohesionGroupsIn(d.value, d.name))

        return [...funcDecls, ...varDecls]
    },

    // Check if AST contains any JSX (file context check)
    // @sig hasJSXContext :: AST -> Boolean
    hasJSXContext: ast => AST.from(ast).some(n => ASTNode.JSXElement.is(n) || ASTNode.JSXFragment.is(n)),
}

const checkReactComponentCohesion = FS.withExemptions('react-component-cohesion', V.check)
export { checkReactComponentCohesion }
