// ABOUTME: Rule to enforce verb-prefix naming on all functions
// ABOUTME: Catches function names that don't start with a recognized cohesion verb prefix

import { Aggregators as AS } from '../shared/aggregators.js'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

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

const violation = FS.createViolation('function-naming', PRIORITY)

const F = {
    // Create a function-naming violation
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, name) =>
        violation(
            line,
            1,
            `"${name}" does not start with a recognized verb prefix. ` +
                `FIX: Rename to start with one of: ${VERB_PREFIXES.replaceAll('|', ', ')}.`,
        ),
}

const V = {
    // Validate that all module-level function names use recognized verb prefixes
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || PS.isGeneratedFile(sourceCode)) return []

        return AS.collectModuleLevelFunctions(ast)
            .filter(({ name }) => !PS.isPascalCase(name))
            .filter(({ name }) => !P.hasRecognizedPrefix(name))
            .map(({ name, line }) => F.createViolation(line, name))
    },
}

// Run function-naming rule with COMPLEXITY exemption support
// @sig checkFunctionNaming :: (AST?, String, String) -> [Violation]
const checkFunctionNaming = (ast, sourceCode, filePath) =>
    FS.withExemptions('function-naming', V.check, ast, sourceCode, filePath)
export { checkFunctionNaming }
