// ABOUTME: Rule to detect render* functions that should be components
// ABOUTME: Suggests extracting renderX to <X /> subcomponent

import { PS } from '../predicates.js'
import { AS } from '../aggregators.js'

const PRIORITY = 2

const P = {
    // Check if name follows render* pattern
    // @sig isRenderFunction :: String -> Boolean
    isRenderFunction: name => /^render[A-Z]/.test(name),

    // Check if node is JSX element or fragment
    // @sig isJSXNode :: ASTNode -> Boolean
    isJSXNode: node => node.type === 'JSXElement' || node.type === 'JSXFragment',

    // Check if node is a render function (declaration or variable)
    // @sig isRenderNode :: ASTNode -> Boolean
    isRenderNode: node => {
        const { type, id, init } = node
        const name = id?.name
        if (!name || !P.isRenderFunction(name)) return false
        if (type === 'FunctionDeclaration') return true
        if (type === 'VariableDeclarator' && init && PS.isFunctionNode(init)) return true
        return false
    },
}

const T = {
    // Convert render function name to component name
    // @sig toComponentName :: String -> String
    toComponentName: name => name.replace(/^render/, ''),

    // Extract violation info from a render node
    // @sig toViolationInfo :: ASTNode -> { line: Number, name: String }
    toViolationInfo: node => ({ line: node.loc?.start?.line || 1, name: node.id.name }),
}

const F = {
    // Create a react-component-cohesion violation from node info
    // @sig createViolation :: { line: Number, name: String } -> Violation
    createViolation: ({ line, name }) => ({
        type: 'react-component-cohesion',
        line,
        column: 1,
        priority: PRIORITY,
        message:
            `"${name}" should be extracted to a <${T.toComponentName(name)} /> component. ` +
            `FIX: Move to its own component, not a render function inside the parent.`,
        rule: 'react-component-cohesion',
    }),
}

const V = {
    // Check if AST contains any JSX (file context check)
    // @sig hasJSXContext :: AST -> Boolean
    hasJSXContext: ast => AS.collectNodes(ast).some(P.isJSXNode),
}

// Validate that no render* functions exist (they should be components)
// @sig checkReactComponentCohesion :: (AST?, String, String) -> [Violation]
const checkReactComponentCohesion = (ast, sourceCode, filePath) => {
    if (!ast || PS.isTestFile(filePath)) return []
    if (!filePath.endsWith('.jsx')) return []
    if (!V.hasJSXContext(ast)) return []
    return AS.collectNodes(ast).filter(P.isRenderNode).map(T.toViolationInfo).map(F.createViolation)
}

export { checkReactComponentCohesion }
