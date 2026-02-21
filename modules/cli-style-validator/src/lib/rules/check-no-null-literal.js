// ABOUTME: Rule to ban null literals from source code
// ABOUTME: Flags any use of the null keyword to enforce undefined as the sole absent value

import { AST } from '@graffio/ast'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Create a no-null-literal violation for a given line
    // @sig createViolation :: Number -> Violation
    createViolation: line =>
        violation(
            line,
            1,
            'null literal is banned. FIX: Use undefined, omit the field, or use isNil() at system boundaries.',
        ),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Validators
//
// ---------------------------------------------------------------------------------------------------------------------

const V = {
    // Check source code for null literals by walking the AST
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || PS.isGeneratedFile(sourceCode)) return []

        return AST.from(ast)
            .filter(node => {
                const { type, raw } = node.esTree
                return type === 'Literal' && raw === 'null'
            })
            .map(node => F.createViolation(node.line))
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const PRIORITY = 7
const violation = FS.createViolation('no-null-literal', PRIORITY)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run no-null-literal rule with COMPLEXITY exemption support
// @sig checkNoNullLiteral :: (AST?, String, String) -> [Violation]
const checkNoNullLiteral = (ast, sourceCode, filePath) =>
    FS.withExemptions('no-null-literal', V.check, ast, sourceCode, filePath)
export { checkNoNullLiteral }
