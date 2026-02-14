// ABOUTME: Rule to enforce verb-prefix naming on all functions
// ABOUTME: Catches function names that don't start with a recognized cohesion verb prefix

import { AST, ASTNode } from '@graffio/ast'
import { Violation } from '../../types/index.js'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const PRIORITY = 6

// Union of all recognized verb prefixes across all cohesion groups
const VERB_PREFIXES =
    'is|has|should|can|to|parse|format|create|make|build' +
    '|check|validate|collect|count|gather|find|process|persist|handle|dispatch|emit|send|query|register' +
    '|toggle|post|hydrate'
const RECOGNIZED_PREFIX = new RegExp(`^(${VERB_PREFIXES})([A-Z]|$)`)

const P = {
    // Check if name starts with a recognized verb prefix
    // @sig hasRecognizedPrefix :: String -> Boolean
    hasRecognizedPrefix: name => RECOGNIZED_PREFIX.test(name),
}

const T = {
    // Transform variable declaration to function name entries
    // @sig toFunctionVariableNames :: ASTNode -> [{ name: String, line: Number }]
    toFunctionVariableNames: statement => {
        if (!ASTNode.VariableDeclaration.is(statement)) return []
        return statement.declarations
            .filter(({ value, name }) => value && PS.isFunctionNode(value) && name)
            .map(({ name, line }) => ({ name, line }))
    },

    // Transform function declaration to name entry
    // @sig toFunctionDeclarationNames :: ASTNode -> [{ name: String, line: Number }]
    toFunctionDeclarationNames: statement => {
        if (!ASTNode.FunctionDeclaration.is(statement)) return []
        const { name, line } = statement
        return name ? [{ name, line }] : []
    },
}

const F = {
    // Create a function-naming violation
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, name) =>
        Violation(
            'function-naming',
            line,
            1,
            PRIORITY,
            `"${name}" does not start with a recognized verb prefix. ` +
                `FIX: Rename to start with one of: ${VERB_PREFIXES.replaceAll('|', ', ')}.`,
            'function-naming',
        ),
}

const V = {
    // Validate that all module-level function names use recognized verb prefixes
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || PS.isGeneratedFile(sourceCode)) return []

        return A.collectModuleLevelFunctionNames(ast)
            .filter(({ name }) => !PS.isPascalCase(name))
            .filter(({ name }) => !P.hasRecognizedPrefix(name))
            .map(({ name, line }) => F.createViolation(line, name))
    },
}

const A = {
    // Collect all module-level function names from AST
    // @sig collectModuleLevelFunctionNames :: AST -> [{ name: String, line: Number }]
    collectModuleLevelFunctionNames: ast =>
        AST.topLevelStatements(ast).flatMap(statement => [
            ...T.toFunctionVariableNames(statement),
            ...T.toFunctionDeclarationNames(statement),
        ]),
}

const checkFunctionNaming = FS.withExemptions('function-naming', V.check)
export { checkFunctionNaming }
