// ABOUTME: Rule to detect module-level functions that should be nested inside their sole caller
// ABOUTME: Single-use helpers should live inside the function that uses them

import { traverseAST, isFunctionNode } from '../traverse.js'

const PRIORITY = 2

/**
 * Create a function-nesting violation
 * @sig createViolation :: (Number, String, String) -> Violation
 */
const createViolation = (line, funcName, callerName) => ({
    type: 'function-nesting',
    line,
    column: 1,
    priority: PRIORITY,
    message:
        `"${funcName}" is only used by "${callerName}". ` +
        `FIX: Move it inside "${callerName}" as a nested function at the top of the function body.`,
    rule: 'function-nesting',
})

/**
 * Get the name from a variable declarator with function init
 * @sig getFunctionName :: ASTNode -> String?
 */
const getFunctionName = node => {
    if (node.type === 'FunctionDeclaration' && node.id) return node.id.name
    if (node.type === 'VariableDeclaration') {
        const declarator = node.declarations[0]
        if (declarator?.init && isFunctionNode(declarator.init)) return declarator.id?.name
    }
    return null
}

/**
 * Collect all module-level function declarations with their line numbers
 * @sig collectModuleFunctions :: AST -> Map<String, Number>
 */
const collectModuleFunctions = ast => {
    const functions = new Map()
    if (!ast?.body) return functions

    ast.body
        .filter(node => node.type === 'FunctionDeclaration' || node.type === 'VariableDeclaration')
        .forEach(node => {
            const name = getFunctionName(node)
            if (name) functions.set(name, node.loc?.start?.line || 1)
        })

    return functions
}

/**
 * Collect all exported names from export statements
 * @sig collectExportedNames :: AST -> Set<String>
 */
const collectExportedNames = ast => {
    const exported = new Set()
    if (!ast?.body) return exported

    ast.body.forEach(node => {
        if (node.type === 'ExportNamedDeclaration') {
            // export { a, b, c }
            node.specifiers?.forEach(spec => exported.add(spec.local?.name))

            // export const x = ...
            if (node.declaration) {
                const name = getFunctionName(node.declaration)
                if (name) exported.add(name)
            }
        }
        if (node.type === 'ExportDefaultDeclaration') {
            const name = node.declaration?.id?.name || node.declaration?.name
            if (name) exported.add(name)
        }
    })

    return exported
}

/**
 * Get the function body node for traversal
 * @sig getFunctionBody :: ASTNode -> ASTNode?
 */
const getFunctionBody = node => {
    if (node.type === 'FunctionDeclaration') return node.body
    if (node.type === 'VariableDeclaration') {
        const init = node.declarations[0]?.init
        if (init && isFunctionNode(init)) return init.body
    }
    return null
}

/**
 * Collect all function call names within a function body (excluding recursive calls)
 * @sig collectCallsInFunction :: (ASTNode, String, Set<String>) -> Set<String>
 */
const collectCallsInFunction = (body, ownName, moduleFunctionNames) => {
    const calls = new Set()

    traverseAST(body, node => {
        if (node.type !== 'CallExpression') return
        const callee = node.callee
        if (callee?.type !== 'Identifier') return

        const calledName = callee.name
        if (calledName === ownName) return
        if (moduleFunctionNames.has(calledName)) calls.add(calledName)
    })

    return calls
}

/**
 * Build a map of function name -> set of callers
 * @sig buildCallerMap :: (AST, Map<String, Number>) -> Map<String, Set<String>>
 */
const buildCallerMap = (ast, moduleFunctions) => {
    const callerMap = new Map()
    moduleFunctions.forEach((_, name) => callerMap.set(name, new Set()))

    ast.body
        .filter(node => node.type === 'FunctionDeclaration' || node.type === 'VariableDeclaration')
        .forEach(node => {
            const callerName = getFunctionName(node)
            if (!callerName) return

            const body = getFunctionBody(node)
            if (!body) return

            const calls = collectCallsInFunction(body, callerName, moduleFunctions)
            calls.forEach(calledName => callerMap.get(calledName)?.add(callerName))
        })

    return callerMap
}

/**
 * Check if file is a test file that should skip validation
 * @sig isTestFile :: String -> Boolean
 */
const isTestFile = filePath => filePath.includes('.tap.js') || filePath.includes('.integration-test.js')

/**
 * Check for single-use module-level functions that should be nested
 * @sig checkFunctionNesting :: (AST?, String, String) -> [Violation]
 */
const checkFunctionNesting = (ast, sourceCode, filePath) => {
    if (!ast || isTestFile(filePath)) return []

    const moduleFunctions = collectModuleFunctions(ast)
    const exportedNames = collectExportedNames(ast)
    const callerMap = buildCallerMap(ast, moduleFunctions)

    const violations = []

    moduleFunctions.forEach((line, funcName) => {
        if (exportedNames.has(funcName)) return

        const callers = callerMap.get(funcName)
        if (!callers || callers.size !== 1) return

        const [soleCallerName] = callers
        violations.push(createViolation(line, funcName, soleCallerName))
    })

    return violations
}

export { checkFunctionNesting }
